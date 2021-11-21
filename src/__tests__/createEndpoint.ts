import { RequestOptions } from '../types';
import createEndpoint from '../createEndpoint';

describe('Endpoint test suite', () => {
  it('Should create an Endpoint', () => {
    expect(() => createEndpoint('/')).not.toThrowError();
  });

  it('Should create an Endpoint', () => {
    const route = '/post/:id?fields=:fields';
    const options: RequestOptions<any, { id: number; fields: string }, {}> = {
      data: {},
      params: { id: 1, fields: 'title' },
    };
    const reqMiddleware = jest.fn();
    const resMiddleware = jest.fn();
    const endpoint = createEndpoint(route, options).request(reqMiddleware).response(resMiddleware);

    expect(endpoint.path).toEqual(route);
    expect(endpoint.options).toEqual(options);
    expect(endpoint.pathKeys).toEqual(['id']);
    expect(endpoint.queryKeysMap).toEqual([['fields', 'fields']]);
    expect(endpoint.middlewares.request).toContain(reqMiddleware);
    expect(endpoint.middlewares.response).toContain(resMiddleware);

    const path = endpoint.compile(options.params);
    expect(path).toEqual('/post/1');
  });
});
