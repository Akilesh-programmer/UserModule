import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  MASTER_SERVICE,
  COMPANY_CREATE, COMPANY_FIND_ALL, COMPANY_FIND_ONE,
  COMPANY_UPDATE, COMPANY_DELETE, COMPANY_FIND_ACTIVE,
} from '@app/common';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { BypassIfActiveOnly } from '../decorators/bypass-active-only.decorator';

@Controller('api/v1/companies')
export class CompanyGatewayController {
  constructor(@Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy) {}

  @Get()
  @RequirePermission('company', 'read')
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.masterClient.send(COMPANY_FIND_ALL, query || {}));
  }

  @Get('active')
  @RequirePermission('company', 'read')
  findActive() {
    return firstValueFrom(this.masterClient.send(COMPANY_FIND_ACTIVE, {}));
  }

  @Get(':id')
  @RequirePermission('company', 'read')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(COMPANY_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission('company', 'create')
  create(@Body() body: any) {
    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }
    return firstValueFrom(this.masterClient.send(COMPANY_CREATE, { ...body, address }));
  }

  @Put(':id')
  @RequirePermission('company', 'update')
  update(@Param('id') id: string, @Body() body: any) {
    let address = body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }
    return firstValueFrom(this.masterClient.send(COMPANY_UPDATE, { id, ...body, address }));
  }

  @Delete(':id')
  @RequirePermission('company', 'delete')
  delete(@Param('id') id: string) {
    return firstValueFrom(this.masterClient.send(COMPANY_DELETE, { id }));
  }
}
