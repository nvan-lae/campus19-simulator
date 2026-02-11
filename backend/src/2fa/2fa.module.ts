import { Module } from '@nestjs/common';
import { TwoFaService } from './2fa.service';
import { TwoFaController } from './2fa.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [TwoFaService],
  controllers: [TwoFaController],
  exports: [TwoFaService],
})
export class TwoFaModule {}
