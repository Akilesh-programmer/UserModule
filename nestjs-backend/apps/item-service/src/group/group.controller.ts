import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GROUP_CREATE, GROUP_FIND_ALL, GROUP_FIND_ONE, GROUP_UPDATE, GROUP_DELETE, GROUP_FIND_ACTIVE } from '@app/common';
import { GroupService } from './group.service';

@Controller()
export class GroupController {
  constructor(private readonly svc: GroupService) {}

  @MessagePattern(GROUP_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(GROUP_FIND_ACTIVE)
  findActive(@Payload() query: any) { return this.svc.findActive(query); }

  @MessagePattern(GROUP_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(GROUP_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(GROUP_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(GROUP_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
