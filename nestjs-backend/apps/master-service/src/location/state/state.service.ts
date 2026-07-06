import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { State, StateDocument } from './schemas/state.schema';

@Injectable()
export class StateService {
  constructor(@InjectModel(State.name) private readonly model: Model<StateDocument>) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    return this.model.find(filter).populate('countryId', 'name').sort({ name: 1 }).lean().exec();
  }

  async findActive(query?: { countryId?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.countryId) {
      try {
        filter.countryId = new Types.ObjectId(query.countryId);
      } catch {
        filter.countryId = query.countryId;
      }
    }
    return this.model.find(filter).populate('countryId', 'name').sort({ name: 1 }).lean().exec();
  }

  async findByCountry(countryId: string) {
    let cid: any = countryId;
    try {
      cid = new Types.ObjectId(countryId);
    } catch {}
    return this.model.find({ countryId: cid, isActive: true }).sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('countryId', 'name').lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'State not found' });
    return doc;
  }

  async create(dto: { name: string; countryId: string; code?: string; isActive?: boolean }) {
    const exists = await this.model.findOne({ name: new RegExp(`^${dto.name}$`, 'i'), countryId: dto.countryId }).exec();
    if (exists) throw new RpcException({ statusCode: 409, message: `State '${dto.name}' already exists in this country` });
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<{ name: string; countryId: string; code: string; isActive: boolean }>) {
    if (dto.name) {
      const existing = await this.model.findById(id).exec();
      const countryId = dto.countryId || existing?.countryId;
      const exists = await this.model.findOne({ name: new RegExp(`^${dto.name}$`, 'i'), countryId, _id: { $ne: id } }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `State '${dto.name}' already exists in this country` });
    }
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'State not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'State not found' });
    return { message: 'State deleted successfully' };
  }
}
