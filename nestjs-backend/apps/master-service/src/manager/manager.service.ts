import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { Manager, ManagerDocument } from './schemas/manager.schema';

const ADDRESS_POPULATE = [
  { path: 'address.stateId', select: 'name' },
  { path: 'address.cityId', select: 'name' },
  { path: 'address.pincodeId', select: 'code' },
  { path: 'address.areaId', select: 'name' },
];

@Injectable()
export class ManagerService {
  constructor(
    @InjectModel(Manager.name) private readonly managerModel: Model<ManagerDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') filter.isActive = true;
    return this.managerModel.find(filter).select('-passwordHash').populate(ADDRESS_POPULATE).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.managerModel.findById(id).select('-passwordHash').populate(ADDRESS_POPULATE).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Manager not found' });
    return doc;
  }

  async create(dto: any): Promise<any> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const managerData: any = {
      name: dto.name,
      mobile: dto.mobile || '',
      email: dto.email || '',
      aadhaarNo: dto.aadhaarNo || '',
      drivingLicenseNo: dto.drivingLicenseNo || '',
      panCardNo: dto.panCardNo || '',
      username: dto.username,
      passwordHash,
      userTypeId: dto.userTypeId,
      address: dto.address || {},
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };
    if (dto.profilePic) managerData.profilePic = dto.profilePic;

    const manager = await this.managerModel.create(managerData);
    const result = await this.managerModel.findById(manager._id).select('-passwordHash').populate(ADDRESS_POPULATE).lean().exec();
    return result;
  }

  async update(id: string, dto: any): Promise<any> {
    const existing = await this.managerModel.findById(id).exec();
    if (!existing) throw new RpcException({ statusCode: 404, message: 'Manager not found' });

    const oldProfilePic = existing.profilePic;
    const updatableFields = ['name', 'mobile', 'email', 'aadhaarNo', 'drivingLicenseNo', 'panCardNo', 'address', 'isActive'];
    for (const field of updatableFields) {
      if (dto[field] !== undefined) (existing as any)[field] = dto[field];
    }
    if (dto.profilePic) existing.profilePic = dto.profilePic;
    await existing.save();

    const result = await this.managerModel.findById(id).select('-passwordHash').populate(ADDRESS_POPULATE).lean().exec();
    return { data: result, oldProfilePic: dto.profilePic ? oldProfilePic : null };
  }

  async delete(id: string) {
    const doc = await this.managerModel.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Manager not found' });
    return { message: 'Manager deleted successfully', profilePic: doc.profilePic };
  }

  async findActive() {
    return this.managerModel.find({ isActive: true }).select('name').sort({ name: 1 }).lean().exec();
  }

  async findByUsername(username: string) {
    return this.managerModel.findOne({ username }).select('+passwordHash').lean().exec();
  }

  async checkUsernameExists(username: string, excludeId?: string) {
    const filter: Record<string, any> = { username };
    if (excludeId) filter._id = { $ne: excludeId };
    return (await this.managerModel.countDocuments(filter).exec()) > 0;
  }
}
