import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // 1. Extract the token from the header: "Bearer <token>"
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      
      if (!token) {
        this.logger.warn(`Client ${client.id} has no token. Disconnecting...`);
        client.disconnect();
        return;
      }

      // 2. Remove "Bearer " prefix if present
      const cleanToken = token.replace('Bearer ', '');

      // 3. Verify the token
      const payload = this.jwtService.verify(cleanToken);
      
      // 4. Find the user in the DB
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        client.disconnect();
        return;
      }

      // 5. Attach the user to the socket for future use
      client.data.user = user;
      this.logger.log(`Client connected: ${client.id} (User: ${user.username})`);

    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
    // Now we know EXACTLY who sent the message!
    this.logger.log(`Message from ${client.data.user?.username}: ${data}`);
    return 'pong';
  }
}
