import { Event, Unsubscribe } from 'evnty';

export class Callbable extends Function {
  constructor(func: Function) {
    super();
    return Object.setPrototypeOf(func, new.target.prototype);
  }
}

export type MaybePromise<T> = PromiseLike<T> | T;

export interface ApidlyRequest<Params, Data> extends Omit<RequestInit, 'headers'> {
  params?: Params;
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

export interface Events {
  start: Event;
  success: Event;
  error: Event;
  done: Event;
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

export interface Compile<T> {
  <Params = Record<string, any>>(pattern: string): (params: Params, options?: T) => string;
}
export interface EndpointInterface<Output, EndpointParams, Data, CompilerOptions> extends MiddleWired<Output, EndpointParams, Data> {
  readonly path: string;
  readonly compilePath: ReturnType<Compile<CompilerOptions>>;
  readonly options: RequestOptions<Output, EndpointParams, Data>;
  readonly middlewares: Middlewares<Output, EndpointParams, Data>;
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

export interface ClientInterface<ClientParams, CompilerOptions> extends MiddleWired<unknown, ClientParams, unknown>, EventWired<unknown, ClientParams, unknown> {
  <Output, Params, Data>(endpoint: EndpointInterface<Output, Params, Data, CompilerOptions>, options?: RequestOptions<Output, Params & Partial<ClientParams>, Data>): MaybePromise<Output>;
}
