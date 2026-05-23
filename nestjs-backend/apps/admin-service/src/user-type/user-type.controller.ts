import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  USER_TYPE_CREATE,
  USER_TYPE_FIND_ALL,
  USER_TYPE_FIND_ONE,
  USER_TYPE_UPDATE,
  USER_TYPE_DELETE,
} from '@app/common';
import { UserTypeService } from './user-type.service';

@Controller()
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @MessagePattern(USER_TYPE_FIND_ALL)
  findAll(@Payload() query: { activeOnly?: string }) {
    return this.userTypeService.findAll(query);
  }

  @MessagePattern(USER_TYPE_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    return this.userTypeService.findOne(data.id);
  }

  @MessagePattern(USER_TYPE_CREATE)
  create(@Payload() dto: any) {
    return this.userTypeService.create(dto);
  }

  @MessagePattern(USER_TYPE_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.userTypeService.update(id, dto);
  }

  @MessagePattern(USER_TYPE_DELETE)
  delete(@Payload() data: { id: string }) {
    return this.userTypeService.delete(data.id);
  }
}
