import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  USER_CREATE, USER_FIND_ALL, USER_FIND_ONE, USER_UPDATE, USER_DELETE,
  USER_FIND_BY_USERNAME, USER_CHECK_USERNAME,
} from '@app/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(USER_FIND_ALL)
  findAll(): Promise<any[]> {
    return this.userService.findAll();
  }

  @MessagePattern(USER_FIND_ONE)
  findOne(@Payload() data: { id: string }): Promise<any> {
    return this.userService.findOne(data.id);
  }

  @MessagePattern(USER_CREATE)
  create(@Payload() dto: any): Promise<any> {
    return this.userService.create(dto);
  }

  @MessagePattern(USER_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }): Promise<any> {
    const { id, ...dto } = data;
    return this.userService.update(id, dto);
  }

  @MessagePattern(USER_DELETE)
  delete(@Payload() data: { id: string }) {
    return this.userService.delete(data.id);
  }

  @MessagePattern(USER_FIND_BY_USERNAME)
  findByUsername(@Payload() data: { username: string }) {
    return this.userService.findByUsername(data.username);
  }

  @MessagePattern(USER_CHECK_USERNAME)
  checkUsername(@Payload() data: { username: string; excludeId?: string }) {
    return this.userService.checkUsernameExists(data.username, data.excludeId);
  }
}
