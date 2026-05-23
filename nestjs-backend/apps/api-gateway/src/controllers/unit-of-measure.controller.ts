import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ITEM_SERVICE, UOM_CREATE, UOM_FIND_ALL, UOM_FIND_ONE, UOM_UPDATE, UOM_DELETE, UOM_FIND_ACTIVE } from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/unit-of-measures')
export class UnitOfMeasureGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission('unitOfMeasure', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) { return firstValueFrom(this.itemClient.send(UOM_FIND_ALL, query || {})); }

  @Get('active')
  findActive() { return firstValueFrom(this.itemClient.send(UOM_FIND_ACTIVE, {})); }

  @Get(':id')
  @RequirePermission('unitOfMeasure', 'read')
  findOne(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(UOM_FIND_ONE, { id })); }

  @Post()
  @RequirePermission('unitOfMeasure', 'create')
  create(@Body() dto: any) { return firstValueFrom(this.itemClient.send(UOM_CREATE, dto)); }

  @Put(':id')
  @RequirePermission('unitOfMeasure', 'update')
  update(@Param('id') id: string, @Body() dto: any) { return firstValueFrom(this.itemClient.send(UOM_UPDATE, { id, ...dto })); }

  @Delete(':id')
  @RequirePermission('unitOfMeasure', 'delete')
  delete(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(UOM_DELETE, { id })); }
}
