import { Test, TestingModule } from '@nestjs/testing';
import { PermissionGuardService } from './permission.guard';

describe('PermissionGuardService', () => {
  let service: PermissionGuardService;

  beforeEach(async () => {
    process.env.ALLOW_SELECT = 'true';
    process.env.ALLOW_INSERT = 'false';

    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionGuardService],
    }).compile();

    service = module.get<PermissionGuardService>(PermissionGuardService);
  });

  afterEach(() => {
    delete process.env.ALLOW_SELECT;
    delete process.env.ALLOW_INSERT;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectOperation', () => {
    it('should detect SELECT operation', () => {
      const result = service.detectOperation('SELECT * FROM users');
      expect(result).toBe('SELECT');
    });

    it('should detect INSERT operation', () => {
      const result = service.detectOperation(
        'INSERT INTO users (name) VALUES (?)',
      );
      expect(result).toBe('INSERT');
    });

    it('should detect UPDATE operation', () => {
      const result = service.detectOperation('UPDATE users SET name = ?');
      expect(result).toBe('UPDATE');
    });

    it('should detect DELETE operation', () => {
      const result = service.detectOperation('DELETE FROM users WHERE id = ?');
      expect(result).toBe('DELETE');
    });

    it('should detect DDL operations', () => {
      expect(service.detectOperation('CREATE TABLE test (id int)')).toBe('DDL');
      expect(
        service.detectOperation(
          'ALTER TABLE users ADD COLUMN name varchar(255)',
        ),
      ).toBe('DDL');
      expect(service.detectOperation('DROP TABLE users')).toBe('DDL');
    });

    it('should detect VIEW operations', () => {
      expect(service.detectOperation('SHOW TABLES')).toBe('VIEW');
      expect(service.detectOperation('DESCRIBE users')).toBe('VIEW');
    });
  });

  describe('checkPermission', () => {
    it('should allow SELECT when ALLOW_SELECT=true', () => {
      const result = service.checkPermission('SELECT * FROM users');
      expect(result.allowed).toBe(true);
      expect(result.operation).toBe('SELECT');
    });

    it('should deny INSERT when ALLOW_INSERT=false', () => {
      const result = service.checkPermission(
        'INSERT INTO users (name) VALUES (?)',
      );
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('not allowed');
    });
  });
});
