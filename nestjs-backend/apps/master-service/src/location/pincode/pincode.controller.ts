import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  PINCODE_CREATE, PINCODE_FIND_ALL, PINCODE_FIND_ONE,
  PINCODE_UPDATE, PINCODE_DELETE, PINCODE_FIND_ACTIVE, PINCODE_FIND_BY_CITY,
} from '@app/common';
import { PincodeService } from './pincode.service';

@Controller()
export class PincodeController {
  constructor(private readonly pincodeService: PincodeService) {}

  @MessagePattern(PINCODE_FIND_ALL)
  findAll(@Payload() query: any) { return this.pincodeService.findAll(query); }

  @MessagePattern(PINCODE_FIND_ACTIVE)
  findActive(@Payload() query: any) { return this.pincodeService.findActive(query); }

  @MessagePattern(PINCODE_FIND_BY_CITY)
  findByCity(@Payload() data: { cityId: string }) { return this.pincodeService.findByCity(data.cityId); }

  @MessagePattern(PINCODE_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.pincodeService.findOne(data.id); }

  @MessagePattern(PINCODE_CREATE)
  create(@Payload() dto: any) { return this.pincodeService.create(dto); }

  @MessagePattern(PINCODE_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.pincodeService.update(id, dto);
  }

  @MessagePattern(PINCODE_DELETE)
  delete(@Payload() data: { id: string }) { return this.pincodeService.delete(data.id); }
}
