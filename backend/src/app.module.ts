import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [UsersModule, AuthModule, GameModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
