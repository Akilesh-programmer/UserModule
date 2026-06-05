import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  SHOP_TYPE_CREATE, SHOP_TYPE_FIND_ALL, SHOP_TYPE_FIND_ONE,
  SHOP_TYPE_UPDATE, SHOP_TYPE_DELETE, SHOP_TYPE_FIND_ACTIVE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/shop-types')
export class ShopTypeGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('shopType', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(SHOP_TYPE_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('shopType', 'read')
  findActive() {
    return firstValueFrom(this.masterClient.send(SHOP_TYPE_FIND_ACTIVE, {}));
  }

  @Get(':id')
  @RequirePermission('shopType', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(SHOP_TYPE_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('shopType', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(SHOP_TYPE_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('shopType', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(SHOP_TYPE_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('shopType', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(SHOP_TYPE_DELETE, { id }));
  }
}
