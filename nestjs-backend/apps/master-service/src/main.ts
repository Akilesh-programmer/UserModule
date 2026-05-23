import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { MasterServiceModule } from './master-service.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(MasterServiceModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.MASTER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.MASTER_SERVICE_PORT || '3003', 10),
    },
  });

  await app.listen();
  console.log(`👔 Master Service is running on TCP port ${process.env.MASTER_SERVICE_PORT || 3003}`);
}

bootstrap();
