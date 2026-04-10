import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteQueryTool } from './execute-query.tool';
import { MySqlService } from '../mysql.service';
import { PermissionGuardService } from '../permission.guard';

describe('ExecuteQueryTool', () => {
  let tool: ExecuteQueryTool;
  let mockMySqlService: Partial<MySqlService>;
  let mockPermissionGuard: Partial<PermissionGuardService>;

  beforeEach(async () => {
    mockMySqlService = {
      executeQuery: jest.fn().mockResolvedValue({
        columns: ['id', 'name'],
        rows: [{ id: 1, name: 'Test' }],
        rowCount: 1,
      }),
    };

    mockPermissionGuard = {
      checkPermission: jest
        .fn()
        .mockReturnValue({ allowed: true, operation: 'SELECT' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteQueryTool,
        { provide: MySqlService, useValue: mockMySqlService },
        { provide: PermissionGuardService, useValue: mockPermissionGuard },
      ],
    }).compile();

    tool = module.get<ExecuteQueryTool>(ExecuteQueryTool);
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('executeQuery', () => {
    it('should execute query and return result', async () => {
      const result = await tool.executeQuery({ sql: 'SELECT * FROM users' });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as {
        columns: string[];
        rowCount: number;
      };
      expect(parsed.columns).toEqual(['id', 'name']);
      expect(parsed.rowCount).toBe(1);
    });

    it('should check permission before executing', async () => {
      await tool.executeQuery({ sql: 'SELECT * FROM users' });
      expect(mockPermissionGuard.checkPermission).toHaveBeenCalledWith(
        'SELECT * FROM users',
      );
    });
  });
});
