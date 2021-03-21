import * as PTR from 'path-to-regexp';
import { RequestParameters } from './Request';

export interface CompileURL {
  (params: RequestParameters): URL;
}

function omit(data: any, keys: string[]) {
  return Object.fromEntries(keys.map(key => [key, data[key]]).filter(([, value]) => typeof value !== 'undefined'));
}

export default function createCompiler(route: string, base: string): CompileURL {
  const url = new URL(route, base);
  const paramsKeys: PTR.Key[] = [];
  PTR.pathToRegexp(url.pathname, paramsKeys);

  const pathKeys: string[] = paramsKeys.map(({ name }) => name.toString());
  const queryKeysMap: [string, string][] = [...url.searchParams.entries()].map(([key, value]) => [key, value.replace(/^:/, '')]);

  const pathFunction = PTR.compile(url.pathname, { encode: encodeURIComponent });

  return (params: RequestParameters) => {
    const pathParams = omit(params, pathKeys);
    const pathname = pathFunction(pathParams);
    const url = new URL(pathname, base);

    for(const [name, key] of queryKeysMap) {
      const value = params[key]?.toString();
      if (typeof value !== 'undefined') {
        url.searchParams.set(name, value);
      }
    }
    return url;
  };
}
