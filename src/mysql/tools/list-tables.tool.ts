import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { MySqlService } from '../mysql.service';

@Injectable()
export class ListTablesTool {
  constructor(private mysqlService: MySqlService) {}

  @Tool({
    name: 'list_tables',
    description: 'List all tables in the current database',
    parameters: z.object({}),
  })
  async listTables() {
    const tables = await this.mysqlService.listTables();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tables, null, 2),
        },
      ],
    };
  }
}
