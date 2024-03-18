import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { Lecturer } from './lecturer.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturerService: LecturersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Lecturer> {
    return this.lecturerService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  editLecturerProfile(
    @Body() updateLecturerDto: UpdateLecturerDto,
    @Req() req,
  ): Promise<Lecturer> {
    return this.lecturerService.update(req.user, updateLecturerDto);
  }
}
