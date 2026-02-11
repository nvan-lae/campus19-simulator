import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a TOTP secret and QR code for setup
   */
  async generateTotpSecretForSetup(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    
    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA already enabled');
    }    
    const issuer = 'Campus19 Simulator';
  
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${issuer}:${user.email}`,
      issuer,
    });
  
    const encrypted = this.encrypt(secret.base32);
  
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecretEncrypted: encrypted,
        twoFactorEnabled: false,
      },
    });
  
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
  
    return {
      otpauthUrl: secret.otpauth_url,
      qrCodeDataURL,
    };
  }
  

  /*
  * Verify a TOTP code (setup or login)
  */
  async verifyTotpCodeForUser(
    userId: number,
    token: string,
    purpose: 'setup' | 'login',
  ): Promise<boolean | { recoveryCodes: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user || !user.twoFactorSecretEncrypted) {
      return false;
    }
  
    const decryptedSecret = this.decrypt(user.twoFactorSecretEncrypted);
  
    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
  
    if (!isValid) return false;
  
    if (purpose === 'setup') {
      const { codes, hashes } = await this.generateRecoveryCodes();
  
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          twoFactorRecoveryHashes: JSON.stringify(hashes),
          twoFactorConfirmedAt: new Date(),
        },
      });
  
      return { recoveryCodes: codes };
    }
  
    return true;
  }
  
  

  /**
   * Disable TOTP for a user
   */
  async disableTotp(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecretEncrypted: null,
        twoFactorRecoveryHashes: null,
        twoFactorConfirmedAt: null,
      },
    });
  }
  

  private async generateRecoveryCodes() {
    const codes: string[] = [];
    const hashes: string[] = [];
  
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).slice(-10);
      codes.push(code);
      hashes.push(await bcrypt.hash(code, 10));
    }
  
    return { codes, hashes };
  }
  
  private readonly ENC_KEY = (() => {
    const key = process.env.TWOFA_ENC_KEY;
    if (!key || key.length !== 64) {
      throw new Error('TWOFA_ENC_KEY must be 64 hex characters (32 bytes)');
    }
    return Buffer.from(key, 'hex');
  })();
  
  private encrypt(text: string): string {
    const iv = randomBytes(12); // 12 bytes for GCM
    const cipher = createCipheriv('aes-256-gcm', this.ENC_KEY, iv);
  
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
  
    const tag = cipher.getAuthTag();
  
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }
  
  private decrypt(payload: string): string {
    const buffer = Buffer.from(payload, 'base64');
  
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
  
    const decipher = createDecipheriv('aes-256-gcm', this.ENC_KEY, iv);
    decipher.setAuthTag(tag);
  
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
  
    return decrypted.toString('utf8');
  }  
}
