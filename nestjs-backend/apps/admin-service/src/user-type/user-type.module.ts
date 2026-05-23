import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserType, UserTypeSchema } from './schemas/user-type.schema';
import { UserTypeService } from './user-type.service';
import { UserTypeController } from './user-type.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserType.name, schema: UserTypeSchema }])],
  providers: [UserTypeService],
  controllers: [UserTypeController],
  exports: [UserTypeService, MongooseModule],
})
export class UserTypeModule {}
