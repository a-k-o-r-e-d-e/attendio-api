import { differenceInCalendarWeeks, addWeeks } from 'date-fns';
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
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesService } from '../courses/courses.service';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';
import { ClassFrequency, ClassStatus } from '../constants/enums';
import { set, isPast} from 'date-fns';

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
          title: createClassDto.title ?? course.title,
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

  async update(id: string, updateClassDto: UpdateCourseClassDto) {
    const courseClass = await this.findOneCourseClassById(id);

    const courseClassUpdate = {
      ...courseClass,
      ...updateClassDto,
    };

    let updatedCourseClass: CourseClass;

    await this.dataSource.transaction(async (transactionManager) => {
      updatedCourseClass =
        await transactionManager.save<CourseClass, any>(CourseClass, courseClassUpdate);

      // update any pending class instance.
      const pendingInstances = await this.classInstanceRepository.findBy({
        status: ClassStatus.Pending,
        baseId: courseClass.id,
      });

      const updatedClassInstances = pendingInstances.map((classInstance) => {
        const today = new Date ();
        let currentWeekDate = updatedCourseClass.start_date;

        if (isPast(updatedCourseClass.start_date)) {
          const weeksPast = differenceInCalendarWeeks(
            updatedCourseClass.start_date,
            today,
          );
          currentWeekDate = addWeeks(
            updatedCourseClass.start_date,
            weeksPast,
          );
        }        

        const { start_time, end_time } =
          this.computeClassInstanceStartAndEndTime(
            updatedCourseClass,
            currentWeekDate,
          );

        classInstance = {
          ...classInstance,
          start_time,
          end_time,
        };

        return classInstance;
      });

      await transactionManager.save<ClassInstance, any>(ClassInstance, updatedClassInstances);
    });

    return updatedCourseClass;
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
      const classInstance = this.computeClassInstance(
        courseClass,
        courseClass.start_date,
      );

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

  async createCurrentWeekClassInstances(transactionManager: EntityManager) {
    try {
      const today = new Date();

      const activeWeeklyClasses = await this.courseClassRepository.findBy({
        frequency: ClassFrequency.Weekly,
        start_date: LessThanOrEqual(today),
        end_date: MoreThanOrEqual(today),
      });

      // console.log("Active Classes:: ", activeWeeklyClasses);

      const classInstances = activeWeeklyClasses.map((courseClass) => {
        const weeksPast = differenceInCalendarWeeks(
          courseClass.start_date,
          today,
        );
        const currentWeekDate = addWeeks(courseClass.start_date, weeksPast);

        return this.computeClassInstance(courseClass, currentWeekDate);
      });

      await transactionManager.upsert(ClassInstance, classInstances, [
        'date',
        'baseId',
      ]);

      console.log('upsert Successful');
    } catch (err) {
      console.log('Error :: ', err);
    }
  }

  /// creates the class instance but does not save to the DB
  private computeClassInstance(courseClass: CourseClass, date: Date) {
    const { start_time, end_time } = this.computeClassInstanceStartAndEndTime(
      courseClass,
      date,
    );

    return this.classInstanceRepository.create({
      date: date,
      start_time,
      end_time,
      baseId: courseClass.id,
    });
  }

  private computeClassInstanceStartAndEndTime(
    courseClass: CourseClass,
    date: Date,
  ) {
    const [startTimeHour, startTimeMin] = courseClass.start_time.split(':');
    const [endTimeHour, endTimeMin] = courseClass.end_time.split(':');
    const start_time = set(date, {
      hours: +startTimeHour,
      minutes: +startTimeMin,
      seconds: 0,
    });
    const end_time = set(date, {
      hours: +endTimeHour,
      minutes: +endTimeMin,
      seconds: 0,
    });

    return { start_time, end_time };
  }
}
