import { Injectable } from '@nestjs/common';
import { MySqlConfig, SqlOperation } from './types';
import { loadMySqlConfig } from './config/config.module';

const OPERATION_PATTERNS: Record<SqlOperation, RegExp> = {
  SELECT: /\bSELECT\b/i,
  INSERT: /\bINSERT\b/i,
  UPDATE: /\bUPDATE\b/i,
  DELETE: /\bDELETE\b/i,
  DDL: /\b(CREATE|ALTER|DROP|TRUNCATE)\b/i,
  VIEW: /\b(SHOW|DESCRIBE|EXPLAIN)\b/i,
  UNKNOWN: /./,
};

@Injectable()
export class PermissionGuardService {
  detectOperation(sql: string): SqlOperation {
    const trimmed = sql.trim();

    for (const [operation, pattern] of Object.entries(OPERATION_PATTERNS)) {
      if (operation !== 'UNKNOWN' && pattern.test(trimmed)) {
        return operation as SqlOperation;
      }
    }

    return 'UNKNOWN';
  }

  checkPermission(sql: string): {
    allowed: boolean;
    operation: SqlOperation;
    message?: string;
  } {
    const operation = this.detectOperation(sql);
    const config = loadMySqlConfig();

    const permissionKey =
      `allow${operation.charAt(0) + operation.slice(1).toLowerCase()}` as keyof MySqlConfig['permissions'];
    const isAllowed = config.permissions[permissionKey] ?? false;

    if (!isAllowed) {
      return {
        allowed: false,
        operation,
        message: `${operation} not allowed (ALLOW_${operation}=false)`,
      };
    }

    return { allowed: true, operation };
  }
}
