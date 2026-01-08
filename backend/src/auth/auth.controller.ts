// backend/src/auth/auth.controller.ts

import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. Email/Password Registration
  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  // 2. Email/Password Login
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  // 3. 42 Login Redirect
  @Get('login')
  @UseGuards(AuthGuard('42'))
  async login42() {
    // Passport handles the redirect
  }

  // 4. 42 Callback
  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Req() req, @Res() res) {
    const { access_token } = await this.authService.login(req.user);
    res.redirect(`http://localhost:5173/login?token=${access_token}`);
  }
}