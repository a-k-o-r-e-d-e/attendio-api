import { IsUUID } from 'class-validator';

export class ClassInstanceWsEventDto {
  @IsUUID()
  class_instance_id: string;
}
