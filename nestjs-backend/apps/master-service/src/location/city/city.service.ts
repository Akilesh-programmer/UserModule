import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { City, CityDocument } from './schemas/city.schema';

@Injectable()
export class CityService {
  constructor(@InjectModel(City.name) private readonly model: Model<CityDocument>) {}

  async findAll(query?: { activeOnly?: string; stateId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    if (query?.stateId) filter.stateId = query.stateId;
    return this.model.find(filter).populate('stateId', 'name').sort({ name: 1 }).lean().exec();
  }

  async findActive(query?: { stateId?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.stateId) filter.stateId = query.stateId;
    return this.model.find(filter).populate('stateId', 'name').sort({ name: 1 }).lean().exec();
  }

  async findByState(stateId: string) {
    return this.model.find({ stateId, isActive: true }).sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('stateId', 'name').lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'City not found' });
    return doc;
  }

  async create(dto: { name: string; stateId: string; isActive?: boolean }) {
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<{ name: string; stateId: string; isActive: boolean }>) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'City not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'City not found' });
    return { message: 'City deleted successfully' };
  }
}
