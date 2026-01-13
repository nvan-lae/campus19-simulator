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

// --- Live Game State (Socket shapes) ---

export interface GamePlayer {
  id: number;
  username: string;
  color: string;
  position: number;
  order: number;
}

export interface GameState {
  players: GamePlayer[];
  currentPlayerIndex: number;
  diceValue: number | null;
  gameOver: boolean;
  winner: GamePlayer | null;
  lastMoveDescription: string | null;
}

// --- Match History (optional, for Lobby/Profile) ---
export interface Match {
  id: string;
  status: 'waiting' | 'in-progress' | 'completed';
  // Use GamePlayer or a simplified version here depending on your API
  players: GamePlayer[]; 
  winner?: User;
  createdAt: string;
}
