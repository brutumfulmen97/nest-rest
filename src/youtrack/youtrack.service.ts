import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YoutrackService {
  constructor(private readonly configService: ConfigService) {}

  YOUTRACK_BASE_URL = this.configService.get('YOUTRACK_BASE_URL');
  YOUTRACK_PRIVATE_TOKEN = this.configService.get('YOUTRACK_PRIVATE_TOKEN');
  YOUTRACK_API = this.YOUTRACK_BASE_URL + 'api/';
  YOUTRACK_HUB_API = this.YOUTRACK_BASE_URL + 'hub/api/rest/';

  PROJECT_ID = '84-186';

  NO_SPLIT_STAGES = [
    'Ready for Merge',
    'To Verify',
    'Verified & Ready for Production',
    'Done',
  ];

  ALLOWED_STAGES = ['Open', 'In Progress', 'Need Fix'];

  timestampAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

  async getIssues() {
    try {
      const url =
        this.YOUTRACK_API + 'agiles/' + this.PROJECT_ID + '/sprints/current';

      if (!this.YOUTRACK_API || !this.YOUTRACK_PRIVATE_TOKEN) {
        throw new Error('Missing required YouTrack configuration');
      }

      const params = {
        fields:
          'board(trimmedSwimlanes(cells(issues(id,summary,created,idReadable,isDraft,project(id,name,archived),customFields(name,value(name,value,minutes,presentation,email,login,avatarUrl))))))',
      };

      const queryString = new URLSearchParams(params);

      const response = await fetch(`${url}?${queryString.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.YOUTRACK_PRIVATE_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.statusText}`);
      }

      const data = await response.json();

      const withoutLowPriority = data.board.trimmedSwimlanes.slice(0, 2);

      return withoutLowPriority;
    } catch (error) {
      throw new Error(`Error fetching YouTrack issues: ${error.message}`);
    }
  }

  async fetchTaskTimelog(skip = 0, accumulatedData = []) {
    try {
      const url = this.YOUTRACK_API + 'activities';

      if (!this.YOUTRACK_API || !this.YOUTRACK_PRIVATE_TOKEN) {
        throw new Error('Missing required YouTrack configuration');
      }

      const params = {
        fields:
          'id,author(id,login,name),timestamp,added,target(id,idReadable)',
        categories: 'CustomFieldCategory',
        start: this.timestampAgo.toString(),
        reverse: 'true',
        $skip: skip.toString(),
        issueQuery:
          'Priority: High, Medium project: -{Studio Present}, -SP_HR Stage: -Done , -{Verified & Ready for Production} -{I Need Help - Waiting For} -Estimation',
      };

      const queryString = new URLSearchParams(params);

      const response = await fetch(`${url}?${queryString.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.YOUTRACK_PRIVATE_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch timelog: ${response.statusText}`);
      }

      const responseData = await response.json();
      const lastTimelog = responseData[responseData.length - 1];

      const mergedData = [...accumulatedData, ...responseData];

      if (lastTimelog && lastTimelog.timestamp > this.timestampAgo) {
        return this.fetchTaskTimelog(skip + 1000, mergedData);
      }

      return mergedData;
    } catch (error) {
      console.error('Error fetching YouTrack timelog:', error.message);
      throw new Error(`Error fetching YouTrack timelog: ${error.message}`);
    }
  }

  async popoulateHighChartsData() {
    const issues = await this.getIssues();
    const users = await this.getUsers();

    const issuesWithTimelog = issues.map((issue) => {
      const timelog = this.fetchTaskTimelog();

      return {
        ...issue,
        timelog,
      };
    });

    return { issues: issuesWithTimelog, users };
  }

  async getUsers() {
    try {
      const url = this.YOUTRACK_HUB_API + 'users';

      if (!this.YOUTRACK_HUB_API || !this.YOUTRACK_PRIVATE_TOKEN) {
        throw new Error('Missing required YouTrack configuration');
      }

      const params = {
        fields: 'id,login,banned,name,profile/email/email,avatar/url',
        query:
          'access(organization: {GmbH}) or access(organization: {Studio Present})',
      };

      const queryString = new URLSearchParams();
      queryString.append('fields', params.fields);
      queryString.append('query', params.query);

      const response = await fetch(`${url}?${queryString.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.YOUTRACK_PRIVATE_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error fetching YouTrack users: ${error.message}`);
    }
  }
}
