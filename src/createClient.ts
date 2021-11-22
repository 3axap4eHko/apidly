import createEvent from 'evnty';
import { RequestOptions, ApidlyRequest, ApidlyResponse, RequestMiddleware, ResponseMiddleware, Events, Middlewares, RequestType, ResponseType, RetryStrategy, Callbable } from './types';
import { Endpoint } from './createEndpoint';
import { jsonRequest, jsonResponse } from './dataTypes';
import { pickFirstOption, omit, sanitize, defaultRetryStrategy, retry } from './utils';

export interface ClientOptions<Output = any, Params = any, Data = any> extends RequestOptions<Output, Params, Data> {
  base: string;
}

const request = async <Output, Params, Data>(
  clientOptions: ClientOptions<Output, Params, Data>,
  events: Events,
  middlewares: Middlewares<Output, Params, Data>,
  endpoint: Endpoint<Output, Params, Data>,
  options: RequestOptions<Output, Params, Data> = {}
) => {
  type RequestOptionsType = RequestOptions<Output, Params, Data>;
  const requestType = pickFirstOption<RequestOptionsType, RequestType<Output, Params, Data>>('requestType', jsonRequest, options, endpoint.options, clientOptions as any);
  const responseType = pickFirstOption<RequestOptionsType, ResponseType<Output, Params, Data>>('responseType', jsonResponse, options, endpoint.options, clientOptions as any);
  const maxRetries = pickFirstOption<RequestOptionsType, number>('maxRetries', 0, options, endpoint.options, clientOptions as any);
  const retryStrategy = pickFirstOption<RequestOptionsType, RetryStrategy>('retryStrategy', defaultRetryStrategy, options, endpoint.options, clientOptions as any);
  const cache = pickFirstOption<RequestOptionsType, RequestCache>('cache', void 0, options, endpoint.options, clientOptions as any);
  const credentials = pickFirstOption<RequestOptionsType, RequestCredentials>('credentials', void 0, options, endpoint.options, clientOptions as any);
  const integrity = pickFirstOption<RequestOptionsType, string>('integrity', void 0, options, endpoint.options, clientOptions as any);
  const keepalive = pickFirstOption<RequestOptionsType, boolean>('keepalive', void 0, options, endpoint.options, clientOptions as any);
  const method = pickFirstOption<RequestOptionsType, string>('method', 'get', options, endpoint.options, clientOptions as any);
  const mode = pickFirstOption<RequestOptionsType, RequestMode>('mode', void 0, options, endpoint.options, clientOptions as any);
  const redirect = pickFirstOption<RequestOptionsType, RequestRedirect>('redirect', void 0, options, endpoint.options, clientOptions as any);
  const referrer = pickFirstOption<RequestOptionsType, string>('referrer', void 0, options, endpoint.options, clientOptions as any);
  const referrerPolicy = pickFirstOption<RequestOptionsType, ReferrerPolicy>('referrerPolicy', void 0, options, endpoint.options, clientOptions as any);
  const signal = pickFirstOption<RequestOptionsType, AbortSignal | null>('signal', void 0, options, endpoint.options, clientOptions as any);
  const window = pickFirstOption<RequestOptionsType, any>('window', void 0, options, endpoint.options, clientOptions as any);

  const headers = new Headers();
  for (const headersInit of [clientOptions.headers, endpoint.options.headers, options.headers].filter(Boolean)) {
    new Headers(headersInit).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const dataList = [clientOptions.data, endpoint.options.data, options.data];
  const data = dataList.some((d) => typeof d !== 'undefined') ? ({ ...clientOptions.data, ...endpoint.options.data, ...options.data } as Data) : void 0;

  const params = { ...clientOptions.params, ...endpoint.options.params, ...options.params } as Params;

  const pathParams = omit(params, endpoint.pathKeys);
  const pathname = endpoint.compile(pathParams);
  const url = new URL(pathname, clientOptions.base);

  for (const [name, key] of endpoint.queryKeysMap) {
    const value = (options.params as any)[key]?.toString();
    if (typeof value !== 'undefined') {
      url.searchParams.set(name, value);
    } else {
      url.searchParams.delete(name);
    }
  }

  const request = sanitize<ApidlyRequest<Output, Params, Data>>({
    requestType,
    responseType,
    maxRetries,
    retryStrategy,
    data,
    params,
    cache,
    credentials,
    headers,
    integrity,
    keepalive,
    method,
    mode,
    redirect,
    referrer,
    referrerPolicy,
    signal,
    window,
  });

  if (request.data) {
    await requestType(url, request);
  }

  await events.start(url, request);

  try {
    return await retry(
      async () => {
        for (const requestMiddleware of [].concat(middlewares.request, endpoint.middlewares.request)) {
          await requestMiddleware(url, request);
        }

        const response = (await fetch(url.href, request)) as ApidlyResponse<Output>;
        response.data = await responseType(response, request);
        for (const responseMiddleware of [].concat(middlewares.response, endpoint.middlewares.response)) {
          await responseMiddleware(response);
        }

        return response.data;
      },
      retryStrategy,
      maxRetries
    );
  } catch (e: any) {
    await events.error(e, url, request);
    throw e;
  } finally {
    await events.done(url, request);
  }
};

export class Client<CommonOutput, CommonParams, CommonData> extends Callbable {
  private events: Events;
  private middlewares: Middlewares<CommonOutput, CommonParams, CommonData>;

  constructor(clientOptions: ClientOptions<CommonOutput, CommonParams, CommonData>) {
    const events = {
      start: createEvent(),
      done: createEvent(),
      error: createEvent(),
    };
    const middlewares = {
      request: [] as RequestMiddleware<CommonOutput, CommonParams, CommonData>[],
      response: [] as ResponseMiddleware<CommonOutput>[],
    };
    super(request.bind(null, clientOptions, events, middlewares));
    this.events = events;
    this.middlewares = middlewares;
  }
  request(middleware: RequestMiddleware<CommonOutput, CommonParams, CommonData>) {
    this.middlewares.request.push(middleware);

    return this;
  }
  response(middleware: ResponseMiddleware<CommonOutput>) {
    this.middlewares.response.push(middleware);

    return this;
  }
  onStart(listener: (url: URL, request: ApidlyRequest<CommonOutput, CommonParams, CommonData>) => any) {
    return this.events.start.on(listener);
  }
  onDone(listener: (url: URL, request: ApidlyRequest<CommonOutput, CommonParams, CommonData>) => any) {
    return this.events.done.on(listener);
  }
  onError(listener: (error: Error, url: URL, request: ApidlyRequest<CommonOutput, CommonParams, CommonData>) => any) {
    return this.events.error.on(listener);
  }
}

export interface RequestCall {
  <Output, Params, Data>(endpoint: Endpoint<Output, Params, Data>, options?: RequestOptions<Output, Params, Data>): Promise<Output>;
}

export default <CommonOutput, CommonParams, CommonData>(clientOptions: ClientOptions<CommonOutput, CommonParams, CommonData>) => {
  type CallableClient = Client<CommonOutput, CommonParams, CommonData> & RequestCall;

  return new Client<CommonOutput, CommonParams, CommonData>(clientOptions) as CallableClient;
};
