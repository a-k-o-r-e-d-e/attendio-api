import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from './insititution.entity';
import { InstitutionsService } from './institutions.service';
import { InstitutionsController } from './institutions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  providers: [InstitutionsService],
  controllers: [InstitutionsController],
  exports: [InstitutionsService]
})
export class InstitutionsModule {}
