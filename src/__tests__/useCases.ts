import { createClient, createEndpoint, createCredentials } from '../index';

globalThis.fetch = jest.fn();

function mockFetch(data: any) {
  return (<jest.MockedFunction<typeof fetch>>fetch).mockReturnValue(Promise.resolve(new Response(JSON.stringify(data))));
}

const BASE = 'https://localhost';
const clientOptions = { base: BASE };

describe('Use cases test suite', () => {
  it('Should make a get request with no params', async () => {
    const result = { test: 1 };
    const uri = '/api/v1/test';
    const fetch = mockFetch(result);

    const client = createClient(clientOptions);
    const endpoint = createEndpoint(uri, 'get');
    const request = client(endpoint);

    const response = await request();
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test`, expect.any(Object));
    expect(response).toEqual(result);
  });

  it('Should make a get request with path params', async () => {
    const result = { test: 1 };
    const uri = '/api/v1/test/:id';
    const fetch = mockFetch(result);

    const client = createClient(clientOptions);
    const endpoint = createEndpoint(uri, 'get');
    const request = client(endpoint);

    const response = await request({ params: { id: 1 } });
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test/1`, expect.any(Object));
    expect(response).toEqual(result);
  });

  it('Should make a get request with path and query params', async () => {
    const result = { test: 1 };
    const uri = '/api/v1/test/:id?search=:query';
    const fetch = mockFetch(result);

    const client = createClient(clientOptions);
    const endpoint = createEndpoint(uri, 'get');
    const request = client(endpoint);

    const response = await request({ params: { id: 1, query: 'test' } });
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test/1?search=test`, expect.any(Object));
    expect(response).toEqual(result);
  });

  it('Should make an authenticated get request with path and query params', async () => {
    const result = { test: 1 };
    const uri = '/api/v1/test/:id?search=:query';
    const fetch = mockFetch(result);

    const credentials = createCredentials<any>(async () => ({ credentials: null, expires: 0 }));
    const client = createClient(clientOptions);
    const endpoint = createEndpoint(uri, 'get');
    const request = client(endpoint);

    const response = await request({ params: { id: 1, query: 'test' } });
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/v1/test/1?search=test`, expect.any(Object));
    expect(response).toEqual(result);
  });
});

