import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const testUserFactory = (inputs?: Partial<User>) => {
  return {
    id: '1',
    username: 'testUser',
    email: 'test@example.com',
    password: 'password',
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
    ...inputs,
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let mockUser = testUserFactory();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [mockUser];
      jest.spyOn(repository, 'find').mockResolvedValue(users);
      expect(await service.findAll()).toEqual(users);
    });
  });

  describe('getById', () => {
    it('should return the user with the provided id', async () => {
      const userId = '1';
      const user: User = testUserFactory();
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);
      expect(await service.getById(userId)).toBe(user);
    });

    it('should throw HttpStatus.NOT_FOUND if user with provided id does not exist', async () => {
      const userId = 'nonexistent-id';
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.getById(userId)).rejects.toThrow(
        new NotFoundException('User with this id does not exist'),
      );
    });
  });

  describe('getByUsernameOrEmail', () => {
    const emailIdentifier = 'test@example.com';
    const usernameIdentifier = 'testUsername';
    it('should return the user with the provided email', async () => {
      const user: User = testUserFactory({ email: emailIdentifier });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);
      expect(await service.getByUsernameOrEmail(emailIdentifier)).toBe(user);
    });

    it('should return the user with the provided username', async () => {
      const user: User = testUserFactory({ username: usernameIdentifier });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);
      expect(await service.getByUsernameOrEmail(usernameIdentifier)).toBe(user);
    });

    it('should throw HttpStatus.NOT_FOUND if user with provided email or username does not exist', async () => {
      const userIdentifier = 'nonexistent@example.com';
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);
      await expect(
        service.getByUsernameOrEmail(userIdentifier),
      ).rejects.toThrow(
        new NotFoundException('User with this email does not exist'),
      );
    });
  });
});
