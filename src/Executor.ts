import 'cross-fetch/polyfill';
import Callable from './Callable';
import { CompileURL } from './createCompiler';
import { Request, Events, RequestParameters, RequestMiddleware } from './Request';

export interface ExecutorOptions {
  base: string;
  method: string;
  compile: CompileURL;
  events: Events;
  middlewares: RequestMiddleware[];
}

export interface ExecutorParameters {
  params?: RequestParameters;
  body?: BodyInit;
  credentials?: any;
}

export async function execute({ method, compile, events, middlewares }: ExecutorOptions, { params, body, credentials }: ExecutorParameters = {}) {
  const url = compile(params);
  const headers = new Headers();
  const request = new Request(url, {
    method,
    headers,
    events,
    body,
  });

  for (const middleware of middlewares) {
    await middleware(request, params);
  }

  const init = request.getInit();
  try {
    events.start();
    const response = await fetch(url, init);

    if (response.status === 404) {
      throw new Error(response.statusText);
    }

    const result = await response.json();
    if (response.status === 400) {
      throw new Error(result.message);
    }

    return result;
  } catch (e) {
    events.error(e, url, init);
  } finally {
    events.done();
  }
}

export class Executor extends Callable {
  constructor(options: ExecutorOptions) {
    super(execute.bind(null, options));
  }
}
