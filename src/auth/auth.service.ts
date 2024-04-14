import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateProfileDto } from '../common/dtos/create-profile.dto';
import { Role } from '../constants/enums';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';
import { CreateLecturerDto } from '../lecturers/dto/create-lecturer.dto';
import { LecturersService } from '../lecturers/lecturers.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import JwtPayload from './interfaces/jwt-payload.interface';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { StudentsService } from '../students/students.service';
import { Lecturer } from '../lecturers/lecturer.entity';
import { Student } from '../students/entities/student.entity';
import EnvVars from '../constants/EnvVars';

@Injectable()
export class AuthService {
  constructor(
    private readonly lecturerService: LecturersService,
    private readonly studentService: StudentsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerLecturer(lecturerDto: CreateLecturerDto) {
    try {
      lecturerDto.user.password = await this.hashPassword(
        lecturerDto.user.password,
      );
      const newLecturer = await this.lecturerService.create(lecturerDto);
      return newLecturer;
    } catch (error) {
      console.error('Error: ', error);
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException(
          error?.detail ?? 'User with that email/username already exists',
        );
      }

      throw error;
    }
  }

  async registerStudent(studentDto: CreateStudentDto) {
    try {
      studentDto.user.password = await this.hashPassword(
        studentDto.user.password,
      );
      const newStudent = await this.studentService.create(studentDto);
      return newStudent;
    } catch (error) {
      console.error('Error: ', error);
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException(
          error?.detail ?? 'User with that email/username already exists',
        );
      }

      throw error;
    }
  }

  public async validateUser(
    emailOrUsername: string,
    plainTextPassword: string,
  ) {
    try {
      const user =
        await this.usersService.getByUsernameOrEmail(emailOrUsername);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      console.log('Error: ', error);
      throw error;
    }
  }

  async login(user: User, user_type: Role, fcm_token: string) {
    if (![Role.Admin, user_type].some((role) => user.roles.includes(role))) {
      throw new BadRequestException(
        `Authentication Failed: User is not a ${user_type}`,
      );
    }

    const profile = await this.getProfile(user.username, user_type);

    try {
      await this.usersService.updateFcmToken(user, fcm_token);
    } catch (error) {
      console.error('Error: ', error);
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException(error?.detail ?? 'Duplicate Fcm Token');
      }

      throw error;
    }

    const payload: JwtPayload = {
      username: user.username,
      user_id: user.id,
      user_type,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      profile,
    };
  }

  async getProfile(username: string, userType: Role) {
    let profile: Lecturer | Student;

    if (userType === Role.Lecturer) {
      profile = await this.lecturerService.findOneByUsername(username);
    } else if (userType === Role.Student) {
      profile = await this.studentService.findOneByUsername(username);
    } else {
      throw new HttpException(
        `${userType} Profile Not Implemented Yet`,
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    return profile;
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  private async hashPassword(plainTextPassword) {
    return await bcrypt.hash(plainTextPassword, 10);
  }

  async getProfileFromAuthToken(authToken: string) {
    try {
      const payload: JwtPayload = this.jwtService.verify(authToken, {
        secret: EnvVars.JWT_SECRET,
      });

      const userId = payload.user_id;

      if (userId) {
        return this.getProfile(payload.username, payload.user_type);
      }

      return null;
    } catch (err) {
      throw err;
    }
  }
}
