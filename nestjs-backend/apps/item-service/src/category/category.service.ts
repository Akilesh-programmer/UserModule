import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private readonly model: Model<CategoryDocument>) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    return this.model.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async findActive() {
    return this.model.find({ isActive: true }).sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Category not found' });
    return doc;
  }

  async create(dto: { name: string; code: string; description?: string; isActive?: boolean }) {
    const exists = await this.model.findOne({ code: dto.code.toUpperCase() }).exec();
    if (exists) throw new RpcException({ statusCode: 409, message: `Category code '${dto.code}' already exists` });
    return this.model.create({ ...dto, code: dto.code.toUpperCase() });
  }

  async update(id: string, dto: any) {
    if (dto.code) {
      const exists = await this.model.findOne({ code: dto.code.toUpperCase(), _id: { $ne: id } }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `Category code '${dto.code}' already exists` });
      dto.code = dto.code.toUpperCase();
    }
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Category not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Category not found' });
    return { message: 'Category deleted successfully' };
  }
}
