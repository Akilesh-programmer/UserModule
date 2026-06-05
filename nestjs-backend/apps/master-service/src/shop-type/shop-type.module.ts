import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopType, ShopTypeSchema } from './schemas/shop-type.schema';
import { ShopTypeService } from './shop-type.service';
import { ShopTypeController } from './shop-type.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ShopType.name, schema: ShopTypeSchema }])],
  controllers: [ShopTypeController],
  providers: [ShopTypeService],
  exports: [ShopTypeService],
})
export class ShopTypeModule {}
