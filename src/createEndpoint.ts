import { RequestOptions, RequestMiddleware, ResponseMiddleware, Middlewares, EndpointInterface, Compile } from './types';
import { compile } from './utils';

class Endpoint<Output, Params, Data> implements EndpointInterface<Output, Params, Data, never> {
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

export default <Output, Params = any, Data = any>(path: string, options?: RequestOptions<Output, Params, Data>) => {
  return new Endpoint<Output, Params, Data>(path, options);
};
