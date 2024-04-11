import { HttpExceptionTransformationFilter } from './ws-exception.filter';

describe('WebsocketFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionTransformationFilter()).toBeDefined();
  });
});
