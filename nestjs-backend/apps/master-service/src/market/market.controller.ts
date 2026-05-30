import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MARKET_CREATE, MARKET_FIND_ALL, MARKET_FIND_ONE,
  MARKET_UPDATE, MARKET_DELETE, MARKET_FIND_ACTIVE,
} from '@app/common';
import { MarketService } from './market.service';

@Controller()
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @MessagePattern(MARKET_FIND_ALL)
  findAll(@Payload() query: any) { return this.marketService.findAll(query); }

  @MessagePattern(MARKET_FIND_ACTIVE)
  findActive(@Payload() query: any) { return this.marketService.findActive(query); }

  @MessagePattern(MARKET_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.marketService.findOne(data.id); }

  @MessagePattern(MARKET_CREATE)
  create(@Payload() dto: any) { return this.marketService.create(dto); }

  @MessagePattern(MARKET_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.marketService.update(id, dto);
  }

  @MessagePattern(MARKET_DELETE)
  delete(@Payload() data: { id: string }) { return this.marketService.delete(data.id); }
}
