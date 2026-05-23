import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { rateLimit } from 'express-rate-limit';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Body parsing & sanitization
  app.use(cookieParser());
  app.use(compression());
  app.use(mongoSanitize());

  // Logging (development only)
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Rate limiting on API routes
  app.use('/api', rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200,
    message: 'Too many requests from this IP, please try again later.',
  }));

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Global filters & interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Static file serving for uploads
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API Gateway is running on http://localhost:${port}`);
}

bootstrap();
