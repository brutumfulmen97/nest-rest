import { Test, TestingModule } from '@nestjs/testing';
import { YoutrackService } from './youtrack.service';

describe('YoutrackService', () => {
  let service: YoutrackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutrackService],
    }).compile();

    service = module.get<YoutrackService>(YoutrackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
