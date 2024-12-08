import { Test, TestingModule } from '@nestjs/testing';
import { YoutrackController } from './youtrack.controller';

describe('YoutrackController', () => {
  let controller: YoutrackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutrackController],
    }).compile();

    controller = module.get<YoutrackController>(YoutrackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
