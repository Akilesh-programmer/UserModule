import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import {
  ITEM_SERVICE,
  SCHEME_CREATE, SCHEME_FIND_ALL, SCHEME_FIND_ONE,
  SCHEME_UPDATE, SCHEME_DELETE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';
import { multerOptions } from '../middleware/multer.config';

@Controller('api/v1/schemes')
export class SchemeGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission('scheme', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.itemClient.send(SCHEME_FIND_ALL, query || {}));
  }

  @Get(':id')
  @RequirePermission('scheme', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.itemClient.send(SCHEME_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('scheme', 'create')
  @UseInterceptors(FileInterceptor('productImage', multerOptions))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const dto = {
      ...body,
      productImage: file ? file.filename : undefined,
      isActive: body.isActive === 'true' || body.isActive === true,
      boxQuantity: Number(body.boxQuantity),
    };
    return firstValueFrom(this.itemClient.send(SCHEME_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('scheme', 'update')
  @UseInterceptors(FileInterceptor('productImage', multerOptions))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const dto: any = { ...body };
    if (file) dto.productImage = file.filename;
    if (dto.isActive !== undefined) dto.isActive = dto.isActive === 'true' || dto.isActive === true;
    if (dto.boxQuantity !== undefined) dto.boxQuantity = Number(dto.boxQuantity);

    const result = await firstValueFrom(this.itemClient.send(SCHEME_UPDATE, { id, ...dto }));
    if (result.oldImage) this.deleteFile(result.oldImage);
    return result.data || result;
  }

  @Delete(':id')
  @RequirePermission('scheme', 'delete')
  async delete(@Param('id') id: string) {
    const result = await firstValueFrom(this.itemClient.send(SCHEME_DELETE, { id }));
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
