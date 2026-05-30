import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  AREA_CREATE, AREA_FIND_ALL, AREA_FIND_ONE,
  AREA_UPDATE, AREA_DELETE, AREA_FIND_ACTIVE, AREA_FIND_BY_PINCODE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/areas')
export class AreaGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('area', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(AREA_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('area', 'read')
  findActive(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(AREA_FIND_ACTIVE, query || {}));
  }

  @Get('by-pincode/:pincodeId')
  @RequirePermission('area', 'read')
  findByPincode(@Param('pincodeId') pincodeId: string) {
    return firstValueFrom(this.masterClient.send(AREA_FIND_BY_PINCODE, { pincodeId }));
  }

  @Get(':id')
  @RequirePermission('area', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(AREA_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('area', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(AREA_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('area', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(AREA_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('area', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(AREA_DELETE, { id }));
  }
}
