import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { ApplicationPdf, ApplicationPdfDocument } from './schemas/application-pdf.schema';

@Injectable()
export class ApplicationPdfService {
  constructor(
    @InjectModel(ApplicationPdf.name) private readonly model: Model<ApplicationPdfDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    return this.model.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Application PDF not found' });
    return doc;
  }

  async create(dto: any) {
    return this.model.create(dto);
  }

  async update(id: string, dto: any) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new RpcException({ statusCode: 404, message: 'Application PDF not found' });

    const oldPdf = (dto.pdfFile && existing.pdfFile) ? existing.pdfFile : undefined;

    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (oldPdf) return { data: doc, oldPdf };
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Application PDF not found' });
    return { message: 'Application PDF deleted successfully', pdfFile: doc.pdfFile || undefined };
  }
}
