import { Injectable } from '@nestjs/common';
import { ComponentRequest } from './component-request.service';

export interface Notification {
  id: string;
  userId: string;
  type: 'request-created' | 'request-updated' | 'request-commented' | 'request-assigned' | 'issue-created' | 'issue-updated';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private notifications = new Map<string, Notification>();

  // Create notification
  createNotification(data: {
    userId: string;
    type: Notification['type'];
    title: string;
    message: string;
    link?: string;
  }): Notification {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      read: false,
      createdAt: new Date()
    };

    this.notifications.set(id, notification);
    return notification;
  }

  // Get notifications for user
  getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Mark as read
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  // Mark all as read for user
  markAllAsRead(userId: string): number {
    const notifications = this.getNotifications(userId, true);
    notifications.forEach(n => {
      n.read = true;
    });
    return notifications.length;
  }

  // Delete notification
  deleteNotification(notificationId: string): boolean {
    return this.notifications.delete(notificationId);
  }

  // Notify request creator when request is updated
  notifyRequestUpdated(request: ComponentRequest, updatedBy: string): void {
    if (request.requestedBy !== updatedBy) {
      this.createNotification({
        userId: request.requestedBy,
        type: 'request-updated',
        title: `Request "${request.title}" updated`,
        message: `Your request has been updated by ${updatedBy}`,
        link: `/feedback?request=${request.id}`
      });
    }
  }

  // Notify when request is assigned
  notifyRequestAssigned(request: ComponentRequest, assignedTo: string): void {
    this.createNotification({
      userId: assignedTo,
      type: 'request-assigned',
      title: `Request assigned: "${request.title}"`,
      message: `You have been assigned to work on this request`,
      link: `/feedback?request=${request.id}`
    });
  }

  // Notify when comment is added
  notifyCommentAdded(request: ComponentRequest, commentAuthor: string): void {
    // Notify request creator if not the commenter
    if (request.requestedBy !== commentAuthor) {
      this.createNotification({
        userId: request.requestedBy,
        type: 'request-commented',
        title: `New comment on "${request.title}"`,
        message: `${commentAuthor} added a comment`,
        link: `/feedback?request=${request.id}`
      });
    }

    // Notify assignee if different from creator and commenter
    if (request.assignedTo && request.assignedTo !== commentAuthor && request.assignedTo !== request.requestedBy) {
      this.createNotification({
        userId: request.assignedTo,
        type: 'request-commented',
        title: `New comment on "${request.title}"`,
        message: `${commentAuthor} added a comment`,
        link: `/feedback?request=${request.id}`
      });
    }
  }

  // Notify voters when request status changes significantly
  notifyRequestStatusChange(request: ComponentRequest, newStatus: string): void {
    const significantStatuses = ['approved', 'rejected', 'completed', 'released'];
    if (significantStatuses.includes(newStatus)) {
      // Notify all voters
      request.voters.forEach(voterId => {
        if (voterId !== request.requestedBy) {
          this.createNotification({
            userId: voterId,
            type: 'request-updated',
            title: `Request "${request.title}" ${newStatus}`,
            message: `A request you voted on has been ${newStatus}`,
            link: `/feedback?request=${request.id}`
          });
        }
      });
    }
  }

  // Get unread count for user
  getUnreadCount(userId: string): number {
    return this.getNotifications(userId, true).length;
  }
}

