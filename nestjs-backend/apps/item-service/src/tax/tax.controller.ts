import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TAX_CREATE, TAX_FIND_ALL, TAX_FIND_ONE, TAX_UPDATE, TAX_DELETE, TAX_FIND_ACTIVE } from '@app/common';
import { TaxService } from './tax.service';

@Controller()
export class TaxController {
  constructor(private readonly svc: TaxService) {}

  @MessagePattern(TAX_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(TAX_FIND_ACTIVE)
  findActive() { return this.svc.findActive(); }

  @MessagePattern(TAX_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(TAX_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(TAX_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(TAX_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
