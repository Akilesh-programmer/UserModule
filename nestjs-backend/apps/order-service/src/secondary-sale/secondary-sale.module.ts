import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecondarySaleController } from './secondary-sale.controller';
import { SecondarySaleService } from './secondary-sale.service';
import { SecondarySale, SecondarySaleSchema } from './schemas/secondary-sale.schema';
import { Counter, CounterSchema } from '../common/schemas/counter.schema';
import { OrderModule } from '../order/order.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecondarySale.name, schema: SecondarySaleSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    OrderModule,
    StockModule,
  ],
  controllers: [SecondarySaleController],
  providers: [SecondarySaleService],
  exports: [SecondarySaleService],
})
export class SecondarySaleModule {}
