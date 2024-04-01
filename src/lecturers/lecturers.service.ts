import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Lecturer } from './lecturer.entity';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { Role } from '../constants/enums';
import { InstitutionsService } from '../institutions/institutions.service';
import { CoursesService } from '../courses/courses.service';
import { ClassInstance } from '../classes/entities/class-instance.entity';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class LecturersService {
  constructor(
    @InjectRepository(Lecturer)
    private readonly lecturerRepository: Repository<Lecturer>,
    private readonly institutionService: InstitutionsService,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    private readonly classesService: ClassesService,
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

  async findOneById(id: string): Promise<Lecturer> {
    const lecturer = await this.findOne({ id });
    if (!lecturer) {
      throw new NotFoundException('Lecturer with this id does not exist');
    }
    return lecturer;
  }

  async findOneByEmail(email: string): Promise<Lecturer> {
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

  async findOneByUsername(username: string): Promise<Lecturer> {
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

  async create(lecturerDto: CreateLecturerDto): Promise<Lecturer> {
    const { institution: insititutionId, ...remainingDto } = lecturerDto;

    const insititution =
      await this.institutionService.findOneById(insititutionId);

    const createLecturerDto = {
      ...remainingDto,
      user: {
        ...lecturerDto.user,
        roles: [Role.Lecturer],
      } as any,
      insititution: insititution,
      insititutionId,
    };

    const newLecturer = this.lecturerRepository.create(createLecturerDto);

    newLecturer.institution = insititution;

    return await this.lecturerRepository.save(newLecturer);
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

    return await this.findOneById(lecturer.id);
  }

  async delete(id: string) {
    const lecturer = await this.findOneById(id);
    if (!lecturer) {
      throw new NotFoundException('Lecturer does not exist!');
    }
    await this.lecturerRepository.delete(id);
  }

  async fetchMyCourses(lecturer: Lecturer) {
    return await this.coursesService.findAll(lecturer, {
      lecturer: {
        id: lecturer.id,
      },
    });
  }

  async fetchMyClassInstances(lecturer: Lecturer): Promise<ClassInstance[]> {
    return await this.classesService.findAllClassInstances({
      base: {
        course: {
          lecturer: {
            id: lecturer.id,
          },
        },
      },
    });
  }
}
