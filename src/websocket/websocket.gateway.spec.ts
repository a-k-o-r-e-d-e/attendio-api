import '../test/mocks/firebase.mock';
import { BaseWSGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { TestBed } from '@automock/jest';
import { Socket } from 'socket.io';

describe('WebsocketGateway', () => {
  let gateway: BaseWSGateway;
  let websocketService: WebsocketService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(BaseWSGateway).compile();

    gateway = unit;
    websocketService = unitRef.get(WebsocketService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should call getProfileFromSocket from websocketService', async () => {
      // Arrange
      const socket = {} as Socket;

      // Act
      await gateway.handleConnection(socket);

      // Assert
      expect(websocketService.getProfileFromSocket).toHaveBeenCalledWith(
        socket,
      );
    });
  });
});
