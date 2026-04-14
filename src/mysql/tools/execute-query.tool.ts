import { Injectable, ForbiddenException } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { MySqlService } from '../mysql.service';
import { PermissionGuardService } from '../permission.guard';
import { loadMySqlConfig } from '../config/config.module';

@Injectable()
export class ExecuteQueryTool {
  constructor(
    private mysqlService: MySqlService,
    private permissionGuard: PermissionGuardService,
  ) {}

  @Tool({
    name: 'execute_query',
    description: 'Execute a SELECT query on the database',
    parameters: z.object({
      sql: z.string().describe('The SQL query to execute'),
      timeout: z.number().optional().describe('Query timeout in milliseconds'),
    }),
  })
  async executeQuery({ sql, timeout }: { sql: string; timeout?: number }) {
    const permission = this.permissionGuard.checkPermission(sql);

    if (!permission.allowed) {
      throw new ForbiddenException(permission.message);
    }

    const config = loadMySqlConfig();
    const isDryRun = config.dryRun;

    // According to specification: DRY_RUN mode SHALL execute the query
    // to return metadata and actual rowCount, but SHALL NOT return rows data.
    const result = await this.mysqlService.executeQuery(sql, timeout);

    if (isDryRun) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                dryRun: true,
                columns: result.columns,
                rowCount: result.rowCount,
                rows: null,
                message:
                  'DRY_RUN mode: Query validated but data not returned. Set DRY_RUN=false to get actual data.',
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
}
