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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Render('users')
  async getUsers(
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('limit') limit: number = 10,
  ) {
    const users = await this.usersService.getUsers(sort, limit);

    return { title: 'Users', users };
  }

  @Get('admins')
  getAdmins() {
    return this.usersService.getAdmins();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Post()
  createUser(@Body(ValidationPipe) body: User) {
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) body: Partial<User>,
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
