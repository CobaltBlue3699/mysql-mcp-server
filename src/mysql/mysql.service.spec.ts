import { Test, TestingModule } from '@nestjs/testing';
import { MySqlService } from './mysql.service';

const mockPool = {
  query: jest.fn(),
  getConnection: jest.fn(),
  end: jest.fn().mockResolvedValue(undefined),
};

jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => mockPool),
}));

describe('MySqlService', () => {
  let service: MySqlService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MySqlService],
    }).compile();

    service = module.get<MySqlService>(MySqlService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── healthCheck ─────────────────────────────────────────────────────────────

  describe('healthCheck', () => {
    it('should return false when pool is not initialized', async () => {
      const bare = new MySqlService();
      expect(await bare.healthCheck()).toBe(false);
    });

    it('should return true when connection succeeds', async () => {
      const mockConnection = { release: jest.fn() };
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      expect(await service.healthCheck()).toBe(true);
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should return false when connection fails', async () => {
      mockPool.getConnection.mockRejectedValueOnce(
        new Error('connect ECONNREFUSED'),
      );
      expect(await service.healthCheck()).toBe(false);
    });
  });

  // ─── listTables ──────────────────────────────────────────────────────────────

  describe('listTables', () => {
    it('should return mapped table list', async () => {
      mockPool.query.mockResolvedValueOnce([
        [
          { Name: 'users', Type: 'BASE TABLE' },
          { Name: 'orders', Type: 'BASE TABLE' },
        ],
        [],
      ]);

      const result = await service.listTables();
      expect(result).toEqual([
        { tableName: 'users', tableType: 'BASE TABLE' },
        { tableName: 'orders', tableType: 'BASE TABLE' },
      ]);
    });

    it('should return empty array when no tables exist', async () => {
      mockPool.query.mockResolvedValueOnce([[], []]);
      expect(await service.listTables()).toEqual([]);
    });
  });

  // ─── describeTable ────────────────────────────────────────────────────────────

  describe('describeTable', () => {
    const mockRows = [
      {
        Field: 'id',
        Type: 'int',
        Null: 'NO',
        Key: 'PRI',
        Default: null,
        Extra: 'auto_increment',
      },
      {
        Field: 'name',
        Type: 'varchar(255)',
        Null: 'YES',
        Key: '',
        Default: null,
        Extra: '',
      },
    ];

    it('should return column descriptions for a valid table', async () => {
      mockPool.query.mockResolvedValueOnce([mockRows, []]);
      const result = await service.describeTable('users');
      expect(result.columns).toHaveLength(2);
      expect(result.columns[0]).toEqual({
        field: 'id',
        type: 'int',
        null: 'NO',
        key: 'PRI',
        default: null,
        extra: 'auto_increment',
      });
    });

    it('should throw for table names containing injection characters', async () => {
      await expect(
        service.describeTable('users`; DROP TABLE users;'),
      ).rejects.toThrow('Invalid table name');
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should throw for table names with spaces', async () => {
      await expect(service.describeTable('my table')).rejects.toThrow(
        'Invalid table name',
      );
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should accept table names with underscores and dollar signs', async () => {
      mockPool.query.mockResolvedValueOnce([mockRows, []]);
      await expect(service.describeTable('my_table$1')).resolves.toBeDefined();
    });
  });

  // ─── executeQuery ─────────────────────────────────────────────────────────────

  describe('executeQuery', () => {
    const mockFields = [{ name: 'id' }, { name: 'name' }];
    const mockRows = [{ id: 1, name: 'Alice' }];

    it('should return columns, rows, and rowCount', async () => {
      mockPool.query.mockResolvedValueOnce([mockRows, mockFields]);
      const result = await service.executeQuery('SELECT * FROM users');
      expect(result).toEqual({
        columns: ['id', 'name'],
        rows: mockRows,
        rowCount: 1,
      });
    });

    it('should pass timeout to query options when provided', async () => {
      mockPool.query.mockResolvedValueOnce([[], []]);
      await service.executeQuery('SELECT 1', 5000);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({ sql: 'SELECT 1', timeout: 5000 }),
      );
    });

    it('should not set timeout when not provided', async () => {
      mockPool.query.mockResolvedValueOnce([[], []]);
      await service.executeQuery('SELECT 1');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.not.objectContaining({ timeout: expect.anything() }),
      );
    });

    it('should remove query from pendingQueries after completion', async () => {
      mockPool.query.mockResolvedValueOnce([mockRows, mockFields]);
      await service.executeQuery('SELECT 1');
      // Access private field via bracket notation for testing
      expect((service as any).pendingQueries).toHaveLength(0);
    });

    it('should remove query from pendingQueries on error', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Query failed'));
      await expect(service.executeQuery('INVALID SQL')).rejects.toThrow(
        'Query failed',
      );
      expect((service as any).pendingQueries).toHaveLength(0);
    });
  });

  // ─── listDatabases ────────────────────────────────────────────────────────────

  describe('listDatabases', () => {
    it('should filter out system databases', async () => {
      mockPool.query.mockResolvedValueOnce([
        [
          { Database: 'information_schema' },
          { Database: 'performance_schema' },
          { Database: 'mysql' },
          { Database: 'sys' },
          { Database: 'my_app' },
          { Database: 'staging' },
        ],
        [],
      ]);

      const result = await service.listDatabases();
      expect(result).toEqual(['my_app', 'staging']);
      expect(result).not.toContain('information_schema');
      expect(result).not.toContain('performance_schema');
      expect(result).not.toContain('mysql');
      expect(result).not.toContain('sys');
    });

    it('should return empty array when only system databases exist', async () => {
      mockPool.query.mockResolvedValueOnce([
        [{ Database: 'information_schema' }, { Database: 'mysql' }],
        [],
      ]);
      expect(await service.listDatabases()).toEqual([]);
    });
  });

  // ─── isShutdown ───────────────────────────────────────────────────────────────

  describe('isShutdown', () => {
    it('should return false initially', () => {
      expect(service.isShutdown).toBe(false);
    });
  });

  // ─── shutdown ─────────────────────────────────────────────────────────────────

  describe('shutdown', () => {
    it('should close the pool and set isShutdown', async () => {
      await service.shutdown();
      expect(mockPool.end).toHaveBeenCalledTimes(1);
      expect(service.isShutdown).toBe(true);
    });

    it('should be a no-op when called a second time', async () => {
      await service.shutdown();
      await service.shutdown();
      expect(mockPool.end).toHaveBeenCalledTimes(1);
    });

    it('should force close after 30s timeout when queries are pending', async () => {
      jest.useFakeTimers();

      // Inject a never-resolving pending query
      const neverResolves = new Promise(() => {});
      (service as any).pendingQueries = [neverResolves];

      const shutdownPromise = service.shutdown();

      // Advance past the 30s max wait
      jest.advanceTimersByTime(31000);

      await shutdownPromise;

      expect(mockPool.end).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
  });
});
