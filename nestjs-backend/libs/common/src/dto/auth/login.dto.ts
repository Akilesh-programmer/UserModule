import { IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
  @IsNotEmpty({ message: "Username is required" })
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  username!: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  password!: string;
}
