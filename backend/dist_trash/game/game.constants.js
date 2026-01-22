"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialDestination = exports.getTileEffect = exports.SHOP_ITEMS = exports.ESCAPE_COSTS = exports.CODING_QUESTIONS = exports.SPECIAL_TILES = exports.GOOSE_COIN_REWARD = exports.GOOSE_TILES = exports.COLORS = exports.STARTING_COINS = exports.MAX_PLAYERS = exports.BOARD_SIZE = void 0;
exports.BOARD_SIZE = 63;
exports.MAX_PLAYERS = 4;
exports.STARTING_COINS = 10;
exports.COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];
exports.GOOSE_TILES = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];
exports.GOOSE_COIN_REWARD = 5;
exports.SPECIAL_TILES = {
    6: 'bridge',
    19: 'inn',
    31: 'well',
    42: 'labyrinth',
    52: 'prison',
    58: 'death',
    15: 'challenge',
    35: 'challenge',
    55: 'challenge',
};
exports.CODING_QUESTIONS = [
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
exports.ESCAPE_COSTS = {
    well: 10,
    prison: 15,
    death: 20,
};
exports.SHOP_ITEMS = [
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
const getTileEffect = (position) => {
    if (exports.GOOSE_TILES.includes(position))
        return 'goose';
    return exports.SPECIAL_TILES[position] || 'none';
};
exports.getTileEffect = getTileEffect;
const getSpecialDestination = (position, effect) => {
    switch (effect) {
        case 'bridge':
            return 12;
        case 'labyrinth':
            return 30;
        case 'death':
            return 0;
        default:
            return null;
    }
};
exports.getSpecialDestination = getSpecialDestination;
//# sourceMappingURL=game.constants.js.map