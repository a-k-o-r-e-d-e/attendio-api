import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateCourseClassDto } from './dto/create-class.dto';
import { UpdateCourseClassDto } from './dto/update-class.dto';
import { Roles } from '../auth/role.decorator';
import { Role } from '../constants/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import RolesGuard from '../auth/guards/role.guard';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.Lecturer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createClassDto: CreateCourseClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateCourseClassDto,
  ) {
    return this.classesService.update(+id, updateClassDto);
  }

  @Roles(Role.Lecturer, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.classesService.remove(id);
    return {
      message: 'Successful',
    };
  }
}
