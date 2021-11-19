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
