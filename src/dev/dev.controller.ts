import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { DevService } from './dev.service';
import { Role } from 'src/constants/enums';
import { Roles } from 'src/auth/role.decorator';
import RolesGuard from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  //delete lecturer
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('lecturers/:id')
  async deleteLecturer(@Param('id') lecturerId: string): Promise<any> {
    await this.devService.deleteLecturer(lecturerId);
    return {
      message: 'Successful',
    };
  }

  //delete lecturer
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('students/:id')
  async deleteStudent(@Param('id') studentId: string): Promise<any> {
    await this.devService.deleteStudent(studentId);
    return {
      message: 'Successful',
    };
  }
}
