import { CreateLecturerDto } from '../lecturers/dto/create-lecturer.dto';
import { Role } from '../constants/enums';
import { Lecturer } from '../lecturers/lecturer.entity';
import { User } from 'src/users/user.entity';

interface LecturerPartial extends Partial<Omit<User, 'user'>> {
  user?: Partial<User>;
}

export function buildLecturerMock(partial?: LecturerPartial): Lecturer {
  return {
    id: '123e4567-e89b-12d3-a456-426614174001', // Mock lecturer UUID
    title: 'Dr.',
    first_name: 'John',
    last_name: 'Doe',
    gender: 'Male',
    phone_number: '1234567890',
    // institution: '123e4567-e89b-12d3-a456-426614174000', // Mock institution UUID
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
    user: {
      id: '123e4567-e89b-12d3-a456-426614174002', // Mock user UUID
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: 'HashedPassword', // Mock hashed password
      roles: [Role.Lecturer], // Assuming lecturer role
      created_at: new Date(),
      updated_at: new Date(),
      ...partial?.user,
    },
  };
}

export function buildCreateLecturerDtoMock(
  partial?: Partial<CreateLecturerDto>,
): CreateLecturerDto {
  return {
    title: 'Dr.',
    first_name: 'John',
    last_name: 'Doe',
    gender: 'Male',
    phone_number: '1234567890',
    institution: '123e4567-e89b-12d3-a456-426614174000', // Mock institution UUID
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    ...partial,
    user: {
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: 'Password@123',
      ...partial?.user,
    },
  };
}
