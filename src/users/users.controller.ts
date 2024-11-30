import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getUsers() {
    return 'get users';
  }

  @Get('admins')
  getAdmins() {
    return 'get admins';
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return `get user ${id}`;
  }
}
