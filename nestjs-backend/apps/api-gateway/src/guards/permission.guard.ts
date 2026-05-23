import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PERMISSION_KEY, PermissionMeta } from '../decorators/require-permission.decorator';
import { BYPASS_ACTIVE_ONLY_KEY } from '../decorators/bypass-active-only.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ADMIN_SERVICE, PERMISSION_GET_FOR_AUTH, MODULE_LABELS, PermissionModule, CrudAction } from '@app/common';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Get permission metadata
    const meta = this.reflector.getAllAndOverride<PermissionMeta | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!meta) return true; // No permission required for this route

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // Admin bypass
    if (user.isAdmin) return true;

    // Bypass for activeOnly read
    const bypassActiveOnly = this.reflector.getAllAndOverride<boolean>(BYPASS_ACTIVE_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (bypassActiveOnly && request.query?.activeOnly === 'true') return true;

    // Fetch permissions from User Service
    try {
      const permissions = await firstValueFrom(
        this.adminClient.send(PERMISSION_GET_FOR_AUTH, { userTypeId: user.userTypeId }),
      );

      const modulePerms = permissions?.[meta.module];
      if (modulePerms?.[meta.action]) return true;
    } catch {
      // If permission fetch fails, deny
    }

    const label = MODULE_LABELS[meta.module] || meta.module;
    throw new ForbiddenException(
      `You do not have permission to ${meta.action} ${label}. Please contact your administrator.`,
    );
  }
}
