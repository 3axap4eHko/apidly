import createEvent from 'evnty';
import {
  ClientOptions,
  Client as ClientInterface,
  Endpoint,
  RequestOptions,
  ApidlyRequest,
  ApidlyResponse,
  RequestMiddleware,
  ResponseMiddleware,
  Events,
  Middlewares,
  MiddleWired,
  EventWired,
  RequestType,
  ResponseType,
  RetryStrategy,
  Callbable,
  Compile,
} from './types';
import { jsonRequest, jsonResponse } from './dataTypes';
import { pickFirstOption, sanitize, defaultRetryStrategy, retry, compile } from './utils';

interface RequestInitOptions<Output, Params, Data> extends ClientOptions<Params>, Middlewares<Output, Params, Data>, Events {
  compileBase: ReturnType<Compile>;
}

const request = async <Output, Params, Data>(
  init: RequestInitOptions<Output, Params, Data>,
  endpoint: Endpoint<Output, Params, Data>,
  options: RequestOptions<Output, Params, Data> = {}
) => {
  type RequestOptionsType = RequestOptions<Output, Partial<Params>, Partial<Data>>;
  const requestType = pickFirstOption<RequestOptionsType, RequestType<Params, Data>>('requestType', jsonRequest, options, endpoint.options, init as any);
  const responseType = pickFirstOption<RequestOptionsType, ResponseType<Output, Params, Data>>(
    'responseType',
    jsonResponse,
    options,
    endpoint.options,
    init as any
  );
  const maxRetries = pickFirstOption<RequestOptionsType, number>('maxRetries', 0, options, endpoint.options, init as any);
  const retryStrategy = pickFirstOption<RequestOptionsType, RetryStrategy>('retryStrategy', defaultRetryStrategy, options, endpoint.options, init as any);
  const cache = pickFirstOption<RequestOptionsType, RequestCache>('cache', void 0, options, endpoint.options, init as any);
  const credentials = pickFirstOption<RequestOptionsType, RequestCredentials>('credentials', void 0, options, endpoint.options, init as any);
  const integrity = pickFirstOption<RequestOptionsType, string>('integrity', void 0, options, endpoint.options, init as any);
  const keepalive = pickFirstOption<RequestOptionsType, boolean>('keepalive', void 0, options, endpoint.options, init as any);
  const method = pickFirstOption<RequestOptionsType, string>('method', 'get', options, endpoint.options, init as any);
  const mode = pickFirstOption<RequestOptionsType, RequestMode>('mode', void 0, options, endpoint.options, init as any);
  const redirect = pickFirstOption<RequestOptionsType, RequestRedirect>('redirect', void 0, options, endpoint.options, init as any);
  const referrer = pickFirstOption<RequestOptionsType, string>('referrer', void 0, options, endpoint.options, init as any);
  const referrerPolicy = pickFirstOption<RequestOptionsType, ReferrerPolicy>('referrerPolicy', void 0, options, endpoint.options, init as any);
  const signal = pickFirstOption<RequestOptionsType, AbortSignal | null>('signal', void 0, options, endpoint.options, init as any);
  const window = pickFirstOption<RequestOptionsType, any>('window', void 0, options, endpoint.options, init as any);

  const headers = new Headers();
  for (const headersInit of [init.headers, endpoint.options.headers, options.headers].filter(Boolean)) {
    new Headers(headersInit).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const dataList = [endpoint.options.data, options.data];
  const data = dataList.some((d) => typeof d !== 'undefined') ? ({ ...endpoint.options.data, ...options.data } as Data) : void 0;

  const params = { ...init.params, ...endpoint.options.params, ...options.params } as Params;
  const pathname = endpoint.compilePath(params);
  const base = init.compileBase(params);

  const url = new URL(pathname, base);
  url.pathname = url.pathname.replace('//', '/');
  for (const [key, value] of url.searchParams) {
    if (value === '') {
      url.searchParams.delete(key);
    }
  }

  const request = sanitize<ApidlyRequest<Params, Data>>({
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

  await init.start(url, request);

  try {
    return await retry(
      async () => {
        for (const requestMiddleware of [].concat(init.request, endpoint.middlewares.request)) {
          await requestMiddleware(url, request);
        }
        const response = (await fetch(url.href, request)) as ApidlyResponse<Output>;
        response.data = await responseType(response, url, request);
        for (const responseMiddleware of [].concat(init.response, endpoint.middlewares.response)) {
          await responseMiddleware(response, url, request);
        }
        await init.success(response, url, request);

        return response.data;
      },
      retryStrategy,
      maxRetries
    );
  } catch (e: any) {
    await init.error(e, url, request);
    throw e;
  } finally {
    await init.done(url, request);
  }
};

class Client<ClientParams = unknown> extends Callbable implements MiddleWired<unknown, ClientParams, unknown>, EventWired<unknown, ClientParams, unknown> {
  private requestInit: RequestInitOptions<unknown, ClientParams, unknown>;

  constructor(clientOptions: ClientOptions<ClientParams>) {
    const requestInit: RequestInitOptions<unknown, ClientParams, unknown> = {
      ...clientOptions,
      start: createEvent(),
      success: createEvent(),
      error: createEvent(),
      done: createEvent(),
      request: [] as RequestMiddleware<ClientParams, unknown>[],
      response: [] as ResponseMiddleware<unknown, ClientParams, unknown>[],
      compileBase: compile(clientOptions.base),
    };

    super(request.bind(null, requestInit));

    this.requestInit = requestInit;
  }
  request(middleware: RequestMiddleware<ClientParams, unknown>) {
    this.requestInit.request.push(middleware);

    return this;
  }
  response(middleware: ResponseMiddleware<unknown, ClientParams, unknown>) {
    this.requestInit.response.push(middleware);

    return this;
  }
  onStart(listener: (url: URL, request: ApidlyRequest<ClientParams, unknown>) => any) {
    return this.requestInit.start.on(listener);
  }
  onSuccess(listener: (response: ApidlyResponse<unknown>, url: URL, request: ApidlyRequest<ClientParams, unknown>) => any) {
    return this.requestInit.success.on(listener);
  }
  onDone(listener: (url: URL, request: ApidlyRequest<ClientParams, unknown>) => any) {
    return this.requestInit.done.on(listener);
  }
  onError(listener: (error: Error, url: URL, request: ApidlyRequest<ClientParams, unknown>) => any) {
    return this.requestInit.error.on(listener);
  }
}

export default <ClientParams>(clientOptions: ClientOptions<ClientParams>) => {
  return new Client<ClientParams>(clientOptions) as unknown as ClientInterface<ClientParams>;
};
