import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserException } from './user.exception';
import { ExceptionService } from '../core/exception';
import { DatabaseHelperModule } from '../helpers/database/database.helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), DatabaseHelperModule],
  controllers: [UsersController],
  providers: [UsersService, UserException, ExceptionService], // Provide the missing dependency
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
