import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AREA_CREATE, AREA_FIND_ALL, AREA_FIND_ONE,
  AREA_UPDATE, AREA_DELETE, AREA_FIND_ACTIVE, AREA_FIND_BY_PINCODE,
} from '@app/common';
import { AreaService } from './area.service';

@Controller()
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @MessagePattern(AREA_FIND_ALL)
  findAll(@Payload() query: any) { return this.areaService.findAll(query); }

  @MessagePattern(AREA_FIND_ACTIVE)
  findActive(@Payload() query: any) { return this.areaService.findActive(query); }

  @MessagePattern(AREA_FIND_BY_PINCODE)
  findByPincode(@Payload() data: { pincodeId: string }) { return this.areaService.findByPincode(data.pincodeId); }

  @MessagePattern(AREA_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.areaService.findOne(data.id); }

  @MessagePattern(AREA_CREATE)
  create(@Payload() dto: any) { return this.areaService.create(dto); }

  @MessagePattern(AREA_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.areaService.update(id, dto);
  }

  @MessagePattern(AREA_DELETE)
  delete(@Payload() data: { id: string }) { return this.areaService.delete(data.id); }
}
