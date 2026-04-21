import {
  ConsoleLogger,
  Injectable,
  LogLevel,
  OnModuleDestroy,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { loadMySqlConfig } from './config.module';

@Injectable()
export class MySqlLoggerService
  extends ConsoleLogger
  implements OnModuleDestroy
{
  // NestJS uses 'log' instead of 'info' — map project levels to NestJS equivalents.
  private static readonly LEVEL_MAP: Partial<Record<string, LogLevel>> = {
    info: 'log',
  };

  private logDir: string;
  private isStdio: boolean;
  private readonly streams = new Map<string, fs.WriteStream>();

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
    const nestLevel = (MySqlLoggerService.LEVEL_MAP[config.logging.level] ??
      config.logging.level) as LogLevel;
    const levelIndex = logLevels.indexOf(nestLevel);
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

  onModuleDestroy() {
    for (const stream of this.streams.values()) {
      stream.end();
    }
    this.streams.clear();
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

  private getStream(level: string): fs.WriteStream {
    if (!this.streams.has(level)) {
      const filePath = path.join(this.logDir, `${level}.log`);
      const stream = fs.createWriteStream(filePath, { flags: 'a' });
      stream.on('error', (err) => {
        process.stderr.write(`Log stream error [${level}]: ${err.message}\n`);
      });
      this.streams.set(level, stream);
    }
    return this.streams.get(level)!;
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
      this.getStream(level).write(logMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Failed to write to log file: ${errorMessage}\n`);
    }
  }
}
