import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { MySqlService } from '../mysql.service';

@Injectable()
export class DescribeTableTool {
  constructor(private mysqlService: MySqlService) {}

  @Tool({
    name: 'describe_table',
    description: 'Get the structure of a specific table',
    parameters: z.object({
      tableName: z
        .string()
        .regex(
          /^[\w$]+$/,
          'Table name must contain only letters, digits, underscores, or $',
        )
        .describe('The name of the table to describe'),
    }),
  })
  async describeTable({ tableName }: { tableName: string }) {
    if (!/^[\w$]+$/.test(tableName)) {
      throw new Error(`Invalid table name: "${tableName}"`);
    }
    const description = await this.mysqlService.describeTable(tableName);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(description, null, 2),
        },
      ],
    };
  }
}
