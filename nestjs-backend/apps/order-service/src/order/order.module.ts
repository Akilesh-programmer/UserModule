import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { Counter, CounterSchema } from '../common/schemas/counter.schema';
import { StockModule } from '../stock/stock.module';
import { SecondarySale, SecondarySaleSchema } from '../secondary-sale/schemas/secondary-sale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Counter.name, schema: CounterSchema },
      { name: SecondarySale.name, schema: SecondarySaleSchema },
    ]),
    StockModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
