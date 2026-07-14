import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StockModule } from './stock/stock.module';
import { OrderModule } from './order/order.module';
import { SecondarySaleModule } from './secondary-sale/secondary-sale.module';
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
        uri: config.get<string>('MONGO_URI_ORDERS', 'mongodb://localhost:27017/salesforce_orders'),
      }),
    }),
    StockModule,
    OrderModule,
    SecondarySaleModule,
  ],
})
export class OrderServiceModule {}
