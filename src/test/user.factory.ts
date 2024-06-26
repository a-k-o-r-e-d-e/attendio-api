import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

export const buildUserMock = (inputs?: Partial<User>) => {
  return {
    id: '1',
    username: 'testUser',
    email: 'test@example.com',
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
    fcm_token: 'sample_token',
    ...inputs,
    password:
      inputs?.password ?? bcrypt.hashSync(inputs?.password ?? 'password', 10),
  };
};
