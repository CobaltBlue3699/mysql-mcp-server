export interface TableInfo {
  tableName: string;
  tableType: string;
}

export interface ColumnInfo {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string | null;
  extra: string;
}

export interface TableDescription {
  columns: ColumnInfo[];
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[] | null;
  rowCount: number;
  dryRun?: boolean;
  message?: string;
}

export interface DatabaseInfo {
  databaseName: string;
}

export type SqlOperation =
  | 'SELECT'
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'DDL'
  | 'VIEW'
  | 'UNKNOWN';

export type { MySqlConfig } from '../config/mysql.config';
