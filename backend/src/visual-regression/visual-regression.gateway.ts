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

@Injectable()
@WebSocketGateway({
  namespace: '/visual-regression',
  cors: {
    origin: '*',
  },
})
export class VisualRegressionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clientRooms: Map<string, Set<string>> = new Map(); // clientId -> Set<projectId/runId>

  constructor(private readonly visualRegressionService: VisualRegressionService) {}

  handleConnection(client: Socket) {
    console.log(`Visual Regression WebSocket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Visual Regression WebSocket client disconnected: ${client.id}`);
    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('subscribe:project')
  handleSubscribeProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    if (!this.clientRooms.has(client.id)) {
      this.clientRooms.set(client.id, new Set());
    }
    this.clientRooms.get(client.id)!.add(`project:${data.projectId}`);
    client.join(`project:${data.projectId}`);
    return { success: true, message: `Subscribed to project ${data.projectId}` };
  }

  @SubscribeMessage('subscribe:run')
  handleSubscribeRun(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { runId: string },
  ) {
    if (!this.clientRooms.has(client.id)) {
      this.clientRooms.set(client.id, new Set());
    }
    this.clientRooms.get(client.id)!.add(`run:${data.runId}`);
    client.join(`run:${data.runId}`);
    return { success: true, message: `Subscribed to run ${data.runId}` };
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
  emitRunStatusUpdate(runId: string, status: string, data?: any) {
    this.server.to(`run:${runId}`).emit('run:status-update', {
      runId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitRunCompleted(runId: string, results: any) {
    this.server.to(`run:${runId}`).emit('run:completed', {
      runId,
      results,
      timestamp: new Date().toISOString(),
    });
  }

  emitProjectUpdate(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit('project:update', {
      projectId,
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitResultUpdate(runId: string, resultId: string, update: any) {
    this.server.to(`run:${runId}`).emit('result:update', {
      runId,
      resultId,
      update,
      timestamp: new Date().toISOString(),
    });
  }
}

