import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

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

    const issuer = process.env.TWO_FA_ISSUER ?? 'Campus19 Simulator';

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${issuer}:${user.email ?? user.username}`,
      issuer,
    });

    // Save TEMP secret only
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorTempSecret: secret.base32,
      },
    });

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    return {
      otpauthUrl: secret.otpauth_url,
      qrCodeDataURL,
      ...(process.env.NODE_ENV !== 'production' && {
        base32: secret.base32,
      }),
    };
  }

  /**
   * Verify a TOTP code (setup or login)
   */
  async verifyTotpCodeForUser(
    userId: number,
    token: string,
    purpose: 'setup' | 'login',
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const secret =
      purpose === 'setup'
        ? user.twoFactorTempSecret
        : user.twoFactorSecret;

    if (!secret) {
      return false;
    }

    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: Number(process.env.TWO_FA_CODE_WINDOW ?? 1),
    });

    if (!isValid) {
      return false;
    }

    if (purpose === 'setup') {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secret,
          twoFactorTempSecret: null,
          isTwoFactorEnabled: true,
          twoFactorMethod: 'totp',
        },
      });
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
        isTwoFactorEnabled: false,
        twoFactorMethod: null,
        twoFactorSecret: null,
        twoFactorTempSecret: null,
      },
    });
  }
}
