import { Role } from '../constants/enums';
import { LoginDto } from '../auth/dto/login.dto';

export const buildLoginDTOMock = (partial?: Partial<LoginDto>) => {
  return {
    emailOrUsername: 'john.doe@example.com',
    password: 'Password123!',
    user_type: Role.Lecturer,
     fcm_token: 'random-token',
    ...partial,
  };
};
