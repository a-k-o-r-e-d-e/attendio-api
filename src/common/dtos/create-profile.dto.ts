import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export abstract class CreateProfileDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @IsNotEmpty()
  gender: string;

  @IsPhoneNumber('NG')
  phone_number: string;

  @IsUUID()
  institution: string;

  @IsNotEmpty()
  faculty: string;

  @IsNotEmpty()
  department: string;
}
