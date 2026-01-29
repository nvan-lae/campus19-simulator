import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import { validateEnvOrExit } from './config';

validateEnvOrExit();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      `http://localhost:${process.env.NEST_PORT || 3000}`,
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(
    process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3000,
    '0.0.0.0',
  );
}
void bootstrap();
