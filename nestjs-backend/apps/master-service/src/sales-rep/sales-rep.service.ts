import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { SalesRep, SalesRepDocument } from './schemas/sales-rep.schema';

@Injectable()
export class SalesRepService {
  constructor(
    @InjectModel(SalesRep.name) private readonly salesRepModel: Model<SalesRepDocument>,
  ) {}

  async findAll() {
    return this.salesRepModel.find().select('-passwordHash').populate('managerId', 'name area').sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.salesRepModel.findById(id).select('-passwordHash').populate('managerId', 'name area').lean().exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'Sales rep not found' });
    }
    return doc;
  }

  async create(dto: any): Promise<any> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const repData: any = {
      name: dto.name,
      mobile: dto.mobile || '',
      aadhaarNo: dto.aadhaarNo || '',
      drivingLicenseNo: dto.drivingLicenseNo || '',
      panCardNo: dto.panCardNo || '',
      managerId: dto.managerId,
      username: dto.username,
      passwordHash,
      userTypeId: dto.userTypeId,
      address: dto.address || {},
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };
    if (dto.profilePic) {
      repData.profilePic = dto.profilePic;
    }

    const rep = await this.salesRepModel.create(repData);
    const result = await this.salesRepModel.findById(rep._id).select('-passwordHash').populate('managerId', 'name area').lean().exec();
    return { ...result, _type: 'salesRep' };
  }

  async update(id: string, dto: any): Promise<any> {
    const existing = await this.salesRepModel.findById(id).exec();
    if (!existing) {
      throw new RpcException({ statusCode: 404, message: 'Sales rep not found' });
    }

    const oldProfilePic = existing.profilePic;

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.mobile !== undefined) existing.mobile = dto.mobile;
    if (dto.aadhaarNo !== undefined) existing.aadhaarNo = dto.aadhaarNo;
    if (dto.drivingLicenseNo !== undefined) existing.drivingLicenseNo = dto.drivingLicenseNo;
    if (dto.panCardNo !== undefined) existing.panCardNo = dto.panCardNo;
    if (dto.managerId !== undefined) existing.managerId = dto.managerId;
    if (dto.address !== undefined) existing.address = dto.address;
    if (dto.isActive !== undefined) existing.isActive = dto.isActive;
    if (dto.profilePic) existing.profilePic = dto.profilePic;

    await existing.save();

    const result = await this.salesRepModel.findById(id).select('-passwordHash').populate('managerId', 'name area').lean().exec();
    return {
      data: { ...result, _type: 'salesRep' },
      oldProfilePic: dto.profilePic ? oldProfilePic : null,
    };
  }

  async delete(id: string) {
    const doc = await this.salesRepModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'Sales rep not found' });
    }
    return { message: 'Sales rep deleted successfully', profilePic: doc.profilePic };
  }

  async findByUsername(username: string) {
    return this.salesRepModel.findOne({ username }).select('+passwordHash').lean().exec();
  }

  async checkUsernameExists(username: string, excludeId?: string) {
    const filter: Record<string, any> = { username };
    if (excludeId) filter._id = { $ne: excludeId };
    return (await this.salesRepModel.countDocuments(filter).exec()) > 0;
  }
}
