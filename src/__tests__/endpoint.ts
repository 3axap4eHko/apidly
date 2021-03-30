import { RequestMiddleware } from '../Request';
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

  it('Should compile an Endpoint', () => {
    const base = 'https://localhost';
    const route = '/test/:id';
    const endpoint = new Endpoint(route);
    const compile = endpoint(base);
    expect(compile({ id: 1 }).toString()).toEqual(`https://localhost/test/1`);
  })
});
