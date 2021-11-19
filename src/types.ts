export interface RequestType<Output, Params, Data> {
  (url: URL, request: ApidlyRequest<Output, Params, Data>): Promise<void> | void;
}

export interface ResponseType<Output, Params, Data> {
  (response: Response, request: ApidlyRequest<Output, Params, Data>): Promise<Output> | Output;
}

export interface RequestOptions<Output, Params, Data> extends RequestInit {
  data?: Data;
  params?: Params;
  requestType?: RequestType<Output, Params, Data>;
  responseType?: ResponseType<Output, Params, Data>;
}

export interface ApidlyRequest<Output, Params, Data> extends Omit<RequestOptions<Output, Params, Data>, 'headers'> {
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
