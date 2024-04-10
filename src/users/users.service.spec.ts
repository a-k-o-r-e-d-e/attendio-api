import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { buildUserMock } from '../test/user.factory';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let mockUser = buildUserMock();

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
      const user: User = buildUserMock();
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
      const user: User = buildUserMock({ email: emailIdentifier });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);
      expect(await service.getByUsernameOrEmail(emailIdentifier)).toBe(user);
    });

    it('should return the user with the provided username', async () => {
      const user: User = buildUserMock({ username: usernameIdentifier });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);
      expect(await service.getByUsernameOrEmail(usernameIdentifier)).toBe(user);
    });

    it('should throw HttpStatus.NOT_FOUND if user with provided email or username does not exist', async () => {
      const userIdentifier = 'nonexistent@example.com';
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);
      await expect(
        service.getByUsernameOrEmail(userIdentifier),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFcmToken', () => {
    it('should update the user FCM token and return the updated user', async () => {
      // Arrange
      const user: User = buildUserMock({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        fcm_token: '',
      });
      const updatedUser: User = buildUserMock({
        ...user,
        fcm_token: 'new-fcm-token',
      });
      
      jest.spyOn(repository, 'save').mockResolvedValueOnce(updatedUser)
      jest.spyOn(service, 'getById').mockResolvedValue(updatedUser);

      const result = await service.updateFcmToken(user, 'new-fcm-token');

      // Assert
      expect(result).toEqual(updatedUser);
      expect(repository.save).toHaveBeenCalledWith(user);
    });

  });
});
