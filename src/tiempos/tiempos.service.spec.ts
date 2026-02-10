import { Test, TestingModule } from '@nestjs/testing';
import { TiemposService } from './tiempos.service';

describe('TiemposService', () => {
  let service: TiemposService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiemposService],
    }).compile();

    service = module.get<TiemposService>(TiemposService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
