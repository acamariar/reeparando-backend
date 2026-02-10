import { Test, TestingModule } from '@nestjs/testing';
import { GastosProyectoService } from './gastos-proyecto.service';

describe('GastosProyectoService', () => {
  let service: GastosProyectoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GastosProyectoService],
    }).compile();

    service = module.get<GastosProyectoService>(GastosProyectoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
