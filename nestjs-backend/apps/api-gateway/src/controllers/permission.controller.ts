import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ADMIN_SERVICE, PERMISSION_FIND_ALL, PERMISSION_FIND_BY_USER_TYPE, PERMISSION_SAVE } from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';

@Controller('api/v1/permissions')
export class PermissionGatewayController {
  constructor(@Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy) {}

  @Get()
  @RequirePermission('userPermission', 'read')
  findAll() {
    return firstValueFrom(this.adminClient.send(PERMISSION_FIND_ALL, {}));
  }

  @Get(':userTypeId')
  @RequirePermission('userPermission', 'read')
  findByUserType(@Param('userTypeId') userTypeId: string) {
    return firstValueFrom(this.adminClient.send(PERMISSION_FIND_BY_USER_TYPE, { userTypeId }));
  }

  @Post()
  @RequirePermission('userPermission', 'update')
  save(@Body() dto: any) {
    return firstValueFrom(this.adminClient.send(PERMISSION_SAVE, dto));
  }
}
