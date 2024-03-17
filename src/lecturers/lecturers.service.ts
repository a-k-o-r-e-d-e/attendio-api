import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Lecturer } from './lecturer.entity';
import { CreateLecturerAndUserDto } from './dto/create-lecturer.dto';

@Injectable()
export class LecturersService {
  constructor(
    @InjectRepository(Lecturer)
    private readonly lecturerRepository: Repository<Lecturer>,
  ) {}

  async findAll(): Promise<Lecturer[]> {
    return await this.lecturerRepository.find();
  }

  private async findOne(
    whereClause: FindOptionsWhere<Lecturer>,
  ): Promise<Lecturer> {
    return this.lecturerRepository.findOneBy(whereClause);
  }

  async getById(id: string): Promise<Lecturer> {
    const lecturer = await this.findOne({ id });
    if (!lecturer) {
      throw new HttpException(
        'Lecturer with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return lecturer;
  }

  async getByEmail(email: string): Promise<Lecturer> {
    const lecturer = await this.findOne({
      user: {
        email,
      },
    });

    if (!lecturer) {
      throw new HttpException(
        'Lecturer with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return lecturer;
  }

  async getByUsername (username: string): Promise<Lecturer> {
    const lecturer = await this.findOne({
      user: {
        username,
      },
    });

    if (!lecturer) {
      throw new HttpException(
        'Lecturer with this username does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return lecturer;
  }

  async create(lecturerDto: CreateLecturerAndUserDto) {
    const newLecturer = this.lecturerRepository.create(lecturerDto);

    return this.lecturerRepository.save(newLecturer);
  }
}
