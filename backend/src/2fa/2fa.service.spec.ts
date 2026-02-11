import * as speakeasy from 'speakeasy';

describe('TwoFactorService logic', () => {
  it('verifies a valid TOTP token', () => {
    const secret = speakeasy.generateSecret();

    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    const ok = speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token,
      window: 1,
    });

    expect(ok).toBe(true);
  });

  it('rejects an invalid TOTP token', () => {
    const ok = speakeasy.totp.verify({
      secret: 'JBSWY3DPEHPK3PXP',
      encoding: 'base32',
      token: '000000',
      window: 1,
    });

    expect(ok).toBe(false);
  });
});
