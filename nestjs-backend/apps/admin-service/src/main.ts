import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AdminServiceModule } from './admin-service.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AdminServiceModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.ADMIN_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.ADMIN_SERVICE_PORT || '3002', 10),
    },
  });

  await app.listen();
  console.log(`👤 Admin Service is running on TCP port ${process.env.ADMIN_SERVICE_PORT || 3002}`);
}

bootstrap();
