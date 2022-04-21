import { RequestMiddleware, ApidlyRequest } from './types';

export const jsonRequest = <Params, Data>(url: URL, request: ApidlyRequest<Params, Data>) => {
  request.body = JSON.stringify(request.data);
  request.headers.set('content-type', 'application/json');
};

export const formRequest: RequestMiddleware<any, any> = (url, request) => {
  const form = new URLSearchParams(Object.entries(request.data));
  request.body = form.toString();
  request.headers.set('content-type', 'application/x-www-form-urlencoded');
};

export const jsonResponse = async <Output, Params, Data>(response: Response): Promise<Output> => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e: any) {
    throw new Error(`${e.message}\n${text}`);
  }
};

export const textResponse = async <Output, Params, Data>(response: Response): Promise<Output> => {
  return response.text() as unknown as Output;
};
