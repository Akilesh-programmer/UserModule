import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  STATE_CREATE, STATE_FIND_ALL, STATE_FIND_ONE,
  STATE_UPDATE, STATE_DELETE, STATE_FIND_ACTIVE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/states')
export class StateGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('state', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(STATE_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('state', 'read')
  findActive() {
    return firstValueFrom(this.masterClient.send(STATE_FIND_ACTIVE, {}));
  }

  @Get(':id')
  @RequirePermission('state', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(STATE_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('state', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(STATE_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('state', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(STATE_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('state', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(STATE_DELETE, { id }));
  }
}
