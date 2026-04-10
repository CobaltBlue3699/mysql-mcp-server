import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { MySqlService } from '../mysql.service';

@Injectable()
export class ListDatabasesTool {
  constructor(private mysqlService: MySqlService) {}

  @Tool({
    name: 'list_databases',
    description: 'List all available databases',
    parameters: z.object({}),
  })
  async listDatabases() {
    const databases = await this.mysqlService.listDatabases();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(databases, null, 2),
        },
      ],
    };
  }
}
