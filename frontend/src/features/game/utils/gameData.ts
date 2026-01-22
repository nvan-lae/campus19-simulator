import type { TileEffectType } from '../../../types/game';

export { type TileEffectType };

export const BOARD_SIZE = 63;

// Goose tiles - landing here doubles your roll and earns coins
export const GOOSE_TILES = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];

// Special tiles configuration
export const SPECIAL_TILES: Record<number, TileEffectType> = {
  6: 'bridge', // Jump to tile 12
  19: 'inn', // Skip 1 turn
  31: 'well', // Stuck until someone else lands or pay coins
  42: 'labyrinth', // Go back to tile 30
  52: 'prison', // Skip 2 turns or pay coins
  58: 'death', // Start over or pay coins

  // Scatered challenges
  15: 'challenge',
  35: 'challenge',
  55: 'challenge',
};

// Get the effect type for a given tile
export const getEffectType = (position: number): TileEffectType => {
  if (GOOSE_TILES.includes(position)) return 'goose';
  return SPECIAL_TILES[position] || 'none';
};

// Tile display info for UI
export interface TileInfo {
  emoji?: string;
  label?: string;
}

export const TILE_INFO: Record<TileEffectType, TileInfo> = {
  none: {},
  goose: { emoji: '🪿', label: 'Goose' },
  bridge: { emoji: '🌉', label: 'Bridge' },
  inn: { emoji: '🏨', label: 'Inn' },
  well: { emoji: '🕳️', label: 'Well' },
  labyrinth: { emoji: '🌀', label: 'Maze' },
  prison: { emoji: '⛓️', label: 'Prison' },
  death: { emoji: '💀', label: 'Death' },
  challenge: { emoji: '👾', label: 'Code' },
  mystery: { emoji: '❓', label: 'Mystery' },
};
