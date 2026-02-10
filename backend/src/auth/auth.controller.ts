import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { UsersService } from '../users/users.service';
import { VerifyTotpDto } from './dto/verify-totp.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  // ─────────────────────────────────────────────
  // 1. Email / Password Registration
  // ─────────────────────────────────────────────
  @Post('register')
  async register(@Body() registerDto: any) {
    if (!registerDto?.email || !registerDto?.username) {
      throw new BadRequestException('Email and username are required');
    }

    if (!registerDto?.password) {
      throw new BadRequestException('Password is required');
    }

    try {
      return await this.authService.register(registerDto);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Email or username already exists');
      }
      throw err;
    }
  }

  // ─────────────────────────────────────────────
  // 2. Email / Password Login (NO JWT IF 2FA ON)
  // ─────────────────────────────────────────────
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    const user = req.user;

    // 🔐 If 2FA NOT enabled → issue JWT immediately
    if (!user.isTwoFactorEnabled) {
      return this.authService.login(user);
    }

    // 🔐 If 2FA enabled → DO NOT issue JWT
    if (user.twoFactorMethod === 'totp') {
      return {
        twoFactorRequired: true,
        method: 'totp',
        userId: user.id,
      };
    }

    // fallback (should not happen)
    throw new UnauthorizedException();
  }

  // ─────────────────────────────────────────────
  // 3. Verify 2FA during LOGIN → ISSUE JWT
  // ─────────────────────────────────────────────
  @Post('2fa/verify')
  async verify2fa(@Body() dto: Verify2faDto) {
    const ok = await this.twoFactorService.verifyTotpCodeForUser(
      dto.userId,
      dto.token,
      'login',
    );

    if (!ok) {
      throw new UnauthorizedException('Invalid authentication code');
    }

    return this.authService.login({ id: dto.userId });
  }

  // ─────────────────────────────────────────────
  // 4. Enable TOTP (Authenticated)
  // ─────────────────────────────────────────────
  @UseGuards(AuthGuard('jwt'))
  @Get('2fa/setup')
  async setup2fa(@Req() req) {
    return this.twoFactorService.generateTotpSecretForSetup(req.user.id);
  }

  // ─────────────────────────────────────────────
  // 5. Verify TOTP Setup (Authenticated)
  // ─────────────────────────────────────────────
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/verify-setup')
  async verify2faSetup(@Req() req, @Body() dto: VerifyTotpDto) {
    const ok = await this.twoFactorService.verifyTotpCodeForUser(
      req.user.id,
      dto.token,
      'setup',
    );

    if (!ok) {
      throw new UnauthorizedException('Invalid authentication code');
    }

    return { ok: true };
  }

  // ─────────────────────────────────────────────
  // 6. Disable 2FA (Authenticated)
  // ─────────────────────────────────────────────
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/disable')
  async disable2fa(@Req() req, @Body() dto: VerifyTotpDto) {
    const ok = await this.twoFactorService.verifyTotpCodeForUser(
      req.user.id,
      dto.token,
      'login',
    );

    if (!ok) {
      throw new UnauthorizedException('Invalid authentication code');
    }

    await this.twoFactorService.disableTotp(req.user.id);
    return { ok: true };
  }

  // ─────────────────────────────────────────────
  // 7. 42 OAuth Login
  // ─────────────────────────────────────────────
  @Get('login')
  @UseGuards(AuthGuard('42'))
  async login42() {
    // Passport handles redirect
  }

  // ─────────────────────────────────────────────
  // 8. 42 OAuth Callback
  // ─────────────────────────────────────────────
  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Req() req, @Res() res) {
    const { access_token } = await this.authService.login(req.user);

    const frontend = (
      process.env.FRONTEND_URL || 'https://localhost:5173'
    ).replace(/\/$/, '');

    res.redirect(`${frontend}/login?token=${access_token}`);
  }
}
