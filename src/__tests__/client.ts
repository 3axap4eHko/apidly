import Evnty from 'evnty';
import { Events, RequestMiddleware } from '../Request';
import { createClient, Client } from '../client';

describe('Client test suite', () => {
  it('Should create a Client', () => {
    expect(() => {
      createClient({ base: 'https://example.com' });
    }).not.toThrowError();
  });

  it('Should set properties', () => {
    const base = 'https://example.com';
    const events = {
      start: Evnty(),
      done: Evnty(),
      error: Evnty(),
    };
    const middlewares: RequestMiddleware[] = [];

    const client = new Client({ base }, events, middlewares);
    const middleware = jest.fn();
    const start = jest.fn();
    const done = jest.fn();
    const error = jest.fn();

    client.use(middleware);
    client.onStart(start);
    client.onDone(done);
    client.onError(error);

    expect(client.base).toEqual(base);
    expect(middlewares).toContain(middleware);
    expect(events.start.on).toHaveBeenCalled();
    expect(events.done.on).toHaveBeenCalled();
    expect(events.error.on).toHaveBeenCalled();

  });
});
