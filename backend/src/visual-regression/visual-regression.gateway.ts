import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VisualRegressionService } from './visual-regression.service';
import { KeyManagementService } from '../common/security/key-management.service';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal, PASSWORD_CHANGE_REQUIRED, isPasswordChangePending } from '../auth/principal';

// setTimeout can't wait longer than 2^31-1 ms; longer-lived keys re-arm
const MAX_TIMER_MS = 2 ** 31 - 1;

@Injectable()
@WebSocketGateway({
  namespace: '/visual-regression',
  cors: {
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5174,http://localhost:5175')
      .split(',')
      .map((origin) => origin.trim()),
  },
})
export class VisualRegressionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /** Connected, signed-in sockets on this instance, by socket id */
  private readonly clients = new Map<string, Socket>();
  private clientRooms: Map<string, Set<string>> = new Map(); // clientId -> Set<project:id/run:id>
  /** Disconnects each socket when its credential expires */
  private readonly expiryTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly visualRegressionService: VisualRegressionService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Clients send a user token or an API key as auth.token or an Authorization
   * header. The global AuthGuard doesn't cover connections, so check here
   * (docs/AUTH.md). The credential is kept so it can be checked again on every
   * subscribe and before every broadcast, and the socket is closed when it expires.
   */
  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token ?? client.handshake.headers?.authorization;
    const credential = KeyManagementService.extractKey(token);
    const principal = await this.authService.resolve(credential).catch(() => null);
    if (!principal) {
      this.end(client, { message: 'Sign in or send a valid API key' });
      return;
    }
    if (isPasswordChangePending(principal)) {
      this.end(client, { code: PASSWORD_CHANGE_REQUIRED, message: 'Change your password before subscribing to updates' });
      return;
    }
    client.data.principal = principal;
    client.data.credential = credential;
    this.clients.set(client.id, client);
    this.armExpiry(client, principal);
  }

  handleDisconnect(client: Socket) {
    this.forget(client);
  }

  /** Sends the reason and closes the connection */
  private end(client: Socket, reason: { code?: string; message: string }) {
    this.forget(client);
    client.emit('error', reason);
    client.disconnect(true);
  }

  private forget(client: Socket) {
    this.clients.delete(client.id);
    this.clientRooms.delete(client.id);
    clearTimeout(this.expiryTimers.get(client.id));
    this.expiryTimers.delete(client.id);
  }

  /** Closes the socket when its token or key expires, without waiting for a reconnect */
  private armExpiry(client: Socket, principal: AuthPrincipal) {
    clearTimeout(this.expiryTimers.get(client.id));
    this.expiryTimers.delete(client.id);
    if (!principal.expiresAt) return;
    const remaining = principal.expiresAt.getTime() - Date.now();
    const timer = setTimeout(() => {
      this.expiryTimers.delete(client.id);
      if (principal.expiresAt!.getTime() <= Date.now()) this.end(client, { message: 'Your session has expired. Sign in again.' });
      else this.armExpiry(client, principal);
    }, Math.min(Math.max(remaining, 0), MAX_TIMER_MS));
    timer.unref?.();
    this.expiryTimers.set(client.id, timer);
  }

  /**
   * The socket's principal, re-resolved from its credential, so sign-out,
   * disabling, a password reset, key revocation and expiry take effect on open
   * connections. Closes the socket when the credential no longer works. Null
   * when it doesn't, or when that can't be checked right now (storage down).
   */
  private async currentPrincipal(client: Socket): Promise<AuthPrincipal | null> {
    if (!this.clients.has(client.id)) return null;
    let principal: AuthPrincipal | null;
    try {
      principal = await this.authService.resolve(client.data?.credential as string | undefined);
    } catch {
      // Fail closed for this message or subscription, but keep the connection
      return null;
    }
    if (!principal || isPasswordChangePending(principal)) {
      this.end(client, { message: 'Your session has ended. Sign in again.' });
      return null;
    }
    client.data.principal = principal;
    return principal;
  }

  /** Whether the principal may still read the room's project or run */
  private authorizeRoom(principal: AuthPrincipal, room: string): Promise<unknown> {
    const [kind, id] = [room.slice(0, room.indexOf(':')), room.slice(room.indexOf(':') + 1)];
    return kind === 'run'
      ? this.visualRegressionService.authorizeRun(principal, id, 'read')
      : this.visualRegressionService.authorizeProject(principal, id, 'read');
  }

  private leave(client: Socket, room: string) {
    client.leave(room);
    this.clientRooms.get(client.id)?.delete(room);
  }

  /**
   * Sends an event to the room's subscribers on this instance, checking each
   * one's credential and access first: a subscriber who signed out, was
   * disabled or lost access to the project gets nothing and is disconnected or
   * removed from the room. Never rejects.
   */
  private async broadcast(room: string, event: string, payload: Record<string, unknown>): Promise<void> {
    const subscribers = [...this.clients.values()].filter((client) => this.clientRooms.get(client.id)?.has(room));
    await Promise.allSettled(
      subscribers.map(async (client) => {
        const principal = await this.currentPrincipal(client);
        if (!principal) return;
        try {
          await this.authorizeRoom(principal, room);
        } catch (error) {
          // Access was revoked (or the project deleted); anything else (storage down) skips this message only
          if (error instanceof NotFoundException || error instanceof ForbiddenException) {
            this.leave(client, room);
            client.emit('subscription:revoked', { room });
          }
          return;
        }
        client.emit(event, payload);
      }),
    );
  }

  /** Joins a room once the caller is allowed to read the project or run */
  private async join(client: Socket, room: string, check: (principal: AuthPrincipal) => Promise<unknown>, label: string) {
    const principal = await this.currentPrincipal(client);
    if (!principal) return { success: false, message: 'Not signed in' };
    try {
      await check(principal);
    } catch {
      // Same answer for "doesn't exist" and "not yours", so ids can't be probed
      return { success: false, message: `${label} not found` };
    }
    if (!this.clientRooms.has(client.id)) this.clientRooms.set(client.id, new Set());
    this.clientRooms.get(client.id)!.add(room);
    client.join(room);
    return { success: true, message: `Subscribed to ${label.toLowerCase()} ${room.split(':')[1]}` };
  }

  @SubscribeMessage('subscribe:project')
  handleSubscribeProject(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string }) {
    const projectId = String(data?.projectId ?? '');
    return this.join(client, `project:${projectId}`, (p) => this.visualRegressionService.authorizeProject(p, projectId, 'read'), 'Project');
  }

  @SubscribeMessage('subscribe:run')
  handleSubscribeRun(@ConnectedSocket() client: Socket, @MessageBody() data: { runId: string }) {
    const runId = String(data?.runId ?? '');
    return this.join(client, `run:${runId}`, (p) => this.visualRegressionService.authorizeRun(p, runId, 'read'), 'Run');
  }

  @SubscribeMessage('unsubscribe:project')
  handleUnsubscribeProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    this.leave(client, `project:${data?.projectId}`);
    return { success: true, message: `Unsubscribed from project ${data.projectId}` };
  }

  @SubscribeMessage('unsubscribe:run')
  handleUnsubscribeRun(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { runId: string },
  ) {
    this.leave(client, `run:${data?.runId}`);
    return { success: true, message: `Unsubscribed from run ${data.runId}` };
  }

  // Events for subscribers. Each is checked against the subscriber's current
  // credential and access before it is sent (see broadcast).
  emitRunStatusUpdate(runId: string, status: string, data?: Record<string, unknown>): Promise<void> {
    return this.broadcast(`run:${runId}`, 'run:status-update', {
      runId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitRunCompleted(runId: string, results: unknown): Promise<void> {
    return this.broadcast(`run:${runId}`, 'run:completed', {
      runId,
      results,
      timestamp: new Date().toISOString(),
    });
  }

  emitProjectUpdate(projectId: string, event: string, data: Record<string, unknown>): Promise<void> {
    return this.broadcast(`project:${projectId}`, 'project:update', {
      projectId,
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitResultUpdate(runId: string, resultId: string, update: Record<string, unknown>): Promise<void> {
    return this.broadcast(`run:${runId}`, 'result:update', {
      runId,
      resultId,
      update,
      timestamp: new Date().toISOString(),
    });
  }
}
