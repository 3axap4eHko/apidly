import { Request, RequestParameters, RequestMiddleware } from '../Request';
import { Endpoint, createEndpoint } from '../endpoint';

describe('Endpoint test suite', () => {
  it('Should create an Endpoint', () => {
    expect(() => createEndpoint('/', 'get', () => { })).not.toThrowError();
  })

  it('Should create an Endpoint', () => {
    const route = '/';
    const middleware: RequestMiddleware = jest.fn();
    const endpoint = new Endpoint(route, { middleware });

    expect(endpoint.route).toEqual(route);
    expect(endpoint.method).toEqual('get');
    expect(endpoint.middleware).toEqual(middleware);
  })
});
