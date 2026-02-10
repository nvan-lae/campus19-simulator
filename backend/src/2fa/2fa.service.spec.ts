import { Test } from '@nestjs/testing';
import { TwoFaService } from '../../src/2fa/2fa.service';
import { UsersService } from '../../src/users/users.service';

describe('TwoFaService', () => {
  let service: TwoFaService;

  const usersServiceMock = {
    setTwoFactor: jest.fn(),
    findOne: jest.fn(),
    clearTwoFactor: jest.fn(),
    consumeRecoveryCode: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TwoFaService,
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    service = moduleRef.get(TwoFaService);
  });

  it('encrypts and decrypts secrets correctly', () => {
    const secret = 'BASE32SECRET';
    const encrypted = service.encrypt(secret);
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(secret);
  });

  it('verifies valid TOTP token', () => {
    const secret = 'JBSWY3DPEHPK3PXP'; // known base32
    const token = require('speakeasy').totp({
      secret,
      encoding: 'base32',
    });

    const ok = service.verifyTotp(secret, token);
    expect(ok).toBe(true);
  });

  it('rejects invalid TOTP token', () => {
    const ok = service.verifyTotp('JBSWY3DPEHPK3PXP', '000000');
    expect(ok).toBe(false);
  });
});
