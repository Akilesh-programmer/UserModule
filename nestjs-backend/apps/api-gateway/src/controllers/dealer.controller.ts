import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import {
  MASTER_SERVICE,
  DEALER_CREATE, DEALER_FIND_ALL, DEALER_FIND_ONE,
  DEALER_UPDATE, DEALER_DELETE, DEALER_FIND_ACTIVE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';
import { multerOptions } from '../middleware/multer.config';

@Controller('api/v1/dealers')
export class DealerGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('dealer', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(DEALER_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('dealer', 'read')
  findActive(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(DEALER_FIND_ACTIVE, query || {}));
  }

  @Get(':id')
  @RequirePermission('dealer', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(DEALER_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('dealer', 'create')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }
    const dto = {
      ...body,
      address,
      image: file ? file.filename : undefined,
      isActive: body.isActive === 'true' || body.isActive === true,
    };
    return firstValueFrom(this.masterClient.send(DEALER_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('dealer', 'update')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }
    const dto: any = { ...body, address };
    if (file) dto.image = file.filename;
    if (dto.isActive !== undefined) dto.isActive = dto.isActive === 'true' || dto.isActive === true;

    const result = await firstValueFrom(this.masterClient.send(DEALER_UPDATE, { id, ...dto }));
    if (result.oldImage) this.deleteFile(result.oldImage);
    return result.data || result;
  }

  @Delete(':id')
  @RequirePermission('dealer', 'delete')
  async delete(@Param('id') id: string) {
    const result = await firstValueFrom(this.masterClient.send(DEALER_DELETE, { id }));
    if (result.image) this.deleteFile(result.image);
    return { message: result.message };
  }

  private deleteFile(filename: string) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { }
  }
}
