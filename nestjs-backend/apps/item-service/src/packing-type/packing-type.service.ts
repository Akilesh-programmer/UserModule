import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { PackingType, PackingTypeDocument } from './schemas/packing-type.schema';

@Injectable()
export class PackingTypeService {
  constructor(@InjectModel(PackingType.name) private readonly model: Model<PackingTypeDocument>) {}

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
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Packing type not found' });
    return doc;
  }

  async create(dto: any) { return this.model.create(dto); }

  async update(id: string, dto: any) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Packing type not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Packing type not found' });
    return { message: 'Packing type deleted successfully' };
  }
}
