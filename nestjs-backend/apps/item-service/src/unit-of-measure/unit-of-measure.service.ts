import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { UnitOfMeasure, UnitOfMeasureDocument } from './schemas/unit-of-measure.schema';

@Injectable()
export class UnitOfMeasureService {
  constructor(@InjectModel(UnitOfMeasure.name) private readonly model: Model<UnitOfMeasureDocument>) {}

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
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Unit of measure not found' });
    return doc;
  }

  async create(dto: any) {
    if (dto.abbreviation) {
      const exists = await this.model.findOne({ abbreviation: dto.abbreviation.toUpperCase() }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `Abbreviation '${dto.abbreviation}' already exists` });
      dto.abbreviation = dto.abbreviation.toUpperCase();
    }
    return this.model.create(dto);
  }

  async update(id: string, dto: any) {
    if (dto.abbreviation) {
      const exists = await this.model.findOne({ abbreviation: dto.abbreviation.toUpperCase(), _id: { $ne: id } }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `Abbreviation '${dto.abbreviation}' already exists` });
      dto.abbreviation = dto.abbreviation.toUpperCase();
    }
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Unit of measure not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Unit of measure not found' });
    return { message: 'Unit of measure deleted successfully' };
  }
}
