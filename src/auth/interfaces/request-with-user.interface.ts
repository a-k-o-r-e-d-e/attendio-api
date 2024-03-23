import { Request } from 'express';
import { Lecturer } from '../../lecturers/lecturer.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/user.entity';

export interface RequestWithProfile extends Request {
  user: Lecturer | Student;
}

export interface RequestWithUser extends Request {
  user: User;
}
