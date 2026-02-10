import { Test, TestingModule } from '@nestjs/testing';
import { TiemposController } from './tiempos.controller';
import { TiemposService } from './tiempos.service';

describe('TiemposController', () => {
  let controller: TiemposController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiemposController],
      providers: [TiemposService],
    }).compile();

    controller = module.get<TiemposController>(TiemposController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
