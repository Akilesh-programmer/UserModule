import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import {
  ITEM_SERVICE,
  CATEGORY_CREATE,
  CATEGORY_FIND_ALL,
  CATEGORY_FIND_ONE,
  CATEGORY_UPDATE,
  CATEGORY_DELETE,
  CATEGORY_FIND_ACTIVE,
} from "@app/common";
import { RequirePermission } from "../decorators/require-permission.decorator";
import { BypassIfActiveOnly } from "../decorators/bypass-active-only.decorator";

@Controller("api/v1/categories")
export class CategoryGatewayController {
  constructor(@Inject(ITEM_SERVICE) private readonly itemClient: ClientProxy) {}

  @Get()
  @RequirePermission("category", "read")
  @BypassIfActiveOnly()
  findAll(@Query() query: any) {
    return firstValueFrom(this.itemClient.send(CATEGORY_FIND_ALL, query || {}));
  }

  @Get("active")
  findActive() {
    return firstValueFrom(this.itemClient.send(CATEGORY_FIND_ACTIVE, {}));
  }

  @Get(":id")
  @RequirePermission("category", "read")
  findOne(@Param("id") id: string) {
    return firstValueFrom(this.itemClient.send(CATEGORY_FIND_ONE, { id }));
  }

  @Post()
  @RequirePermission("category", "create")
  create(@Body() dto: any) {
    return firstValueFrom(this.itemClient.send(CATEGORY_CREATE, dto));
  }

  @Put(":id")
  @RequirePermission("category", "update")
  update(@Param("id") id: string, @Body() dto: any) {
    return firstValueFrom(
      this.itemClient.send(CATEGORY_UPDATE, { id, ...dto }),
    );
  }

  @Delete(":id")
  @RequirePermission("category", "delete")
  delete(@Param("id") id: string) {
    return firstValueFrom(this.itemClient.send(CATEGORY_DELETE, { id }));
  }
}
