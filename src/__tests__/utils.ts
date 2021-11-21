import { pickFirstOption, omit, sanitize, retry, defaultRetryStrategy } from '../utils';

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
});
