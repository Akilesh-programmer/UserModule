import { SetMetadata } from "@nestjs/common";
import { PermissionModule, CrudAction } from "@app/common";

export const PERMISSION_KEY = "permission";

export interface PermissionMeta {
  module: PermissionModule;
  action: CrudAction;
}

export const RequirePermission = (
  module: PermissionModule,
  action: CrudAction,
) => SetMetadata(PERMISSION_KEY, { module, action } as PermissionMeta);
