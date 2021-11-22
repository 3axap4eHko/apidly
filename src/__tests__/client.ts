import createClient, { ClientOptions } from '../createClient';
import createEndpoint from '../createEndpoint';
import { RequestMiddleware, ResponseMiddleware } from '../types';

globalThis.fetch = jest.fn();

jest.unmock('evnty');

function mockFetchResponse(response: Response) {
  return (<jest.MockedFunction<typeof fetch>>fetch).mockReturnValue(Promise.resolve(response));
}

function mockFetchResult(data: any) {
  return mockFetchResponse(new Response(JSON.stringify(data)));
}

function mockFetchError(error: Error) {
  return (<jest.MockedFunction<typeof fetch>>fetch).mockImplementation(async () => {
    throw error;
  });
}

function mockFetchImplementation(fn: any) {
  return (<jest.MockedFunction<typeof fetch>>fetch).mockImplementation(fn);
}

const BASE = 'https://localhost';
const clientOptions: ClientOptions = {
  base: BASE,
  headers: { clientHeader: '1' },
};
const client = createClient(clientOptions);

describe('Use cases test suite', () => {
  it('Should call events', async () => {
    const result = new Error('Client fetch error');
    const uri = '/api/v1/test/:id';
    const fetch = mockFetchError(result);

    const startListener = jest.fn();
    const errorListener = jest.fn();
    const doneListener = jest.fn();

    client.onStart(startListener);
    client.onError(errorListener);
    client.onDone(doneListener);

    const endpoint = createEndpoint<string, { id: number }>(uri);
    await expect(client(endpoint, { params: { id: 1 } })).rejects.toEqual(result);

    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test/1`, expect.any(Object));

    expect(startListener).toHaveBeenCalled();
    expect(errorListener).toHaveBeenCalled();
    expect(doneListener).toHaveBeenCalled();
  });

  it('Should make a get request with no params', async () => {
    const result = { test: 1 };
    const uri = '/api/v1/test';
    const fetch = mockFetchResult(result);

    const endpoint = createEndpoint(uri);
    const response = await client(endpoint);

    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test`, expect.any(Object));
    expect(response).toEqual(result);
  });

  it('Should make a get request with path params', async () => {
    const result = { test: 1 };
    const uri = '/api/v1/test/:id';
    const fetch = mockFetchResult(result);

    const endpoint = createEndpoint(uri);
    const response = await client(endpoint, { params: { id: 1 } });

    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test/1`, expect.any(Object));
    expect(response).toEqual(result);
  });

  it('Should make a get request with path and query params', async () => {
    const result = { test: 1 };
    const uri = '/api/v1/test/:id?search=:query';
    const fetch = mockFetchResult(result);

    const endpoint = createEndpoint(uri);
    const response = await client(endpoint, { params: { id: 1, query: 'test' } });

    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test/1?search=test`, expect.any(Object));
    expect(response).toEqual(result);
  });

  it('Should make a post request with path, query params, headers and data', async () => {
    const result = { test: 1 };
    type Output = typeof result;
    const uri = '/api/v1/test/:id?search=:query&limit=:limit';
    const fetch = mockFetchResult(result);

    type Params = { id: number; query: string; limit?: number };
    enum Locale {
      EN_US = 'en_US',
      EN_GB = 'en_GB',
    }
    type Data = { locale: Locale };

    const requestMiddleware = <jest.MockedFunction<RequestMiddleware<Output, Params, Data>>>jest.fn((url, req) => {
      expect(url.searchParams.has('search')).toEqual(true);
      expect(url.searchParams.has('limit')).toEqual(false);
      expect(url.searchParams.get('search')).toEqual('test');
      expect(typeof url.searchParams.get('search')).toEqual('string');

      const headers = new Headers(req.headers);
      expect(headers.get('clientHeader')).toEqual('1');
      expect(headers.get('endpointHeader')).toEqual('1');
      expect(headers.get('requestHeader')).toEqual('1');

      expect(req.data).toHaveProperty('locale');
      expect(req.data.locale).toEqual('en_GB');
    });
    const responseMiddleware = <jest.MockedFunction<ResponseMiddleware<Output>>>jest.fn((res) => {});

    client.request(requestMiddleware).response(responseMiddleware);

    const endpoint = createEndpoint<Output, Params, Data>(uri, {
      method: 'post',
      headers: { endpointHeader: '1' },
      data: { locale: Locale.EN_US },
    })
      .request(requestMiddleware)
      .response(responseMiddleware);

    const response = await client(endpoint, { headers: { requestHeader: '1' }, params: { id: 1, query: 'test' }, data: { locale: Locale.EN_GB } });
    expect(requestMiddleware).toHaveBeenCalledTimes(2);
    expect(responseMiddleware).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test/1?search=test`, expect.any(Object));
    expect(response).toEqual(result);
  });

  it('Should retry on fail', async () => {
    let count = 3;
    const reqMiddleware = jest.fn();
    const client = createClient({ base: BASE, maxRetries: 3 }).request(reqMiddleware);
    const endpoint = createEndpoint('/test');

    mockFetchImplementation(async () => {
      if (count--) {
        throw new Error();
      }
      return new Response(JSON.stringify('OK'));
    });

    const response = await client(endpoint);
    expect(response).toEqual('OK');
    expect(reqMiddleware).toBeCalledTimes(4);
  });
});
