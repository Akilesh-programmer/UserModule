import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ITEM_CREATE, ITEM_FIND_ALL, ITEM_FIND_ONE, ITEM_UPDATE, ITEM_DELETE } from '@app/common';
import { ItemService } from './item.service';

@Controller()
export class ItemController {
  constructor(private readonly svc: ItemService) {}

  @MessagePattern(ITEM_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(ITEM_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(ITEM_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(ITEM_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(ITEM_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
