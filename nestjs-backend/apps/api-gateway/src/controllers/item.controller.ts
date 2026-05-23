import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ITEM_SERVICE, ITEM_CREATE, ITEM_FIND_ALL, ITEM_FIND_ONE, ITEM_UPDATE, ITEM_DELETE } from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';

@Controller('api/v1/items')
export class ItemGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission('item', 'read')
  findAll(@Query() query: any) { return firstValueFrom(this.itemClient.send(ITEM_FIND_ALL, query || {})); }

  @Get(':id')
  @RequirePermission('item', 'read')
  findOne(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(ITEM_FIND_ONE, { id })); }

  @Post()
  @RequirePermission('item', 'create')
  create(@Body() dto: any) { return firstValueFrom(this.itemClient.send(ITEM_CREATE, dto)); }

  @Put(':id')
  @RequirePermission('item', 'update')
  update(@Param('id') id: string, @Body() dto: any) { return firstValueFrom(this.itemClient.send(ITEM_UPDATE, { id, ...dto })); }

  @Delete(':id')
  @RequirePermission('item', 'delete')
  delete(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(ITEM_DELETE, { id })); }
}
