import {
  Controller,
  Get,
  Body,
  Req,
  UseGuards,
  Put,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Student } from './entities/student.entity';
import RolesGuard from '../auth/guards/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../constants/enums';
import { RequestWithProfile } from '../auth/interfaces/request-with-user.interface';
import { Course } from '../courses/entities/course.entity';
import { ClassInstance } from '../classes/entities/class-instance.entity';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(Role.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  getMyProfile(@Req() req): Promise<Student> {
    return req.user;
  }

  @Roles(Role.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('me')
  editStudentProfile(
    @Body() updateStudentDto: UpdateStudentDto,
    @Req() req,
  ): Promise<Student> {
    return this.studentsService.update(req.user, updateStudentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Student> {
    return this.studentsService.findOneById(id);
  }

  @Roles(Role.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/courses')
  async fetchMyCourses(@Req() req: RequestWithProfile): Promise<Course[]> {
    return this.studentsService.fetchMyCourses(req.user as Student);
  }

  @Roles(Role.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/classes/instances')
  async fetchMyClassInstances(
    @Req() req: RequestWithProfile,
  ): Promise<ClassInstance[]> {
    return this.studentsService.fetchMyClassInstances(req.user as Student);
  }
}
