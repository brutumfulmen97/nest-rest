import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SkipThrottle } from '@nestjs/throttler';
import { DatabaseContextService } from '../database-context/database-context.service';

@Injectable()
export class ProjectsService {
  private projectModels: Record<string, Model<Project>> = {};

  constructor(
    @InjectModel(Project.name, 'youtrack')
    private projectModel1: Model<Project>,
    @InjectModel(Project.name, 'gitlab')
    private projectModel2: Model<Project>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private databaseContext: DatabaseContextService,
  ) {
    this.projectModels = {
      youtrack: projectModel1,
      gitlab: projectModel2,
    };
  }

  private get currentModel(): Model<Project> {
    const currentDb = this.databaseContext.getCurrentDatabase();
    return this.projectModels[currentDb];
  }

  async createMany(milestoneData: Array<{ milestone: string; tasks: any[] }>) {
    await this.currentModel.deleteMany({});

    const createdProjects = await this.currentModel.insertMany(
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

    const projects = await this.currentModel.find().exec();

    await this.cacheManager.set('all_projects', projects, 600000);

    return projects;
  }

  async findByMilestone(milestone: string) {
    return this.currentModel.findOne({ milestone }).exec();
  }
}
