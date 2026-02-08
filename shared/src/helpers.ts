import { GOOSE_TILES, PISCINE_TILES, SPECIAL_TILES } from './constants';
import { TileEffectType } from './types';

export const getTileEffect = (position: number): TileEffectType => {
  if (GOOSE_TILES.indexOf(position) !== -1) return 'goose';
  if (PISCINE_TILES.indexOf(position) !== -1) return 'piscine';
  return SPECIAL_TILES[position] || 'none';
};
