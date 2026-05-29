import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  PINCODE_CREATE, PINCODE_FIND_ALL, PINCODE_FIND_ONE,
  PINCODE_UPDATE, PINCODE_DELETE, PINCODE_FIND_ACTIVE, PINCODE_FIND_BY_CITY,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/pincodes')
export class PincodeGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('pincode', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(PINCODE_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('pincode', 'read')
  findActive(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(PINCODE_FIND_ACTIVE, query || {}));
  }

  @Get('by-city/:cityId')
  @RequirePermission('pincode', 'read')
  findByCity(@Param('cityId') cityId: string) {
    return firstValueFrom(this.masterClient.send(PINCODE_FIND_BY_CITY, { cityId }));
  }

  @Get(':id')
  @RequirePermission('pincode', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(PINCODE_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('pincode', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(PINCODE_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('pincode', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(PINCODE_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('pincode', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(PINCODE_DELETE, { id }));
  }
}
