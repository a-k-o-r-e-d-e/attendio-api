import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from './insititution.entity';
import { ILike, Like, Repository } from 'typeorm';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

  async findAll(): Promise<Institution[]> {
    return await this.institutionRepository.find();
  }

  async searchByName(searchText: string): Promise<Institution[]> {
     const searchTextLower = searchText ? searchText.toLowerCase() : '';
    return await this.institutionRepository.findBy({
        name: ILike(`%${searchTextLower}%`)
    })
  }
}
