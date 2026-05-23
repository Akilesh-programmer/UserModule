import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import {
  MASTER_SERVICE, ADMIN_SERVICE,
  MANAGER_CREATE, MANAGER_FIND_ALL, MANAGER_FIND_ONE,
  MANAGER_UPDATE, MANAGER_DELETE, MANAGER_FIND_ACTIVE,
  USER_CHECK_USERNAME, STAFF_CHECK_USERNAME, USER_TYPE_FIND_ALL,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';
import { multerOptions } from '../middleware/multer.config';

@Controller('api/v1/managers')
export class ManagerGatewayController {
  constructor(
    @Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy,
    @Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy,
  ) {}

  @Get()
  @RequirePermission('manager', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(MANAGER_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('manager', 'read')
  findActive(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(MANAGER_FIND_ACTIVE, query || {}));
  }

  @Get(':id')
  @RequirePermission('manager', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(MANAGER_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('manager', 'create')
  @UseInterceptors(FileInterceptor('profilePic', multerOptions))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    // Check username uniqueness across all services
    const [userExists, staffExists] = await Promise.all([
      firstValueFrom(this.adminClient.send(USER_CHECK_USERNAME, { username: body.username })),
      firstValueFrom(this.masterClient.send(STAFF_CHECK_USERNAME, { username: body.username })),
    ]);

    if (userExists || staffExists) {
      if (file) this.deleteFile(file.filename);
      throw new Error('Username already exists');
    }

    // Get Manager userType ID
    const userTypes = await firstValueFrom(this.adminClient.send(USER_TYPE_FIND_ALL, {}));
    const managerType = userTypes.find((t: any) => t.name === 'Manager');
    if (!managerType) {
      if (file) this.deleteFile(file.filename);
      throw new Error('Manager user type not found. Please create it first.');
    }

    // Parse address if it comes as JSON string
    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }

    const dto = {
      ...body,
      address,
      userTypeId: managerType._id,
      profilePic: file ? file.filename : undefined,
      isActive: body.isActive === 'true' || body.isActive === true,
    };

    return firstValueFrom(this.masterClient.send(MANAGER_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('manager', 'update')
  @UseInterceptors(FileInterceptor('profilePic', multerOptions))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }

    const dto: any = { ...body, address };
    if (file) dto.profilePic = file.filename;
    if (dto.isActive !== undefined) dto.isActive = dto.isActive === 'true' || dto.isActive === true;

    const result = await firstValueFrom(this.masterClient.send(MANAGER_UPDATE, { id, ...dto }));

    // Clean up old profile pic if replaced
    if (result.oldProfilePic) {
      this.deleteFile(result.oldProfilePic);
    }

    return result.data || result;
  }

  @Delete(':id')
  @RequirePermission('manager', 'delete')
  async delete(@Param('id') id: string) {
    const result = await firstValueFrom(this.masterClient.send(MANAGER_DELETE, { id }));
    if (result.profilePic) {
      this.deleteFile(result.profilePic);
    }
    return { message: result.message };
  }

  private deleteFile(filename: string) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { /* Ignore cleanup errors */ }
  }
}
