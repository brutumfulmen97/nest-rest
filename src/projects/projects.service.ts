import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SkipThrottle } from '@nestjs/throttler';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createMany(milestoneData: Array<{ milestone: string; tasks: any[] }>) {
    await this.projectModel.deleteMany({});

    const createdProjects = await this.projectModel.insertMany(
      milestoneData.map((data) => ({
        milestone: data.milestone,
        tasks: data.tasks.map((task) => ({
          name: task.name,
          id: task.id,
          assignee: task.assignee,
        })),
      })),
    );

    await this.cacheManager.del('all_projects');

    return createdProjects;
  }

  @SkipThrottle()
  async findAll() {
    const cachedProjects = await this.cacheManager.get('all_projects');

    if (cachedProjects) {
      return cachedProjects;
    }

    const projects = await this.projectModel.find().exec();

    await this.cacheManager.set('all_projects', projects, 600000);

    return projects;
  }

  async findByMilestone(milestone: string) {
    return this.projectModel.findOne({ milestone }).exec();
  }
}
