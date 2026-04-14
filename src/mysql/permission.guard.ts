import { Injectable } from '@nestjs/common';
import { MySqlConfig, SqlOperation } from './types';
import { loadMySqlConfig } from './config/config.module';

const OPERATION_PATTERNS: Record<SqlOperation, RegExp> = {
  SELECT: /^SELECT\b/i,
  INSERT: /^INSERT\b/i,
  UPDATE: /^UPDATE\b/i,
  DELETE: /^DELETE\b/i,
  DDL: /^(CREATE|ALTER|DROP|TRUNCATE)\b/i,
  VIEW: /^(SHOW|DESCRIBE|EXPLAIN)\b/i,
  UNKNOWN: /./,
};

@Injectable()
export class PermissionGuardService {
  detectOperation(sql: string): SqlOperation {
    // 1. Strip comments
    // -- comment
    // /* comment */
    const stripped = sql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    for (const [operation, pattern] of Object.entries(OPERATION_PATTERNS)) {
      if (operation !== 'UNKNOWN' && pattern.test(stripped)) {
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

    // Extra safety: In DRY_RUN mode, only SELECT and VIEW are permitted
    // to prevent accidental data modification even if permissions allow it.
    if (config.dryRun && operation !== 'SELECT' && operation !== 'VIEW') {
      return {
        allowed: false,
        operation,
        message: `Only SELECT and VIEW operations are allowed in DRY_RUN mode. Current operation: ${operation}`,
      };
    }

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
