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

    const responseData = { test: 'value' }
    const response = new Response(JSON.stringify(responseData));
    mockFetch(response);


    const clientMiddleware = jest.fn();
    const client = createClient({ base });
    client.use(clientMiddleware);

    const endpointMiddleware = jest.fn();
    const endpoint = createEndpoint(route, 'post', endpointMiddleware);

    const request = client(endpoint);
    await request({ params: { id: 1 } });

    expect(global.fetch).toHaveBeenCalled();
    expect(clientMiddleware).toHaveBeenCalled();
    expect(endpointMiddleware).toHaveBeenCalled();
  });
});
