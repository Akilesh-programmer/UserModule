import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_LOGIN, LoginDto } from '@app/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_LOGIN)
  async login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
