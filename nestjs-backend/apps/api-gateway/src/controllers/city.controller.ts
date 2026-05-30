import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  CITY_CREATE, CITY_FIND_ALL, CITY_FIND_ONE,
  CITY_UPDATE, CITY_DELETE, CITY_FIND_ACTIVE, CITY_FIND_BY_STATE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/cities')
export class CityGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('city', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(CITY_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('city', 'read')
  findActive(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(CITY_FIND_ACTIVE, query || {}));
  }

  @Get('by-state/:stateId')
  @RequirePermission('city', 'read')
  findByState(@Param('stateId') stateId: string) {
    return firstValueFrom(this.masterClient.send(CITY_FIND_BY_STATE, { stateId }));
  }

  @Get(':id')
  @RequirePermission('city', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(CITY_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('city', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(CITY_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('city', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(CITY_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('city', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(CITY_DELETE, { id }));
  }
}
