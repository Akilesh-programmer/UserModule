import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import {
  MASTER_SERVICE, ADMIN_SERVICE,
  SALES_REP_CREATE, SALES_REP_FIND_ALL, SALES_REP_FIND_ONE,
  SALES_REP_UPDATE, SALES_REP_DELETE,
  USER_CHECK_USERNAME, STAFF_CHECK_USERNAME, USER_TYPE_FIND_ALL,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { multerOptions } from '../middleware/multer.config';

@Controller('api/v1/sales-reps')
export class SalesRepGatewayController {
  constructor(
    @Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy,
    @Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy,
  ) {}

  @Get()
  @RequirePermission('salesRep', 'read')
  findAll() {
    return firstValueFrom(this.masterClient.send(SALES_REP_FIND_ALL, {}));
  }

  @Get(':id')
  @RequirePermission('salesRep', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(SALES_REP_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('salesRep', 'create')
  @UseInterceptors(FileInterceptor('profilePic', multerOptions))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const [userExists, staffExists] = await Promise.all([
      firstValueFrom(this.adminClient.send(USER_CHECK_USERNAME, { username: body.username })),
      firstValueFrom(this.masterClient.send(STAFF_CHECK_USERNAME, { username: body.username })),
    ]);

    if (userExists || staffExists) {
      if (file) this.deleteFile(file.filename);
      throw new Error('Username already exists');
    }

    const userTypes = await firstValueFrom(this.adminClient.send(USER_TYPE_FIND_ALL, {}));
    const salesRepType = userTypes.find((t: any) => t.name === 'Sales Rep');
    if (!salesRepType) {
      if (file) this.deleteFile(file.filename);
      throw new Error('Sales Rep user type not found. Please create it first.');
    }

    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }

    const dto = {
      ...body,
      address,
      userTypeId: salesRepType._id,
      profilePic: file ? file.filename : undefined,
      isActive: body.isActive === 'true' || body.isActive === true,
    };

    return firstValueFrom(this.masterClient.send(SALES_REP_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('salesRep', 'update')
  @UseInterceptors(FileInterceptor('profilePic', multerOptions))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }

    const dto: any = { ...body, address };
    if (file) dto.profilePic = file.filename;
    if (dto.isActive !== undefined) dto.isActive = dto.isActive === 'true' || dto.isActive === true;

    const result = await firstValueFrom(this.masterClient.send(SALES_REP_UPDATE, { id, ...dto }));
    if (result.oldProfilePic) this.deleteFile(result.oldProfilePic);
    return result.data || result;
  }

  @Delete(':id')
  @RequirePermission('salesRep', 'delete')
  async delete(@Param('id') id: string) {
    const result = await firstValueFrom(this.masterClient.send(SALES_REP_DELETE, { id }));
    if (result.profilePic) this.deleteFile(result.profilePic);
    return { message: result.message };
  }

  private deleteFile(filename: string) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { /* Ignore cleanup errors */ }
  }
}
