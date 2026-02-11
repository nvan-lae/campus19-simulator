import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ThrottlerModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    GameModule,
  ],
})
export class AppModule {}
