import { Module } from '@nestjs/common';
import { GameGateway } from './game/game.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [GameGateway],
})
export class GameModule {}
