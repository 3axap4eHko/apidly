import createClient from '../createClient';

describe('Client test suite', () => {
  it('Should create a Client', () => {
    expect(() => {
      createClient({ base: 'https://example.com' });
    }).not.toThrowError();
  });

  it('Should set properties', () => {
    const base = 'https://example.com';
    const options = { base };

    const client = createClient(options);
    expect(typeof client.onStart).toBe('function');
    expect(typeof client.onDone).toBe('function');
    expect(typeof client.onError).toBe('function');
    expect(typeof client.request).toBe('function');
    expect(typeof client.response).toBe('function');
  });
});
