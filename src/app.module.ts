import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { DatabaseContextModule } from './database-context/database-context.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb_youtrack:27017/nest', {
      connectionName: 'youtrack',
    }),
    MongooseModule.forRoot('mongodb://mongodb_gitlab:27017/nest', {
      connectionName: 'gitlab',
    }),
    UsersModule,
    ProjectsModule,
    MyLoggerModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 1,
      },
    ]),
    DatabaseContextModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    TasksService,
  ],
})
export class AppModule {}
