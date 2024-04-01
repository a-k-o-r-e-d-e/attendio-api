import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseClassDto } from './dto/create-class.dto';
import { UpdateCourseClassDto } from './dto/update-class.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseClass } from './entities/course-class.entity';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesService } from '../courses/courses.service';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';
import { ClassFrequency } from '../constants/enums';
import { endOfWeek, set } from 'date-fns';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(CourseClass)
    private readonly courseClassRepository: Repository<CourseClass>,
    @InjectRepository(ClassInstance)
    private readonly classInstanceRepository: Repository<ClassInstance>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    private dataSource: DataSource,
  ) {}

  async create(createClassDto: CreateCourseClassDto) {
    try {
      // Check existence of course
      const course = await this.coursesService.findOneById(
        createClassDto.courseId,
      );

      let classInstance: ClassInstance;

      await this.dataSource.transaction(async (transactionManager) => {
        let createCourseClassObj = this.courseClassRepository.create({
          ...createClassDto,
          course,
        });

        let newCourseClass =
          await transactionManager.save<CourseClass>(createCourseClassObj);

        classInstance = await this.createFirstClassInstance(
          newCourseClass,
          transactionManager,
        );
      });

      return classInstance;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          'A Class Already Exists for this date and time',
        );
      }

      throw error;
    }
  }

  async findAllCourseClasses(
    whereClause?: FindOptionsWhere<CourseClass>,
  ): Promise<CourseClass[]> {
    return await this.courseClassRepository.findBy(whereClause);
  }

  async findAllClassInstances(
    whereClause?: FindOptionsWhere<ClassInstance>,
  ): Promise<ClassInstance[]> {
    return await this.classInstanceRepository.findBy(whereClause);
  }

  async findOneCourseClass(
    whereClause?: FindOptionsWhere<CourseClass>,
  ): Promise<CourseClass> {
    const courseClass = await this.courseClassRepository.findOneBy(whereClause);
    if (!courseClass) {
      throw new NotFoundException('Class does not exist!');
    }

    return courseClass;
  }

  async findOneCourseClassById(courseClassId: string): Promise<CourseClass> {
    return await this.findOneCourseClass({
      id: courseClassId,
    });
  }

  update(id: number, updateClassDto: UpdateCourseClassDto) {
    return `This action updates a #${id} class`;
  }

  async remove(id: string) {
    const course = await this.findOneCourseClassById(id);
    if (!course) {
      throw new NotFoundException('Class does not exist!');
    }
    await this.courseClassRepository.delete(id);
  }

  async createFirstClassInstance(
    courseClass: CourseClass,
    transactionManager?: EntityManager,
  ) {
    try {
      const [startTimeHour, startTimeMin] = courseClass.start_time.split(':');
      const [endTimeHour, endTimeMin] = courseClass.start_time.split(':');
      const start_time = set(courseClass.start_date, {
        hours: +startTimeHour,
        minutes: +startTimeMin,
        seconds: 0,
      });
      const end_time = set(courseClass.start_date, {
        hours: +endTimeHour,
        minutes: +endTimeMin,
        seconds: 0,
      });

      const classInstance = this.classInstanceRepository.create({
        date: courseClass.start_date,
        start_time,
        end_time,
        baseId: courseClass.id,
        // base: courseClass,
      });

      if (transactionManager) {
        return await transactionManager.save<ClassInstance>(classInstance);
      } else {
        return await this.classInstanceRepository.save(classInstance);
      }
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException('Class Instance Already Exists');
      }

      throw error;
    }
  }

  createCurrentWeekClassInstances(courseClass: CourseClass) {
    if (courseClass.frequency == ClassFrequency.Weekly) {
      const endOfCurrWeek = endOfWeek(new Date());
      // const isStartDatePast =
    }
  }
}
