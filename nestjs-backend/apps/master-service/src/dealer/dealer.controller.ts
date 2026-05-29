import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  DEALER_CREATE, DEALER_FIND_ALL, DEALER_FIND_ONE,
  DEALER_UPDATE, DEALER_DELETE, DEALER_FIND_ACTIVE,
} from '@app/common';
import { DealerService } from './dealer.service';

@Controller()
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  @MessagePattern(DEALER_FIND_ALL)
  findAll(@Payload() query: any) { return this.dealerService.findAll(query); }

  @MessagePattern(DEALER_FIND_ACTIVE)
  findActive(@Payload() query: any) { return this.dealerService.findActive(query); }

  @MessagePattern(DEALER_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.dealerService.findOne(data.id); }

  @MessagePattern(DEALER_CREATE)
  create(@Payload() dto: any) { return this.dealerService.create(dto); }

  @MessagePattern(DEALER_UPDATE)
  async update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.dealerService.update(id, dto);
  }

  @MessagePattern(DEALER_DELETE)
  delete(@Payload() data: { id: string }) { return this.dealerService.delete(data.id); }
}
