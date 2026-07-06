import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SCHEME_CREATE, SCHEME_FIND_ALL, SCHEME_FIND_ONE, SCHEME_UPDATE, SCHEME_DELETE } from '@app/common';
import { SchemeService } from './scheme.service';

@Controller()
export class SchemeController {
  constructor(private readonly svc: SchemeService) {}

  @MessagePattern(SCHEME_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(SCHEME_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(SCHEME_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(SCHEME_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(SCHEME_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
