import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitOfMeasure, UnitOfMeasureSchema } from './schemas/unit-of-measure.schema';
import { UnitOfMeasureService } from './unit-of-measure.service';
import { UnitOfMeasureController } from './unit-of-measure.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UnitOfMeasure.name, schema: UnitOfMeasureSchema }])],
  providers: [UnitOfMeasureService],
  controllers: [UnitOfMeasureController],
  exports: [UnitOfMeasureService, MongooseModule],
})
export class UnitOfMeasureModule {}
