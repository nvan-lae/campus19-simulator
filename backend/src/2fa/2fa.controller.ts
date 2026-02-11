import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFaService } from './2fa.service';

@Controller('api/2fa')
export class TwoFaController {
  constructor(private twofa: TwoFaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('enroll')
  async enroll(@Req() req) {
    return this.twofa.enroll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('enroll/verify')
  async verifyEnroll(@Req() req, @Body() body: { token: string; base32: string }) {
    if (!this.twofa.verifyTotp(body.base32, body.token)) {
      throw new Error('Invalid token');
    }
    const recovery = await this.twofa.finalizeEnroll(req.user.id, body.base32);
    return { recoveryCodes: recovery };
  }

  @Post('verify')
  async verifyLogin(@Body() body: { userId: number; token: string }) {
    await this.twofa.verifyLogin(body.userId, body.token);
    return { ok: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('disable')
  async disable(@Req() req) {
    await this.twofa.disable(req.user.id);
    return { ok: true };
  }

  @Post('recover')
  async recover(@Body() body: { userId: number; code: string }) {
    await this.twofa.verifyRecoveryCode(body.userId, body.code);
    return { ok: true };
  }
}
