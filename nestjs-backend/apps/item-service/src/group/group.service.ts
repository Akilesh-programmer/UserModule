import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Group, GroupDocument } from './schemas/group.schema';
import { Category, CategoryDocument } from '../category/schemas/category.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private readonly model: Model<GroupDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string; categoryId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    if (query?.categoryId) filter.categoryId = query.categoryId;
    return this.model.find(filter).populate('categoryId', 'name code').sort({ createdAt: -1 }).lean().exec();
  }

  async findActive(query?: { categoryId?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.categoryId) filter.categoryId = query.categoryId;
    return this.model.find(filter).populate('categoryId', 'name code').sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('categoryId', 'name code').lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Group not found' });
    return doc;
  }

  async create(dto: any) {
    const category = await this.categoryModel.findById(dto.categoryId).exec();
    if (!category) throw new RpcException({ statusCode: 400, message: 'Invalid category' });

    const exists = await this.model.findOne({ code: dto.code.toUpperCase() }).exec();
    if (exists) throw new RpcException({ statusCode: 409, message: `Group code '${dto.code}' already exists` });

    const doc = await this.model.create({ ...dto, code: dto.code.toUpperCase() });
    return this.model.findById(doc._id).populate('categoryId', 'name code').lean().exec();
  }

  async update(id: string, dto: any) {
    if (dto.categoryId) {
      const category = await this.categoryModel.findById(dto.categoryId).exec();
      if (!category) throw new RpcException({ statusCode: 400, message: 'Invalid category' });
    }
    if (dto.code) {
      const exists = await this.model.findOne({ code: dto.code.toUpperCase(), _id: { $ne: id } }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `Group code '${dto.code}' already exists` });
      dto.code = dto.code.toUpperCase();
    }
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).populate('categoryId', 'name code').lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Group not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Group not found' });
    return { message: 'Group deleted successfully' };
  }
}
