import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    CategoryModule,
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService, MongooseModule],
})
export class GroupModule {}
