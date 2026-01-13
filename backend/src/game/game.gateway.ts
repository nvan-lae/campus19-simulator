import { Injectable } from '@nestjs/common';
import { GameRoom, GameState } from './game.logic';
import { User } from '@prisma/client';

@Injectable()
export class GameService {
  // Map<GameID, GameRoom>
  private activeGames: Map<string, GameRoom> = new Map();

  createOrJoinGame(gameId: string, user: User): GameState {
    let game = this.activeGames.get(gameId);

    if (!game) {
      game = new GameRoom(gameId);
      this.activeGames.set(gameId, game);
    }

    game.addPlayer(user);
    return game.getState();
  }

  getGame(gameId: string): GameRoom | undefined {
    return this.activeGames.get(gameId);
  }

  processMove(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    
    return game.rollDice(userId);
  }

  removeGame(gameId: string) {
    this.activeGames.delete(gameId);
  }
}