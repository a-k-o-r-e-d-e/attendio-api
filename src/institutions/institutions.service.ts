import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from './insititution.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

  async findAll(): Promise<Institution[]> {
    return await this.institutionRepository.find();
  }

  private async findOne(
    whereClause: FindOptionsWhere<Institution>,
  ): Promise<Institution> {
    const institution = await this.institutionRepository.findOneBy(whereClause);
    if (!institution) {
      throw new NotFoundException('Institution  does not exist');
    }
    return institution;
  }

  async findOneById(id: string): Promise<Institution> {
    const lecturer = await this.findOne({ id });
    if (!lecturer) {
      throw new NotFoundException('Institution with this id does not exist');
    }
    return lecturer;
  }

  async searchByName(searchText: string): Promise<Institution[]> {
    const searchTextLower = searchText ? searchText.toLowerCase() : '';
    return await this.institutionRepository.findBy({
      name: ILike(`%${searchTextLower}%`),
    });
  }
}
