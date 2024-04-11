import { IsUUID } from 'class-validator';

export class StartClassDto {
  @IsUUID()
  class_instance_id: string;
}
