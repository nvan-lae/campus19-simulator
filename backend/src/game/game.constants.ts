// Game of the Goose - Constants and Configuration

export const BOARD_SIZE = 47;
export const MAX_PLAYERS = 4;
export const STARTING_COINS = 10;

export const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

// Goose tiles - landing here doubles your roll and earns coins
// Classic Goose tiles: 5, 14, 18, 23, 27, 32, 41,
export const GOOSE_TILES = [5, 14, 23, 27, 32, 41];
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
  | 'challenge'
  | 'piscineExam';

// Special tiles configuration
export const SPECIAL_TILES: Record<number, TileEffectType> = {
  10: 'bridge', // Bridge to 12
  19: 'inn', // Inn (wait)
  42: 'labyrinth', // Labyrinth (back to 30 or 39?) Classic is 42->30
  34: 'death', // Black Hole (back to Start)

  // Add 3 coding challenges scattered
  15: 'challenge',
  35: 'challenge',

  // PiscineExam - player gets stuck until they answer correctly
  9: 'piscineExam',
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
    question: 'What is the output of the following code on a system where int is 4 bytes?\n\nint arr[] = {10, 20, 30, 40, 50};\nint *ptr = arr;\nprintf("%d", *(ptr + 3));',
    options: ['20', '30', '40', '50'],
    correctIndex: 2,
    rewardCoins: 5,
  },
  {
    id: 'q2',
    question: 'Which data structure uses LIFO (Last In First Out) principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctIndex: 1,
    rewardCoins: 5,
  },
  {
    id: 'q3',
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctIndex: 1,
    rewardCoins: 5,
  },
  {
    id: 'q4',
    question: 'In C, which keyword is used to declare a variable that cannot be reassigned?',
    options: ['const', 'static', 'volatile', 'register'],
    correctIndex: 0,
    rewardCoins: 5,
  },
  {
    id: 'q5',
    question: 'What is the size of a "char" data type in C?',
    options: ['1 byte', '2 bytes', '4 bytes', 'Depends on the CPU'],
    correctIndex: 0,
    rewardCoins: 5,
  },
  {
    id: 'q6',
    question: 'What will the following code output?\n\nint a = 10, b = 20;\nprintf("%d", a > b ? a : b);',
    options: ['10', '20', '1', '0'],
    correctIndex: 1,
    rewardCoins: 5,
  },
  {
    id: 'q7',
    question: 'What is the correct format specifier for printing a long value in printf()?',
    options: ['%d', '%ld', '%l', '%lf'],
    correctIndex: 1,
    rewardCoins: 5,
  },
  {
    id: 'q8',
    question: 'Which of the following is NOT a valid loop construct in C?',
    options: ['for', 'while', 'do while', 'foreach'],
    correctIndex: 3,
    rewardCoins: 5,
  },
  {
    id: 'q9',
    question: 'What does the "break" statement do in a loop?',
    options: ['Skips the current iteration', 'Exits the loop', 'Pauses the loop', 'Restarts the loop'],
    correctIndex: 1,
    rewardCoins: 5,
  }
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
