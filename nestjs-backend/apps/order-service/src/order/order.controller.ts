import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import {
  ORDER_CREATE,
  ORDER_FIND_ALL,
  ORDER_FIND_ONE,
  ORDER_APPROVE,
  ORDER_REJECT,
  ORDER_UPDATE_STATUS,
  ORDER_WITH_STOCK_CHECK,
  DASHBOARD_ORDER_STATS,
  ORDER_UPDATE,
  ORDER_DELETE,
} from '@app/common';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern(ORDER_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.orderService.update(id, dto);
  }

  @MessagePattern(ORDER_DELETE)
  delete(@Payload() data: { id: string }) {
    return this.orderService.delete(data.id);
  }

  @MessagePattern(DASHBOARD_ORDER_STATS)
  getOrderStats() {
    return this.orderService.getOrderStats();
  }

  @MessagePattern(ORDER_FIND_ALL)
  findAll(@Payload() query: any) {
    return this.orderService.findAll(query);
  }

  @MessagePattern(ORDER_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    return this.orderService.findOne(data.id);
  }

  @MessagePattern(ORDER_CREATE)
  create(@Payload() dto: any) {
    return this.orderService.create(dto);
  }

  @MessagePattern(ORDER_APPROVE)
  approve(@Payload() data: { id: string; approvedBy: string }) {
    return this.orderService.approve(data.id, data.approvedBy);
  }

  @MessagePattern(ORDER_REJECT)
  reject(@Payload() data: { id: string; reason: string }) {
    return this.orderService.reject(data.id, data.reason);
  }

  @MessagePattern(ORDER_UPDATE_STATUS)
  updateStatus(@Payload() data: { id: string; status: string }) {
    return this.orderService.updateStatus(data.id, data.status);
  }

  @MessagePattern(ORDER_WITH_STOCK_CHECK)
  findOneWithStockCheck(@Payload() data: { id: string }): Promise<any> {
    return this.orderService.getOrderWithStockCheck(data.id);
  }
}
