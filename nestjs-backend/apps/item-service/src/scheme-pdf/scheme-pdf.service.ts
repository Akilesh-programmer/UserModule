import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { SchemePdf, SchemePdfDocument } from './schemas/scheme-pdf.schema';
import { Category, CategoryDocument } from '../category/schemas/category.schema';

const POPULATE_REFS = [
  { path: 'categoryId', select: 'name code' },
];

@Injectable()
export class SchemePdfService {
  constructor(
    @InjectModel(SchemePdf.name) private readonly model: Model<SchemePdfDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    return this.model.find(filter).populate(POPULATE_REFS).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate(POPULATE_REFS).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Scheme PDF not found' });
    return doc;
  }

  async create(dto: any) {
    if (dto.categoryId) {
      const cat = await this.categoryModel.findById(dto.categoryId).exec();
      if (!cat) throw new RpcException({ statusCode: 400, message: 'Invalid category' });
    }
    const doc = await this.model.create(dto);
    return this.model.findById(doc._id).populate(POPULATE_REFS).lean().exec();
  }

  async update(id: string, dto: any) {
    if (dto.categoryId) {
      const cat = await this.categoryModel.findById(dto.categoryId).exec();
      if (!cat) throw new RpcException({ statusCode: 400, message: 'Invalid category' });
    }

    const existing = await this.model.findById(id).exec();
    if (!existing) throw new RpcException({ statusCode: 404, message: 'Scheme PDF not found' });

    const oldPdf = (dto.pdfFile && existing.pdfFile) ? existing.pdfFile : undefined;

    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).populate(POPULATE_REFS).lean().exec();
    if (oldPdf) return { data: doc, oldPdf };
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Scheme PDF not found' });
    return { message: 'Scheme PDF deleted successfully', pdfFile: doc.pdfFile || undefined };
  }
}
