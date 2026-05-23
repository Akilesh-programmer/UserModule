import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ADMIN_SERVICE, USER_TYPE_CREATE, USER_TYPE_FIND_ALL, USER_TYPE_FIND_ONE, USER_TYPE_UPDATE, USER_TYPE_DELETE } from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/user-types')
export class UserTypeGatewayController {
  constructor(@Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy) {}

  @Get()
  @RequirePermission('userType', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.adminClient.send(USER_TYPE_FIND_ALL, query || {}));
  }

  @Get(':id')
  @RequirePermission('userType', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.adminClient.send(USER_TYPE_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('userType', 'create')
  create(@Body() dto: any) {
    return firstValueFrom(this.adminClient.send(USER_TYPE_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('userType', 'update')
  update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(this.adminClient.send(USER_TYPE_UPDATE, { id, ...dto }));
  }

  @Delete(':id')
  @RequirePermission('userType', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.adminClient.send(USER_TYPE_DELETE, { id }));
  }
}
