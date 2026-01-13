export const BOARD_SIZE = 42;

// Keep these for rendering the board lines/images
export const SNAKES = { 17: 4 };
export const LADDERS = { 3: 22, 5: 14, 20: 39, 32: 42 };

export const getEffectType = (position: number): 'snake' | 'ladder' | 'none' => {
  if (SNAKES[position as keyof typeof SNAKES]) return 'snake';
  if (LADDERS[position as keyof typeof LADDERS]) return 'ladder';
  return 'none';
};
