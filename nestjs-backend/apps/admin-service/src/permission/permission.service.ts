import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { buildEmptyPermissions } from '@app/common';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name) private readonly permModel: Model<PermissionDocument>,
  ) {}

  async findAll() {
    return this.permModel.find().populate('userTypeId', 'name').sort({ createdAt: -1 }).lean().exec();
  }

  async findByUserType(userTypeId: string) {
    const doc = await this.permModel.findOne({ userTypeId }).lean().exec();
    if (!doc) {
      return { userTypeId, permissions: buildEmptyPermissions() };
    }
    return doc;
  }

  async save(dto: { userTypeId: string; permissions: Record<string, any> }) {
    const doc = await this.permModel.findOneAndUpdate(
      { userTypeId: dto.userTypeId },
      { permissions: dto.permissions },
      { new: true, upsert: true, runValidators: true },
    ).lean().exec();
    return doc;
  }

  /** Get just the permissions object for auth guard use */
  async getForAuth(userTypeId: string) {
    const doc = await this.permModel.findOne({ userTypeId }).lean().exec();
    return doc?.permissions || buildEmptyPermissions();
  }
}
