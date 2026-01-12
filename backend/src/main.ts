import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import { validateEnvOrExit } from './config';

validateEnvOrExit();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

  app.enableCors({
    origin: [frontend, `http://localhost:${process.env.NEST_PORT || 3000}`],
    credentials: true,
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3000);
}
bootstrap();
