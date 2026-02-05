import { Injectable, Logger } from '@nestjs/common';
import { GameRoom, GameState } from './game.logic';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  // Map<GameID, GameRoom>
  private activeGames: Map<string, GameRoom> = new Map();

  constructor(private prisma: PrismaService) { }

  createGame(user: User): string {
    // Generate a random game ID (or use numeric auto-inc if preferred, but string is fine)
    // Using a simple 6-char random string for ease of typing if we wanted manual join
    // UUID is safer for collisions.
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Ensure uniqueness
    if (this.activeGames.has(gameId)) {
      return this.createGame(user); // Retry
    }

    const game = new GameRoom(gameId);
    game.addPlayer(user); // Host joins automatically
    this.activeGames.set(gameId, game);

    this.logger.log(`Game created: ${gameId} by ${user.username}`);
    return gameId;
  }

  joinGame(gameId: string, user: User): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const added = game.addPlayer(user);
    if (!added) {
      if (game.getState().players.find(p => p.id === user.id)) {
        // Already in game, just return state (reconnect)
        return game.getState();
      }
      throw new Error('Game is full or already started');
    }

    this.logger.log(`User ${user.username} joined game ${gameId}`);
    return game.getState();
  }

  getOpenLobbies() {
    const lobbies: { gameId: string; host: string; players: number; maxPlayers: number }[] = [];
    for (const [id, game] of this.activeGames) {
      const state = game.getState();
      if (state.status === 'LOBBY') {
        lobbies.push({
          gameId: id,
          host: state.players[0]?.username || 'Unknown',
          players: state.players.length,
          maxPlayers: 4, // Expose constant?
        });
      }
    }
    return lobbies;
  }

  toggleReady(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.toggleReady(userId);
  }

  startGame(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    return game.startGame(userId);
  }

  getGame(gameId: string): GameRoom | undefined {
    return this.activeGames.get(gameId);
  }

  processRoll(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');

    const state = game.rollDice(userId);
    void this.checkForGameOver(gameId, state);
    return state;
  }

  removeGame(gameId: string) {
    this.activeGames.delete(gameId);
  }

  processMove(gameId: string, userId: number): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    const state = game.makeMove(userId);
    void this.checkForGameOver(gameId, state);
    return state;
  }

  private async checkForGameOver(gameId: string, state: GameState) {
    if (state.gameOver && state.winner) {
      this.logger.log(`Game ${gameId} ended. Winner: ${state.winner.username}`);
      await this.saveMatch(gameId, state);
    }
  }

  private async saveMatch(gameId: string, state: GameState) {
    try {
      // Sort players by rank (simple version: winner is 1st, others by position)
      const rankedPlayers = [...state.players].sort((a, b) => {
        if (a.id === state.winner?.id) return -1;
        if (b.id === state.winner?.id) return 1;
        return b.position - a.position; // Sort by position descending
      });

      await this.prisma.match.create({
        data: {
          players: {
            create: rankedPlayers.map((p, index) => ({
              userId: p.id,
              isWinner: p.id === state.winner?.id,
              rank: index + 1,
              coins: p.coins,
            })),
          },
        },
      });
      this.logger.log(`Match stored for game ${gameId}`);
      // Don't remove game immediately? Maybe keep for a bit for players to see result.
      // this.removeGame(gameId); // Optional cleanup
    } catch (error) {
      this.logger.error(`Failed to save match for game ${gameId}`, error);
    }
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
