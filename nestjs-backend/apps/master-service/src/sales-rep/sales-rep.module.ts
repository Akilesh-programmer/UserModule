import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesRep, SalesRepSchema } from './schemas/sales-rep.schema';
import { SalesRepService } from './sales-rep.service';
import { SalesRepController } from './sales-rep.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: SalesRep.name, schema: SalesRepSchema }])],
  providers: [SalesRepService],
  controllers: [SalesRepController],
  exports: [SalesRepService],
})
export class SalesRepModule {}
