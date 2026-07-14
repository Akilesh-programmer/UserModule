import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ORDER_SERVICE,
  ITEM_SERVICE,
  ORDER_CREATE,
  ORDER_FIND_ALL,
  ORDER_FIND_ONE,
  ORDER_APPROVE,
  ORDER_REJECT,
  ORDER_UPDATE_STATUS,
  ORDER_WITH_STOCK_CHECK,
  ORDER_UPDATE,
  ORDER_DELETE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';

@Controller('api/v1/orders')
export class OrderGatewayController {
  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
    @Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy,
  ) {}

  @Get()
  @RequirePermission('order', 'read')
  findAll(@Query() query: any) {
    return firstValueFrom(this.orderClient.send(ORDER_FIND_ALL, query || {}));
  }

  @Get(':id')
  @RequirePermission('order', 'read')
  findOne(@Param('id') id: string) {
    // Return order details WITH stock checks annotated
    return firstValueFrom(this.orderClient.send(ORDER_WITH_STOCK_CHECK, { id }));
  }

  @Post()
  @RequirePermission('order', 'create')
  async create(@Body() dto: any, @Req() req: any) {
    // Enrich items with current name, rates and properties from item-service
    if (dto.items && Array.isArray(dto.items)) {
      const enrichedItems = await Promise.all(
        dto.items.map(async (item: any) => {
          try {
            const itemDetails = await firstValueFrom(
              this.itemClient.send('item.findOne', { id: item.itemId }),
            );
            return {
              ...item,
              itemName: itemDetails?.itemName || '',
              boxPrice: itemDetails?.boxRate || 0,
              piecePrice: itemDetails?.itemPrice || 0,
              itemsPerBox: itemDetails?.itemsPerBox || 1,
            };
          } catch (err) {
            console.error(`Failed to fetch details for order item ${item.itemId}:`, err);
            return {
              ...item,
              itemName: '',
              boxPrice: 0,
              piecePrice: 0,
              itemsPerBox: 1,
            };
          }
        }),
      );
      dto.items = enrichedItems;
    }

    // Set salesRepId from logged-in user if available and it's a salesRep
    if (req.user && req.user.source === 'salesRep') {
      dto.salesRepId = req.user._id;
    }

    return firstValueFrom(this.orderClient.send(ORDER_CREATE, dto));
  }

  @Put(':id/approve')
  @RequirePermission('order', 'update')
  approve(@Param('id') id: string, @Req() req: any) {
    const approvedBy = req.user ? req.user._id : null;
    return firstValueFrom(this.orderClient.send(ORDER_APPROVE, { id, approvedBy }));
  }

  @Put(':id/reject')
  @RequirePermission('order', 'update')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }
    return firstValueFrom(this.orderClient.send(ORDER_REJECT, { id, reason }));
  }

  @Put(':id/status')
  @RequirePermission('order', 'update')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return firstValueFrom(this.orderClient.send(ORDER_UPDATE_STATUS, { id, status }));
  }

  @Put(':id')
  @RequirePermission('order', 'update')
  async update(@Param('id') id: string, @Body() dto: any) {
    if (dto.items && Array.isArray(dto.items)) {
      const enrichedItems = await Promise.all(
        dto.items.map(async (item: any) => {
          try {
            const itemDetails = await firstValueFrom(
              this.itemClient.send('item.findOne', { id: item.itemId }),
            );
            return {
              ...item,
              itemName: itemDetails?.itemName || '',
              boxPrice: itemDetails?.boxRate || 0,
              piecePrice: itemDetails?.itemPrice || 0,
              itemsPerBox: itemDetails?.itemsPerBox || 1,
            };
          } catch (err) {
            return {
              ...item,
              itemName: '',
              boxPrice: 0,
              piecePrice: 0,
              itemsPerBox: 1,
            };
          }
        }),
      );
      dto.items = enrichedItems;
    }
    return firstValueFrom(this.orderClient.send(ORDER_UPDATE, { id, ...dto }));
  }

  @Delete(':id')
  @RequirePermission('order', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.orderClient.send(ORDER_DELETE, { id }));
  }
}
