import { Controller, Get, Render } from '@nestjs/common';
import { YoutrackService } from './youtrack.service';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('youtrack')
export class YoutrackController {
  constructor(private readonly youtrackService: YoutrackService) {}

  @Get('users')
  @Render('youtrack_users')
  async getUsers() {
    const { users } = await this.youtrackService.getUsers();

    return {
      title: 'Youtrack Users',
      users,
    };
  }

  @Get('issues')
  getIssues() {
    return this.youtrackService.getIssues();
  }

  @SkipThrottle()
  @Get('data')
  formatData() {
    return this.youtrackService.popoulateHighChartsData();
  }

  @Get('chart')
  @Render('youtrack')
  getChart() {
    return {
      title: 'Youtrack Data',
    };
  }
}
