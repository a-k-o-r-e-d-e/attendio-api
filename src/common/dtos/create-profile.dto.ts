import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';

export abstract class CreateProfileDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Your password is not strong enough. Password must be atleast 8 characters long, contain 1 lowercase character, 1 uppercase character and 1 number',
    },
  )
  password: string;

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
