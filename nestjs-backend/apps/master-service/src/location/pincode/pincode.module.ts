import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pincode, PincodeSchema } from './schemas/pincode.schema';
import { PincodeService } from './pincode.service';
import { PincodeController } from './pincode.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Pincode.name, schema: PincodeSchema }])],
  controllers: [PincodeController],
  providers: [PincodeService],
  exports: [PincodeService],
})
export class PincodeModule {}
