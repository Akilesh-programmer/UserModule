import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  SALES_REP_CREATE, SALES_REP_FIND_ALL, SALES_REP_FIND_ONE,
  SALES_REP_UPDATE, SALES_REP_DELETE,
} from '@app/common';
import { SalesRepService } from './sales-rep.service';

@Controller()
export class SalesRepController {
  constructor(private readonly salesRepService: SalesRepService) {}

  @MessagePattern(SALES_REP_FIND_ALL)
  findAll() {
    return this.salesRepService.findAll();
  }

  @MessagePattern(SALES_REP_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    return this.salesRepService.findOne(data.id);
  }

  @MessagePattern(SALES_REP_CREATE)
  create(@Payload() dto: any): Promise<any> {
    return this.salesRepService.create(dto);
  }

  @MessagePattern(SALES_REP_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }): Promise<any> {
    const { id, ...dto } = data;
    return this.salesRepService.update(id, dto);
  }

  @MessagePattern(SALES_REP_DELETE)
  delete(@Payload() data: { id: string }) {
    return this.salesRepService.delete(data.id);
  }
}
