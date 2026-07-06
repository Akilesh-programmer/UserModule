import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemePdf, SchemePdfSchema } from './schemas/scheme-pdf.schema';
import { SchemePdfService } from './scheme-pdf.service';
import { SchemePdfController } from './scheme-pdf.controller';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SchemePdf.name, schema: SchemePdfSchema }]),
    CategoryModule,
  ],
  providers: [SchemePdfService],
  controllers: [SchemePdfController],
  exports: [SchemePdfService, MongooseModule],
})
export class SchemePdfModule {}
