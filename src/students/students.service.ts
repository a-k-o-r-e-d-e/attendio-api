import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InstitutionsService } from '../institutions/institutions.service';
import { Role } from '../constants/enums';
import { CoursesService } from '../courses/courses.service';
import { ClassInstance } from '../classes/entities/class-instance.entity';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly institutionService: InstitutionsService,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { institution: insititutionId, ...remainingDto } = createStudentDto;

    const insititution =
      await this.institutionService.findOneById(insititutionId);

    const createStudentObj = {
      ...remainingDto,
      user: {
        ...createStudentDto.user,
        roles: [Role.Student],
      } as any,
      insititution: insititution,
    };

    const newStudent = this.studentRepository.create(createStudentObj);

    newStudent.institution = insititution;

    return await this.studentRepository.save(newStudent);
  }

  async findAll(whereClause?: FindOptionsWhere<Student>): Promise<Student[]> {
    return await this.studentRepository.findBy(whereClause);
  }

  private async findOne(whereClause: FindOptionsWhere<Student>) {
    const student = await this.studentRepository.findOneBy(whereClause);
    if (!student) {
      throw new NotFoundException('Student  does not exist');
    }
    return student;
  }

  async findOneById(id: string): Promise<Student> {
    const student = await this.findOne({ id });
    if (!student) {
      throw new NotFoundException('Student with this id does not exist');
    }
    return student;
  }

  async findOneByEmail(email: string): Promise<Student> {
    const student = await this.findOne({
      user: {
        email,
      },
    });

    if (!student) {
      throw new NotFoundException('Student with this email does not exist');
    }
    return student;
  }

  async findOneByUsername(username: string): Promise<Student> {
    const student = await this.findOne({
      user: {
        username,
      },
    });

    if (!student) {
      throw new NotFoundException('Student with this username does not exist');
    }
    return student;
  }

  async update(student: Student, studentDto: UpdateStudentDto) {
    /// We perform update this way to ensure we update the referenced user table also.
    // It is expected that we have used data validation to ensure only allowed/updatable values are passed to this function
    const studentUpdate = {
      ...student,
      ...studentDto,
      user: {
        ...student.user,
        // email is currently the only value allowed to be updated using the update student endpoint
        email: studentDto.user?.email ?? student.user.email,
      },
    };

    await this.studentRepository.save(studentUpdate);

    return await this.findOneById(student.id);
  }

  async delete(id: string) {
    const student = await this.findOneById(id);
    if (!student) {
      throw new NotFoundException('Student does not exist!');
    }
    await this.studentRepository.delete(id);
  }

  /// Fetch the courses logged in student has enrolled for.
  async fetchMyCourses(student: Student) {
    return await this.coursesService.findAll(student, {
      studentsEnrollments: {
        studentId: student.id,
      },
    });
  }

  async fetchMyClassInstances(student: Student): Promise<ClassInstance[]> {
    return await this.classesService.findAllClassInstances({
      base: {
        course: {
          studentsEnrollments: {
            studentId: student.id,
          },
        },
      },
    });
  }
}
