import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Lecturer } from '../lecturers/lecturer.entity';
import { Student } from '../students/entities/student.entity';
import { Institution } from '../institutions/insititution.entity';
import { LecturersService } from '../lecturers/lecturers.service';
import { StudentCourseEnrollment } from './entities/student-course-enrollment.entity';
import { StudentsService } from '../students/students.service';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(StudentCourseEnrollment)
    private readonly studentEnrollmentRepo: Repository<StudentCourseEnrollment>,
    private readonly lecturerService: LecturersService,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentService: StudentsService,
  ) {}

  async create(createCourseDto: CreateCourseDto, lecturer: Lecturer) {
    const { ...remainingDto } = createCourseDto;

    await this.lecturerService.findOneById(lecturer.id);

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
  async findAll(
    user: Student | Lecturer,
    whereClause?: FindOptionsWhere<Course>,
  ): Promise<Course[]> {
    return await this.courseRepository.findBy({
      ...whereClause,
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

  async enrollStudent(courseId: string, student: Student) {
    try {
      const course = await this.findOneById(courseId);
      const studentEnrollment = {
        course_id: courseId,
        student_id: student.id,
        student,
        course,
      };

      await this.studentEnrollmentRepo.save(studentEnrollment);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException('Student already enrolled for course');
      }

      throw error;
    }
  }

  async unenrollStudent(courseId: string, student: Student) {
    // check if course exists
    const course = await this.findOneById(courseId);
    // check if student is enrolled for course
    const studentEnrollment = await this.studentEnrollmentRepo.findOneBy({
      courseId: course.id,
      studentId: student.id,
    });

    if (!studentEnrollment) {
      throw new NotFoundException('Student is not enrolled to course');
    }

    await this.studentEnrollmentRepo.delete(studentEnrollment.id);
  }

  async fetchEnrolledStudents(courseId: string) {
    const course = await this.findOneById(courseId);
    return await this.studentService.findAll({
      coursesEnrollments: { courseId: course.id },
    });
  }
}
