import { Module } from '@nestjs/common';
import { YoutrackService } from './youtrack.service';
import { YoutrackController } from './youtrack.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [YoutrackService],
  controllers: [YoutrackController],
  imports: [ConfigModule],
})
export class YoutrackModule {}
