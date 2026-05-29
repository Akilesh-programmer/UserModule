import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CITY_CREATE, CITY_FIND_ALL, CITY_FIND_ONE,
  CITY_UPDATE, CITY_DELETE, CITY_FIND_ACTIVE, CITY_FIND_BY_STATE,
} from '@app/common';
import { CityService } from './city.service';

@Controller()
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @MessagePattern(CITY_FIND_ALL)
  findAll(@Payload() query: any) { return this.cityService.findAll(query); }

  @MessagePattern(CITY_FIND_ACTIVE)
  findActive(@Payload() query: any) { return this.cityService.findActive(query); }

  @MessagePattern(CITY_FIND_BY_STATE)
  findByState(@Payload() data: { stateId: string }) { return this.cityService.findByState(data.stateId); }

  @MessagePattern(CITY_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.cityService.findOne(data.id); }

  @MessagePattern(CITY_CREATE)
  create(@Payload() dto: any) { return this.cityService.create(dto); }

  @MessagePattern(CITY_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.cityService.update(id, dto);
  }

  @MessagePattern(CITY_DELETE)
  delete(@Payload() data: { id: string }) { return this.cityService.delete(data.id); }
}
