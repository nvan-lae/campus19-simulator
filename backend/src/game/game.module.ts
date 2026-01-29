import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule if needed for auth or service


@Module({
  imports: [UsersModule],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule { }
