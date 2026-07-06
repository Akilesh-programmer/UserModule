import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './schemas/item.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { CategoryModule } from '../category/category.module';
import { GroupModule } from '../group/group.module';
import { TaxModule } from '../tax/tax.module';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { PackingTypeModule } from '../packing-type/packing-type.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    CategoryModule,
    GroupModule,
    TaxModule,
    UnitOfMeasureModule,
    PackingTypeModule,
  ],
  providers: [ItemService],
  controllers: [ItemController],
  exports: [ItemService, MongooseModule],
})
export class ItemModule {}
