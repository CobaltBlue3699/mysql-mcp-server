import { Module } from '@nestjs/common';
import { ListTablesTool } from './list-tables.tool';
import { DescribeTableTool } from './describe-table.tool';
import { ExecuteQueryTool } from './execute-query.tool';
import { ListDatabasesTool } from './list-databases.tool';
import { PermissionGuardService } from '../permission.guard';

@Module({
  providers: [
    ListTablesTool,
    DescribeTableTool,
    ExecuteQueryTool,
    ListDatabasesTool,
    PermissionGuardService,
  ],
  exports: [
    ListTablesTool,
    DescribeTableTool,
    ExecuteQueryTool,
    ListDatabasesTool,
  ],
})
export class ToolsModule {}
