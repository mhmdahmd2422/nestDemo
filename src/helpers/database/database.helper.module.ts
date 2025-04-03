import { Module } from '@nestjs/common'
import { DatabaseHelper } from './database.helper'
import { ExceptionModule } from '../../core/exception';

@Module({
  imports: [ExceptionModule],
  providers: [DatabaseHelper],
  exports: [DatabaseHelper],
})
export class DatabaseHelperModule {}
