import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  COUNTRY_CREATE, COUNTRY_FIND_ALL, COUNTRY_FIND_ONE,
  COUNTRY_UPDATE, COUNTRY_DELETE, COUNTRY_FIND_ACTIVE,
} from '@app/common';
import { CountryService } from './country.service';

@Controller()
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @MessagePattern(COUNTRY_FIND_ALL)
  findAll(@Payload() query: any) { return this.countryService.findAll(query); }

  @MessagePattern(COUNTRY_FIND_ACTIVE)
  findActive() { return this.countryService.findActive(); }

  @MessagePattern(COUNTRY_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.countryService.findOne(data.id); }

  @MessagePattern(COUNTRY_CREATE)
  create(@Payload() dto: any) { return this.countryService.create(dto); }

  @MessagePattern(COUNTRY_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.countryService.update(id, dto);
  }

  @MessagePattern(COUNTRY_DELETE)
  delete(@Payload() data: { id: string }) { return this.countryService.delete(data.id); }
}
