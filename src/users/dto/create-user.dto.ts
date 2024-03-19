import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { IsCustomStrongPassword } from '../strong-password.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsCustomStrongPassword()
  password: string;
}
