import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { ListTablesTool } from './list-tables.tool';
import { DescribeTableTool } from './describe-table.tool';
import { ExecuteQueryTool } from './execute-query.tool';
import { ListDatabasesTool } from './list-databases.tool';

@Module({
  imports: [
    McpModule.forFeature(
      [ListTablesTool, DescribeTableTool, ExecuteQueryTool, ListDatabasesTool],
      process.env.MCP_SERVER_NAME ?? 'mysql-mcp-server',
    ),
  ],
  providers: [
    ListTablesTool,
    DescribeTableTool,
    ExecuteQueryTool,
    ListDatabasesTool,
  ],
  exports: [
    ListTablesTool,
    DescribeTableTool,
    ExecuteQueryTool,
    ListDatabasesTool,
  ],
})
export class ToolsModule {}
