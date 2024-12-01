import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getUsers(sort: 'asc' | 'desc' = 'desc', limit: number = 50) {
    return this.userModel.find().sort({ createdAt: sort }).limit(limit);
  }

  async createMany(users: User[]) {
    await this.userModel.deleteMany({});
    return this.userModel.insertMany(users);
  }
}
