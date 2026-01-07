export interface User {
  id: string;
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

export interface Player {
  id: string;
  user: User;
  position: number;
  order: number;
}

export interface Match {
  id: string;
  status: 'waiting' | 'in-progress' | 'completed';
  players: Player[];
  currentPlayerOrder: number;
  winner?: User;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface GameMove {
  playerId: string;
  diceValue: number;
  newPosition: number;
  timestamp: string;
}
