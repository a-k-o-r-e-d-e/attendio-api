import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User with this id does not exist');
    }
    return user;
  }

  async getByUsernameOrEmail(emailOrUsername: string): Promise<User> {
    const user = await this.userRepository.findOneBy([
      { email: emailOrUsername },
      { username: emailOrUsername },
    ]);

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    return user;
  }
}
