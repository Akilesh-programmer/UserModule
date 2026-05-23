import { Injectable } from '@nestjs/common';
import { ManagerService } from './manager/manager.service';
import { SalesRepService } from './sales-rep/sales-rep.service';

@Injectable()
export class StaffService {
  constructor(
    private readonly managerService: ManagerService,
    private readonly salesRepService: SalesRepService,
  ) {}

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

    const taggedManagers = managers.map((m: any) => ({ ...m, _type: 'manager' }));
    const taggedSalesReps = salesReps.map((s: any) => ({ ...s, _type: 'salesRep' }));

    return [...taggedManagers, ...taggedSalesReps];
  }
}
