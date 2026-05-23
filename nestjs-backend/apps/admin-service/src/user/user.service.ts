import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { UserType, UserTypeDocument } from '../user-type/schemas/user-type.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserType.name) private readonly userTypeModel: Model<UserTypeDocument>,
  ) {}

  async findAll(): Promise<any[]> {
    const users = await this.userModel
      .find()
      .select('-passwordHash')
      .populate('userTypeId', 'name')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return users.map((u) => ({ ...u, _type: 'user' }));
  }

  async findOne(id: string): Promise<any> {
    const doc = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .populate('userTypeId', 'name')
      .lean()
      .exec();

    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'User not found' });
    }
    return { ...doc, _type: 'user' };
  }

  async create(dto: {
    userTypeId: string;
    username: string;
    password: string;
    description?: string;
    isActive?: boolean;
  }): Promise<any> {
    // Validate user type exists
    const userType = await this.userTypeModel.findById(dto.userTypeId).exec();
    if (!userType) {
      throw new RpcException({ statusCode: 400, message: 'Invalid user type' });
    }

    // Block Admin type assignment
    if (userType.name === 'Admin') {
      throw new RpcException({ statusCode: 403, message: 'Cannot create users with Admin type' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      userTypeId: dto.userTypeId,
      username: dto.username,
      passwordHash,
      description: dto.description || '',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const populated = await this.userModel
      .findById(user._id)
      .select('-passwordHash')
      .populate('userTypeId', 'name')
      .lean()
      .exec();

    return { ...populated, _type: 'user' };
  }

  async update(id: string, dto: {
    userTypeId?: string;
    username?: string;
    password?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<any> {
    const updateData: Record<string, any> = {};
    if (dto.userTypeId) updateData.userTypeId = dto.userTypeId;
    if (dto.username) updateData.username = dto.username;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    const doc = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select('-passwordHash')
      .populate('userTypeId', 'name')
      .lean()
      .exec();

    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'User not found' });
    }
    return { ...doc, _type: 'user' };
  }

  async delete(id: string) {
    const doc = await this.userModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new RpcException({ statusCode: 404, message: 'User not found' });
    }
    return { message: 'User deleted successfully' };
  }

  /** Find user by username with passwordHash included (for auth login) */
  async findByUsername(username: string) {
    const user = await this.userModel
      .findOne({ username })
      .select('+passwordHash')
      .populate('userTypeId', 'name')
      .lean()
      .exec();

    return user || null;
  }

  /** Check if username exists in User collection */
  async checkUsernameExists(username: string, excludeId?: string) {
    const filter: Record<string, any> = { username };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await this.userModel.countDocuments(filter).exec();
    return count > 0;
  }
}
