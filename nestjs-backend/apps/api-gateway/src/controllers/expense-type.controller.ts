import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  EXPENSE_TYPE_CREATE, EXPENSE_TYPE_FIND_ALL, EXPENSE_TYPE_FIND_ONE,
  EXPENSE_TYPE_UPDATE, EXPENSE_TYPE_DELETE, EXPENSE_TYPE_FIND_ACTIVE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/expense-types')
export class ExpenseTypeGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('expenseType', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(EXPENSE_TYPE_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('expenseType', 'read')
  findActive() {
    return firstValueFrom(this.masterClient.send(EXPENSE_TYPE_FIND_ACTIVE, {}));
  }

  @Get(':id')
  @RequirePermission('expenseType', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(EXPENSE_TYPE_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('expenseType', 'create')
  create(@Body() body: any) {
    return firstValueFrom(this.masterClient.send(EXPENSE_TYPE_CREATE, body));
  }

  @Put(':id')
  @RequirePermission('expenseType', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.masterClient.send(EXPENSE_TYPE_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @RequirePermission('expenseType', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(EXPENSE_TYPE_DELETE, { id }));
  }
}
