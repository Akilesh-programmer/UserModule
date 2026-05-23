import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tax, TaxSchema } from './schemas/tax.schema';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tax.name, schema: TaxSchema }])],
  providers: [TaxService],
  controllers: [TaxController],
  exports: [TaxService, MongooseModule],
})
export class TaxModule {}
