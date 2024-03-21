import { Controller, Get, Body, Req, UseGuards, Put } from '@nestjs/common';
import { StudentsService } from './students.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Student } from './entities/student.entity';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getById(@Req() req): Promise<Student> {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  editStudentProfile(
    @Body() updateStudentDto: UpdateStudentDto,
    @Req() req,
  ): Promise<Student> {
    return this.studentsService.update(req.user, updateStudentDto);
  }
}
