import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { State, StateDocument } from './schemas/state.schema';

@Injectable()
export class StateService {
  constructor(@InjectModel(State.name) private readonly model: Model<StateDocument>) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    return this.model.find(filter).sort({ name: 1 }).lean().exec();
  }

  async findActive() {
    return this.model.find({ isActive: true }).sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'State not found' });
    return doc;
  }

  async create(dto: { name: string; isActive?: boolean }) {
    const exists = await this.model.findOne({ name: new RegExp(`^${dto.name}$`, 'i') }).exec();
    if (exists) throw new RpcException({ statusCode: 409, message: `State '${dto.name}' already exists` });
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<{ name: string; isActive: boolean }>) {
    if (dto.name) {
      const exists = await this.model.findOne({ name: new RegExp(`^${dto.name}$`, 'i'), _id: { $ne: id } }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `State '${dto.name}' already exists` });
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
