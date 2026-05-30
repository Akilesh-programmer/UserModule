import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dealer, DealerSchema } from './schemas/dealer.schema';
import { DealerService } from './dealer.service';
import { DealerController } from './dealer.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Dealer.name, schema: DealerSchema }])],
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService],
})
export class DealerModule {}
