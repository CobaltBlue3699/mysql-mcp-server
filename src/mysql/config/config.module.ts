import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import {
  MySqlConfig,
  DatabaseConfig,
  PoolConfig,
  McpTransportConfig,
  LoggingConfig,
  PermissionConfig,
} from './mysql.config';

export function loadMySqlConfig(): MySqlConfig {
  return {
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'test_db',
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      acquireTimeout: parseInt(
        process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000',
        10,
      ),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),
    },
    mcp: {
      type:
        (process.env.MCP_TRANSPORT as
          | 'stdio'
          | 'http-sse'
          | 'streamable-http') || 'stdio',
      host: process.env.MCP_HOST || '0.0.0.0',
      port: parseInt(process.env.MCP_PORT || '3000', 10),
      serverName: process.env.MCP_SERVER_NAME || 'mysql-mcp-server',
      serverVersion: process.env.MCP_SERVER_VERSION || '1.0.0',
    },
    logging: {
      level:
        (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ||
        'info',
      dir: process.env.LOG_DIR || './logs',
    },
    dryRun: process.env.DRY_RUN === 'true',
    permissions: {
      allowSelect: process.env.ALLOW_SELECT !== 'false',
      allowView: process.env.ALLOW_VIEW !== 'false',
      allowInsert: process.env.ALLOW_INSERT === 'true',
      allowUpdate: process.env.ALLOW_UPDATE === 'true',
      allowDelete: process.env.ALLOW_DELETE === 'true',
      allowDdl: process.env.ALLOW_DDL === 'true',
    },
  };
}

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [loadMySqlConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}

export type {
  MySqlConfig,
  DatabaseConfig,
  PoolConfig,
  McpTransportConfig,
  LoggingConfig,
  PermissionConfig,
};
