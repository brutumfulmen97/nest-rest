import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Render,
  ValidationPipe,
  Ip,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { MyLoggerService } from '../my-logger/my-logger.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  private readonly myLoggerService = new MyLoggerService(UsersController.name);

  @Get()
  @Render('users')
  async getUsers(
    @Ip() ip: string,
    @Query('sort')
    sort: 'asc' | 'desc' = 'desc',
    @Query('limit') limit: number = 10,
  ) {
    this.myLoggerService.log(
      `getUsers ${ip}\t${sort}\t${limit}`,
      'UsersController',
    );
    const users = await this.usersService.getUsers(sort, limit);

    return { title: 'Users', users: [...users] };
  }

  @Get('admins')
  getAdmins() {
    this.myLoggerService.log('getAdmins');
    return this.usersService.getAdmins();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    this.myLoggerService.log('getUser');
    return this.usersService.getUser(id);
  }

  @Post()
  createUser(@Body(ValidationPipe) body: User) {
    this.myLoggerService.log('createUser');
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) body: Partial<User>,
  ) {
    this.myLoggerService.log('updateUser');
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    this.myLoggerService.log('deleteUser');
    return this.usersService.deleteUser(id);
  }
}
