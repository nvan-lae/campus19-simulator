import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { GameService } from './game.service';
import { User } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: User;
  };
}

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly gameService: GameService // Inject our new service
  ) {}

  async handleConnection(client: Socket) {
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
    // Optional: Handle player disconnect (pause game? auto-forfeit?)
  }

  @SubscribeMessage('join_game')
  handleJoinGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const user = client.data.user;
    if (!user) return;

    // 1. Join the Socket.IO room for this game
    client.join(data.gameId);

    // 2. Add player to the game logic
    const gameState = this.gameService.createOrJoinGame(data.gameId, user);

    // 3. Notify EVERYONE in the room that state updated
    this.server.to(data.gameId).emit('game_state_update', gameState);
    
    this.logger.log(`User ${user.username} joined game ${data.gameId}`);
  }

  @SubscribeMessage('roll_dice')
  handleRollDice(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket
  ) {
    const user = client.data.user;
    try {
      // 1. Process logic
      const newState = this.gameService.processRoll(data.gameId, user.id);

      // 2. Broadcast result
      this.server.to(data.gameId).emit('game_state_update', newState);
      
    } catch (e) {
      // Send error only to the specific client
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('move_player')
  handleMovePlayer(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.processMove(data.gameId, user.id);
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }
}
