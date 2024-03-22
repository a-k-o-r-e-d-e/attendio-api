import { Injectable } from '@nestjs/common';
import { LecturersService } from '../lecturers/lecturers.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class DevService {
  constructor(
    private readonly lecturerService: LecturersService,
    private readonly studentService: StudentsService,
  ) {}

  async deleteLecturer(lecturerId: string) {
    return await this.lecturerService.delete(lecturerId);
  }

  async deleteStudent(studentId: string) {
    return await this.studentService.delete(studentId);
  }
}
