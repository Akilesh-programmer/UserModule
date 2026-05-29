import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Item, ItemDocument } from './schemas/item.schema';
import { Category, CategoryDocument } from '../category/schemas/category.schema';
import { Group, GroupDocument } from '../group/schemas/group.schema';
import { Tax, TaxDocument } from '../tax/schemas/tax.schema';
import { UnitOfMeasure, UnitOfMeasureDocument } from '../unit-of-measure/schemas/unit-of-measure.schema';
import { PackingType, PackingTypeDocument } from '../packing-type/schemas/packing-type.schema';

const POPULATE_REFS = [
  { path: 'categoryId', select: 'name code' },
  { path: 'groupId', select: 'name code' },
  { path: 'taxId', select: 'percentage taxType' },
  { path: 'uomId', select: 'abbreviation' },
  { path: 'packingTypeId', select: 'name unitsPerPack' },
];

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item.name) private readonly model: Model<ItemDocument>,
    @InjectModel(Category.name) private readonly catModel: Model<CategoryDocument>,
    @InjectModel(Group.name) private readonly grpModel: Model<GroupDocument>,
    @InjectModel(Tax.name) private readonly taxModel: Model<TaxDocument>,
    @InjectModel(UnitOfMeasure.name) private readonly uomModel: Model<UnitOfMeasureDocument>,
    @InjectModel(PackingType.name) private readonly ptModel: Model<PackingTypeDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string; categoryId?: string; groupId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    if (query?.categoryId) filter.categoryId = query.categoryId;
    if (query?.groupId) filter.groupId = query.groupId;
    return this.model.find(filter).populate(POPULATE_REFS).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate(POPULATE_REFS).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Item not found' });
    return doc;
  }

  async create(dto: any) {
    // Validate all references
    await this.validateRefs(dto);

    // Check item code uniqueness
    if (dto.itemCode) {
      const exists = await this.model.findOne({ itemCode: dto.itemCode.toUpperCase() }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `Item code '${dto.itemCode}' already exists` });
      dto.itemCode = dto.itemCode.toUpperCase();
    }

    const doc = await this.model.create(dto);
    return this.model.findById(doc._id).populate(POPULATE_REFS).lean().exec();
  }

  async update(id: string, dto: any) {
    // Validate changed references
    await this.validateRefs(dto, true);

    if (dto.itemCode) {
      const exists = await this.model.findOne({ itemCode: dto.itemCode.toUpperCase(), _id: { $ne: id } }).exec();
      if (exists) throw new RpcException({ statusCode: 409, message: `Item code '${dto.itemCode}' already exists` });
      dto.itemCode = dto.itemCode.toUpperCase();
    }

    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).populate(POPULATE_REFS).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Item not found' });
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Item not found' });
    return { message: 'Item deleted successfully' };
  }

  /** Validate all referenced entities exist */
  private async validateRefs(dto: any, partial = false) {
    const checks: Promise<void>[] = [];

    if (dto.categoryId) {
      checks.push(
        this.catModel.findById(dto.categoryId).exec().then((d) => {
          if (!d) throw new RpcException({ statusCode: 400, message: 'Invalid category' });
        }),
      );
    } else if (!partial) {
      throw new RpcException({ statusCode: 400, message: 'Category is required' });
    }

    if (dto.groupId) {
      checks.push(
        this.grpModel.findById(dto.groupId).exec().then((d) => {
          if (!d) throw new RpcException({ statusCode: 400, message: 'Invalid group' });
        }),
      );
    }

    if (dto.taxId) {
      checks.push(
        this.taxModel.findById(dto.taxId).exec().then((d) => {
          if (!d) throw new RpcException({ statusCode: 400, message: 'Invalid tax' });
        }),
      );
    }

    if (dto.uomId) {
      checks.push(
        this.uomModel.findById(dto.uomId).exec().then((d) => {
          if (!d) throw new RpcException({ statusCode: 400, message: 'Invalid unit of measure' });
        }),
      );
    }

    if (dto.packingTypeId) {
      checks.push(
        this.ptModel.findById(dto.packingTypeId).exec().then((d) => {
          if (!d) throw new RpcException({ statusCode: 400, message: 'Invalid packing type' });
        }),
      );
    }

    await Promise.all(checks);
  }
}
