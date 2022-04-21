import { RequestOptions, RequestMiddleware, ResponseMiddleware, Middlewares, MiddleWired, EndpointInterface, Compile } from './types';
import { compile } from './utils';

export class Endpoint<Output, Params, Data> implements MiddleWired<Output, Params, Data> {
  readonly compilePath: ReturnType<Compile<never>>;
  readonly middlewares: Middlewares<Output, Params, Data> = {
    request: [],
    response: [],
  };

  constructor(public readonly path: string, public readonly options: RequestOptions<Output, Params, Data> = {}) {
    this.compilePath = compile(path);
  }
  request(middleware: RequestMiddleware<Params, Data>) {
    this.middlewares.request.push(middleware);

    return this;
  }
  response(middleware: ResponseMiddleware<Output, Params, Data>) {
    this.middlewares.response.push(middleware);

    return this;
  }
}

export default <Output, Params = any, Data = any>(path: string, options?: RequestOptions<Output, Params, Data>): EndpointInterface<Output, Params, Data, never> => {
  return new Endpoint<Output, Params, Data>(path, options);
};
