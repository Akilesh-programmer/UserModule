import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  EXPENSE_TYPE_CREATE, EXPENSE_TYPE_FIND_ALL, EXPENSE_TYPE_FIND_ONE,
  EXPENSE_TYPE_UPDATE, EXPENSE_TYPE_DELETE, EXPENSE_TYPE_FIND_ACTIVE,
} from '@app/common';
import { ExpenseTypeService } from './expense-type.service';

@Controller()
export class ExpenseTypeController {
  constructor(private readonly expenseTypeService: ExpenseTypeService) {}

  @MessagePattern(EXPENSE_TYPE_FIND_ALL)
  findAll(@Payload() query: any) { return this.expenseTypeService.findAll(query); }

  @MessagePattern(EXPENSE_TYPE_FIND_ACTIVE)
  findActive() { return this.expenseTypeService.findActive(); }

  @MessagePattern(EXPENSE_TYPE_FIND_ONE)
  findOne(@Payload() data: { id: string }) { return this.expenseTypeService.findOne(data.id); }

  @MessagePattern(EXPENSE_TYPE_CREATE)
  create(@Payload() dto: any) { return this.expenseTypeService.create(dto); }

  @MessagePattern(EXPENSE_TYPE_UPDATE)
  update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...dto } = data;
    return this.expenseTypeService.update(id, dto);
  }

  @MessagePattern(EXPENSE_TYPE_DELETE)
  delete(@Payload() data: { id: string }) { return this.expenseTypeService.delete(data.id); }
}
