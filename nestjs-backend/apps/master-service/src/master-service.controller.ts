import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { STAFF_FIND_BY_USERNAME, STAFF_CHECK_USERNAME, STAFF_FIND_ALL_FOR_USERS, DASHBOARD_MASTER_STATS } from '@app/common';
import { MasterService } from './master-service.service';

@Controller()
export class MasterServiceController {
  constructor(private readonly masterService: MasterService) {}

  @MessagePattern(DASHBOARD_MASTER_STATS)
  getMasterStats() {
    return this.masterService.getMasterStats();
  }

  @MessagePattern(STAFF_FIND_BY_USERNAME)
  findByUsername(@Payload() data: { username: string }) {
    return this.masterService.findByUsername(data.username);
  }

  @MessagePattern(STAFF_CHECK_USERNAME)
  checkUsername(@Payload() data: { username: string; excludeId?: string }) {
    return this.masterService.checkUsernameExists(data.username, data.excludeId);
  }

  @MessagePattern(STAFF_FIND_ALL_FOR_USERS)
  findAllForUsers() {
    return this.masterService.findAllForUsers();
  }
}
