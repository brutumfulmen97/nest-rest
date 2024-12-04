import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { DatabaseContextService } from '../database-context/database-context.service';

@Injectable()
export class UsersService {
  private userModels: Record<string, Model<User>> = {};

  constructor(
    @InjectModel(User.name, 'youtrack')
    private userModel1: Model<User>,
    @InjectModel(User.name, 'gitlab')
    private userModel2: Model<User>,
    private databaseContext: DatabaseContextService,
  ) {
    this.userModels = {
      youtrack: userModel1,
      gitlab: userModel2,
    };
  }

  private get currentModel(): Model<User> {
    const currentDb = this.databaseContext.getCurrentDatabase();
    return this.userModels[currentDb];
  }

  async findAll(): Promise<User[]> {
    return this.currentModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.currentModel.findById(id).exec();
  }

  async createMany(users: User[]): Promise<User[]> {
    await this.currentModel.deleteMany({});

    return this.currentModel.insertMany(users);
  }
}
