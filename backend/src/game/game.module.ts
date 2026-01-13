import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { UsersModule } from '../users/users.module';
import { GameService } from './game.service';

@Module({
  imports: [UsersModule],
  providers: [GameGateway, GameService],
})
export class GameModule {}
