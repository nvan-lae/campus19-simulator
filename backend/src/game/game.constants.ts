// Game of the Goose - Constants and Configuration

export const BOARD_SIZE = 63;
export const MAX_PLAYERS = 4;
export const STARTING_COINS = 10;

export const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

// Goose tiles - landing here doubles your roll and earns coins
// Classic Goose tiles: 5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59
export const GOOSE_TILES = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];
export const GOOSE_COIN_REWARD = 5;

// Special tile types
export type TileEffectType =
  | 'none'
  | 'goose'
  | 'bridge'
  | 'inn'
  | 'well'
  | 'labyrinth'
  | 'prison'
  | 'death'
  | 'challenge';

// Special tiles configuration
export const SPECIAL_TILES: Record<number, TileEffectType> = {
  6: 'bridge', // Bridge to 12
  19: 'inn', // Inn (wait)
  31: 'well', // Well (wait)
  42: 'labyrinth', // Labyrinth (back to 30 or 39?) Classic is 42->30
  52: 'prison', // Prison (wait)
  58: 'death', // Death (back to Start)

  // Add 3 coding challenges scattered
  15: 'challenge',
  35: 'challenge',
  55: 'challenge',
};

// Coding Challenges
export interface CodingQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  rewardCoins: number;
}

export const CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: 'q1',
    question: 'What is the specific type for an integer in TypeScript?',
    options: ['int', 'number', 'float', 'Integer'],
    correctIndex: 1,
    rewardCoins: 15,
  },
  {
    id: 'q2',
    question: 'Which method adds an element to the end of an array?',
    options: ['push()', 'pop()', 'unshift()', 'concat()'],
    correctIndex: 0,
    rewardCoins: 10,
  },
  {
    id: 'q3',
    question: 'What does "NaN" stand for?',
    options: ['Not a Null', 'No a Number', 'Not a Number', 'New and Null'],
    correctIndex: 2,
    rewardCoins: 12,
  },
];

// Escape costs for special tiles
export const ESCAPE_COSTS: Partial<Record<TileEffectType, number>> = {
  well: 10,
  prison: 15,
  death: 20,
};

// Shop items configuration
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  targetOther: boolean; // true if used against another player
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'skip_shield',
    name: 'Skip Shield',
    description: 'Block the next negative effect',
    cost: 10,
    targetOther: false,
  },
  {
    id: 'extra_roll',
    name: 'Extra Roll',
    description: 'Get an additional roll this turn',
    cost: 15,
    targetOther: false,
  },
  {
    id: 'freeze_trap',
    name: 'Freeze Trap',
    description: 'Target player skips their next turn',
    cost: 12,
    targetOther: true,
  },
  {
    id: 'pushback',
    name: 'Pushback',
    description: 'Push a player back 3 tiles',
    cost: 8,
    targetOther: true,
  },
  {
    id: 'swap_position',
    name: 'Swap Position',
    description: 'Swap positions with another player',
    cost: 15,
    targetOther: true,
  },
  {
    id: 'chaos_orb',
    name: 'Chaos Orb',
    description: 'Shuffle all player positions!',
    cost: 25,
    targetOther: false,
  },
];

// Get the effect type for a given tile
export const getTileEffect = (position: number): TileEffectType => {
  if (GOOSE_TILES.includes(position)) return 'goose';
  return SPECIAL_TILES[position] || 'none';
};

// Get the destination for special movement tiles
export const getSpecialDestination = (
  position: number,
  effect: TileEffectType,
): number | null => {
  switch (effect) {
    case 'bridge':
      return 12; // 6 -> 12
    case 'labyrinth':
      return 30; // 42 -> 30
    case 'death':
      return 0; // 58 -> Start
    default:
      return null;
  }
};
