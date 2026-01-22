export declare const BOARD_SIZE = 63;
export declare const MAX_PLAYERS = 4;
export declare const STARTING_COINS = 10;
export declare const COLORS: string[];
export declare const GOOSE_TILES: number[];
export declare const GOOSE_COIN_REWARD = 5;
export type TileEffectType = 'none' | 'goose' | 'bridge' | 'inn' | 'well' | 'labyrinth' | 'prison' | 'death' | 'challenge' | 'mystery';
export declare const SPECIAL_TILES: Record<number, TileEffectType>;
export interface CodingQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    rewardCoins: number;
}
export declare const CODING_QUESTIONS: CodingQuestion[];
export declare const ESCAPE_COSTS: Partial<Record<TileEffectType, number>>;
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    targetOther: boolean;
}
export declare const SHOP_ITEMS: ShopItem[];
export declare const getTileEffect: (position: number) => TileEffectType;
export declare const getSpecialDestination: (position: number, effect: TileEffectType) => number | null;
