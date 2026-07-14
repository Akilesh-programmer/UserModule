import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ORDER_SERVICE,
  ITEM_SERVICE,
  STOCK_CREATE,
  STOCK_FIND_ALL,
  STOCK_FIND_ONE,
  STOCK_UPDATE,
  STOCK_DELETE,
  STOCK_FIND_BY_DEALER,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';

@Controller('api/v1/stocks')
export class StockGatewayController {
  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
    @Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy,
  ) {}

  @Get()
  @RequirePermission('stockEntry', 'read')
  findAll(@Query() query: any) {
    return firstValueFrom(this.orderClient.send(STOCK_FIND_ALL, query || {}));
  }

  @Get('by-dealer/:dealerId')
  findByDealer(@Param('dealerId') dealerId: string) {
    return firstValueFrom(this.orderClient.send(STOCK_FIND_BY_DEALER, { dealerId }));
  }

  @Get(':id')
  @RequirePermission('stockEntry', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.orderClient.send(STOCK_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('stockEntry', 'create')
  async create(@Body() dto: any) {
    // Enrich items with itemsPerBox from item-service
    if (dto.items && Array.isArray(dto.items)) {
      const enrichedItems = await Promise.all(
        dto.items.map(async (item: any) => {
          try {
            const itemDetails = await firstValueFrom(
              this.itemClient.send('item.findOne', { id: item.itemId }),
            );
            return {
              ...item,
              itemsPerBox: itemDetails?.itemsPerBox || 1,
            };
          } catch (err) {
            console.error(`Failed to fetch details for item ${item.itemId}:`, err);
            return {
              ...item,
              itemsPerBox: 1,
            };
          }
        }),
      );
      dto.items = enrichedItems;
    }
    return firstValueFrom(this.orderClient.send(STOCK_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('stockEntry', 'update')
  async update(@Param('id') id: string, @Body() dto: any) {
    // Enrich items with itemsPerBox if they are being updated
    if (dto.items && Array.isArray(dto.items)) {
      const enrichedItems = await Promise.all(
        dto.items.map(async (item: any) => {
          try {
            const itemDetails = await firstValueFrom(
              this.itemClient.send('item.findOne', { id: item.itemId }),
            );
            return {
              ...item,
              itemsPerBox: itemDetails?.itemsPerBox || 1,
            };
          } catch (err) {
            return {
              ...item,
              itemsPerBox: 1,
            };
          }
        }),
      );
      dto.items = enrichedItems;
    }
    return firstValueFrom(this.orderClient.send(STOCK_UPDATE, { id, ...dto }));
  }

  @Delete(':id')
  @RequirePermission('stockEntry', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.orderClient.send(STOCK_DELETE, { id }));
  }
}
