import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { validateEnvOrExit } from './config';

validateEnvOrExit();

async function bootstrap() {
  // Define paths to the generated secrets
  const keyPath = path.join(process.cwd(), 'secrets/key.pem');
  const certPath = path.join(process.cwd(), 'secrets/cert.pem');

  // Check if files exist to avoid crashing if something went wrong with the Makefile
  let httpsOptions;
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } else {
    console.error(
      'SSL certificates not found.\n' +
        'Please ensure the TLS certificates in "secrets/key.pem" and "secrets/cert.pem" are generated before starting this service.\n' +
        'If you are running via Docker, generate the certificates on the host (for example, using "make certs" or "make up") before starting the container.',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });

  const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:5173';

  app.enableCors({
    origin: [
      frontendUrl,
      'https://localhost:5173',
      'https://127.0.0.1:5173',
      // Allow the HTTPS origin as well
      `https://localhost:${process.env.NEST_PORT || 3000}`,
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(
    process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3000,
    '0.0.0.0',
  );
  
  console.log(`Application is running on: https://localhost:${process.env.NEST_PORT || 3000}`);
}
void bootstrap();
