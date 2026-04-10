import { Test, TestingModule } from '@nestjs/testing';
import { MySqlService } from './mysql.service';

describe('MySqlService', () => {
  let service: MySqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MySqlService],
    }).compile();

    service = module.get<MySqlService>(MySqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return false when pool is not initialized', async () => {
      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('isShutdown', () => {
    it('should return false initially', () => {
      expect(service.isShutdown).toBe(false);
    });
  });
});
