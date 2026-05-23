import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MANAGER_CREATE, MANAGER_FIND_ALL, MANAGER_FIND_ONE,
  MANAGER_UPDATE, MANAGER_DELETE, MANAGER_FIND_ACTIVE,
} from '@app/common';
import { ManagerService } from './manager.service';

@Controller()
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @MessagePattern(MANAGER_FIND_ALL)
  findAll(@Payload() query: any) {
    return this.managerService.findAll(query);
  }

  @MessagePattern(MANAGER_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    return this.managerService.findOne(data.id);
  }

  @MessagePattern(MANAGER_CREATE)
  create(@Payload() dto: any): Promise<any> {
    return this.managerService.create(dto);
  }

  @MessagePattern(MANAGER_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }): Promise<any> {
    const { id, ...dto } = data;
    return this.managerService.update(id, dto);
  }

  @MessagePattern(MANAGER_DELETE)
  delete(@Payload() data: { id: string }) {
    return this.managerService.delete(data.id);
  }

  @MessagePattern(MANAGER_FIND_ACTIVE)
  findActive(@Payload() query: any) {
    return this.managerService.findActive(query);
  }
}
