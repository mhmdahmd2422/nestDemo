import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Match } from '../../helpers/validation/match.decorator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  password: string

  @Match('password')
  password_confirmation: string

  @IsNotEmpty()
  @IsString()
  role: UserRole
}
