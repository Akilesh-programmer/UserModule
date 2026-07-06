import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Scheme, SchemeDocument } from './schemas/scheme.schema';
import { Group, GroupDocument } from '../group/schemas/group.schema';
import { Item, ItemDocument } from '../item/schemas/item.schema';

const POPULATE_REFS = [
  { path: 'groupId', select: 'name code' },
  { path: 'itemId', select: 'itemName itemCode' },
];

@Injectable()
export class SchemeService {
  constructor(
    @InjectModel(Scheme.name) private readonly model: Model<SchemeDocument>,
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    @InjectModel(Item.name) private readonly itemModel: Model<ItemDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    return this.model.find(filter).populate(POPULATE_REFS).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate(POPULATE_REFS).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Scheme not found' });
    return doc;
  }

  async create(dto: any) {
    await this.validateRefs(dto);
    const doc = await this.model.create(dto);
    return this.model.findById(doc._id).populate(POPULATE_REFS).lean().exec();
  }

  async update(id: string, dto: any) {
    await this.validateRefs(dto, true);

    const existing = await this.model.findById(id).exec();
    if (!existing) throw new RpcException({ statusCode: 404, message: 'Scheme not found' });

    const oldImage = (dto.productImage && existing.productImage) ? existing.productImage : undefined;

    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).populate(POPULATE_REFS).lean().exec();
    if (oldImage) return { data: doc, oldImage };
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Scheme not found' });
    return { message: 'Scheme deleted successfully', image: doc.productImage || undefined };
  }

  private async validateRefs(dto: any, partial = false) {
    const checks: Promise<void>[] = [];

    if (dto.groupId) {
      checks.push(
        this.groupModel.findById(dto.groupId).exec().then((d) => {
          if (!d) throw new RpcException({ statusCode: 400, message: 'Invalid group' });
        }),
      );
    } else if (!partial) {
      throw new RpcException({ statusCode: 400, message: 'Group is required' });
    }

    if (dto.itemId) {
      checks.push(
        this.itemModel.findById(dto.itemId).exec().then((d) => {
          if (!d) throw new RpcException({ statusCode: 400, message: 'Invalid item' });
        }),
      );
    } else if (!partial) {
      throw new RpcException({ statusCode: 400, message: 'Item is required' });
    }

    await Promise.all(checks);
  }
}
