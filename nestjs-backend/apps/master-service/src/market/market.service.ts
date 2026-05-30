import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Market, MarketDocument } from './schemas/market.schema';

const POPULATE = [
  { path: 'stateId', select: 'name' },
  { path: 'districtId', select: 'name' },
];

@Injectable()
export class MarketService {
  constructor(@InjectModel(Market.name) private readonly model: Model<MarketDocument>) {}

  async findAll(query?: { activeOnly?: string; stateId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    if (query?.stateId) filter.stateId = query.stateId;
    return this.model.find(filter).populate(POPULATE).sort({ name: 1 }).lean().exec();
  }

  async findActive(query?: { stateId?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.stateId) filter.stateId = query.stateId;
    return this.model.find(filter).populate(POPULATE).sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate(POPULATE).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Market not found' });
    return doc;
  }

  async create(dto: { name: string; stateId: string; districtId: string; isActive?: boolean }) {
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<{ name: string; stateId: string; districtId: string; isActive: boolean }>) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Market not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Market not found' });
    return { message: 'Market deleted successfully' };
  }
}
