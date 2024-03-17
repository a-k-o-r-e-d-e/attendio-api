import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProfileDto } from 'src/common/dtos/create-profile.dto';
import { Role } from 'src/constants/enums';
import { PostgresErrorCode } from 'src/database/postgres-errorcodes.enum';
import { CreateLecturerDto } from 'src/lecturers/dto/create-lecturer.dto';
import { LecturersService } from 'src/lecturers/lecturers.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import JwtPayload from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly lecturerService: LecturersService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerLecturer(lecturerDto: CreateLecturerDto) {
    try {
      const newLecturer = await this.lecturerService.create({
        ...lecturerDto,
        user: await this.extractUser(lecturerDto, Role.Lecturer),
      });
      return newLecturer;
    } catch (error) {
      console.error('Error: ', error);
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          error?.detail ?? 'User with that email/username already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login(user: User, userType: Role) {
    if (user.type != Role.Admin && userType != user.type) {
      throw new HttpException(
        `Authentication Failed: User is not a ${userType}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const profile = await this.getProfile(user.username, userType);

    const payload: JwtPayload = {
      username: user.username,
      user_id: user.id,
      user_type: userType,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      profile,
    };
  }

  async getProfile(username: string, userType: Role) {
    let profile;

    if (userType === Role.Lecturer) {
      profile = await this.lecturerService.getByUsername(username);
    } else {
      throw new HttpException(
        'Student Profile Not Implemented Yet',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    return profile;
  }

  private async extractUser(profile: CreateProfileDto, role: Role) {
    return {
      email: profile.email,
      username: profile.username,
      password: await bcrypt.hash(profile.password, 10),
      type: role,
    };
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
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
