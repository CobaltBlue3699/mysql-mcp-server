import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { loadMySqlConfig } from './config.module';

@Injectable()
export class MySqlLoggerService extends ConsoleLogger {
  private logDir: string;
  private isStdio: boolean;

  constructor() {
    const config = loadMySqlConfig();
    const logLevels: LogLevel[] = [
      'error',
      'warn',
      'log',
      'debug',
      'verbose',
      'fatal',
    ];
    const levelIndex = logLevels.indexOf(config.logging.level as LogLevel);
    const activeLevels =
      levelIndex !== -1 ? logLevels.slice(0, levelIndex + 1) : logLevels;

    super('MySQL-MCP', {
      logLevels: activeLevels,
    });

    this.logDir = config.logging.dir;
    this.isStdio = config.mcp.type === 'stdio';

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message: any, context?: string) {
    if (!this.isLevelEnabled('log')) return;
    super.log(message, context);
    this.writeToFile('info', message, context);
  }

  error(message: any, stack?: string, context?: string) {
    if (!this.isLevelEnabled('error')) return;
    super.error(message, stack, context);
    this.writeToFile('error', message, context, stack);
  }

  warn(message: any, context?: string) {
    if (!this.isLevelEnabled('warn')) return;
    super.warn(message, context);
    this.writeToFile('warn', message, context);
  }

  debug(message: any, context?: string) {
    if (!this.isLevelEnabled('debug')) return;
    super.debug(message, context);
    this.writeToFile('debug', message, context);
  }

  verbose(message: any, context?: string) {
    if (!this.isLevelEnabled('verbose')) return;
    super.verbose(message, context);
    this.writeToFile('verbose', message, context);
  }

  fatal(message: any, context?: string) {
    if (!this.isLevelEnabled('fatal')) return;
    super.fatal(message, context);
    this.writeToFile('fatal', message, context);
  }

  /**
   * Overriding this method to ensure logs go to stderr when using stdio transport
   * to avoid breaking the MCP protocol which uses stdout.
   */
  protected printMessages(
    messages: string[],
    context?: string,
    logLevel?: LogLevel,
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    const stream = this.isStdio ? 'stderr' : writeStreamType || 'stdout';
    super.printMessages(messages, context, logLevel, stream);
  }

  private writeToFile(
    level: string,
    message: any,
    context?: string,
    stack?: string,
  ) {
    try {
      const timestamp = new Date().toISOString();
      const ctx = context ? ` [${context}]` : '';
      const stk = stack ? `\n${stack}` : '';
      const logMessage = `[${timestamp}] [${level.toUpperCase()}]${ctx} ${message}${stk}\n`;

      const filePath = path.join(this.logDir, `${level}.log`);
      // Use synchronous for simplicity in this project as it matches previous behavior
      // but ideally this should be a stream in a high-traffic app.
      fs.appendFileSync(filePath, logMessage);
    } catch (err) {
      // Fallback to stderr if file writing fails
      const errorMessage = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Failed to write to log file: ${errorMessage}\n`);
    }
  }
}
