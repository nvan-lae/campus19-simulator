export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  targetOther: boolean;
}

export interface InventoryItem {
  itemId: string;
  name: string;
}

export type TileEffectType =
  | 'none'
  | 'goose'
  | 'bridge'
  | 'inn'
  | 'well'
  | 'labyrinth'
  | 'prison'
  | 'death'
  | 'challenge'
  | 'piscineExam'
  | 'piscine'
  | 'mystery';

// User & Stats
export interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  stats?: GameStats;
}

export interface GameStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
}

// Core Game Objects
export interface GamePlayer {
  id: number;
  username: string;
  color: string;
  position: number;
  order: number;
  coins: number;
  turnsToSkip: number;
  stuckInWell: boolean;
  stuckOnPiscineExam: boolean;
  hasShield: boolean;
  inventory: InventoryItem[];
}

export interface ActiveChallenge {
  playerId: number;
  questionId: string;
  questionText: string;
  options: string[];
  reward: number;
  bets: { playerId: number; prediction: 'success' | 'fail' }[];
}

// The Full Game State
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
  currentTurnBets: { playerId: number; bet: 'low' | 'high' }[];
  rollBetResult: {
    winners: number[];
    losers: number[];
    outcome: 'low' | 'high';
  } | null;
  rollAvailableAt: string | null;
  turnStartTime: number | null;
  turnTimeLimit: number;
}

// Match / Lobby
export interface Match {
  id: string;
  status: 'waiting' | 'in-progress' | 'completed';
  players: GamePlayer[];
  winner?: PublicUser;
  createdAt: string;
}
