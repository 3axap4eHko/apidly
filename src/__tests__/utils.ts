import { pickFirstOption, omit, sanitize, retry, defaultRetryStrategy, compile } from '../utils';

const PERFORMANCE_TEST_COUNT = 1000000;
const PERFORMANCE_TEST_URL = 'https://example.com/{value1}/{value2}/{value3}';
const PERFORMANCE_TEST_PARAMS = { value1: 'foo', value2: 'bar', value3: 'baz' };
const PERFORMANCE_TEST_RESULT = 'https://example.com/foo/bar/baz';

describe('Utils test suite', () => {
  it('Should pickFirstOption if exists', () => {
    type Data = { id: number };
    const data1 = { id: 1 };
    const data2 = { id: 2 };
    const first = pickFirstOption<Data, number>('id', 0, data1, data2);
    expect(first).toEqual(1);
  });

  it("Should pickFirstOption as default if doesn't exists", () => {
    type Data = { id?: number };
    const data1 = {};
    const data2 = {};
    const first = pickFirstOption<Data, number>('id', 0, data1, data2);
    expect(first).toEqual(0);
  });

  it('Should omit keys', () => {
    const data = { a: 1, b: 2, c: 3 };
    const ommitedData = omit(data, ['b']);
    expect(ommitedData).toHaveProperty('b');
    expect(ommitedData).not.toHaveProperty('a');
    expect(ommitedData).not.toHaveProperty('c');
    expect(ommitedData.b).toEqual(2);
  });

  it('Should sanitize object', () => {
    const data: Record<string, any> = { a: void 0, b: 0, c: false, d: '' };
    const sanitizedData = sanitize(data);
    expect(sanitizedData).not.toHaveProperty('a');
    expect(sanitizedData).toHaveProperty('b');
    expect(sanitizedData).toHaveProperty('c');
    expect(sanitizedData).toHaveProperty('d');
  });

  it('Should retry', async () => {
    const error = new Error;
    const fn = jest.fn(() => {
      throw error;
    });
    await expect(retry(fn, defaultRetryStrategy, 1)).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('Should compile url', async () => {
    const build = compile('https://example.com/{encoded}/[preserved]/?query={query}');

    const fullExample = build({ encoded: '@', preserved: '@', query: 'query' });
    expect(fullExample).toEqual('https://example.com/%40/@/?query=query');

    const partialExample = build({ encoded: '@' });
    expect(partialExample).toEqual('https://example.com/%40//?query=');
  });

  it('Should do the trick url', async () => {
    const build = compile('https://example.com/{value1.toLowerCase()}/{value2?.toLowerCase()}');

    const partialExample = build({ value1: 'Test' });
    expect(partialExample).toEqual('https://example.com/test/');
  });

  it('Should check performance test validity', async () => {
    const build = compile(PERFORMANCE_TEST_URL);
    const test = build(PERFORMANCE_TEST_PARAMS);
    expect(test).toEqual(PERFORMANCE_TEST_RESULT);
  });

  it(`Should do performance test for ${PERFORMANCE_TEST_COUNT} samples`, async () => {
    let i = PERFORMANCE_TEST_COUNT;
    const build = compile(PERFORMANCE_TEST_URL);
    while (--i) {
      build(PERFORMANCE_TEST_PARAMS);
    }
  });
});
