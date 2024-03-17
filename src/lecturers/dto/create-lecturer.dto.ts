import { CreateProfileDto } from 'src/common/dtos/create-profile.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateLecturerDto extends CreateProfileDto {}

export class CreateLecturerAndUserDto extends CreateLecturerDto {
    user: CreateUserDto
}