import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Dealer, DealerDocument } from './schemas/dealer.schema';

const POPULATE = [
  { path: 'managerId', select: 'name' },
  { path: 'salesRepId', select: 'name' },
  { path: 'marketId', select: 'name' },
  { path: 'address.stateId', select: 'name' },
  { path: 'address.cityId', select: 'name' },
  { path: 'address.pincodeId', select: 'code' },
  { path: 'address.areaId', select: 'name' },
];

@Injectable()
export class DealerService {
  constructor(@InjectModel(Dealer.name) private readonly model: Model<DealerDocument>) {}

  async findAll(query?: { activeOnly?: string; managerId?: string; salesRepId?: string; marketId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    if (query?.managerId) filter.managerId = query.managerId;
    if (query?.salesRepId) filter.salesRepId = query.salesRepId;
    if (query?.marketId) filter.marketId = query.marketId;
    return this.model.find(filter).populate(POPULATE).sort({ dealerName: 1 }).lean().exec();
  }

  async findActive(query?: { managerId?: string; salesRepId?: string; marketId?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.managerId) filter.managerId = query.managerId;
    if (query?.salesRepId) filter.salesRepId = query.salesRepId;
    if (query?.marketId) filter.marketId = query.marketId;
    return this.model.find(filter).populate(POPULATE).sort({ dealerName: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate(POPULATE).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Dealer not found' });
    return doc;
  }

  async create(dto: any) {
    const doc = await this.model.create(dto);
    return this.model.findById(doc._id).populate(POPULATE).lean().exec();
  }

  async update(id: string, dto: any) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new RpcException({ statusCode: 404, message: 'Dealer not found' });
    const oldImage = existing.image;
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    return { data: doc, oldImage: dto.image && dto.image !== oldImage ? oldImage : null };
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Dealer not found' });
    return { message: 'Dealer deleted successfully', image: doc.image };
  }
}
