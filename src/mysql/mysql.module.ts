import { Module, Global } from '@nestjs/common';
import { MySqlService } from './mysql.service';

@Global()
@Module({
  providers: [MySqlService],
  exports: [MySqlService],
})
export class MySqlModule {}
