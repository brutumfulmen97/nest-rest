import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectSchema } from '../schemas/project.schema';
import { Project } from '../schemas/project.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    CacheModule.register({
      ttl: 600000,
    }),
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
