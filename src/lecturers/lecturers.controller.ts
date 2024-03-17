import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { Lecturer } from './lecturer.entity';

@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturerService: LecturersService) {}

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Lecturer> {
    return this.lecturerService.getById(id);
  }
}
