import createEvent, { Unsubscribe } from 'evnty';
import { RequestOptions, ApidlyRequest, ApidlyResponse, RequestMiddleware, ResponseMiddleware, RequestType, ResponseType } from './types';
import { Endpoint } from './createEndpoint';
import { jsonRequest, jsonResponse } from './dataTypes';
import { pickFirstOption, omit, sanitize } from './utils';

export interface ClientOptions<Output = any, Params = any, Data = any> extends RequestOptions<Output, Params, Data> {
  base: string;
}
export interface Client<Output, Params, Data> {
  <Output>(endpoint: Endpoint<Output, Params, Data>, options?: RequestOptions<Output, Params, Data>): Promise<Output>;
  request: (middleware: RequestMiddleware<Output, Params, Data>) => this;
  response: (middleware: ResponseMiddleware<Output>) => this;
  onStart: (listener: (request: Request) => any) => Unsubscribe;
  onDone: (listener: (request: Request) => any) => Unsubscribe;
  onError: (listener: (error: Error, request: Request) => any) => Unsubscribe;
}

export default <Output, Params, Data>(clientOptions: ClientOptions<Output, Params, Data>) => {
  const events = {
    start: createEvent(),
    done: createEvent(),
    error: createEvent(),
  };
  const requestMiddlewares: RequestMiddleware<Output, Params, Data>[] = [];
  const responseMiddlewares: ResponseMiddleware<Output>[] = [];

  const client = async <Output, Params, Data>(endpoint: Endpoint<Output, Params, Data>, options: RequestOptions<Output, Params, Data> = {}) => {
    type RequestOptionsType = RequestOptions<Output, Params, Data>;
    const requestType = pickFirstOption<RequestOptionsType, RequestType<Output, Params, Data>>('requestType', jsonRequest, options, endpoint.options, clientOptions as any);
    const responseType = pickFirstOption<RequestOptionsType, ResponseType<Output, Params, Data>>('responseType', jsonResponse, options, endpoint.options, clientOptions as any);
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

    for (const requestMiddleware of [].concat(requestMiddlewares, endpoint.requestMiddlewares)) {
      await requestMiddleware(url, request);
    }

    await events.start(url, request);

    try {
      const response = (await fetch(url.href, request)) as ApidlyResponse<Output>;
      response.data = await responseType(response, request);

      for (const responseMiddleware of [].concat(responseMiddlewares, endpoint.responseMiddlewares)) {
        await responseMiddleware(responseMiddleware);
      }

      return response.data;
    } catch (e) {
      await events.error(e, url, request);
      return null;
    } finally {
      await events.done(url, request);
    }
  };

  client.request = (middleware: RequestMiddleware<Output, Params, Data>) => {
    requestMiddlewares.push(middleware);
    return client;
  };
  client.response = (middleware: ResponseMiddleware<Output>) => {
    responseMiddlewares.push(middleware);
    return client;
  };

  client.onStart = (listener: (url: URL, request: ApidlyRequest<Output, Params, Data>) => any) => events.start.on(listener);
  client.onDone = (listener: (url: URL, request: ApidlyRequest<Output, Params, Data>) => any) => events.done.on(listener);
  client.onError = (listener: (error: Error, url: URL, request: ApidlyRequest<Output, Params, Data>) => any) => events.error.on(listener);

  return client;
};
