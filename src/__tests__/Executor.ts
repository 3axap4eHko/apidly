import Evnty from 'evnty';
import { Executor } from '../Executor';
import { Request, RequestParameters, RequestMiddleware } from '../Request';

globalThis.fetch = jest.fn();

function mockFetch(response: Response) {
  return (<jest.MockedFunction<typeof fetch>>fetch).mockReturnValue(Promise.resolve(response));
}

function createExecutor(data: any = null) {
  const base = 'https://example.com';
  const events = {
    start: Evnty(),
    done: Evnty(),
    error: Evnty(),
  };
  const compile = jest.fn(() => new URL('/', base));
  const middleware: RequestMiddleware = jest.fn((req: Request, params: RequestParameters) => {});

  const executor = new Executor({
    base,
    method: 'get',
    compile,
    events,
    middlewares: [middleware],
  });

  return { executor, base, events, compile, middleware };
}

describe('Executor test suite', () => {
  it('Should create an Executor', () => {
    expect(createExecutor).not.toThrowError();
  });

  it('Should call url compilation on execution', async () => {
    const { executor, compile } = createExecutor();
    await executor();
    expect(compile).toHaveBeenCalled();
  });

  it('Should call middlewares on execution', async () => {
    const { executor, middleware } = createExecutor();
    await executor();
    expect(middleware).toHaveBeenCalled();
  });

  it('Should call events on execution', async () => {
    const { executor, events } = createExecutor();
    const responseData = { test: 'value' }
    const response = new Response(JSON.stringify(responseData));
    mockFetch(response);

    const result = await executor();
    expect(events.error).not.toHaveBeenCalled();
    expect(events.start).toHaveBeenCalled();
    expect(events.done).toHaveBeenCalled();
    expect(result).toEqual(responseData);
  });

  it('Should call error event on 404', async () => {
    const { executor, events } = createExecutor();
    const response = new Response(JSON.stringify(null), {
      status: 404,
    });
    mockFetch(response);

    await executor();
    expect(events.error).toHaveBeenCalled();
    expect(events.start).toHaveBeenCalled();
    expect(events.done).toHaveBeenCalled();
  });

  it('Should call error event on 400', async () => {
    const { executor, events } = createExecutor();
    const response = new Response(JSON.stringify(null), {
      status: 400,
    });
    mockFetch(response);

    await executor();
    expect(events.error).toHaveBeenCalled();
    expect(events.start).toHaveBeenCalled();
    expect(events.done).toHaveBeenCalled();
  });
});
