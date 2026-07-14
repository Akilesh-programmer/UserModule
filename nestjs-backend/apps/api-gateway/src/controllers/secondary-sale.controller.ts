import { Body, Controller, Get, Inject, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ORDER_SERVICE,
  SECONDARY_SALE_CREATE,
  SECONDARY_SALE_FIND_ALL,
  SECONDARY_SALE_FIND_ONE,
  SECONDARY_SALE_MARK_DELIVERED,
  SECONDARY_SALE_MARK_RETURNED,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';

@Controller('api/v1/secondary-sales')
export class SecondarySaleGatewayController {
  constructor(@Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy) {}

  @Get()
  @RequirePermission('secondarySale', 'read')
  findAll(@Query() query: any) {
    return firstValueFrom(this.orderClient.send(SECONDARY_SALE_FIND_ALL, query || {}));
  }

  @Get(':id')
  @RequirePermission('secondarySale', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.orderClient.send(SECONDARY_SALE_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('secondarySale', 'create')
  create(@Body() dto: any, @Req() req: any) {
    const dispatchedBy = req.user ? req.user._id : null;
    return firstValueFrom(this.orderClient.send(SECONDARY_SALE_CREATE, { ...dto, dispatchedBy }));
  }

  @Put(':id/delivered')
  @RequirePermission('secondarySale', 'update')
  markDelivered(@Param('id') id: string) {
    return firstValueFrom(this.orderClient.send(SECONDARY_SALE_MARK_DELIVERED, { id }));
  }

  @Put(':id/returned')
  @RequirePermission('secondarySale', 'update')
  markReturned(@Param('id') id: string, @Body('reason') reason?: string) {
    return firstValueFrom(this.orderClient.send(SECONDARY_SALE_MARK_RETURNED, { id, reason }));
  }
}
