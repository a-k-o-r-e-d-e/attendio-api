import { IsNotEmpty } from 'class-validator';

export class UpdateFcmTokenDto {
  @IsNotEmpty()
  fcm_token: string;
}
