import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLecturerDto } from '../lecturers/dto/create-lecturer.dto';
import { Lecturer } from '../lecturers/lecturer.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {RequestWithUser, RequestWithProfile} from './interfaces/request-with-user.interface';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { Role } from '../constants/enums';
import { UpdateFcmTokenDto } from '../notifications/dto/update-fcm-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/lecturer')
  async registerLecturer(@Body() createLecturerDto: CreateLecturerDto) {
    return new Lecturer(
      await this.authService.registerLecturer(createLecturerDto),
    );
  }

  @Post('register/student')
  async registerStudent(@Body() createStudentDto: CreateStudentDto) {
    return new Lecturer(
      await this.authService.registerStudent(createStudentDto),
    );
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user, loginDto.user_type, loginDto.fcm_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('token')
  authenticate(
    @Req() req: RequestWithProfile,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ) {
    return this.authService.login(
      req.user.user,
      req.user.user.roles.find((val) => val !== Role.Admin),
      updateFcmTokenDto.fcm_token
    );
  }
}
