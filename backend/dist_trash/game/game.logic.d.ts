import { User } from '@prisma/client';
export interface InventoryItem {
    itemId: string;
    name: string;
}
export interface GamePlayer {
    id: number;
    username: string;
    color: string;
    position: number;
    order: number;
    coins: number;
    turnsToSkip: number;
    stuckInWell: boolean;
    hasShield: boolean;
    inventory: InventoryItem[];
}
export interface ActiveChallenge {
    playerId: number;
    questionId: string;
    questionText: string;
    options: string[];
    reward: number;
    bets: {
        playerId: number;
        prediction: 'success' | 'fail';
    }[];
}
export interface GameState {
    players: GamePlayer[];
    currentPlayerIndex: number;
    diceValue: number | null;
    gameOver: boolean;
    winner: GamePlayer | null;
    lastMoveDescription: string | null;
    pendingGooseRoll: boolean;
    activeChallenge: ActiveChallenge | null;
    turnCount: number;
    currentGlobalEvent: 'gravity_flux' | 'inflation' | 'windy' | null;
    bountyTargetId: number | null;
}
export declare class GameRoom {
    readonly roomId: string;
    private state;
    private readonly MAX_PLAYERS;
    private readonly COLORS;
    constructor(roomId: string);
    rollDice(userId: number): GameState;
    makeMove(userId: number): GameState;
    private applyTileEffect;
    submitChallenge(userId: number, answerIndex: number): GameState;
    payToEscape(userId: number): GameState;
    purchaseItem(userId: number, itemId: string): GameState;
    useItem(userId: number, itemId: string, targetPlayerId?: number): GameState;
    private rescueFromWell;
    private nextTurn;
    addPlayer(user: User): boolean;
    getState(): GameState;
    placeBet(userId: number, prediction: 'success' | 'fail'): GameState;
}
