import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SCHEME_PDF_CREATE, SCHEME_PDF_FIND_ALL, SCHEME_PDF_FIND_ONE, SCHEME_PDF_UPDATE, SCHEME_PDF_DELETE } from '@app/common';
import { SchemePdfService } from './scheme-pdf.service';

@Controller()
export class SchemePdfController {
  constructor(private readonly svc: SchemePdfService) {}

  @MessagePattern(SCHEME_PDF_FIND_ALL)
  findAll(@Payload() query: any) { return this.svc.findAll(query); }

  @MessagePattern(SCHEME_PDF_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.svc.findOne(data.id); }

  @MessagePattern(SCHEME_PDF_CREATE)
  create(@Payload() dto: any) { return this.svc.create(dto); }

  @MessagePattern(SCHEME_PDF_UPDATE)
  update(@Payload() data: { id: string; [k: string]: any }) { const { id, ...dto } = data; return this.svc.update(id, dto); }

  @MessagePattern(SCHEME_PDF_DELETE)
  delete(@Payload() data: { id: string }) { return this.svc.delete(data.id); }
}
