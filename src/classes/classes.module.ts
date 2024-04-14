import { forwardRef, Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseClass } from './entities/course-class.entity';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesModule } from '../courses/courses.module';
import { ClassesGateway } from './classes.gateway';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { OnGoingingClassInstance } from './entities/ongoing-class-instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseClass, ClassInstance, OnGoingingClassInstance]),
    forwardRef(() => CoursesModule),
    forwardRef(() => AuthModule),
    WebsocketModule,
    NotificationsModule,
    forwardRef(() => AttendanceModule),
  ],
  controllers: [ClassesController],
  providers: [ClassesService, ClassesGateway],
  exports: [ClassesService],
})
export class ClassesModule {}
