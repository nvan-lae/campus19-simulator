// Mock game data and constants
export const BOARD_SIZE = 42;
export const SNAKES = {
  17: 4,
};

export const LADDERS = {
  3: 22,
  5: 14,
  20: 39,
  32: 42,
};

export const TILE_EFFECTS = {
  ...SNAKES,
  ...LADDERS,
};

export const mockPlayers = [
  {
    id: 'player1',
    name: 'You',
    color: '#FF6B6B',
    position: 0,
    order: 0,
  },
  {
    id: 'player2',
    name: 'CPU 1',
    color: '#4ECDC4',
    position: 0,
    order: 1,
  },
  {
    id: 'player3',
    name: 'CPU 2',
    color: '#FFE66D',
    position: 0,
    order: 2,
  },
  {
    id: 'player4',
    name: 'CPU 3',
    color: '#95E1D3',
    position: 0,
    order: 3,
  },
];

export const checkTileEffect = (position: number): number => {
  if (TILE_EFFECTS[position as keyof typeof TILE_EFFECTS]) {
    return TILE_EFFECTS[position as keyof typeof TILE_EFFECTS];
  }
  return position;
};

export const isSnake = (position: number): boolean => {
  return SNAKES[position as keyof typeof SNAKES] !== undefined;
};

export const isLadder = (position: number): boolean => {
  return LADDERS[position as keyof typeof LADDERS] !== undefined;
};

export const getEffectType = (
  position: number
): 'snake' | 'ladder' | 'none' => {
  if (isSnake(position)) return 'snake';
  if (isLadder(position)) return 'ladder';
  return 'none';
};
