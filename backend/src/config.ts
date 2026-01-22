// backend/src/config.ts

export function validateEnvOrExit() {
  const isProd = process.env.NODE_ENV === 'production';

  const required = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
  const missing = required.filter(
    (k) => !process.env[k] || process.env[k]?.trim() === '',
  );

  if (missing.length > 0) {
    const msg = `[Config] Missing required environment variables: ${missing.join(', ')}`;
    if (isProd) {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
    }
  }

  // JWT secret checks
  const insecureJwt =
    !process.env.JWT_SECRET ||
    ['secretKey', 'your_jwt_secret_here'].includes(process.env.JWT_SECRET);
  if (insecureJwt) {
    const msg =
      '[Config] JWT_SECRET is missing or using an insecure default. Set a strong JWT_SECRET in production.';
    if (isProd) {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
    }
  }

  // 42 OAuth checks: both or none
  const has42Id = !!process.env.FORTYTWO_CLIENT_ID;
  const has42Secret = !!process.env.FORTYTWO_CLIENT_SECRET;
  if (has42Id !== has42Secret) {
    const msg =
      '[Config] FORTYTWO_CLIENT_ID and FORTYTWO_CLIENT_SECRET must both be provided or both omitted.';
    if (isProd) {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
    }
  }
}
