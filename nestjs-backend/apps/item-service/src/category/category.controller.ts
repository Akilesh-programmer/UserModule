import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CATEGORY_CREATE, CATEGORY_FIND_ALL, CATEGORY_FIND_ONE, CATEGORY_UPDATE, CATEGORY_DELETE, CATEGORY_FIND_ACTIVE } from '@app/common';
import { CategoryService } from './category.service';

@Controller()
export class CategoryController {
  constructor(private readonly svc: CategoryService) {}

  @MessagePattern(CATEGORY_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(CATEGORY_FIND_ACTIVE)
  findActive() { return this.svc.findActive(); }

  @MessagePattern(CATEGORY_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(CATEGORY_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(CATEGORY_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(CATEGORY_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
