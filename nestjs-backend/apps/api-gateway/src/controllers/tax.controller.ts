import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ITEM_SERVICE, TAX_CREATE, TAX_FIND_ALL, TAX_FIND_ONE, TAX_UPDATE, TAX_DELETE, TAX_FIND_ACTIVE } from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/taxes')
export class TaxGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission('tax', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) { return firstValueFrom(this.itemClient.send(TAX_FIND_ALL, query || {})); }

  @Get('active')
  findActive() { return firstValueFrom(this.itemClient.send(TAX_FIND_ACTIVE, {})); }

  @Get(':id')
  @RequirePermission('tax', 'read')
  findOne(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(TAX_FIND_ONE, { id })); }

  @Post()
  @RequirePermission('tax', 'create')
  create(@Body() dto: any) { return firstValueFrom(this.itemClient.send(TAX_CREATE, dto)); }

  @Put(':id')
  @RequirePermission('tax', 'update')
  update(@Param('id') id: string, @Body() dto: any) { return firstValueFrom(this.itemClient.send(TAX_UPDATE, { id, ...dto })); }

  @Delete(':id')
  @RequirePermission('tax', 'delete')
  delete(@Param('id') id: string) { return firstValueFrom(this.itemClient.send(TAX_DELETE, { id })); }
}
