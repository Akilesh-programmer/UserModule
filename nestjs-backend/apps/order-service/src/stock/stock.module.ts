import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockEntry, StockEntrySchema } from './schemas/stock-entry.schema';
import { Counter, CounterSchema } from '../common/schemas/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockEntry.name, schema: StockEntrySchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService, MongooseModule],
})
export class StockModule {}
