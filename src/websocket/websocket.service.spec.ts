import '../test/mocks/firebase.mock';
import { TestBed } from '@automock/jest';
import { WebsocketService } from './websocket.service';
import { AuthService } from '../auth/auth.service';
import { Socket } from 'socket.io';
import { buildUserMock } from '../test/user.factory';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(WebsocketService).compile();

    service = unit;
    authService = unitRef.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfileFromSocket', () => {
    it('should return user profile if valid token is provided', async () => {
      // Arrange
      const user = buildUserMock({ id: '1', username: 'testuser' });
      const authToken = 'valid_token';
      const socket: Socket = {
        handshake: {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        } as any,
        disconnect: jest.fn(),
      } as any;
      authService.getProfileFromAuthToken = jest.fn().mockReturnValue(user);

      // Act
      const result = await service.getProfileFromSocket(socket);

      // Assert
      expect(result).toEqual(user);
      expect(authService.getProfileFromAuthToken).toHaveBeenCalledWith(
        authToken,
      );
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect socket if invalid token is provided', async () => {
      // Arrange
      const authToken = 'invalid_token';
      const socket: Socket = {
        handshake: {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        } as any,
        disconnect: jest.fn(),
      } as any;
      authService.getProfileFromAuthToken = jest.fn().mockReturnValue(null);

      // Act
      const result = await service.getProfileFromSocket(socket);

      // Assert
      expect(result).toBeNull();
      expect(authService.getProfileFromAuthToken).toHaveBeenCalledWith(
        authToken,
      );
      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect socket if token is missing', async () => {
      // Arrange
      const socket: Socket = {
        handshake: {
          headers: {},
        },
        disconnect: jest.fn(),
      } as any;

      // Act
      const result = await service.getProfileFromSocket(socket);

      // Assert
      expect(result).toBeUndefined();
      expect(socket.disconnect).toHaveBeenCalled();
    });
  });
});
