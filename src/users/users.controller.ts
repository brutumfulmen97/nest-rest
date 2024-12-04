import { Controller, Get, Render } from '@nestjs/common';
import { UsersService } from './users.service';
import { UseDatabase } from 'src/database-context/use-database.decorator';
import { DatabaseContextService } from 'src/database-context/database-context.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  @Get('youtrack')
  @UseDatabase('youtrack')
  @Render('users')
  async findAllFromYoutrack() {
    const currentDb = this.databaseContext.getCurrentDatabase();

    const users = await this.usersService.findAll();
    return { title: currentDb, users };
  }

  @Get()
  @UseDatabase('gitlab')
  @Render('users')
  async findAll() {
    const currentDb = this.databaseContext.getCurrentDatabase();

    const users = await this.usersService.findAll();
    return { title: currentDb, users };
  }
}
