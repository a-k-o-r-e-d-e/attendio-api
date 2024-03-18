import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Allow } from 'class-validator';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['email']),
) {}
