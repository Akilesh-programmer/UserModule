import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SecondarySaleService } from './secondary-sale.service';
import {
  SECONDARY_SALE_CREATE,
  SECONDARY_SALE_FIND_ALL,
  SECONDARY_SALE_FIND_ONE,
  SECONDARY_SALE_MARK_DELIVERED,
  SECONDARY_SALE_MARK_RETURNED,
} from '@app/common';

@Controller()
export class SecondarySaleController {
  constructor(private readonly secondarySaleService: SecondarySaleService) {}

  @MessagePattern(SECONDARY_SALE_FIND_ALL)
  findAll(@Payload() query: any) {
    return this.secondarySaleService.findAll(query);
  }

  @MessagePattern(SECONDARY_SALE_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    return this.secondarySaleService.findOne(data.id);
  }

  @MessagePattern(SECONDARY_SALE_CREATE)
  create(@Payload() dto: any) {
    return this.secondarySaleService.create(dto);
  }

  @MessagePattern(SECONDARY_SALE_MARK_DELIVERED)
  markDelivered(@Payload() data: { id: string }) {
    return this.secondarySaleService.markDelivered(data.id);
  }

  @MessagePattern(SECONDARY_SALE_MARK_RETURNED)
  markReturned(@Payload() data: { id: string; reason?: string }) {
    return this.secondarySaleService.markReturned(data.id, data.reason);
  }
}
