import { Event, Unsubscribe } from 'evnty';

interface Callable {
  (...args: any[]): Promise<void>;
}

const CallableFunction = Function as Callable & FunctionConstructor;

export class Callbable extends CallableFunction {
  constructor(func: Function) {
    super();
    return Object.setPrototypeOf(func, new.target.prototype);
  }
}

export type MaybePromise<T> = PromiseLike<T> | T;

export interface ApidlyRequest<Params, Data> extends Omit<RequestInit, 'headers'> {
  params: Partial<Params>;
  data?: Data;
  headers: Headers;
}

export interface ApidlyResponse<Output> extends Response {
  data: Output;
}

export interface RetryStrategy {
  (times: number): number;
}

export interface RequestType<Params, Data> {
  (url: URL, request: ApidlyRequest<Params, Data>): MaybePromise<void>;
}

export interface ResponseType<Output, Params, Data> {
  (response: ApidlyResponse<Output>, url: URL, request: ApidlyRequest<Params, Data>): MaybePromise<Output>;
}

export interface RequestMiddleware<Params, Data> {
  (url: URL, request: ApidlyRequest<Params, Data>): MaybePromise<void>;
}

export interface ResponseMiddleware<Output, Params, Data> {
  (response: ApidlyResponse<Output>, url: URL, request: ApidlyRequest<Params, Data>): MaybePromise<void>;
}

export interface Middlewares<Output, Params, Data> {
  request: RequestMiddleware<Params, Data>[];
  response: ResponseMiddleware<Output, Params, Data>[];
}

export interface MiddleWired<Output, Params, Data> {
  request(middleware: RequestMiddleware<Params, Data>): this;
  response(middleware: ResponseMiddleware<Output, Params, Data>): this;
}

export interface Events<Output, Params, Data> {
  start: Event<[URL, ApidlyRequest<Params, Data>]>;
  success: Event<[ApidlyResponse<Output>, URL, ApidlyRequest<Params, Data>]>;
  error: Event<[Error, URL, ApidlyRequest<Params, Data>]>;
  done: Event<[URL, ApidlyRequest<Params, Data>]>;
}

export interface EventWired<Output, Params, Data> {
  onStart(listener: (url: URL, request: ApidlyRequest<Params, Data>) => any): Unsubscribe;
  onSuccess(listener: (response: ApidlyResponse<Output>, url: URL, request: ApidlyRequest<Params, Data>) => any): Unsubscribe;
  onError(listener: (error: Error, url: URL, request: ApidlyRequest<Params, Data>) => any): Unsubscribe;
  onDone(listener: (url: URL, request: ApidlyRequest<Params, Data>) => any): Unsubscribe;
}

export interface EndpointOptions<Output, EndpointParams, Data> extends RequestInit {
  params?: EndpointParams;
  requestType?: RequestType<EndpointParams, unknown>;
  responseType?: ResponseType<Output, EndpointParams, Data>;
  maxRetries?: number;
  retryStrategy?: RetryStrategy;
}

export interface Compile {
  <Params = Record<string, any>>(pattern: string): (params: Params) => string;
}

export interface ClientOptions<ClientParams> extends RequestInit {
  base: string;
  params?: ClientParams;
  requestType?: RequestType<ClientParams, unknown>;
  responseType?: ResponseType<unknown, ClientParams, unknown>;
  maxRetries?: number;
  retryStrategy?: RetryStrategy;
}

export interface RequestOptions<Output, Params, Data> extends RequestInit {
  data?: Data;
  params?: Params;
  requestType?: RequestType<Params, Data>;
  responseType?: ResponseType<Output, Params, Data>;
  maxRetries?: number;
  retryStrategy?: RetryStrategy;
}
