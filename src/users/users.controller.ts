import { Controller, Get, Query, Render, Ip } from '@nestjs/common';
import { UsersService } from './users.service';
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
}
