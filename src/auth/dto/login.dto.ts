import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../constants/enums';

export class LoginDto {
  @IsNotEmpty()
  emailOrUsername: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  user_type: Role;
}
