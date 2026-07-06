import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationPdf, ApplicationPdfSchema } from './schemas/application-pdf.schema';
import { ApplicationPdfService } from './application-pdf.service';
import { ApplicationPdfController } from './application-pdf.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApplicationPdf.name, schema: ApplicationPdfSchema }]),
  ],
  providers: [ApplicationPdfService],
  controllers: [ApplicationPdfController],
  exports: [ApplicationPdfService, MongooseModule],
})
export class ApplicationPdfModule {}
