import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IJwtPayload } from '@app/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check for @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Extract token from cookies ONLY
    const token = request.cookies?.jwt;
    if (!token) {
      throw new UnauthorizedException('You are not logged in. Please log in to continue.');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET')!;
      const payload = jwt.verify(token, secret) as IJwtPayload;
      request.user = payload;
      return true;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Your session has expired. Please log in again.');
      }
      throw new UnauthorizedException('Invalid token. Please log in again.');
    }
  }
}
