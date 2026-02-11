import { EVAL_TILES, PISCINE_TILES, SPECIAL_TILES } from './constants';
import { TileEffectType } from './types';

export const getTileEffect = (position: number): TileEffectType => {
  if (EVAL_TILES.indexOf(position) !== -1) return 'eval';
  if (PISCINE_TILES.indexOf(position) !== -1) return 'piscine';
  return SPECIAL_TILES[position] || 'none';
};
