import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, GameModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
