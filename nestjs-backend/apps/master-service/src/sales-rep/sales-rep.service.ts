import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { SalesRep, SalesRepDocument } from './schemas/sales-rep.schema';

const ADDRESS_POPULATE = [
  { path: 'address.stateId', select: 'name' },
  { path: 'address.cityId', select: 'name' },
  { path: 'address.pincodeId', select: 'code' },
  { path: 'address.areaId', select: 'name' },
];

@Injectable()
export class SalesRepService {
  constructor(
    @InjectModel(SalesRep.name) private readonly salesRepModel: Model<SalesRepDocument>,
  ) {}

  async findAll() {
    return this.salesRepModel.find().select('-passwordHash')
      .populate('managerId', 'name')
      .populate(ADDRESS_POPULATE)
      .sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.salesRepModel.findById(id).select('-passwordHash')
      .populate('managerId', 'name')
      .populate(ADDRESS_POPULATE)
      .lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Sales rep not found' });
    return doc;
  }

  async create(dto: any): Promise<any> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const repData: any = {
      name: dto.name,
      mobile: dto.mobile || '',
      email: dto.email || '',
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
    if (dto.profilePic) repData.profilePic = dto.profilePic;

    const rep = await this.salesRepModel.create(repData);
    return this.salesRepModel.findById(rep._id).select('-passwordHash')
      .populate('managerId', 'name')
      .populate(ADDRESS_POPULATE)
      .lean().exec();
  }

  async update(id: string, dto: any): Promise<any> {
    const existing = await this.salesRepModel.findById(id).exec();
    if (!existing) throw new RpcException({ statusCode: 404, message: 'Sales rep not found' });

    const oldProfilePic = existing.profilePic;
    const updatableFields = ['name', 'mobile', 'email', 'aadhaarNo', 'drivingLicenseNo', 'panCardNo', 'managerId', 'address', 'isActive'];
    for (const field of updatableFields) {
      if (dto[field] !== undefined) (existing as any)[field] = dto[field];
    }
    if (dto.profilePic) existing.profilePic = dto.profilePic;
    await existing.save();

    const result = await this.salesRepModel.findById(id).select('-passwordHash')
      .populate('managerId', 'name')
      .populate(ADDRESS_POPULATE)
      .lean().exec();
    return { data: result, oldProfilePic: dto.profilePic ? oldProfilePic : null };
  }

  async delete(id: string) {
    const doc = await this.salesRepModel.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Sales rep not found' });
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
