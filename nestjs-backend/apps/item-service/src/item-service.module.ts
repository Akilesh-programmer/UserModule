import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from './category/category.module';
import { GroupModule } from './group/group.module';
import { TaxModule } from './tax/tax.module';
import { UnitOfMeasureModule } from './unit-of-measure/unit-of-measure.module';
import { PackingTypeModule } from './packing-type/packing-type.module';
import { ItemModule } from './item/item.module';
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
        uri: config.get<string>('MONGO_URI_ITEMS', 'mongodb://localhost:27017/usermodule_items'),
      }),
    }),
    CategoryModule,
    GroupModule,
    TaxModule,
    UnitOfMeasureModule,
    PackingTypeModule,
    ItemModule,
  ],
})
export class ItemServiceModule {}
