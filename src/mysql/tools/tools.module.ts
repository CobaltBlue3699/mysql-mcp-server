import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { ListTablesTool } from './list-tables.tool';
import { DescribeTableTool } from './describe-table.tool';
import { ExecuteQueryTool } from './execute-query.tool';
import { ListDatabasesTool } from './list-databases.tool';
import { loadMySqlConfig } from '../config/config.module';

const config = loadMySqlConfig();

@Module({
  imports: [
    McpModule.forFeature(
      [ListTablesTool, DescribeTableTool, ExecuteQueryTool, ListDatabasesTool],
      config.mcp.serverName,
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
