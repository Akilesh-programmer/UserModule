import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  PERMISSION_FIND_ALL, PERMISSION_FIND_BY_USER_TYPE,
  PERMISSION_SAVE, PERMISSION_GET_FOR_AUTH,
} from '@app/common';
import { PermissionService } from './permission.service';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @MessagePattern(PERMISSION_FIND_ALL)
  findAll() {
    return this.permissionService.findAll();
  }

  @MessagePattern(PERMISSION_FIND_BY_USER_TYPE)
  findByUserType(@Payload() data: { userTypeId: string }) {
    return this.permissionService.findByUserType(data.userTypeId);
  }

  @MessagePattern(PERMISSION_SAVE)
  save(@Payload() dto: any) {
    return this.permissionService.save(dto);
  }

  @MessagePattern(PERMISSION_GET_FOR_AUTH)
  getForAuth(@Payload() data: { userTypeId: string }) {
    return this.permissionService.getForAuth(data.userTypeId);
  }
}
