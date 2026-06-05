import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  COUNTRY_CREATE, COUNTRY_FIND_ALL, COUNTRY_FIND_ONE,
  COUNTRY_UPDATE, COUNTRY_DELETE, COUNTRY_FIND_ACTIVE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/countries')
export class CountryGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('country', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(COUNTRY_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('country', 'read')
  findActive() {
    return firstValueFrom(this.masterClient.send(COUNTRY_FIND_ACTIVE, {}));
  }

  @Get(':id')
  @RequirePermission('country', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(COUNTRY_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('country', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(COUNTRY_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('country', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(COUNTRY_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('country', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(COUNTRY_DELETE, { id }));
  }
}
