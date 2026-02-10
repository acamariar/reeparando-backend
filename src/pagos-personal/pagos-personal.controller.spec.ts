import { Test, TestingModule } from '@nestjs/testing';
import { PagosPersonalController } from './pagos-personal.controller';
import { PagosPersonalService } from './pagos-personal.service';

describe('PagosPersonalController', () => {
  let controller: PagosPersonalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosPersonalController],
      providers: [PagosPersonalService],
    }).compile();

    controller = module.get<PagosPersonalController>(PagosPersonalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
