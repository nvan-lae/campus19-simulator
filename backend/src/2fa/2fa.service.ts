import { Injectable, UnauthorizedException } from '@nestjs/common';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

const ENC_KEY = Buffer.from(process.env.TWOFA_ENC_KEY!, 'hex'); // 32 bytes
const IV_LEN = 12;

@Injectable()
export class TwoFaService {
  constructor(private users: UsersService) {}

  async enroll(userId: number) {
    const secret = speakeasy.generateSecret({ length: 20 });
    const qr = await QRCode.toDataURL(secret.otpauth_url!);
    return { base32: secret.base32, otpauthUrl: secret.otpauth_url, qr };
  }

  verifyTotp(secretBase32: string, token: string) {
    return speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token,
      window: Number(process.env.TOTP_WINDOW || 1),
    });
  }

  encrypt(text: string) {
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv('aes-256-gcm', ENC_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
  }

  decrypt(payload: string) {
    const buf = Buffer.from(payload, 'base64');
    const iv = buf.slice(0, IV_LEN);
    const tag = buf.slice(IV_LEN, IV_LEN + 16);
    const data = buf.slice(IV_LEN + 16);
    const decipher = createDecipheriv('aes-256-gcm', ENC_KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString();
  }

  async finalizeEnroll(userId: number, base32: string) {
    const encrypted = this.encrypt(base32);
    const recoveryCodes = Array.from({ length: 10 }, () =>
      randomBytes(4).toString('hex'),
    );
    const hashes = await Promise.all(
      recoveryCodes.map((c) => bcrypt.hash(c, 10)),
    );

    await this.users.setTwoFactor(
      userId,
      encrypted,
      JSON.stringify(hashes),
    );

    return recoveryCodes; // plaintext ONCE
  }

  async verifyLogin(userId: number, token: string) {
    const user = await this.users.findById(userId);
    if (!user?.twoFactorSecretEncrypted) throw new UnauthorizedException();
    const secret = this.decrypt(user.twoFactorSecretEncrypted);
    if (!this.verifyTotp(secret, token)) {
      throw new UnauthorizedException();
    }
  }

  async verifyRecoveryCode(userId: number, code: string) {
    return this.users.consumeRecoveryCode(userId, code);
  }

  async disable(userId: number) {
    await this.users.clearTwoFactor(userId);
  }
}
