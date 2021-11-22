import { Event } from 'evnty';

export class Callbable extends Function {
  constructor(func: Function) {
    super();
    return Object.setPrototypeOf(func, new.target.prototype);
  }
}

export interface ClientOptions<Output = any, Params = any, Data = any> extends RequestOptions<Output, Params, Data> {
  base: string;
}

export interface RequestType<Output, Params, Data> {
  (url: URL, request: ApidlyRequest<Output, Params, Data>): Promise<void> | void;
}

export interface ResponseType<Output, Params, Data> {
  (response: Response, request: ApidlyRequest<Output, Params, Data>): Promise<Output> | Output;
}

export interface RetryStrategy {
  (times: number): number;
}

export interface RequestOptions<Output, Params, Data> extends RequestInit {
  data?: Data;
  params?: Params;
  requestType?: RequestType<Output, Params, Data>;
  responseType?: ResponseType<Output, Params, Data>;
  maxRetries?: number;
  retryStrategy?: RetryStrategy;
}

export interface ApidlyRequest<Output = any, Params = any, Data = any> extends Omit<RequestOptions<Output, Params, Data>, 'headers'> {
  headers: Headers;
}

export interface ApidlyResponse<Output> extends Response {
  data: Output;
}

export interface RequestMiddleware<Output, Params, Data> {
  (url: URL, request: ApidlyRequest<Output, Params, Data>): Promise<void> | void;
}

export interface ResponseMiddleware<Output> {
  (response: ApidlyResponse<Output>): Promise<void> | void;
}

export interface Events {
  start: Event;
  done: Event;
  error: Event;
}

export interface Middlewares<Output, Params, Data> {
  request: RequestMiddleware<Output, Params, Data>[];
  response: ResponseMiddleware<Output>[];
}
