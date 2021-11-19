import * as PTR from 'path-to-regexp';
import { RequestOptions, RequestMiddleware, ResponseMiddleware } from './types';

export class Endpoint<Output, Params, Data> {
  readonly path: string;
  readonly pathKeys: string[];
  readonly queryKeysMap: [string, string][];
  readonly compile: PTR.PathFunction<object>;
  readonly options?: RequestOptions<Output, Params, Data>;
  readonly requestMiddlewares: RequestMiddleware<Output, Params, Data>[] = [];
  readonly responseMiddlewares: ResponseMiddleware<Output>[] = [];

  constructor(path: string, options: RequestOptions<Output, Params, Data> = {}) {
    const url = new URL(path, 'https://apidly.io');
    const paramsKeys: PTR.Key[] = [];
    PTR.pathToRegexp(url.pathname, paramsKeys);

    this.path = path;
    this.options = options;
    this.pathKeys = paramsKeys.map(({ name }) => name.toString());
    this.queryKeysMap = [...url.searchParams.entries()].map(([key, value]) => [key, value.replace(/^:/, '')]);
    this.compile = PTR.compile(url.pathname, { encode: encodeURIComponent });
  }
  request(middleware: RequestMiddleware<Output, Params, Data>) {
    this.requestMiddlewares.push(middleware);

    return this;
  }
  response(middleware: ResponseMiddleware<Output>) {
    this.responseMiddlewares.push(middleware);

    return this;
  }
}

export default <Output, Params, Data = void>(path: string, options?: RequestOptions<Output, Params, Data>) => {
  return new Endpoint<Output, Params, Data>(path, options);
};
