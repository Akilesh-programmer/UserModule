import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ItemServiceModule } from './item-service.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ItemServiceModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.ITEM_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.ITEM_SERVICE_PORT || '3004', 10),
    },
  });

  await app.listen();
  console.log(`📦 Item Service is running on TCP port ${process.env.ITEM_SERVICE_PORT || 3004}`);
}

bootstrap();
