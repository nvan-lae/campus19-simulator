import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { GameService } from './game.service';
import { User } from '@prisma/client';
interface AuthenticatedSocket extends Socket {
    data: {
        user?: User;
    };
}
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly usersService;
    private readonly gameService;
    server: Server;
    private logger;
    constructor(jwtService: JwtService, usersService: UsersService, gameService: GameService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinGame(data: {
        gameId: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleRollDice(data: {
        gameId: string;
    }, client: Socket): void;
    handleMovePlayer(data: {
        gameId: string;
    }, client: Socket): void;
    handlePayEscape(data: {
        gameId: string;
    }, client: Socket): void;
    handlePurchaseItem(data: {
        gameId: string;
        itemId: string;
    }, client: Socket): void;
    handleUseItem(data: {
        gameId: string;
        itemId: string;
        targetPlayerId?: number;
    }, client: Socket): void;
    handleSubmitChallenge(data: {
        gameId: string;
        answerIndex: number;
    }, client: Socket): void;
    handlePlaceBet(data: {
        gameId: string;
        prediction: 'success' | 'fail';
    }, client: Socket): void;
    handleSendReaction(data: {
        gameId: string;
        emoji: string;
    }, client: Socket): void;
    handleSendMessage(data: {
        gameId: string;
        message: string;
    }, client: Socket): void;
}
export {};
