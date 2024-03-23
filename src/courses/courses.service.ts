import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Lecturer } from '../lecturers/lecturer.entity';
import { Student } from '../students/entities/student.entity';
import { Institution } from '../institutions/insititution.entity';
import { LecturersService } from '../lecturers/lecturers.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly lecturerService: LecturersService,
  ) {}

  async create(createCourseDto: CreateCourseDto, lecturer: Lecturer) {
    const { ...remainingDto } = createCourseDto;

    await this.lecturerService.getById(lecturer.id);

    const createCourseObj = {
      ...remainingDto,
      insititution: lecturer.institution,
      lecturer,
    };

    const newCourse = this.courseRepository.create(createCourseObj);

    newCourse.institution = lecturer.institution;
    newCourse.lecturer = lecturer;

    return await this.courseRepository.save(newCourse);
  }

  // User is used to restrict the returned courses to user's insitution
  async findAll(user: Student | Lecturer): Promise<Course[]> {
    return await this.courseRepository.findBy({
      institution: {
        id: user.institution.id,
      },
    });
  }

  private async findOne(
    whereClause: FindOptionsWhere<Course>,
  ): Promise<Course> {
    const course = await this.courseRepository.findOneBy(whereClause);
    if (!course) {
      throw new NotFoundException('Course does not exist');
    }
    return course;
  }

  async findOneById(id: string): Promise<Course> {
    return await this.findOne({ id });
  }

  async findOneByCourseCode(course_code: string): Promise<Course> {
    return await this.findOne({ course_code });
  }

  // User is used to restrict the returned courses to user's insitution
  async search(
    searchText: string,
    user: Student | Lecturer,
  ): Promise<Course[]> {
    const searchTextLower = searchText ? searchText.toLowerCase() : '';
    const institutionClause: { institution: FindOptionsWhere<Institution> } = {
      institution: {
        id: user.institution.id,
      },
    };
    return await this.courseRepository.findBy([
      {
        course_code: ILike(`%${searchTextLower}%`),
        ...institutionClause,
      },
      {
        title: ILike(`%${searchTextLower}%`),
        ...institutionClause,
      },
    ]);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOneById(id);

    const courseUpdate = {
      ...course,
      ...updateCourseDto,
    };

    await this.courseRepository.save(courseUpdate);

    return await this.findOneById(course.id);
  }

  async remove(id: string) {
    const course = await this.findOneById(id);
    if (!course) {
      throw new NotFoundException('Course does not exist!');
    }
    await this.courseRepository.delete(id);
  }
}
