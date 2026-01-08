import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { AuthService } from '../auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy as any, '42') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID || '',
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET || '',
      callbackURL: process.env.FORTYTWO_CALLBACK_URL || '',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // This links the 42 Profile to our Database
    return this.authService.validate42User(profile);
  }
}
