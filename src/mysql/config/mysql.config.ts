export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeout: number;
  queryTimeout: number;
}

export interface McpTransportConfig {
  type: 'stdio' | 'http-sse' | 'streamable-http';
  host: string;
  port: number;
  serverName: string;
  serverVersion: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  dir: string;
}

export interface PermissionConfig {
  allowSelect: boolean;
  allowView: boolean;
  allowInsert: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
  allowDdl: boolean;
}

export interface MySqlConfig {
  database: DatabaseConfig;
  pool: PoolConfig;
  mcp: McpTransportConfig;
  logging: LoggingConfig;
  dryRun: boolean;
  permissions: PermissionConfig;
}
