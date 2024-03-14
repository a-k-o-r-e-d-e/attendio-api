import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    // Generate 4 users.
    const users = DataFactory.createForClass(User).generate(10);

    console.log(users);

    // Insert into the database.
    return this.userRepository.insert(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}
