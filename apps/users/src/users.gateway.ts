import { Server, Socket } from 'socket.io';
import { EUserRole, User } from '@app/entities';
import { ForbiddenException, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthService } from '@/auth/src/auth.service';
import { EUsersGatewayEvent } from './constants';

// TODO: add gateway global prefix and versions | or get from .env
@WebSocketGateway({
  namespace: 'api/v1/users',
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(UsersGateway.name);

  // TODO: add use redis
  private readonly clients: Map<Socket['id'], Socket> = new Map();
  // TODO: add use redis
  private readonly userAssociateMap: Map<Socket['id'], User['id']> = new Map();

  constructor(private readonly authService: AuthService) {}

  private deleteClient(id: Socket['id']) {
    this.clients.delete(id);
    this.userAssociateMap.delete(id);
  }

  private async validateClientToken(client: Socket): Promise<void> {
    try {
      const token = client.handshake.query.token;
      const t = Array.isArray(token) ? token[0] : token;
      if (!t) return;
      const tokenPayload = await this.authService.validateToken(t);

      const isAvaliable =
        tokenPayload.isActive && tokenPayload.role === EUserRole.ADMIN;

      if (!isAvaliable) {
        throw new ForbiddenException('Forbidden');
      }

      if (!this.clients.has(client.id)) {
        this.clients.set(client.id, client);
      }
      if (!this.userAssociateMap.has(client.id)) {
        this.userAssociateMap.set(client.id, tokenPayload.sub);
      }
    } catch (err) {
      client.disconnect();
      this.deleteClient(client.id);
      this.logger.error(`[VALIDATE TOKEN]: ${err.message}`);
    }
  }

  private broadcast(
    event: EUsersGatewayEvent,
    data: any,
    options: {
      excludeClientIds?: Socket['id'][];
      excludeUserIds?: User['id'][];
    } = {},
  ) {
    const { excludeClientIds, excludeUserIds } = {
      excludeClientIds: [],
      excludeUserIds: [],
      ...options,
    };
    for (const [id, client] of [...this.clients.entries()]) {
      if (excludeClientIds.includes(id)) continue;
      if (excludeUserIds.includes(this.userAssociateMap.get(id))) continue;
      client.emit(event, data);
    }

    this.logger.log(
      `[BROADCAST] Event: ${event}. Message: ${JSON.stringify(data, null, 2)}`,
    );
  }

  @SubscribeMessage('message')
  onMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket) {
    this.logger.log(
      `[READ] | Client: ${client.id} | Event: message | Message: ${JSON.stringify(message, null, 2)}`,
    );
  }

  public sendEventUpdateUser(params: {
    userId: User['id'];
    requesterUserId?: User['id'];
    updatedParams?: Partial<User>;
  }) {
    const { userId = '', requesterUserId = '', updatedParams = {} } = params;
    const message = {
      id: userId,
      update: updatedParams,
      requesterUserId,
    };

    this.broadcast(EUsersGatewayEvent.UPDATE, message);
  }

  public sendEventDeleteUser(params: {
    userId: User['id'];
    requesterUserId?: User['id'];
  }) {
    const { userId = '', requesterUserId = '' } = params;
    const message = {
      id: userId,
      requesterUserId,
    };

    this.broadcast(EUsersGatewayEvent.DELETE, message);
  }

  public async handleConnection(client: Socket) {
    try {
      await this.validateClientToken(client);
      const msg = `Client connected. ID: ${client.id}`;
      this.logger.log(msg);
      this.broadcast(EUsersGatewayEvent.CONNECT, msg, {
        excludeClientIds: [client.id],
      });
    } catch (err) {
      this.logger.error(err);
      client.disconnect(false);
    }
  }

  public handleDisconnect(client: Socket) {
    const msg = `Client disconnected. ID: ${client.id}`;
    this.logger.log(msg);
    this.deleteClient(client.id);
    this.broadcast(EUsersGatewayEvent.DISCONNECT, msg, {
      excludeClientIds: [client.id],
    });
  }
}
