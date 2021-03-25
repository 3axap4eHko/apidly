import Evnty from 'evnty';
import { Request } from '../Request';

function createRequest() {
  const events = {
    start: Evnty(),
    done: Evnty(),
    error: Evnty(),
  }
  const base = 'https://example.com';
  const url = new URL('/', base);
  const method = 'get';
  const headers = new Headers();
  const body: BodyInit = null;

  const request = new Request(url, {
    method,
    headers,
    body,
    events,
  });

  return {
    url,
    method,
    headers,
    request,
    body,
    events,
  }
}

describe('Request test suite', () => {
  it('Should create a Request', () => {
    expect(createRequest).not.toThrowError();
  });

  it('Should return provided options', () => {
    const { request, url, method, body } = createRequest();
    expect(request.url).toEqual(url);
    expect(request.method).toEqual(method);
    expect(request.body).toEqual(body);
  });

  it('Should set headers', () => {
    const { request, headers } = createRequest();
    request.set('test', 'value');
    expect(request.get('test')).toEqual('value');
    expect(headers.get('test')).toEqual('value');
  });

  it('Should set request as JSON', () => {
    const { request } = createRequest();
    const body = { test: 'value' };
    request.asJSON(body);

    expect(request.get('content-type')).toEqual('application/json');
    expect(request.body).toEqual(JSON.stringify(body));
  });

  it('Should set request as form', () => {
    const { request } = createRequest();
    const body = { test: 'value' };
    request.asForm(body);

    expect(request.get('content-type')).toEqual('application/x-www-form-urlencoded');
    expect(request.body).toEqual(new URLSearchParams(body).toString());
  });

  it('Should return RequestInit object', () => {
    const { request, method, headers, body } = createRequest();
    const init = request.getInit();

    expect(init).toEqual({ method, headers, body });
  });
});
