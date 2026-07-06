import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Scheme, SchemeSchema } from './schemas/scheme.schema';
import { SchemeService } from './scheme.service';
import { SchemeController } from './scheme.controller';
import { GroupModule } from '../group/group.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Scheme.name, schema: SchemeSchema }]),
    GroupModule,
    ItemModule,
  ],
  providers: [SchemeService],
  controllers: [SchemeController],
  exports: [SchemeService, MongooseModule],
})
export class SchemeModule {}
