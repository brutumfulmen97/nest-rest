import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { ProjectsService } from 'src/projects/projects.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private readonly logger = new MyLoggerService(TasksService.name);
  constructor(
    private readonly projectService: ProjectsService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    try {
      const gitlabRestApi = this.configService.get('GITLAB_REST_API');
      const endpoint = this.configService.get('ENDPOINT');

      const response = await fetch(`${gitlabRestApi}${endpoint}`, {
        headers: {
          'PRIVATE-TOKEN': this.configService.get('PRIVATE_TOKEN'),
        },
      });

      const data = await response.json();

      if (response.status !== 200) {
        this.logger.error('Error fetching data from GitLab');
        return;
      }

      const milestoneMap = new Map();

      data.forEach((issue) => {
        if (issue.milestone) {
          const milestoneName = issue.milestone.title;
          if (!milestoneMap.has(milestoneName)) {
            milestoneMap.set(milestoneName, []);
          }

          milestoneMap.get(milestoneName).push({
            name: issue.title,
            id: issue.id,
            assignee: issue.assignee?.username || 'Unassigned',
          });
        }
      });

      const formattedData = Array.from(milestoneMap).map(
        ([milestone, tasks]) => ({
          milestone,
          tasks,
        }),
      );

      await this.projectService.createMany(formattedData);

      this.logger.log('Successfully fetched and stored milestone data');
    } catch (error) {
      this.logger.error('Error fetching/storing data: ' + error.message);
    }
  }
}
