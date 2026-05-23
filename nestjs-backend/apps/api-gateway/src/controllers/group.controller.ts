import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ITEM_SERVICE, GROUP_CREATE, GROUP_FIND_ALL, GROUP_FIND_ONE, GROUP_UPDATE, GROUP_DELETE, GROUP_FIND_ACTIVE } from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/groups')
export class GroupGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission('group', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) { return firstValueFrom(this.itemClient.send(GROUP_FIND_ALL, query || {})); }

  @Get('active')
  findActive(@Query() query: any) { return firstValueFrom(this.itemClient.send(GROUP_FIND_ACTIVE, query || {})); }

  @Get(':id')
  @RequirePermission('group', 'read')
  findOne(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(GROUP_FIND_ONE, { id })); }

  @Post()
  @RequirePermission('group', 'create')
  create(@Body() dto: any) { return firstValueFrom(this.itemClient.send(GROUP_CREATE, dto)); }

  @Put(':id')
  @RequirePermission('group', 'update')
  update(@Param('id') id: string, @Body() dto: any) { return firstValueFrom(this.itemClient.send(GROUP_UPDATE, { id, ...dto })); }

  @Delete(':id')
  @RequirePermission('group', 'delete')
  delete(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(GROUP_DELETE, { id })); }
}
