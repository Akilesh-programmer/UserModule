import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  SHOP_TYPE_CREATE, SHOP_TYPE_FIND_ALL, SHOP_TYPE_FIND_ONE,
  SHOP_TYPE_UPDATE, SHOP_TYPE_DELETE, SHOP_TYPE_FIND_ACTIVE,
} from '@app/common';
import { ShopTypeService } from './shop-type.service';

@Controller()
export class ShopTypeController {
  constructor(private readonly shopTypeService: ShopTypeService) {}

  @MessagePattern(SHOP_TYPE_FIND_ALL)
  findAll(@Payload() query: any) { return this.shopTypeService.findAll(query); }

  @MessagePattern(SHOP_TYPE_FIND_ACTIVE)
  findActive() { return this.shopTypeService.findActive(); }

  @MessagePattern(SHOP_TYPE_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.shopTypeService.findOne(data.id); }

  @MessagePattern(SHOP_TYPE_CREATE)
  create(@Payload() dto: any) { return this.shopTypeService.create(dto); }

  @MessagePattern(SHOP_TYPE_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.shopTypeService.update(id, dto);
  }

  @MessagePattern(SHOP_TYPE_DELETE)
  delete(@Payload() data: { id: string }) { return this.shopTypeService.delete(data.id); }
}
