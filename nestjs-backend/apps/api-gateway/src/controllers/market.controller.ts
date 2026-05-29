import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  MARKET_CREATE, MARKET_FIND_ALL, MARKET_FIND_ONE,
  MARKET_UPDATE, MARKET_DELETE, MARKET_FIND_ACTIVE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/markets')
export class MarketGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('market', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(MARKET_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('market', 'read')
  findActive(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(MARKET_FIND_ACTIVE, query || {}));
  }

  @Get(':id')
  @RequirePermission('market', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(MARKET_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('market', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(MARKET_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('market', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(MARKET_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('market', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(MARKET_DELETE, { id }));
  }
}
