import createEndpoint from '../createEndpoint';

describe('Endpoint test suite', () => {
  it('Should create an Endpoint', () => {
    expect(() => createEndpoint('/')).not.toThrowError();
  });

  it('Should create an Endpoint', () => {
    type Output = any;
    type Params = { id: number; fields: string };
    type Data = { content: string };
    const route = '/post/{id}?fields={fields}';
    const options = {
      data: { content: 'test' },
      params: { id: 1, fields: 'title' },
    };
    const reqMiddleware = jest.fn();
    const resMiddleware = jest.fn();
    const endpoint = createEndpoint<Output, Params, Data>(route, options).request(reqMiddleware).response(resMiddleware);

    expect(endpoint.path).toEqual(route);
    expect(endpoint.options).toEqual(options);
    expect(endpoint.middlewares.request).toContain(reqMiddleware);
    expect(endpoint.middlewares.response).toContain(resMiddleware);

    const path = endpoint.compilePath(options.params);
    expect(path).toEqual('/post/1?fields=title');
  });
});
