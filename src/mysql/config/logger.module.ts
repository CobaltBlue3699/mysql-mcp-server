import { Module, Global } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LoggingConfig } from './mysql.config';
import { loadMySqlConfig } from './config.module';

@Global()
@Module({})
export class LoggerModule {
  static forRoot() {
    const config = loadMySqlConfig();
    const loggingConfig: LoggingConfig = config.logging;

    const logDir = loggingConfig.dir;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const levels: Record<string, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    const currentLevel = levels[loggingConfig.level] ?? 1;

    const log = (level: string, message: string, ...args: unknown[]) => {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

      const logFn = levels[level] >= currentLevel ? console.log : () => {};
      logFn(logMessage, ...args);

      const filePath = path.join(logDir, `${level}.log`);
      fs.appendFileSync(
        filePath,
        `${logMessage} ${args.map((a) => JSON.stringify(a)).join(' ')}\n`,
      );
    };

    const logger = {
      debug: (msg: string, ...args: unknown[]) => log('debug', msg, ...args),
      log: (msg: string, ...args: unknown[]) => log('info', msg, ...args),
      warn: (msg: string, ...args: unknown[]) => log('warn', msg, ...args),
      error: (msg: string, ...args: unknown[]) => log('error', msg, ...args),
    };

    return {
      module: LoggerModule,
      providers: [
        {
          provide: 'LOGGER_SERVICE',
          useValue: logger,
        },
      ],
      exports: ['LOGGER_SERVICE'],
    };
  }
}
