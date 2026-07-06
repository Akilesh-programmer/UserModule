import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ManagerModule } from './manager/manager.module';
import { SalesRepModule } from './sales-rep/sales-rep.module';
import { CountryModule } from './location/country/country.module';
import { StateModule } from './location/state/state.module';
import { CityModule } from './location/city/city.module';
import { PincodeModule } from './location/pincode/pincode.module';
import { AreaModule } from './location/area/area.module';
import { MarketModule } from './market/market.module';
import { DealerModule } from './dealer/dealer.module';
import { ExpenseTypeModule } from './expense-type/expense-type.module';
import { CompanyModule } from './company/company.module';
import { ShopTypeModule } from './shop-type/shop-type.module';
import { MasterServiceController } from './master-service.controller';
import { MasterService } from './master-service.service';
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
        uri: config.get<string>('MONGO_URI_MASTER', 'mongodb://localhost:27017/salesforce_master'),
      }),
    }),
    ManagerModule,
    SalesRepModule,
    CountryModule,
    StateModule,
    CityModule,
    PincodeModule,
    AreaModule,
    MarketModule,
    DealerModule,
    ExpenseTypeModule,
    CompanyModule,
    ShopTypeModule,
  ],
  controllers: [MasterServiceController],
  providers: [MasterService],
})
export class MasterServiceModule {}
