#!/usr/bin/env node
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadMySqlConfig } from './mysql/config/config.module';
import { MySqlLoggerService } from './mysql/config/logger.service';

async function bootstrap() {
  const loggerService = new MySqlLoggerService();
  const ctx = 'Bootstrap';

  loggerService.log('Starting MySQL MCP Server...', ctx);

  const config = loadMySqlConfig();
  loggerService.log(
    `Database: ${config.database.host}:${config.database.port}/${config.database.name}`,
    ctx,
  );
  loggerService.log(`MCP Transport: ${config.mcp.type}`, ctx);
  loggerService.log(`Log Level: ${config.logging.level}`, ctx);
  loggerService.log(`Log dir: ${path.resolve(config.logging.dir)}`, ctx);

  if (config.dryRun) {
    loggerService.warn(
      'DRY_RUN mode is enabled - query results will not be returned',
      ctx,
    );
  }

  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    loggerService.warn(
      `Missing optional environment variables: ${missing.join(', ')}`,
      ctx,
    );
  }

  const app = await NestFactory.create(AppModule, {
    logger: loggerService,
  });

  await app.init();

  loggerService.log(`MCP Server ready on ${config.mcp.type} transport`, ctx);
  loggerService.log(
    `Server: ${config.mcp.serverName} v${config.mcp.serverVersion}`,
    ctx,
  );
}

bootstrap().catch((err) => {
  const loggerService = new MySqlLoggerService();
  const message =
    err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
  loggerService.error('Failed to bootstrap application', message, 'Bootstrap');
  process.stderr.write(`Failed to bootstrap application: ${message}\n`);
  loggerService.onModuleDestroy();
  process.exit(1);
});
