import { Body, Controller, Inject, Post, Res } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Response } from "express";
import { firstValueFrom } from "rxjs";
import { AUTH_SERVICE, AUTH_LOGIN, LoginDto } from "@app/common";
import { Public } from "../decorators/public.decorator";
import { ConfigService } from "@nestjs/config";

@Controller("api/v1/auth")
export class AuthGatewayController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await firstValueFrom(this.authClient.send(AUTH_LOGIN, dto));

    const cookieDays = parseInt(
      this.config.get("JWT_COOKIE_EXPIRES_IN", "1"),
      10,
    );
    res.cookie("jwt", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: cookieDays * 24 * 60 * 60 * 1000,
    });

    return {
      status: "success",
      token: result.token,
      user: result.user,
      permissions: result.permissions,
    };
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
    });

    return { status: "success", message: "Logged out successfully" };
  }
}
