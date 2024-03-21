import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Lecturer } from './lecturer.entity';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { Role } from '../constants/enums';

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
    const lecturer = await this.lecturerRepository.findOneBy(whereClause);
    if (!lecturer) {
      throw new NotFoundException('Lecturer  does not exist');
    }
    return lecturer;
  }

  async getById(id: string): Promise<Lecturer> {
    const lecturer = await this.findOne({ id });
    if (!lecturer) {
      throw new NotFoundException('Lecturer with this id does not exist');
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
      throw new NotFoundException('Lecturer with this email does not exist');
    }
    return lecturer;
  }

  async getByUsername(username: string): Promise<Lecturer> {
    const lecturer = await this.findOne({
      user: {
        username,
      },
    });

    if (!lecturer) {
      throw new NotFoundException('Lecturer with this username does not exist');
    }
    return lecturer;
  }

  async create(lecturerDto: CreateLecturerDto) {
    lecturerDto.user = {
      ...lecturerDto.user,
      roles: [Role.Lecturer],
    } as any;
    const newLecturer = this.lecturerRepository.create(lecturerDto);

    return this.lecturerRepository.save(newLecturer);
  }

  async update(lecturer: Lecturer, lecturerDto: UpdateLecturerDto) {
    /// We perform update this way to ensure we update the referenced user table also.
    // It is expected that we have used data validation to ensure only allowed/updatable values are passed to this function
    const lecturerUpdate = {
      ...lecturer,
      ...lecturerDto,
      user: {
        ...lecturer.user,
        // email is currently the only value allowed to be updated using the update lecturer endpoint
        email: lecturerDto.user?.email ?? lecturer.user.email,
      },
    };

    await this.lecturerRepository.save(lecturerUpdate);

    return await this.getById(lecturer.id);
  }

  async delete(id: string) {
    const lecturer = await this.getById(id);
    if (!lecturer) {
      throw new NotFoundException('Lecturer does not exist!');
    }
    await this.lecturerRepository.delete(id);
  }
}
