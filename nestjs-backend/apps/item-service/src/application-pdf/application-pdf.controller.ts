import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { APPLICATION_PDF_CREATE, APPLICATION_PDF_FIND_ALL, APPLICATION_PDF_FIND_ONE, APPLICATION_PDF_UPDATE, APPLICATION_PDF_DELETE } from '@app/common';
import { ApplicationPdfService } from './application-pdf.service';

@Controller()
export class ApplicationPdfController {
  constructor(private readonly svc: ApplicationPdfService) {}

  @MessagePattern(APPLICATION_PDF_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(APPLICATION_PDF_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(APPLICATION_PDF_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(APPLICATION_PDF_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(APPLICATION_PDF_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
