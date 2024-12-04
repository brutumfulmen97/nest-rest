import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseContextModule } from '../database-context/database-context.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'youtrack',
    ),
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'gitlab',
    ),
    DatabaseContextModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
