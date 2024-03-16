import { Controller, Get } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionService: InstitutionsService) {}

  @Get()
  findAll() {
    return this.institutionService.findAll();
  }
}
