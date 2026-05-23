import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ITEM_SERVICE, PACKING_TYPE_CREATE, PACKING_TYPE_FIND_ALL, PACKING_TYPE_FIND_ONE, PACKING_TYPE_UPDATE, PACKING_TYPE_DELETE, PACKING_TYPE_FIND_ACTIVE } from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/packing-types')
export class PackingTypeGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission('packingType', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) { return firstValueFrom(this.itemClient.send(PACKING_TYPE_FIND_ALL, query || {})); }

  @Get('active')
  findActive() { return firstValueFrom(this.itemClient.send(PACKING_TYPE_FIND_ACTIVE, {})); }

  @Get(':id')
  @RequirePermission('packingType', 'read')
  findOne(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(PACKING_TYPE_FIND_ONE, { id })); }

  @Post()
  @RequirePermission('packingType', 'create')
  create(@Body() dto: any) { return firstValueFrom(this.itemClient.send(PACKING_TYPE_CREATE, dto)); }

  @Put(':id')
  @RequirePermission('packingType', 'update')
  update(@Param('id') id: string, @Body() dto: any) { return firstValueFrom(this.itemClient.send(PACKING_TYPE_UPDATE, { id, ...dto })); }

  @Delete(':id')
  @RequirePermission('packingType', 'delete')
  delete(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(PACKING_TYPE_DELETE, { id })); }
}
