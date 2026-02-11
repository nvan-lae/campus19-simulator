import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { AuthService } from '../auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy as any, '42') {
  constructor(private authService: AuthService) {
    // Decide config FIRST
    const has42Config =
      !!process.env.FORTYTWO_CLIENT_ID &&
      !!process.env.FORTYTWO_CLIENT_SECRET &&
      !!process.env.FORTYTWO_CALLBACK_URL;

    // Call super ONCE, unconditionally
    super({
      clientID: has42Config ? process.env.FORTYTWO_CLIENT_ID! : 'disabled',
      clientSecret: has42Config ? process.env.FORTYTWO_CLIENT_SECRET! : 'disabled',
      callbackURL: has42Config ? process.env.FORTYTWO_CALLBACK_URL! : 'disabled',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    return this.authService.validate42User(profile);
  }
}
