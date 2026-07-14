import { Injectable } from '@nestjs/common';
import { ManagerService } from './manager/manager.service';
import { SalesRepService } from './sales-rep/sales-rep.service';
import { DealerService } from './dealer/dealer.service';
import { MarketService } from './market/market.service';

@Injectable()
export class MasterService {
  constructor(
    private readonly managerService: ManagerService,
    private readonly salesRepService: SalesRepService,
    private readonly dealerService: DealerService,
    private readonly marketService: MarketService,
  ) {}

  async getMasterStats() {
    const [salesReps, dealers, shops, markets] = await Promise.all([
      this.salesRepService.count({ isActive: true }),
      this.dealerService.count({ isActive: true }),
      this.dealerService.count({}),
      this.marketService.count({ isActive: true }),
    ]);
    return { salesReps, dealers, shops, markets };
  }

  /** Find user by username across Manager and SalesRep (for auth login) */
  async findByUsername(username: string) {
    const manager = await this.managerService.findByUsername(username);
    if (manager) {
      return { record: manager, source: 'manager' as const };
    }

    const salesRep = await this.salesRepService.findByUsername(username);
    if (salesRep) {
      return { record: salesRep, source: 'salesRep' as const };
    }

    return null;
  }

  /** Check if username exists in either Manager or SalesRep collections */
  async checkUsernameExists(username: string, excludeId?: string) {
    const managerExists = await this.managerService.checkUsernameExists(username, excludeId);
    if (managerExists) return true;

    const salesRepExists = await this.salesRepService.checkUsernameExists(username, excludeId);
    return salesRepExists;
  }

  /** Get all managers and sales reps tagged with _type for combined user list */
  async findAllForUsers() {
    const [managers, salesReps] = await Promise.all([
      this.managerService.findAll(),
      this.salesRepService.findAll(),
    ]);

    // userTypeId is a raw ObjectId pointing to the admin DB — cross-DB populate won't work.
    // Construct a virtual populated { _id, name } so the frontend renders user type correctly.
    const taggedManagers = managers.map((m: any) => ({
      ...m,
      _type: 'manager',
      userTypeId: m.userTypeId ? { _id: m.userTypeId, name: 'Manager' } : null,
    }));
    const taggedSalesReps = salesReps.map((s: any) => ({
      ...s,
      _type: 'salesRep',
      userTypeId: s.userTypeId ? { _id: s.userTypeId, name: 'Sales Rep' } : null,
    }));

    return [...taggedManagers, ...taggedSalesReps];
  }
}
