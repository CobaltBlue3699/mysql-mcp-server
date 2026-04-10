import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { QueryResult, TableInfo, TableDescription } from './types';
import { loadMySqlConfig } from './config/config.module';

@Injectable()
export class MySqlService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool | null = null;
  private readonly logger = new Logger(MySqlService.name);
  private isShuttingDown = false;
  private pendingQueries: Promise<unknown>[] = [];

  onModuleInit() {
    this.initializePool();
  }

  async onModuleDestroy() {
    await this.shutdown();
  }

  private initializePool() {
    const config = loadMySqlConfig();

    this.pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      waitForConnections: true,
      connectionLimit: config.pool.max,
      enableKeepAlive: true,
    });

    this.logger.log(
      `MySQL pool initialized: ${config.database.host}:${config.database.port}/${config.database.name}`,
    );
  }

  async healthCheck(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }
    try {
      const connection = await this.pool.getConnection();
      connection.release();
      return true;
    } catch (error) {
      this.logger.error('Health check failed', error);
      return false;
    }
  }

  async listTables(): Promise<TableInfo[]> {
    this.ensurePool();
    const [rows] =
      await this.pool!.query<mysql.RowDataPacket[]>('SHOW TABLE STATUS');
    return rows.map((row) => ({
      tableName: row.Name as string,
      tableType: row.Type as string,
    }));
  }

  async describeTable(tableName: string): Promise<TableDescription> {
    this.ensurePool();
    const [rows] = await this.pool!.query<mysql.RowDataPacket[]>(
      `DESCRIBE \`${tableName}\``,
    );
    return {
      columns: rows.map((row) => ({
        field: row.Field as string,
        type: row.Type as string,
        null: row.Null as string,
        key: row.Key as string,
        default: row.Default as string | null,
        extra: row.Extra as string,
      })),
    };
  }

  async executeQuery(sql: string, queryTimeout?: number): Promise<QueryResult> {
    this.ensurePool();

    const queryOptions: mysql.QueryOptions = { sql };
    if (queryTimeout) {
      queryOptions.timeout = queryTimeout;
    }

    const queryPromise = this.pool!.query<mysql.RowDataPacket[]>(queryOptions);

    this.pendingQueries.push(queryPromise);

    try {
      const [rows, fields] = await queryPromise;
      this.pendingQueries = this.pendingQueries.filter(
        (p) => p !== queryPromise,
      );

      return {
        columns: fields.map((f) => f.name),
        rows: rows as unknown as Record<string, unknown>[],
        rowCount: rows.length,
      };
    } catch (error) {
      this.pendingQueries = this.pendingQueries.filter(
        (p) => p !== queryPromise,
      );
      throw error;
    }
  }

  async listDatabases(): Promise<string[]> {
    this.ensurePool();
    const [rows] =
      await this.pool!.query<mysql.RowDataPacket[]>('SHOW DATABASES');
    return rows
      .map((row) => row.Database as string)
      .filter(
        (db) =>
          ![
            'information_schema',
            'performance_schema',
            'mysql',
            'sys',
          ].includes(db),
      );
  }

  private ensurePool() {
    if (!this.pool) {
      throw new Error('MySQL pool not initialized');
    }
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }
    this.isShuttingDown = true;

    this.logger.log('Starting graceful shutdown...');

    const waitStart = Date.now();
    const maxWait = 30000;

    while (this.pendingQueries.length > 0) {
      if (Date.now() - waitStart > maxWait) {
        this.logger.warn('Timeout waiting for pending queries, force closing');
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.logger.log('MySQL pool closed');
    }

    this.logger.log('Graceful shutdown complete');
  }

  get isShutdown(): boolean {
    return this.isShuttingDown;
  }
}
