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

  processRoll(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');

    return game.rollDice(userId);
  }

  removeGame(gameId: string) {
    this.activeGames.delete(gameId);
  }

  processMove(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.makeMove(userId);
  }

  payToEscape(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.payToEscape(userId);
  }

  purchaseItem(gameId: string, userId: number, itemId: string): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.purchaseItem(userId, itemId);
  }

  useItem(
    gameId: string,
    userId: number,
    itemId: string,
    targetPlayerId?: number,
  ): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.useItem(userId, itemId, targetPlayerId);
  }

  submitChallenge(
    gameId: string,
    userId: number,
    answerIndex: number,
  ): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.submitChallenge(userId, answerIndex);
  }

  placeBet(
    gameId: string,
    userId: number,
    prediction: 'success' | 'fail',
  ): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.placeBet(userId, prediction);
  }

  placeRollBet(
    gameId: string,
    userId: number,
    prediction: 'low' | 'high',
  ): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.placeRollBet(userId, prediction);
  }
}
