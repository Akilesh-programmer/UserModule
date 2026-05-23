import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { UserType, UserTypeDocument } from './schemas/user-type.schema';

@Injectable()
export class UserTypeService {
  constructor(
    @InjectModel(UserType.name) private readonly userTypeModel: Model<UserTypeDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') {
      filter.isActive = true;
    }
    return this.userTypeModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const doc = await this.userTypeModel.findById(id).exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'User type not found' });
    }
    return doc;
  }

  async create(dto: { name: string; description?: string; isActive?: boolean }) {
    return this.userTypeModel.create(dto);
  }

  async update(id: string, dto: { name?: string; description?: string; isActive?: boolean }) {
    const doc = await this.userTypeModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'User type not found' });
    }
    return doc;
  }

  async delete(id: string) {
    const doc = await this.userTypeModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'User type not found' });
    }
    return { message: 'User type deleted successfully' };
  }
}
