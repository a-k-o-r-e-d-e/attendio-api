import { Injectable } from '@nestjs/common';
import { LecturersService } from 'src/lecturers/lecturers.service';

@Injectable()
export class DevService {
  constructor(private readonly lecturerService: LecturersService) {}

  async deleteLecturer(lecturerId: string) {
    return await this.lecturerService.delete(lecturerId);
  }
}
