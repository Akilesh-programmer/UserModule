import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackingType, PackingTypeSchema } from './schemas/packing-type.schema';
import { PackingTypeService } from './packing-type.service';
import { PackingTypeController } from './packing-type.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: PackingType.name, schema: PackingTypeSchema }])],
  providers: [PackingTypeService],
  controllers: [PackingTypeController],
  exports: [PackingTypeService, MongooseModule],
})
export class PackingTypeModule {}
