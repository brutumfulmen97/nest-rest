import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getUsers(
    sort: 'asc' | 'desc' = 'desc',
    limit: number = 10,
    role: 'ADMIN' | 'USER' = 'USER',
  ) {
    return this.userModel.find({ role }).sort({ createdAt: sort }).limit(limit);
  }

  getUser(id: string) {
    return this.userModel.findById(id);
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
