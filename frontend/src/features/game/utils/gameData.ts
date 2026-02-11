import  { type TileEffectType, getTileEffect } from '@campus19/shared';
export { getTileEffect as getEffectType };


// Tile display info for UI
export interface TileInfo {
  emoji?: string;
  label?: string;
}

export const TILE_INFO: Record<TileEffectType, TileInfo> = {
  none: {},
  goose: { emoji: '🪿', label: 'Goose' },
  inn: { emoji: '🏨', label: 'Inn' },
  labyrinth: { emoji: '🧩', label: 'Maze' },
  death: { emoji: '🕳️', label: 'Black Hole' },
  challenge: { emoji: '👾', label: 'Code' },
  mystery: { emoji: '❓', label: 'Mystery' },
  piscine: { emoji: '🏊‍♂️', label: 'Piscine' },
  piscineExam : { emoji: '📚', label: 'Piscine Exam' },
};
