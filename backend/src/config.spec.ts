import { validateEnvOrExit } from './config';

describe('validateEnvOrExit', () => {
  const OLD_ENV = process.env;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(((
      code?: number,
    ) => {
      throw new Error('process.exit:' + code);
    }) as never);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = OLD_ENV;
    exitSpy.mockRestore();
    (console.warn as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it('warns in development and does not exit when envs are missing', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;
    delete process.env.DATABASE_URL;
    delete process.env.FRONTEND_URL;

    expect(() => validateEnvOrExit()).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('exits in production when envs are missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    delete process.env.DATABASE_URL;

    expect(() => validateEnvOrExit()).toThrow('process.exit:1');
  });

  it('does not exit in production when all required envs present', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'supersecret';
    process.env.DATABASE_URL = 'postgres://foo';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.FORTYTWO_CLIENT_ID = 'id';
    process.env.FORTYTWO_CLIENT_SECRET = 'secret';

    expect(() => validateEnvOrExit()).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('exits in production if only one 42 var is present', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'supersecret';
    process.env.DATABASE_URL = 'postgres://foo';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.FORTYTWO_CLIENT_ID = 'id';
    delete process.env.FORTYTWO_CLIENT_SECRET;

    expect(() => validateEnvOrExit()).toThrow('process.exit:1');
  });
});
