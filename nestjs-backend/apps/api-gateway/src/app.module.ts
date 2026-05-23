import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, ADMIN_SERVICE, MASTER_SERVICE, ITEM_SERVICE } from '@app/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { AuthGatewayController } from './controllers/auth.controller';
import { UserTypeGatewayController } from './controllers/user-type.controller';
import { UserGatewayController } from './controllers/user.controller';
import { PermissionGatewayController } from './controllers/permission.controller';
import { ManagerGatewayController } from './controllers/manager.controller';
import { SalesRepGatewayController } from './controllers/sales-rep.controller';
import { CategoryGatewayController } from './controllers/category.controller';
import { GroupGatewayController } from './controllers/group.controller';
import { TaxGatewayController } from './controllers/tax.controller';
import { UnitOfMeasureGatewayController } from './controllers/unit-of-measure.controller';
import { PackingTypeGatewayController } from './controllers/packing-type.controller';
import { ItemGatewayController } from './controllers/item.controller';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('AUTH_SERVICE_HOST', 'localhost'),
            port: config.get('AUTH_SERVICE_PORT', 3001),
          },
        }),
      },
      {
        name: ADMIN_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('ADMIN_SERVICE_HOST', 'localhost'),
            port: config.get('ADMIN_SERVICE_PORT', 3002),
          },
        }),
      },
      {
        name: MASTER_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('MASTER_SERVICE_HOST', 'localhost'),
            port: config.get('MASTER_SERVICE_PORT', 3003),
          },
        }),
      },
      {
        name: ITEM_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('ITEM_SERVICE_HOST', 'localhost'),
            port: config.get('ITEM_SERVICE_PORT', 3004),
          },
        }),
      },
    ]),
  ],
  controllers: [
    AuthGatewayController,
    UserTypeGatewayController,
    UserGatewayController,
    PermissionGatewayController,
    ManagerGatewayController,
    SalesRepGatewayController,
    CategoryGatewayController,
    GroupGatewayController,
    TaxGatewayController,
    UnitOfMeasureGatewayController,
    PackingTypeGatewayController,
    ItemGatewayController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
