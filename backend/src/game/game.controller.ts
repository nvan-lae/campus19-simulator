import { Controller, Post, Get, UseGuards, Request, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming this exists, need to verify path or mock it
import { User } from '@prisma/client';

@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getOpenLobbies() {
        return this.gameService.getOpenLobbies();
    }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    createGame(@Request() req: { user: User }) {
        // req.user is populated by JwtStrategy
        const gameId = this.gameService.createGame(req.user);
        return { gameId };
    }
}
