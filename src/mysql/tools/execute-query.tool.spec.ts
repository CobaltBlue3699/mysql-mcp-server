import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteQueryTool } from './execute-query.tool';
import { MySqlService } from '../mysql.service';
import { PermissionGuardService } from '../permission.guard';
import { ForbiddenException } from '@nestjs/common';
import * as configModule from '../config/config.module';
import { QueryResult, MySqlConfig } from '../types';

describe('ExecuteQueryTool', () => {
  let tool: ExecuteQueryTool;
  let mockMySqlService: {
    executeQuery: jest.Mock;
  };
  let mockPermissionGuard: {
    checkPermission: jest.Mock;
  };

  const mockQueryResult: QueryResult = {
    columns: ['id', 'name'],
    rows: [{ id: 1, name: 'Test' }],
    rowCount: 1,
  };

  const createMockConfig = (
    overrides: Partial<MySqlConfig> = {},
  ): MySqlConfig => ({
    database: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      name: 'test',
    },
    pool: { min: 1, max: 5, acquireTimeout: 10000, queryTimeout: 10000 },
    mcp: {
      type: 'stdio',
      host: '0.0.0.0',
      port: 3000,
      serverName: 'test',
      serverVersion: '1.0.0',
    },
    logging: { level: 'info', dir: './logs' },
    dryRun: false,
    permissions: {
      allowSelect: true,
      allowView: true,
      allowInsert: true,
      allowUpdate: true,
      allowDelete: true,
      allowDdl: true,
    },
    ...overrides,
  });

  beforeEach(async () => {
    mockMySqlService = {
      executeQuery: jest.fn().mockResolvedValue(mockQueryResult),
    };

    mockPermissionGuard = {
      checkPermission: jest
        .fn()
        .mockReturnValue({ allowed: true, operation: 'SELECT' }),
    };

    jest
      .spyOn(configModule, 'loadMySqlConfig')
      .mockReturnValue(createMockConfig());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteQueryTool,
        { provide: MySqlService, useValue: mockMySqlService },
        { provide: PermissionGuardService, useValue: mockPermissionGuard },
      ],
    }).compile();

    tool = module.get<ExecuteQueryTool>(ExecuteQueryTool);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('executeQuery', () => {
    const testSql = 'SELECT * FROM users';

    it('should execute query and return full result when dryRun is false', async () => {
      const result = await tool.executeQuery({ sql: testSql });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as QueryResult;

      expect(parsed.columns).toEqual(['id', 'name']);
      expect(parsed.rows).toEqual([{ id: 1, name: 'Test' }]);
      expect(parsed.rowCount).toBe(1);
      expect(mockMySqlService.executeQuery).toHaveBeenCalledWith(
        testSql,
        undefined,
      );
    });

    it('should pass timeout correctly to mysqlService', async () => {
      const timeout = 5000;
      await tool.executeQuery({ sql: testSql, timeout });
      expect(mockMySqlService.executeQuery).toHaveBeenCalledWith(
        testSql,
        timeout,
      );
    });

    it('should check permission before any execution', async () => {
      await tool.executeQuery({ sql: testSql });
      expect(mockPermissionGuard.checkPermission).toHaveBeenCalledWith(testSql);
    });

    it('should throw ForbiddenException if permission is denied', async () => {
      mockPermissionGuard.checkPermission.mockReturnValue({
        allowed: false,
        message: 'Insufficient privileges',
        operation: 'DELETE',
      });

      await expect(
        tool.executeQuery({ sql: 'DELETE FROM users' }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockMySqlService.executeQuery).not.toHaveBeenCalled();
    });

    describe('dryRun mode behavior (Spec Logic)', () => {
      it('should dynamically map service results but strictly hide rows', async () => {
        // 1. 設定 Dry Run 模式
        jest
          .spyOn(configModule, 'loadMySqlConfig')
          .mockReturnValue(createMockConfig({ dryRun: true }));

        // 2. 模擬資料庫回傳「與平常完全不同」的動態內容
        const dynamicResult = {
          columns: ['dynamic_col_1', 'dynamic_col_2'],
          rows: [{ dynamic_col_1: 'val1', dynamic_col_2: 'val2' }],
          rowCount: 42,
        };
        mockMySqlService.executeQuery.mockResolvedValueOnce(dynamicResult);

        const result = await tool.executeQuery({ sql: testSql });
        const parsed = JSON.parse(result.content[0].text) as QueryResult & {
          dryRun: boolean;
        };

        // 3. 驗證邏輯：
        // 確保 SQL 確實被傳遞給了 Service
        expect(mockMySqlService.executeQuery).toHaveBeenCalledWith(
          testSql,
          undefined,
        );

        // 核心邏輯驗證：
        // 不論 Service 回傳什麼 rows，工具回傳的 rows 必須被強制設為 null
        expect(parsed.rows).toBeNull();
        expect(parsed.rows).not.toEqual(dynamicResult.rows);

        // 轉發邏輯驗證：
        // 確保工具正確地從 Service 的結果中抓取並轉發了正確的 metadata
        expect(parsed.columns).toEqual(['dynamic_col_1', 'dynamic_col_2']);
        expect(parsed.rowCount).toBe(42);
        expect(parsed.dryRun).toBe(true);
      });
    });
  });
});
