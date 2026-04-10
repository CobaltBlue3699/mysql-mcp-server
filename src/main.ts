import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadMySqlConfig } from './mysql/config/config.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  logger.log('Starting MySQL MCP Server...');

  const config = loadMySqlConfig();
  logger.log(
    `Database: ${config.database.host}:${config.database.port}/${config.database.name}`,
  );
  logger.log(`MCP Transport: ${config.mcp.type}`);
  logger.log(`Log Level: ${config.logging.level}`);

  if (config.dryRun) {
    logger.warn('DRY_RUN mode is enabled - query results will not be returned');
  }

  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    logger.warn(
      `Missing optional environment variables: ${missing.join(', ')}`,
    );
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  await app.init();

  logger.log(`MCP Server ready on ${config.mcp.type} transport`);
  logger.log(`Server: ${config.mcp.serverName} v${config.mcp.serverVersion}`);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
