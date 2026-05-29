import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Area, AreaDocument } from './schemas/area.schema';

const POPULATE = [
  { path: 'stateId', select: 'name' },
  { path: 'cityId', select: 'name' },
  { path: 'pincodeId', select: 'code' },
];

@Injectable()
export class AreaService {
  constructor(@InjectModel(Area.name) private readonly model: Model<AreaDocument>) {}

  async findAll(query?: { activeOnly?: string; stateId?: string; cityId?: string; pincodeId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    if (query?.stateId) filter.stateId = query.stateId;
    if (query?.cityId) filter.cityId = query.cityId;
    if (query?.pincodeId) filter.pincodeId = query.pincodeId;
    return this.model.find(filter).populate(POPULATE).sort({ name: 1 }).lean().exec();
  }

  async findActive(query?: { stateId?: string; cityId?: string; pincodeId?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.stateId) filter.stateId = query.stateId;
    if (query?.cityId) filter.cityId = query.cityId;
    if (query?.pincodeId) filter.pincodeId = query.pincodeId;
    return this.model.find(filter).populate(POPULATE).sort({ name: 1 }).lean().exec();
  }

  async findByPincode(pincodeId: string) {
    return this.model.find({ pincodeId, isActive: true }).sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate(POPULATE).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Area not found' });
    return doc;
  }

  async create(dto: { name: string; pincodeId: string; cityId: string; stateId: string; isActive?: boolean }) {
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<{ name: string; pincodeId: string; cityId: string; stateId: string; isActive: boolean }>) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Area not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Area not found' });
    return { message: 'Area deleted successfully' };
  }
}
