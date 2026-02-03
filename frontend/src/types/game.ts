// --- Domain Entities (Database/API shapes) ---

export interface User {
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

// --- Shop and Inventory ---

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

// Shop items available for purchase
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'skip_shield',
    name: 'Skip Shield',
    description: 'Block the next negative effect',
    cost: 10,
    targetOther: false,
  },
  {
    id: 'extra_roll',
    name: 'Extra Roll',
    description: 'Get an additional roll this turn',
    cost: 15,
    targetOther: false,
  },
  {
    id: 'freeze_trap',
    name: 'Freeze Trap',
    description: 'Target player skips their next turn',
    cost: 12,
    targetOther: true,
  },
  {
    id: 'pushback',
    name: 'Pushback',
    description: 'Push a player back 3 tiles',
    cost: 8,
    targetOther: true,
  },

  {
    id: 'swap_position',
    name: 'Swap Position',
    description: 'Swap positions with another player',
    cost: 15,
    targetOther: true,
  },
  {
    id: 'chaos_orb',
    name: 'Chaos Orb',
    description: 'Shuffle all player positions!',
    cost: 25,
    targetOther: false,
  },
];

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
  | 'mystery';

// --- Live Game State (Socket shapes) ---

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
  bets: { playerId: number; prediction: 'success' | 'fail' }[];
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
  currentTurnBets: { playerId: number; bet: 'low' | 'high' }[];
  rollBetResult: {
    winners: number[];
    losers: number[];
    outcome: 'low' | 'high';
  } | null;
  rollAvailableAt: string | null;
}

// --- Match History (optional, for Lobby/Profile) ---
export interface Match {
  id: string;
  status: 'waiting' | 'in-progress' | 'completed';
  players: GamePlayer[];
  winner?: User;
  createdAt: string;
}
