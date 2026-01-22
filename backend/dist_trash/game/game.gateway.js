"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const game_service_1 = require("./game.service");
let GameGateway = class GameGateway {
    constructor(jwtService, usersService, gameService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.gameService = gameService;
        this.logger = new common_1.Logger('GameGateway');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization;
            if (!token) {
                this.logger.warn(`Client ${client.id} has no token. Disconnecting...`);
                client.disconnect();
                return;
            }
            const cleanToken = token.replace('Bearer ', '');
            const payload = this.jwtService.verify(cleanToken);
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                client.disconnect();
                return;
            }
            client.data.user = user;
            this.logger.log(`Client connected: ${client.id} (User: ${user.username})`);
        }
        catch (error) {
            this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinGame(data, client) {
        const user = client.data.user;
        if (!user)
            return;
        await client.join(data.gameId);
        const gameState = this.gameService.createOrJoinGame(data.gameId, user);
        this.server.to(data.gameId).emit('game_state_update', gameState);
        this.logger.log(`User ${user.username} joined game ${data.gameId}`);
    }
    handleRollDice(data, client) {
        const user = client.data.user;
        try {
            const newState = this.gameService.processRoll(data.gameId, user.id);
            this.server.to(data.gameId).emit('game_state_update', newState);
        }
        catch (e) {
            client.emit('game_error', { message: e.message });
        }
    }
    handleMovePlayer(data, client) {
        const user = client.data.user;
        try {
            const newState = this.gameService.processMove(data.gameId, user.id);
            this.server.to(data.gameId).emit('game_state_update', newState);
        }
        catch (e) {
            client.emit('game_error', { message: e.message });
        }
    }
    handlePayEscape(data, client) {
        const user = client.data.user;
        try {
            const newState = this.gameService.payToEscape(data.gameId, user.id);
            this.server.to(data.gameId).emit('game_state_update', newState);
        }
        catch (e) {
            client.emit('game_error', { message: e.message });
        }
    }
    handlePurchaseItem(data, client) {
        const user = client.data.user;
        try {
            const newState = this.gameService.purchaseItem(data.gameId, user.id, data.itemId);
            this.server.to(data.gameId).emit('game_state_update', newState);
        }
        catch (e) {
            client.emit('game_error', { message: e.message });
        }
    }
    handleUseItem(data, client) {
        const user = client.data.user;
        try {
            const newState = this.gameService.useItem(data.gameId, user.id, data.itemId, data.targetPlayerId);
            this.server.to(data.gameId).emit('game_state_update', newState);
        }
        catch (e) {
            client.emit('game_error', { message: e.message });
        }
    }
    handleSubmitChallenge(data, client) {
        const user = client.data.user;
        try {
            const newState = this.gameService.submitChallenge(data.gameId, user.id, data.answerIndex);
            this.server.to(data.gameId).emit('game_state_update', newState);
        }
        catch (e) {
            client.emit('game_error', { message: e.message });
        }
    }
    handlePlaceBet(data, client) {
        const user = client.data.user;
        try {
            const newState = this.gameService.placeBet(data.gameId, user.id, data.prediction);
            this.server.to(data.gameId).emit('game_state_update', newState);
        }
        catch (e) {
            client.emit('game_error', { message: e.message });
        }
    }
    handleSendReaction(data, client) {
        const user = client.data.user;
        this.server.to(data.gameId).emit('game_reaction', {
            playerId: user.id,
            emoji: data.emoji,
        });
    }
    handleSendMessage(data, client) {
        const user = client.data.user;
        if (!data.message || data.message.trim().length === 0)
            return;
        this.server.to(data.gameId).emit('chat_message', {
            playerId: user.id,
            username: user.username,
            message: data.message.trim(),
            timestamp: new Date().toISOString(),
        });
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_game'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleJoinGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('roll_dice'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleRollDice", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('move_player'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleMovePlayer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('pay_escape'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handlePayEscape", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('purchase_item'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handlePurchaseItem", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('use_item'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleUseItem", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('submit_challenge'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleSubmitChallenge", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('place_bet'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handlePlaceBet", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_reaction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleSendReaction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleSendMessage", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: 'http://localhost:5173', credentials: true },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map