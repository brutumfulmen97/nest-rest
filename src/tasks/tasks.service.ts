import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { ProjectsService } from 'src/projects/projects.service';
import { ConfigService } from '@nestjs/config';

const GITLAB_REST_API = 'https://gitlab.studiopresent.com/api/v4';
const ENDPOINT =
  '/groups/pierre-core/issues?sort=asc&order_by=relative_position&pagination=keyset&per_page=100&state=all&page=1';

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
      const response = await fetch(`${GITLAB_REST_API}${ENDPOINT}`, {
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
