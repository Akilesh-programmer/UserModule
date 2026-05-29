import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Pincode, PincodeDocument } from './schemas/pincode.schema';

@Injectable()
export class PincodeService {
  constructor(@InjectModel(Pincode.name) private readonly model: Model<PincodeDocument>) {}

  async findAll(query?: { activeOnly?: string; stateId?: string; cityId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    if (query?.stateId) filter.stateId = query.stateId;
    if (query?.cityId) filter.cityId = query.cityId;
    return this.model.find(filter).populate('cityId', 'name').populate('stateId', 'name').sort({ code: 1 }).lean().exec();
  }

  async findActive(query?: { stateId?: string; cityId?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.stateId) filter.stateId = query.stateId;
    if (query?.cityId) filter.cityId = query.cityId;
    return this.model.find(filter).populate('cityId', 'name').populate('stateId', 'name').sort({ code: 1 }).lean().exec();
  }

  async findByCity(cityId: string) {
    return this.model.find({ cityId, isActive: true }).sort({ code: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('cityId', 'name').populate('stateId', 'name').lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Pincode not found' });
    return doc;
  }

  async create(dto: { code: string; cityId: string; stateId: string; isActive?: boolean }) {
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<{ code: string; cityId: string; stateId: string; isActive: boolean }>) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Pincode not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Pincode not found' });
    return { message: 'Pincode deleted successfully' };
  }
}
