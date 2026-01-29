import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
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
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly gameService: GameService, // Inject our new service
  ) { }

  async handleConnection(client: Socket) {
    try {
      // 1. Extract the token from the header: "Bearer <token>"
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization;

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
      this.logger.log(
        `Client connected: ${client.id} (User: ${user.username})`,
      );
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Optional: Handle player disconnect (pause game? auto-forfeit?)
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.data.user;
    if (!user) {
      this.logger.error(`User not found on socket ${client.id} during join_game`);
      client.emit('game_error', { message: 'Authentication pending. Please retry.' });
      return;
    }

    // 1. Join the Socket.IO room for this game
    try {
      this.logger.log(`[GameGateway] Client ${client.id} (User ${user.username}) joining room ${data.gameId}`);
      await client.join(data.gameId);

      // 2. Add player to the game logic
      this.logger.log(`[GameGateway] Calling gameService.joinGame for ${data.gameId}`);
      const gameState = this.gameService.joinGame(data.gameId, user);

      // 3. Notify EVERYONE in the room that state updated
      this.logger.log(`[GameGateway] Emitting game_state_update to room ${data.gameId}. Players: ${gameState.players.length}`);
      this.server.to(data.gameId).emit('game_state_update', gameState);

    } catch (e) {
      this.logger.error(`[GameGateway] Error in join_game: ${e.message}`);
      client.emit('game_error', { message: e.message });
      await client.leave(data.gameId);
    }
  }

  @SubscribeMessage('player_ready')
  async handlePlayerReady(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.data.user;
    if (!user) return;
    try {
      const newState = this.gameService.toggleReady(data.gameId, user.id);
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('start_game')
  async handleStartGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.data.user;
    if (!user) return;
    try {
      const newState = this.gameService.startGame(data.gameId, user.id);
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('roll_dice')
  handleRollDice(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
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
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.processMove(data.gameId, user.id);
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('pay_escape')
  handlePayEscape(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.payToEscape(data.gameId, user.id);
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('purchase_item')
  handlePurchaseItem(
    @MessageBody() data: { gameId: string; itemId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.purchaseItem(
        data.gameId,
        user.id,
        data.itemId,
      );
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('use_item')
  handleUseItem(
    @MessageBody()
    data: { gameId: string; itemId: string; targetPlayerId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.useItem(
        data.gameId,
        user.id,
        data.itemId,
        data.targetPlayerId,
      );
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('submit_challenge')
  handleSubmitChallenge(
    @MessageBody() data: { gameId: string; answerIndex: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.submitChallenge(
        data.gameId,
        user.id,
        data.answerIndex,
      );
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('place_bet')
  handlePlaceBet(
    @MessageBody() data: { gameId: string; prediction: 'success' | 'fail' },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.placeBet(
        data.gameId,
        user.id,
        data.prediction,
      );
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('place_roll_bet')
  handlePlaceRollBet(
    @MessageBody() data: { gameId: string; prediction: 'low' | 'high' },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    try {
      const newState = this.gameService.placeRollBet(
        data.gameId,
        user.id,
        data.prediction,
      );
      this.server.to(data.gameId).emit('game_state_update', newState);
    } catch (e) {
      client.emit('game_error', { message: e.message });
    }
  }

  @SubscribeMessage('send_reaction')
  handleSendReaction(
    @MessageBody() data: { gameId: string; emoji: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!client.rooms.has(data.gameId)) return;
    // Just broadcast the reaction, no state change really needed for now
    // But we might want to validate gameId
    this.server.to(data.gameId).emit('game_reaction', {
      playerId: user.id,
      emoji: data.emoji,
    });
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @MessageBody() data: { gameId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!data.message || data.message.trim().length === 0) return;

    this.server.to(data.gameId).emit('chat_message', {
      playerId: user.id,
      username: user.username,
      message: data.message.trim(),
      timestamp: new Date().toISOString(),
    });
  }
}
