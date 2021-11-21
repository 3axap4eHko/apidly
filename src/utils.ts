import { RetryStrategy } from './types';

export const pickFirstOption = <O, T>(name: keyof O, defaultValue: T, ...options: O[]): T => {
  for (const option of options) {
    if (typeof option[name] !== 'undefined') {
      return option[name] as unknown as T;
    }
  }
  return defaultValue;
};

export const omit = (data: any, keys: string[]) => {
  return Object.fromEntries(keys.map((key) => [key, data[key]]).filter(([, value]) => typeof value !== 'undefined'));
};

export const sanitize = <T>(data: any) => {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => typeof value !== 'undefined')) as unknown as T;
};

export const defaultRetryStrategy: RetryStrategy = (times: number) => Math.min(times ** 2 * 50, 2000);

export const retry = async <T>(fn: () => T | Promise<T>, retryStrategy: RetryStrategy, maxRetries: number): Promise<T> => {
  let retries = 0;
  while (true) {
    try {
      return (await fn()) as T;
    } catch (e: any) {
      const delay = retryStrategy(++retries);
      await new Promise((resolve, reject) => {
        if (retries <= maxRetries) {
          setTimeout(resolve, delay);
        } else {
          reject(e);
        }
      });
    }
  }
};
