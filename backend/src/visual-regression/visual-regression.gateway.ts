import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { VisualRegressionService } from './visual-regression.service';
import { KeyManagementService } from '../common/security/key-management.service';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';

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
  @WebSocketServer()
  server: Server;

  private clientRooms: Map<string, Set<string>> = new Map(); // clientId -> Set<projectId/runId>

  constructor(
    private readonly visualRegressionService: VisualRegressionService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Clients send a user token or an API key as auth.token or an Authorization
   * header. The global AuthGuard doesn't cover connections, so check here and
   * keep the principal for the subscription checks.
   */
  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token ?? client.handshake.headers?.authorization;
    const principal = await this.authService.resolve(KeyManagementService.extractKey(token)).catch(() => null);
    if (!principal) {
      client.emit('error', { message: 'Sign in or send a valid API key' });
      client.disconnect(true);
      return;
    }
    client.data.principal = principal;
  }

  handleDisconnect(client: Socket) {
    this.clientRooms.delete(client.id);
  }

  private principalOf(client: Socket): AuthPrincipal | null {
    return (client.data?.principal as AuthPrincipal | undefined) ?? null;
  }

  /** Joins a room once the caller is allowed to read the project or run */
  private async join(client: Socket, room: string, check: (principal: AuthPrincipal) => Promise<unknown>, label: string) {
    const principal = this.principalOf(client);
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
    client.leave(`project:${data.projectId}`);
    this.clientRooms.get(client.id)?.delete(`project:${data.projectId}`);
    return { success: true, message: `Unsubscribed from project ${data.projectId}` };
  }

  @SubscribeMessage('unsubscribe:run')
  handleUnsubscribeRun(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { runId: string },
  ) {
    client.leave(`run:${data.runId}`);
    this.clientRooms.get(client.id)?.delete(`run:${data.runId}`);
    return { success: true, message: `Unsubscribed from run ${data.runId}` };
  }

  // Emit events to clients
  emitRunStatusUpdate(runId: string, status: string, data?: Record<string, unknown>) {
    this.server.to(`run:${runId}`).emit('run:status-update', {
      runId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitRunCompleted(runId: string, results: unknown) {
    this.server.to(`run:${runId}`).emit('run:completed', {
      runId,
      results,
      timestamp: new Date().toISOString(),
    });
  }

  emitProjectUpdate(projectId: string, event: string, data: Record<string, unknown>) {
    this.server.to(`project:${projectId}`).emit('project:update', {
      projectId,
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitResultUpdate(runId: string, resultId: string, update: Record<string, unknown>) {
    this.server.to(`run:${runId}`).emit('result:update', {
      runId,
      resultId,
      update,
      timestamp: new Date().toISOString(),
    });
  }
}

