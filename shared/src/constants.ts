import { ShopItem, TileEffectType } from './types';

export const BOARD_SIZE = 47;
export const MAX_PLAYERS = 4;
export const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

export const EVAL_TILES = [5, 14, 23, 27, 32, 41];
export const PISCINE_TILES = [1, 2, 3, 4, 6, 7, 8];
export const STARTING_COINS = 10;
export const EVAL_COIN_REWARD = 5;

export const SPECIAL_TILES: Record<number, TileEffectType> = {
  19: 'marioKart',
  12: 'marioKart',
  42: 'stage',
  34: 'death',
  15: 'challenge',
  35: 'challenge',
  9: 'piscineExam',
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'norminette_pass',
    name: 'Norminette Pass',
    description: 'Block the next negative effect (your code passes norm this time)',
    cost: 5,
    targetOther: false,
  },
  {
    id: 'bonus_eval',
    name: 'Bonus Eval Slot',
    description: 'Get an additional roll this turn (you booked an extra eval)',
    cost: 12,
    targetOther: false,
  },
  {
    id: 'segfault_trap',
    name: 'Segfault Trap',
    description: 'Target player skips their next turn (their program segfaulted)',
    cost: 10,
    targetOther: true,
  },
  {
    id: 'git_reset_hard',
    name: 'Git Reset --Hard',
    description: 'Push a player back 3 tiles (force-reset their progress)',
    cost: 8,
    targetOther: true,
  },
  {
    id: 'peer_swap',
    name: 'Peer Swap',
    description: 'Swap positions with another player (mandatory peer learning)',
    cost: 18,
    targetOther: true,
  },
  {
    id: 'moulinette_roulette',
    name: 'Moulinette Roulette',
    description: 'Shuffle all player positions! (Moulinette went haywire)',
    cost: 25,
    targetOther: false,
  },
];

// Escape costs for special tiles
export const ESCAPE_COSTS: Partial<Record<TileEffectType, number>> = {
  death: 20,
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
