import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, loadMySqlConfig } from './mysql/config/config.module';
import { LoggerModule } from './mysql/config/logger.module';
import { MySqlModule } from './mysql/mysql.module';
import { ToolsModule } from './mysql/tools/tools.module';
import { PermissionGuardService } from './mysql/permission.guard';
import { McpModule } from '@rekog/mcp-nest';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot(),
    MySqlModule,
    ToolsModule,
    McpModule.forRootAsync({
      useFactory: () => {
        const config = loadMySqlConfig();
        return {
          name: config.mcp.serverName,
          version: config.mcp.serverVersion,
          transport: config.mcp.type,
          ...(config.mcp.type !== 'stdio' && {
            host: config.mcp.host,
            port: config.mcp.port,
          }),
        };
      },
      inject: [],
    }),
  ],
  providers: [PermissionGuardService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    this.logger.log('MySQL MCP Server initialized');
  }
}
