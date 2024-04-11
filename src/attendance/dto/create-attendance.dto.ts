import { IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  class_instance_id: string;
}
