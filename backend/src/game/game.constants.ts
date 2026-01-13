export const BOARD_SIZE = 42;
export const MAX_PLAYERS = 4;
export const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

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

// Simple helper to calculate new position
export const checkTileEffect = (position: number): number => {
  if (TILE_EFFECTS[position]) {
    return TILE_EFFECTS[position];
  }
  return position;
};
