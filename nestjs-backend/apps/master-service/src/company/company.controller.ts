import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  COMPANY_CREATE, COMPANY_FIND_ALL, COMPANY_FIND_ONE,
  COMPANY_UPDATE, COMPANY_DELETE, COMPANY_FIND_ACTIVE,
} from '@app/common';
import { CompanyService } from './company.service';

@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @MessagePattern(COMPANY_FIND_ALL)
  findAll(@Payload() query: any) { return this.companyService.findAll(query); }

  @MessagePattern(COMPANY_FIND_ACTIVE)
  findActive() { return this.companyService.findActive(); }

  @MessagePattern(COMPANY_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.companyService.findOne(data.id); }

  @MessagePattern(COMPANY_CREATE)
  create(@Payload() dto: any) { return this.companyService.create(dto); }

  @MessagePattern(COMPANY_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.companyService.update(id, dto);
  }

  @MessagePattern(COMPANY_DELETE)
  delete(@Payload() data: { id: string }) { return this.companyService.delete(data.id); }
}
