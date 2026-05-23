import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UOM_CREATE, UOM_FIND_ALL, UOM_FIND_ONE, UOM_UPDATE, UOM_DELETE, UOM_FIND_ACTIVE } from '@app/common';
import { UnitOfMeasureService } from './unit-of-measure.service';

@Controller()
export class UnitOfMeasureController {
  constructor(private readonly svc: UnitOfMeasureService) {}

  @MessagePattern(UOM_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(UOM_FIND_ACTIVE)
  findActive() { return this.svc.findActive(); }

  @MessagePattern(UOM_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(UOM_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(UOM_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(UOM_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
