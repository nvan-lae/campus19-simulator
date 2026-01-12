import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

  // Quick sanity check for important env vars
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secretKey' || process.env.JWT_SECRET === 'your_jwt_secret_here') {
    console.warn('[Config] Warning: JWT_SECRET is not set or is using an insecure default. Set JWT_SECRET in .env for production.');
  }

  app.enableCors({
    origin: [frontend, `http://localhost:${process.env.NEST_PORT || 3000}`],
    credentials: true,
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3000);
}
bootstrap();
