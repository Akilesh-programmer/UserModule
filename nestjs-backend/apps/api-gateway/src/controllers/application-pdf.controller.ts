import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import {
  ITEM_SERVICE,
  APPLICATION_PDF_CREATE, APPLICATION_PDF_FIND_ALL, APPLICATION_PDF_FIND_ONE,
  APPLICATION_PDF_UPDATE, APPLICATION_PDF_DELETE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';
import { pdfMulterOptions } from '../middleware/multer-pdf.config';

@Controller('api/v1/application-pdfs')
export class ApplicationPdfGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission('applicationPdf', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.itemClient.send(APPLICATION_PDF_FIND_ALL, query || {}));
  }

  @Get(':id')
  @RequirePermission('applicationPdf', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.itemClient.send(APPLICATION_PDF_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('applicationPdf', 'create')
  @UseInterceptors(FileInterceptor('pdfFile', pdfMulterOptions))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const dto = {
      ...body,
      pdfFile: file ? file.filename : undefined,
      isActive: body.isActive === 'true' || body.isActive === true,
    };
    return firstValueFrom(this.itemClient.send(APPLICATION_PDF_CREATE, dto));
  }

  @Put(':id')
  @RequirePermission('applicationPdf', 'update')
  @UseInterceptors(FileInterceptor('pdfFile', pdfMulterOptions))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const dto: any = { ...body };
    if (file) dto.pdfFile = file.filename;
    if (dto.isActive !== undefined) dto.isActive = dto.isActive === 'true' || dto.isActive === true;

    const result = await firstValueFrom(this.itemClient.send(APPLICATION_PDF_UPDATE, { id, ...dto }));
    if (result.oldPdf) this.deleteFile(result.oldPdf);
    return result.data || result;
  }

  @Delete(':id')
  @RequirePermission('applicationPdf', 'delete')
  async delete(@Param('id') id: string) {
    const result = await firstValueFrom(this.itemClient.send(APPLICATION_PDF_DELETE, { id }));
    if (result.pdfFile) this.deleteFile(result.pdfFile);
    return { message: result.message };
  }

  private deleteFile(filename: string) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { }
  }
}
