import { IsNotEmpty } from 'class-validator';
import { CreateProfileDto } from '../../common/dtos/create-profile.dto';

export class CreateStudentDto extends CreateProfileDto {
  @IsNotEmpty()
  matric_no: string;
}
