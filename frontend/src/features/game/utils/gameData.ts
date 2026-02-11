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
  marioKart: { emoji: '🏎️', label: 'Mario Kart' },
  stage: { emoji: '👨‍💼', label: 'Looking for Stage' },
  death: { emoji: '🕳️', label: 'Black Hole' },
  challenge: { emoji: '👾', label: 'Code' },
  mystery: { emoji: '❓', label: 'Mystery' },
  piscine: { emoji: '🏊‍♂️', label: 'Piscine' },
  piscineExam : { emoji: '📚', label: 'Piscine Exam' },
};
