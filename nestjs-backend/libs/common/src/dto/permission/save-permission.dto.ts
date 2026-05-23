import { IsMongoId, IsNotEmpty, IsObject } from "class-validator";

export class SavePermissionDto {
  @IsNotEmpty({ message: "User type is required" })
  @IsMongoId({ message: "Invalid user type ID" })
  userTypeId!: string;

  @IsNotEmpty({ message: "Permissions are required" })
  @IsObject()
  permissions!: Record<
    string,
    { create: boolean; read: boolean; update: boolean; delete: boolean }
  >;
}
