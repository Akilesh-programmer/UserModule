import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  ITEM_SERVICE,
  ORDER_SERVICE,
  DASHBOARD_MASTER_STATS,
  DASHBOARD_ORDER_STATS,
  ITEM_FIND_ALL,
  SCHEME_FIND_ALL,
} from '@app/common';

@Controller('api/v1/dashboard')
export class DashboardGatewayController {
  constructor(
    @Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy,
    @Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy,
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  @Get('stats')
  async getStats() {
    try {
      // 1. Fetch master stats (sales reps, active dealers, total shops, active markets)
      const masterStats = await firstValueFrom(
        this.masterClient.send(DASHBOARD_MASTER_STATS, {}),
      ).catch((err) => {
        console.error('Failed to fetch master stats:', err);
        return { salesReps: 0, dealers: 0, shops: 0, markets: 0 };
      });

      // 2. Fetch transactional stats (order count, secondary sales count, dispatch count, income, returns)
      const orderStats = await firstValueFrom(
        this.orderClient.send(DASHBOARD_ORDER_STATS, {}),
      ).catch((err) => {
        console.error('Failed to fetch order stats:', err);
        return { ordersCount: 0, secondarySalesCount: 0, dispatchCount: 0, incomeTotal: 0, returnsTotal: 0 };
      });

      // 3. Fetch active item count from item-service
      let itemsCount = 0;
      try {
        const items = await firstValueFrom(
          this.itemClient.send(ITEM_FIND_ALL, { activeOnly: 'true' }),
        );
        itemsCount = Array.isArray(items) ? items.length : items?.data?.length || 0;
      } catch (err) {
        console.error('Failed to fetch items count:', err);
      }

      // 4. Fetch scheme count from item-service
      let schemesCount = 0;
      try {
        const schemes = await firstValueFrom(
          this.itemClient.send(SCHEME_FIND_ALL, { activeOnly: 'true' }),
        );
        schemesCount = Array.isArray(schemes) ? schemes.length : schemes?.data?.length || 0;
      } catch (err) {
        console.error('Failed to fetch schemes count:', err);
      }

      // Format response exactly matching the frontend Dashboard needs:
      return {
        salesRepCount: masterStats.salesReps || 0,
        dealerCount: masterStats.dealers || 0,
        shopCount: masterStats.shops || 0,
        marketCount: masterStats.markets || 0,
        itemCount: itemsCount,
        schemeCount: schemesCount,
        orderReceiptCount: orderStats.ordersCount || 0,
        secondarySalesCount: orderStats.secondarySalesCount || 0,
        orderDispatchCount: orderStats.dispatchCount || 0,
        incomeTotal: orderStats.incomeTotal || 0,
        returnsTotal: orderStats.returnsTotal || 0,
      };
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch dashboard stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
