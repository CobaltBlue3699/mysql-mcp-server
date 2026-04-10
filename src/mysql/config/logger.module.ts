import { Module, Global } from '@nestjs/common';
import { MySqlLoggerService } from './logger.service';

@Global()
@Module({
  providers: [MySqlLoggerService],
  exports: [MySqlLoggerService],
})
export class LoggerModule {}
