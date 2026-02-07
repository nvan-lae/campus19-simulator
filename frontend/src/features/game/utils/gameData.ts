import type { TileEffectType } from '../../../types/game';

export { type TileEffectType };

export const BOARD_SIZE = 47;

// Goose tiles - landing here doubles your roll and earns coins
export const GOOSE_TILES = [5, 14, 23, 27, 32, 41];
export const PISCINE_TILES = [1, 2, 3, 4, 6 ,7 ,8];

// Special tiles configuration
export const SPECIAL_TILES: Record<number, TileEffectType> = {
  10: 'bridge', // Jump to tile 12
  19: 'inn', // Skip 1 turn
  31: 'well', // Stuck until someone else lands or pay coins
  42: 'labyrinth', // Go back to tile 30
  34: 'death', // Death (back to Start)

  // Scatered challenges
  9: 'piscineExam',
  15: 'challenge',
  35: 'challenge',
};

// Get the effect type for a given tile
export const getEffectType = (position: number): TileEffectType => {
  if (GOOSE_TILES.includes(position)) return 'goose';
  if (PISCINE_TILES.includes(position)) return 'piscine';
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
  labyrinth: { emoji: '🧩', label: 'Maze' },
  prison: { emoji: '⛓️', label: 'Prison' },
  death: { emoji: '💀', label: 'Death' },
  challenge: { emoji: '👾', label: 'Code' },
  mystery: { emoji: '❓', label: 'Mystery' },
  piscine: { emoji: '🏊‍♂️', label: 'Piscine' },
  piscineExam : { emoji: '📚', label: 'Piscine Exam' },
};
