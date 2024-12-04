import { Controller, Get, Render } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from '../schemas/project.schema';
import { UseDatabase } from 'src/database-context/use-database.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Get()
  @UseDatabase('gitlab')
  @Render('projects')
  async findAll() {
    const projects = await this.projectService.findAll();
    return { title: 'Project', projects: projects as Project[] };
  }
}
