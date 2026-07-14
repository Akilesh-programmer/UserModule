import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StockService } from './stock.service';
import {
  STOCK_CREATE,
  STOCK_FIND_ALL,
  STOCK_FIND_ONE,
  STOCK_UPDATE,
  STOCK_DELETE,
  STOCK_FIND_BY_DEALER,
  STOCK_DEDUCT,
} from '@app/common';

@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @MessagePattern(STOCK_FIND_ALL)
  findAll(@Payload() query: any) {
    return this.stockService.findAll(query);
  }

  @MessagePattern(STOCK_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    return this.stockService.findOne(data.id);
  }

  @MessagePattern(STOCK_CREATE)
  create(@Payload() dto: any) {
    return this.stockService.create(dto);
  }

  @MessagePattern(STOCK_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.stockService.update(id, dto);
  }

  @MessagePattern(STOCK_DELETE)
  delete(@Payload() data: { id: string }) {
    return this.stockService.delete(data.id);
  }

  @MessagePattern(STOCK_FIND_BY_DEALER)
  findByDealer(@Payload() data: { dealerId: string }) {
    return this.stockService.findByDealer(data.dealerId);
  }

  @MessagePattern(STOCK_DEDUCT)
  deduct(@Payload() data: { dealerId: string; stockEntryId?: string; items: any[] }) {
    return this.stockService.deduct(data);
  }
}
