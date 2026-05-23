import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { Manager, ManagerDocument } from './schemas/manager.schema';

@Injectable()
export class ManagerService {
  constructor(
    @InjectModel(Manager.name) private readonly managerModel: Model<ManagerDocument>,
  ) {}

  async findAll(query?: { activeOnly?: string; area?: string }) {
    const filter: Record<string, any> = {};
    if (query?.activeOnly === 'true') {
      filter.isActive = true;
    }
    if (query?.area) {
      filter.area = { $regex: new RegExp(query.area, 'i') };
    }
    return this.managerModel.find(filter).select('-passwordHash').sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.managerModel.findById(id).select('-passwordHash').lean().exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'Manager not found' });
    }
    return doc;
  }

  async create(dto: any): Promise<any> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const managerData: any = {
      name: dto.name,
      mobile: dto.mobile || '',
      aadhaarNo: dto.aadhaarNo || '',
      drivingLicenseNo: dto.drivingLicenseNo || '',
      panCardNo: dto.panCardNo || '',
      area: dto.area,
      username: dto.username,
      passwordHash,
      userTypeId: dto.userTypeId,
      address: dto.address || {},
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };
    if (dto.profilePic) {
      managerData.profilePic = dto.profilePic;
    }

    const manager = await this.managerModel.create(managerData);
    const result = await this.managerModel.findById(manager._id).select('-passwordHash').lean().exec();
    return { ...result, _type: 'manager' };
  }

  async update(id: string, dto: any): Promise<any> {
    const existing = await this.managerModel.findById(id).exec();
    if (!existing) {
      throw new RpcException({ statusCode: 404, message: 'Manager not found' });
    }

    const oldProfilePic = existing.profilePic;

    // Update fields
    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.mobile !== undefined) existing.mobile = dto.mobile;
    if (dto.aadhaarNo !== undefined) existing.aadhaarNo = dto.aadhaarNo;
    if (dto.drivingLicenseNo !== undefined) existing.drivingLicenseNo = dto.drivingLicenseNo;
    if (dto.panCardNo !== undefined) existing.panCardNo = dto.panCardNo;
    if (dto.area !== undefined) existing.area = dto.area;
    if (dto.address !== undefined) existing.address = dto.address;
    if (dto.isActive !== undefined) existing.isActive = dto.isActive;
    if (dto.profilePic) existing.profilePic = dto.profilePic;

    await existing.save();

    const result = await this.managerModel.findById(id).select('-passwordHash').lean().exec();
    return {
      data: { ...result, _type: 'manager' },
      oldProfilePic: dto.profilePic ? oldProfilePic : null,
    };
  }

  async delete(id: string) {
    const doc = await this.managerModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'Manager not found' });
    }
    return { message: 'Manager deleted successfully', profilePic: doc.profilePic };
  }

  async findActive(query?: { area?: string }) {
    const filter: Record<string, any> = { isActive: true };
    if (query?.area) {
      filter.area = { $regex: new RegExp(query.area, 'i') };
    }
    return this.managerModel.find(filter).select('name area').sort({ name: 1 }).lean().exec();
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
