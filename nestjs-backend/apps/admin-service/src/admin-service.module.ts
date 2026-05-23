import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserTypeModule } from './user-type/user-type.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI_ADMIN', 'mongodb://localhost:27017/usermodule_admin'),
      }),
    }),
    UserTypeModule,
    UserModule,
    PermissionModule,
  ],
})
export class AdminServiceModule {}
