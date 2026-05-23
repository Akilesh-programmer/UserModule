import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ADMIN_SERVICE, MASTER_SERVICE,
  USER_CREATE, USER_FIND_ALL, USER_FIND_ONE, USER_UPDATE, USER_DELETE,
  USER_CHECK_USERNAME, STAFF_CHECK_USERNAME, STAFF_FIND_ALL_FOR_USERS,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';

@Controller('api/v1/users')
export class UserGatewayController {
  constructor(
    @Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy,
    @Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy,
  ) {}

  @Get()
  @RequirePermission('userCreation', 'read')
  async findAll() {
    // Orchestrate: get users from User Service + staff from Staff Service
    const [users, staff] = await Promise.all([
      firstValueFrom(this.adminClient.send(USER_FIND_ALL, {})),
      firstValueFrom(this.masterClient.send(STAFF_FIND_ALL_FOR_USERS, {})),
    ]);

    const allUsers = [...(users || []), ...(staff || [])];
    allUsers.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allUsers;
  }

  @Get(':id')
  @RequirePermission('userCreation', 'read')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.adminClient.send(USER_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('userCreation', 'create')
  async create(@Body() dto: any) {
    // Check username uniqueness across all services
    const [userExists, staffExists] = await Promise.all([
      firstValueFrom(this.adminClient.send(USER_CHECK_USERNAME, { username: dto.username })),
      firstValueFrom(this.masterClient.send(STAFF_CHECK_USERNAME, { username: dto.username })),
    ]);

    if (userExists || staffExists) {
      throw new Error('Username already exists');
    }

    return firstValueFrom(this.adminClient.send(USER_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('userCreation', 'update')
  async update(@Param('id') id: string, @Body() dto: any) {
    // If username changed, check uniqueness
    if (dto.username) {
      const [userExists, staffExists] = await Promise.all([
        firstValueFrom(this.adminClient.send(USER_CHECK_USERNAME, { username: dto.username, excludeId: id })),
        firstValueFrom(this.masterClient.send(STAFF_CHECK_USERNAME, { username: dto.username, excludeId: id })),
      ]);
      if (userExists || staffExists) {
        throw new Error('Username already exists');
      }
    }

    return firstValueFrom(this.adminClient.send(USER_UPDATE, { id, ...dto }));
  }

  @Delete(':id')
  @RequirePermission('userCreation', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.adminClient.send(USER_DELETE, { id }));
  }
}
