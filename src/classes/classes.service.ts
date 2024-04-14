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
import {
  ClassFrequency,
  ClassStatus,
  NotificationType,
} from '../constants/enums';
import { set, isPast } from 'date-fns';
import { NotificationsService } from '../notifications/notifications.service';
import { StudentCourseEnrollment } from '../courses/entities/student-course-enrollment.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { Socket } from 'socket.io';
import { OnGoingingClassInstance } from './entities/ongoing-class-instance.entity';
import { Student } from 'src/students/entities/student.entity';
import { WsException } from '@nestjs/websockets';
import WsEvents from 'src/constants/websocket-events';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(CourseClass)
    private readonly courseClassRepository: Repository<CourseClass>,
    @InjectRepository(ClassInstance)
    private readonly classInstanceRepository: Repository<ClassInstance>,
    @InjectRepository(OnGoingingClassInstance)
    private readonly ongoingClassRepo: Repository<OnGoingingClassInstance>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    private dataSource: DataSource,
    private readonly notificationService: NotificationsService,
    @Inject(forwardRef(() => AttendanceService))
    private readonly attendanceService: AttendanceService,
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

  async findOneClassInstance(
    whereClause?: FindOptionsWhere<ClassInstance>,
  ): Promise<ClassInstance> {
    const classInstance =
      await this.classInstanceRepository.findOneBy(whereClause);
    if (!classInstance) {
      throw new NotFoundException('Class Instance does not exist!');
    }

    return classInstance;
  }

  async findOneClassInstanceById(
    classInstanceId: string,
  ): Promise<ClassInstance> {
    return await this.findOneClassInstance({
      id: classInstanceId,
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
      updatedCourseClass = await transactionManager.save<CourseClass, any>(
        CourseClass,
        courseClassUpdate,
      );

      // update any pending class instance.
      const pendingInstances = await this.classInstanceRepository.findBy({
        status: ClassStatus.Pending,
        baseId: courseClass.id,
      });

      const updatedClassInstances = pendingInstances.map((classInstance) => {
        const today = new Date();
        let currentWeekDate = updatedCourseClass.start_date;

        if (isPast(updatedCourseClass.start_date)) {
          const weeksPast = differenceInCalendarWeeks(
            updatedCourseClass.start_date,
            today,
          );
          currentWeekDate = addWeeks(updatedCourseClass.start_date, weeksPast);
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

      await transactionManager.save<ClassInstance, any>(
        ClassInstance,
        updatedClassInstances,
      );
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

  async startClass(classInstanceId: string, socket: Socket) {
    const classInstance = await this.findOneClassInstanceById(classInstanceId);
    if (classInstance.status === ClassStatus.Held) {
      throw new ConflictException('Class has already been held');
    }
    classInstance.status = ClassStatus.OnGoinging;
    await this.classInstanceRepository.save(classInstance);
    const students = await this.coursesService.fetchStudentEnrollments(
      {
        courseId: classInstance.base.course.id,
      },
      ['user.fcm_token'],
    );

    // Populate Attendance Records
    await this.attendanceService.populateAttendanceRecords(
      classInstance,
      students,
    );

    /// Create Ongoing class record to store the class state
    let onGoingClass = await this.findOrCreateOnGoingClass(
      classInstance,
      students,
    );

    // Send Notifications to Students
    await this.sendClassStartedNotification(classInstance, students);

    // create class rooms and add lecturers
    let { lecturerRoom, mainRoom } = this.getClassSocketRoom(classInstance);
    socket.join([mainRoom, lecturerRoom]);

    return onGoingClass;
  }

  async joinClass(socket: Socket, student: Student, classInstanceId: string) {
    // check existence of classInstance
    const classInstance = await this.findOneClassInstanceById(classInstanceId);

    // check that student is enrolled for class.
    const studentEnrollment =
      await this.coursesService.findOneStudentEnrollment({
        course: { id: classInstance.base.course.id },
        student: { id: student.id },
      });

    // check that class is ongoing
    if (classInstance.status != ClassStatus.OnGoinging) {
      throw new WsException('You can only join an ongoing class ');
    }

    // update ongoing class state
    const studentEnrollments =
      await this.coursesService.fetchStudentEnrollments({
        courseId: classInstance.base.course.id,
      });
    let onGoingClass = await this.findOrCreateOnGoingClass(
      classInstance,
      studentEnrollments,
    );
    const studentAlreadyJoined = onGoingClass.present_enrolled_students.find(
      (stu) => stu.studentId === studentEnrollment.studentId,
    );
    if (!studentAlreadyJoined) {
      onGoingClass.present_enrolled_students.push(studentEnrollment);
    }

    let { lecturerRoom, mainRoom } = this.getClassSocketRoom(classInstance);

    // Add student to main room.
    socket.join([mainRoom]);

    // inform lecturer of new joined student
    // emit 'student-joined-class' event to class instance room
    socket.to(lecturerRoom).emit(WsEvents.StudentJoinedClass, onGoingClass);
  }

  private sendClassStartedNotification(
    classInstance: ClassInstance,
    students: StudentCourseEnrollment[],
  ) {
    students.forEach(async (studentEnrollment) => {
      try {
        await this.notificationService.sendNotification({
          type: NotificationType.ClassStarted,
          user: studentEnrollment.student.user,
          title: 'Class Started',
          body: `${classInstance.base.course.course_code} class has started`,
          data: {
            message: 'Class Started',
            class_instance_id: classInstance.id,
          },
        });
      } catch (err) {
        console.log('Error Occured');
      }
    });
  }

  private getClassSocketRoom(classInstance: ClassInstance) {
    return {
      lecturerRoom: `ongoing-class-lecturer-${classInstance.base.course.lecturer.id}`,
      mainRoom: `ongoing-class-${classInstance.id}`,
    };
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

  private async findOrCreateOnGoingClass(
    classInstance: ClassInstance,
    enrolledStudents: StudentCourseEnrollment[],
  ) {
    let onGoingClass = await this.ongoingClassRepo.findOneBy({
      class_instance: { id: classInstance.id },
    });

    if (!onGoingClass) {
      onGoingClass = this.ongoingClassRepo.create({
        class_instance: classInstance,
      });

      await this.ongoingClassRepo.upsert(onGoingClass, {
        conflictPaths: { class_instance: true },
      });

      onGoingClass = await this.ongoingClassRepo.findOneBy({
        class_instance: { id: classInstance.id },
      });
    }

    onGoingClass.count_of_enrolled_students = enrolledStudents.length;
    onGoingClass.present_enrolled_students =
      onGoingClass.present_enrolled_students ?? [];

    return onGoingClass;
  }
}
