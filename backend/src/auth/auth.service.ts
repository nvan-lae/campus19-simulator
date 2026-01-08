import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Validate Email/Password User
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    // Check if user exists AND has a password (OAuth users might not)
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. Validate/Create 42 OAuth User
  async validate42User(profile: any) {
    const { id, username, emails, photos } = profile;
    const user = await this.usersService.findByIntraId(id);

    if (user) return user; // User exists, return them

    // User doesn't exist, create them automatically
    return this.usersService.create({
      intraId: id,
      username: username, 
      email: emails[0].value,
      avatarUrl: photos[0].value,
      // No password required for OAuth users
    });
  }

  // 3. Login (Generate JWT Token)
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 4. Register (for Email/Password users)
  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.usersService.create({
      ...data,
      password: hashedPassword,
    });
  }
}
