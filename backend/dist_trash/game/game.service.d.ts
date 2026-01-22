import { GameRoom, GameState } from './game.logic';
import { User } from '@prisma/client';
export declare class GameService {
    private activeGames;
    createOrJoinGame(gameId: string, user: User): GameState;
    getGame(gameId: string): GameRoom | undefined;
    processRoll(gameId: string, userId: number): GameState;
    removeGame(gameId: string): void;
    processMove(gameId: string, userId: number): GameState;
    payToEscape(gameId: string, userId: number): GameState;
    purchaseItem(gameId: string, userId: number, itemId: string): GameState;
    useItem(gameId: string, userId: number, itemId: string, targetPlayerId?: number): GameState;
    submitChallenge(gameId: string, userId: number, answerIndex: number): GameState;
    placeBet(gameId: string, userId: number, prediction: 'success' | 'fail'): GameState;
}
