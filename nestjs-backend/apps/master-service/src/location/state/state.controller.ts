import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  STATE_CREATE, STATE_FIND_ALL, STATE_FIND_ONE,
  STATE_UPDATE, STATE_DELETE, STATE_FIND_ACTIVE,
} from '@app/common';
import { StateService } from './state.service';

@Controller()
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @MessagePattern(STATE_FIND_ALL)
  findAll(@Payload() query: any) { return this.stateService.findAll(query); }

  @MessagePattern(STATE_FIND_ACTIVE)
  findActive() { return this.stateService.findActive(); }

  @MessagePattern(STATE_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.stateService.findOne(data.id); }

  @MessagePattern(STATE_CREATE)
  create(@Payload() dto: any) { return this.stateService.create(dto); }

  @MessagePattern(STATE_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.stateService.update(id, dto);
  }

  @MessagePattern(STATE_DELETE)
  delete(@Payload() data: { id: string }) { return this.stateService.delete(data.id); }
}
