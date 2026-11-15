import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { ComponentRequest } from '../design-system/component-request.service';
import { DocumentStore, VersionConflictError } from '../reviews/document-store';
import { NOTIFICATION_STORE, Notification, NotificationType } from './notification.types';

export type { Notification } from './notification.types';

const MAX_WRITE_ATTEMPTS = 5;

export interface NewNotification {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  changelogEntryId?: string;
  breaking?: boolean;
}

/**
 * People's notifications, stored in Elasticsearch. Every read and change is
 * scoped to the recipient: someone else's notification is "not found", so ids
 * can't be probed.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@Inject(NOTIFICATION_STORE) private readonly store: DocumentStore<Notification>) {}

  async createNotification(data: NewNotification): Promise<Notification> {
    const notification: Notification = {
      id: `ntf_${randomBytes(12).toString('hex')}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      ...(data.link ? { link: data.link } : {}),
      ...(data.changelogEntryId ? { changelogEntryId: data.changelogEntryId } : {}),
      ...(data.breaking !== undefined ? { breaking: data.breaking } : {}),
      read: false,
      createdAt: new Date().toISOString(),
    };
    await this.store.create(notification);
    return notification;
  }

  /**
   * Creates a notification without making the caller wait or fail: for side
   * effects of another change (a comment, a status change) that has already
   * been saved. A storage failure is logged.
   */
  notify(data: NewNotification): void {
    this.createNotification(data).catch((error) => {
      this.logger.warn(`Notification for ${data.userId} not saved: ${(error as Error)?.message}`);
    });
  }

  /** The person's notifications, newest first */
  async getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    return this.store.list({ where: unreadOnly ? { userId, read: false } : { userId } });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return (await this.getNotifications(userId, true)).length;
  }

  /** Marks one of the person's notifications read. 404 for anyone else's. */
  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    return this.mutateOwn(userId, notificationId, (doc) => {
      if (doc.read) return false;
      doc.read = true;
      doc.readAt = new Date().toISOString();
      return true;
    });
  }

  /** Marks all of the person's notifications read; returns how many changed */
  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const notification of await this.getNotifications(userId, true)) {
      try {
        await this.markAsRead(userId, notification.id);
        count++;
      } catch (error) {
        // Deleted in the meantime: nothing to mark
        if (!(error instanceof NotFoundException)) throw error;
      }
    }
    return count;
  }

  /** Deletes one of the person's notifications. 404 for anyone else's. */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const stored = await this.store.get(notificationId);
    if (!stored || stored.doc.userId !== userId) throw new NotFoundException('Notification not found');
    await this.store.delete(notificationId);
  }

  private async mutateOwn(userId: string, id: string, fn: (doc: Notification) => boolean): Promise<Notification> {
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored || stored.doc.userId !== userId) throw new NotFoundException('Notification not found');
      const doc = stored.doc;
      if (!fn(doc)) return doc;
      try {
        await this.store.replace(doc, stored.version);
        return doc;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('Notification is being changed, please try again');
  }

  // ---------- Component request notifications ----------

  // Notify request creator when request is updated
  notifyRequestUpdated(request: ComponentRequest, updatedBy: string): void {
    if (request.requestedBy !== updatedBy) {
      this.notify({
        userId: request.requestedBy,
        type: 'request-updated',
        title: `Request "${request.title}" updated`,
        message: `Your request has been updated by ${updatedBy}`,
        link: `/feedback?request=${request.id}`,
      });
    }
  }

  // Notify when request is assigned
  notifyRequestAssigned(request: ComponentRequest, assignedTo: string): void {
    this.notify({
      userId: assignedTo,
      type: 'request-assigned',
      title: `Request assigned: "${request.title}"`,
      message: `You have been assigned to work on this request`,
      link: `/feedback?request=${request.id}`,
    });
  }

  // Notify when comment is added
  notifyCommentAdded(request: ComponentRequest, commentAuthor: string): void {
    // Notify request creator if not the commenter
    if (request.requestedBy !== commentAuthor) {
      this.notify({
        userId: request.requestedBy,
        type: 'request-commented',
        title: `New comment on "${request.title}"`,
        message: `${commentAuthor} added a comment`,
        link: `/feedback?request=${request.id}`,
      });
    }

    // Notify assignee if different from creator and commenter
    if (request.assignedTo && request.assignedTo !== commentAuthor && request.assignedTo !== request.requestedBy) {
      this.notify({
        userId: request.assignedTo,
        type: 'request-commented',
        title: `New comment on "${request.title}"`,
        message: `${commentAuthor} added a comment`,
        link: `/feedback?request=${request.id}`,
      });
    }
  }

  // Notify voters when request status changes significantly
  notifyRequestStatusChange(request: ComponentRequest, newStatus: string): void {
    const significantStatuses = ['approved', 'rejected', 'completed', 'released'];
    if (significantStatuses.includes(newStatus)) {
      request.voters.forEach((voterId) => {
        if (voterId !== request.requestedBy) {
          this.notify({
            userId: voterId,
            type: 'request-updated',
            title: `Request "${request.title}" ${newStatus}`,
            message: `A request you voted on has been ${newStatus}`,
            link: `/feedback?request=${request.id}`,
          });
        }
      });
    }
  }
}
