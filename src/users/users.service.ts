import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getUsers(sort: 'asc' | 'desc' = 'desc', limit: number = 10) {
    return this.userModel.find().sort({ createdAt: sort }).limit(limit);
  }

  async getUser(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  createUser(body: User) {
    return this.userModel.create(body);
  }

  updateUser(id: string, body: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, body);
  }

  deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  getAdmins() {
    return this.userModel.find({ role: 'ADMIN' });
  }
}
