import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PACKING_TYPE_CREATE, PACKING_TYPE_FIND_ALL, PACKING_TYPE_FIND_ONE, PACKING_TYPE_UPDATE, PACKING_TYPE_DELETE, PACKING_TYPE_FIND_ACTIVE } from '@app/common';
import { PackingTypeService } from './packing-type.service';

@Controller()
export class PackingTypeController {
  constructor(private readonly svc: PackingTypeService) {}

  @MessagePattern(PACKING_TYPE_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(PACKING_TYPE_FIND_ACTIVE)
  findActive() { return this.svc.findActive(); }

  @MessagePattern(PACKING_TYPE_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(PACKING_TYPE_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(PACKING_TYPE_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(PACKING_TYPE_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
