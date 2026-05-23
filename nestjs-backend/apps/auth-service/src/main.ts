import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { AuthModule } from "./auth.module";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.AUTH_SERVICE_HOST || "localhost",
        port: parseInt(process.env.AUTH_SERVICE_PORT || "3001", 10),
      },
    },
  );

  await app.listen();
  console.log(
    `🔐 Auth Service is running on TCP port ${process.env.AUTH_SERVICE_PORT || 3001}`,
  );
}

bootstrap();
