import Callbable from './Callable';
import { RequestMiddleware } from './Request';
import createCompiler from './createCompiler';

export interface EndpointOptions {
  method?: string;
  middleware?: RequestMiddleware;
}

export class Endpoint extends Callbable {
  #route: string;
  #method: string;
  #middleware: RequestMiddleware;

  constructor(route: string, { method = 'get', middleware }: EndpointOptions) {
    super(createCompiler.bind(null, route));
    this.#route = route;
    this.#method = method;
    this.#middleware = middleware;
  }

  get route() {
    return this.#route;
  }

  get method() {
    return this.#method;
  }

  get middleware() {
    return this.#middleware;
  }
}

export function createEndpoint<P, R>(route: string, method?: string, middleware?: RequestMiddleware) {
  return new Endpoint(route, { method, middleware });
}
