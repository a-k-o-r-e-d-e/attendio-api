import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Query,
  Put,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../constants/enums';
import RolesGuard from '../auth/guards/role.guard';
import { RequestWithProfile } from '../auth/interfaces/request-with-user.interface';
import { Student } from '../students/entities/student.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles(Role.Lecturer, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Req() req, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    return await this.coursesService.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  async search(@Query('searchText') searchText: string, @Req() req) {
    return await this.coursesService.search(searchText, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.coursesService.findOneById(id);
  }

  @Roles(Role.Lecturer, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return await this.coursesService.update(id, updateCourseDto);
  }

  @Roles(Role.Lecturer, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.coursesService.remove(id);
    return {
      message: 'Successful',
    };
  }

  @Roles(Role.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/enroll')
  async enrollStudent(
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Req() req: RequestWithProfile,
  ) {
    await this.coursesService.enrollStudent(courseId, req.user as Student);

    return { message: 'Successful' };
  }

  @Roles(Role.Lecturer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/students')
  async fetchEnrolledStudents(
    @Param('id', new ParseUUIDPipe()) courseId: string,
  ) {
    return await this.coursesService.fetchEnrolledStudents(courseId);
  }
}
