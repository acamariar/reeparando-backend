import { Test, TestingModule } from '@nestjs/testing';
import { PagosPersonalService } from './pagos-personal.service';

describe('PagosPersonalService', () => {
  let service: PagosPersonalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosPersonalService],
    }).compile();

    service = module.get<PagosPersonalService>(PagosPersonalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
