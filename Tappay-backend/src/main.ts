import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as session from 'express-session'; // Import express-session
import * as bodyParser from 'body-parser';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Add session middleware
  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET || 'your-secret-key', // Store session secret securely
  //     resave: false, // Do not force session save on every request
  //     saveUninitialized: false, // Do not create session until something is stored
  //     cookie: {
  //       maxAge: 30 * 24 * 60 * 60 * 1000,
  //       // maxAge: 60000, // Session expiry time (1 minute for example)
  //       httpOnly: true, // Ensure the cookie is only accessible via HTTP (not JavaScript)
  //       secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (ensure HTTPS)
  //       // sameSite: 'lax', // Set SameSite attribute for cross-origin cookies
  //     },
  //   }),
  // );

  // Your existing code (global guards, pipes, CORS, etc.)
  app.useGlobalGuards(
    new AuthGuard(
      app.get(JwtService),
      app.get(Reflector),
      app.get(ConfigService),
    ),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Increase size limits for JSON and URL-encoded payloads
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
