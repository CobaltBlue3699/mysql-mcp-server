import { Module, Global } from '@nestjs/common';
import { MySqlService } from './mysql.service';
import { PermissionGuardService } from './permission.guard';

@Global()
@Module({
  providers: [MySqlService, PermissionGuardService],
  exports: [MySqlService, PermissionGuardService],
})
export class MySqlModule {}
