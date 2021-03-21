import { Event } from 'evnty';

export type Value = string | number;

export interface RequestParameters {
  [key: string]: Value;
}

export interface Events {
  start: Event;
  done: Event;
  error: Event;
}

export interface RequestOptions {
  method: string;
  headers: Headers;
  body?: BodyInit;
  events: Events;
}

export interface RequestMiddleware {
  (req: Request, params: RequestParameters): Promise<void> | void;
}

export class Request {
  #url: URL;
  #method: string;
  #headers: Headers;
  #body: BodyInit;

  constructor(url: URL, options: RequestOptions) {
    this.#url = url;
    this.#method = options.method;
    this.#headers = options.headers;
    this.#body = options.body;
  }

  get url() {
    return this.#url;
  }

  get method() {
    return this.#method;
  }

  get body() {
    return this.#body;
  }

  set(name: string, value: string) {
    this.#headers.set(name, value);

    return this;
  }

  asJSON(body: any) {
    this.set('content-type', 'application/json');
    this.#body = JSON.stringify(body);

    return this;
  }

  asForm(data: any) {
    this.set('content-type', 'application/x-www-form-urlencoded');
    const form = new URLSearchParams(Object.entries(data))
    this.#body = form.toString();

    return this;
  }

  getInit(): RequestInit {
    return {
      method: this.#method,
      headers: this.#headers,
      body: this.#body,
    };
  }
}
