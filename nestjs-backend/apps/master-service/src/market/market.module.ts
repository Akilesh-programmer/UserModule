import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Market, MarketSchema } from './schemas/market.schema';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Market.name, schema: MarketSchema }])],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
