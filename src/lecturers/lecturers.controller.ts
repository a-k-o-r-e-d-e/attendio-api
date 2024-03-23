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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import RolesGuard from '../auth/guards/role.guard';
import { Role } from '../constants/enums';
import { Roles } from '../auth/role.decorator';

@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturerService: LecturersService) {}

  @Roles(Role.Lecturer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  getMyProfile(@Req() req): Promise<Lecturer> {
    return req.user;
  }

  @Roles(Role.Lecturer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('me')
  editLecturerProfile(
    @Body() updateLecturerDto: UpdateLecturerDto,
    @Req() req,
  ): Promise<Lecturer> {
    return this.lecturerService.update(req.user, updateLecturerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Lecturer> {
    return this.lecturerService.findOneById(id);
  }
}
