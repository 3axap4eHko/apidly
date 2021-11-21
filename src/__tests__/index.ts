import * as Module from '../index';

describe('Module test suite', () => {
  it('Should export functions', () => {
    expect(typeof Module.Client).toEqual('function');
    expect(typeof Module.createClient).toEqual('function');
    expect(typeof Module.createEndpoint).toEqual('function');
    expect(typeof Module.formRequest).toEqual('function');
    expect(typeof Module.textResponse).toEqual('function');
    expect(typeof Module.jsonRequest).toEqual('function');
    expect(typeof Module.jsonResponse).toEqual('function');
  });
});
