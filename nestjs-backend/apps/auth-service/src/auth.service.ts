import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import * as bcrypt from "bcryptjs";
import {
  ADMIN_SERVICE,
  MASTER_SERVICE,
  USER_FIND_BY_USERNAME,
  STAFF_FIND_BY_USERNAME,
  PERMISSION_GET_FOR_AUTH,
  LoginDto,
  IJwtPayload,
  buildEmptyPermissions,
  buildFullPermissions,
} from "@app/common";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy,
    @Inject(MASTER_SERVICE) private readonly masterClient: ClientProxy,
  ) {}

  async login(dto: LoginDto) {
    // Search for user across all collections in parallel
    const [userResult, staffResult] = await Promise.all([
      firstValueFrom(
        this.adminClient.send(USER_FIND_BY_USERNAME, {
          username: dto.username,
        }),
      ).catch(() => null),
      firstValueFrom(
        this.masterClient.send(STAFF_FIND_BY_USERNAME, {
          username: dto.username,
        }),
      ).catch(() => null),
    ]);

    // Determine which record matched
    let record: any = null;
    let source: "user" | "manager" | "salesRep" = "user";

    if (userResult) {
      record = userResult;
      source = "user";
    } else if (staffResult) {
      record = staffResult.record;
      source = staffResult.source;
    }

    if (!record) {
      throw new RpcException({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    // Check if account is active
    if (!record.isActive) {
      throw new RpcException({
        statusCode: 403,
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      record.passwordHash,
    );
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    // Determine admin status and user type info
    const userTypeName = record.userTypeName || record.userTypeId?.name || "";
    const userTypeId =
      record.userTypeId?._id?.toString() ||
      record.userTypeId?.toString() ||
      record.userTypeIdStr ||
      "";
    const isAdmin = userTypeName === "Admin";

    // Get permissions
    let permissions;
    if (isAdmin) {
      permissions = buildFullPermissions();
    } else {
      try {
        const permResult = await firstValueFrom(
          this.adminClient.send(PERMISSION_GET_FOR_AUTH, { userTypeId }),
        );
        permissions = permResult || buildEmptyPermissions();
      } catch {
        permissions = buildEmptyPermissions();
      }
    }

    // Sign JWT
    const payload: IJwtPayload = {
      id: record._id.toString(),
      username: record.username,
      source,
      userTypeId,
      isAdmin,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: record._id.toString(),
        username: record.username,
        userType: userTypeName,
        isActive: record.isActive,
        isAdmin,
      },
      permissions,
    };
  }
}
