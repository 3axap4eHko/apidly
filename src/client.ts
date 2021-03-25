import Evnty, { Listener } from 'evnty';
import Callable from './Callable';
import { Events, RequestMiddleware } from './Request';
import { Executor } from './Executor';
import { Endpoint } from './endpoint';

export interface ClientOptions {
  base: string;
}

function createExecutor(client: ClientOptions, events: Events, middlewares: RequestMiddleware[], endpoint: Endpoint) {
  const compile = endpoint(client.base);

  return new Executor({
    base: client.base,
    method: endpoint.method,
    compile,
    events,
    middlewares,
  });
}

export class Client extends Callable {
  #base: string;
  #events: Events;
  #middlewares: RequestMiddleware[];

  constructor(options: ClientOptions, events: Events, middlewares: RequestMiddleware[]) {
    super(createExecutor.bind(null, options, events, middlewares));
    this.#base = options.base;
    this.#events = events;
    this.#middlewares = middlewares;
  }

  get base() {
    return this.#base;
  }

  use(middleware: RequestMiddleware) {
    this.#middlewares.push(middleware);

    return this;
  }

  onStart(callback: Listener) {
    return this.#events.start.on(callback);
  }

  onDone(callback: Listener) {
    return this.#events.done.on(callback);
  }

  onError(callback: Listener) {
    return this.#events.error.on(callback);
  }
}

export function createClient(options: ClientOptions) {
  return new Client(
    options,
    {
      start: Evnty(),
      done: Evnty(),
      error: Evnty(),
    },
    []
  );
}
