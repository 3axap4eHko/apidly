# APIDLY

Node and Browser API module.

[![Coverage Status][codecov-image]][codecov-url]
[![Build Status][github-image]][github-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Snyk][snyk-image]][snyk-url]

## Usage

```typescript
import { createClient, createEndpoint, Request, Parameters } from 'apidly';

const client = createClient({ base: 'https://example.com' });
// client level middleware
client.use((req: Request) => req.set('content-type', 'application/json'));

// client error handling
client.onError((e: Error, url: string, init: RequestInit) => {
  console.error(e);
  throw e;
});

// endpoint with middleware
const endpoint = createEndpoint('/api/v1/resource/:resourceId?draft=:isDraft', 'post', (req: Request, params: Parameters) => {
  req.set('x-namespace', params.namespace);
});

// create a reusable request
const request = client(endpoint);

// request execution
const response = await request({
  params: { resourceId: 123, isDraft: true, namespace: 'namespace' },
  body: JSON.stringify({ title: 'title', content: 'content' }),
});
```

## License
License [The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) 2021 Ivan Zakharchanka

[npm-url]: https://www.npmjs.com/package/apidly
[downloads-image]: https://img.shields.io/npm/dw/apidly.svg?maxAge=43200
[npm-image]: https://img.shields.io/npm/v/apidly.svg?maxAge=43200
[github-url]: https://github.com/3axap4eHko/apidly/actions/workflows/cicd.yml
[github-image]: https://github.com/3axap4eHko/apidly/actions/workflows/cicd.yml/badge.svg
[codecov-url]: https://codecov.io/gh/3axap4eHko/apidly
[codecov-image]: https://img.shields.io/codecov/c/github/3axap4eHko/apidly/master.svg?maxAge=43200
[snyk-url]: https://snyk.io/test/npm/apidly/latest
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/3axap4eHko/apidly.svg?maxAge=43200
