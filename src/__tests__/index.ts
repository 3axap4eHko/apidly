import { Request, RequestMiddleware } from '../Request';
import { createClient } from '../client';
import { createEndpoint } from '../endpoint';

globalThis.fetch = jest.fn();

function mockFetch(response: Response) {
  return (<jest.MockedFunction<typeof fetch>>fetch).mockReturnValue(Promise.resolve(response));
}

describe('APIDLY test suite', () => {
  it('Should make a request', async () => {
    const base = 'http://localhost';
    const route = '/test/:id';
    const method = 'post';
    const body = JSON.stringify({ test: 1 });

    const responseData = { test: 'value' }
    const response = new Response(JSON.stringify(responseData));
    const mockedFetch = mockFetch(response);


    const clientMiddleware = jest.fn((req: Request, params: any) => {
      req.set('client', params.client);
    });
    const client = createClient({ base });
    client.use(clientMiddleware);

    const endpointMiddleware = jest.fn((req: Request, params: any) => {
      req.set('endpoint', params.endpoint);
    });
    const endpoint = createEndpoint(route, 'post', endpointMiddleware);

    const request = client(endpoint);
    await request({
      params: { id: 1, client: 1, endpoint: 1 },
      headers: {
        request: 1,
      },
      body,
    });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    const [url, requestInit] = mockedFetch.mock.calls[0];
    expect(url).toEqual(`${base}/test/1`);
    expect(requestInit.method).toEqual(method);
    expect(requestInit.body).toEqual(body);

    expect([...(requestInit.headers as Headers).entries()]).toEqual([
      ['client', '1'],
      ['endpoint', '1'],
      ['request', '1'],
    ]);

    expect(clientMiddleware).toHaveBeenCalled();
    expect(endpointMiddleware).toHaveBeenCalled();
  });
});
