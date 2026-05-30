import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ManagerModule } from './manager/manager.module';
import { SalesRepModule } from './sales-rep/sales-rep.module';
import { StateModule } from './location/state/state.module';
import { CityModule } from './location/city/city.module';
import { PincodeModule } from './location/pincode/pincode.module';
import { AreaModule } from './location/area/area.module';
import { MarketModule } from './market/market.module';
import { DealerModule } from './dealer/dealer.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
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
        uri: config.get<string>('MONGO_URI_MASTER', 'mongodb://localhost:27017/usermodule_master'),
      }),
    }),
    ManagerModule,
    SalesRepModule,
    StateModule,
    CityModule,
    PincodeModule,
    AreaModule,
    MarketModule,
    DealerModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class MasterServiceModule {}
