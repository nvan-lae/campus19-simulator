"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const game_logic_1 = require("./game.logic");
let GameService = class GameService {
    constructor() {
        this.activeGames = new Map();
    }
    createOrJoinGame(gameId, user) {
        let game = this.activeGames.get(gameId);
        if (!game) {
            game = new game_logic_1.GameRoom(gameId);
            this.activeGames.set(gameId, game);
        }
        game.addPlayer(user);
        return game.getState();
    }
    getGame(gameId) {
        return this.activeGames.get(gameId);
    }
    processRoll(gameId, userId) {
        const game = this.activeGames.get(gameId);
        if (!game)
            throw new Error('Game not found');
        return game.rollDice(userId);
    }
    removeGame(gameId) {
        this.activeGames.delete(gameId);
    }
    processMove(gameId, userId) {
        const game = this.activeGames.get(gameId);
        if (!game)
            throw new Error('Game not found');
        return game.makeMove(userId);
    }
    payToEscape(gameId, userId) {
        const game = this.activeGames.get(gameId);
        if (!game)
            throw new Error('Game not found');
        return game.payToEscape(userId);
    }
    purchaseItem(gameId, userId, itemId) {
        const game = this.activeGames.get(gameId);
        if (!game)
            throw new Error('Game not found');
        return game.purchaseItem(userId, itemId);
    }
    useItem(gameId, userId, itemId, targetPlayerId) {
        const game = this.activeGames.get(gameId);
        if (!game)
            throw new Error('Game not found');
        return game.useItem(userId, itemId, targetPlayerId);
    }
    submitChallenge(gameId, userId, answerIndex) {
        const game = this.activeGames.get(gameId);
        if (!game)
            throw new Error('Game not found');
        return game.submitChallenge(userId, answerIndex);
    }
    placeBet(gameId, userId, prediction) {
        const game = this.activeGames.get(gameId);
        if (!game)
            throw new Error('Game not found');
        return game.placeBet(userId, prediction);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map