import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { STAFF_FIND_BY_USERNAME, STAFF_CHECK_USERNAME, STAFF_FIND_ALL_FOR_USERS } from '@app/common';
import { StaffService } from './staff.service';

@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @MessagePattern(STAFF_FIND_BY_USERNAME)
  findByUsername(@Payload() data: { username: string }) {
    return this.staffService.findByUsername(data.username);
  }

  @MessagePattern(STAFF_CHECK_USERNAME)
  checkUsername(@Payload() data: { username: string; excludeId?: string }) {
    return this.staffService.checkUsernameExists(data.username, data.excludeId);
  }

  @MessagePattern(STAFF_FIND_ALL_FOR_USERS)
  findAllForUsers() {
    return this.staffService.findAllForUsers();
  }
}
