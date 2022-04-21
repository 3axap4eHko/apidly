# APIDLY

NodeJS and Browser API client.
In order to use with NodeJS please pick you favorite Fetch API polyfill library like [cross-fetch](https://www.npmjs.com/package/cross-fetch).

[![Build Status][github-image]][github-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Maintainability][codeclimate-image]][codeclimate-url]
[![Snyk][snyk-image]][snyk-url]

## Table of Contents

  - [Features](#features)
  - [Browser Support](#browser-support)
  - [Installing](#installing)
  - [Examples](#examples)
  - [License](#license)

## Features

- Uses [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) (requires fetch polyfill for NodeJS)
- Automatic transforms for JSON/Form data. Also, supports any custom data transformation
- TypeScript support
- Retry mechanism
- Request and Response middlewares

## Browser Support

![Chrome][chrome-image] | ![Firefox][firefox-image] | ![Safari][safari-image] | ![Opera][opera-image] | ![Edge][edge-image] |
--- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |


[chrome-image]: https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png?1
[firefox-image]: https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png?1
[safari-image]: https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png?1
[opera-image]: https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png?1
[edge-image]: https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png?1

## Installing

Using yarn:

```bash
$ yarn add apidly
```

Using npm:

```bash
$ npm install apidly
```

## Examples

### Simple Example

```typescript
import 'cross-fetch/polyfill';
import { createClient, createEndpoint } from 'apidly';

const client = createClient({ base: 'https://api.example.com' });

interface Post {
  id: string;
  title: string;
  content: string;
}

const postsListEndpoint = createEndpoint<Post[]>('/api/v1/posts');

export const listPosts = () => client(postsListEndpoint);
```

### Advanced Example

```typescript
import { createClient, createEndpoint, formRequest, ApidlyRequest } from '../index';
import { getAccessToken } from './authorization';

const client = createClient({
  base: 'https://api.example.com',
  headers: { locale: 'en_US' },     // default client's headers
  requestType: formRequest,         // use form-urlencoded request type
  maxRetries: 3,                    // additional retries count
}).request(async (url: URL, request: ApidlyRequest) => {
  // custom request middleware with authentication
  const token = await getAccessToken();
  request.headers.set('authorization', `Bearer ${token}`);
});

interface Post {
  id: string;
  title: string;
  content: string;
}

interface UpdatePostParams {
  id: string;
}

interface UpdatePostData {
  title: string;
  content: string;
}

const postsUpdateEndpoint = createEndpoint<Post, UpdatePostParams, UpdatePostData>('/api/v1/posts/{id}', { method: 'put' });

export function updatePost(id: string, post: UpdatePostData) {
  return client(postsUpdateEndpoint, { params: { id }, data: post });
}
```

## License

License [Apache-2.0](http://www.apache.org/licenses/LICENSE-2.0)
Copyright (c) 2021-present Ivan Zakharchanka

[npm-url]: https://www.npmjs.com/package/apidly
[downloads-image]: https://img.shields.io/npm/dw/apidly.svg?maxAge=43200
[npm-image]: https://img.shields.io/npm/v/apidly.svg?maxAge=43200
[github-url]: https://github.com/3axap4eHko/apidly/actions/workflows/cicd.yml
[github-image]: https://github.com/3axap4eHko/apidly/actions/workflows/cicd.yml/badge.svg
[codecov-url]: https://codecov.io/gh/3axap4eHko/apidly
[codecov-image]: https://codecov.io/gh/3axap4eHko/apidly/branch/master/graph/badge.svg?token=JZ8QCGH6PI
[codeclimate-url]: https://codeclimate.com/github/3axap4eHko/apidly/maintainability
[codeclimate-image]: https://api.codeclimate.com/v1/badges/0ba20f27f6db2b0fec8c/maintainability
[snyk-url]: https://snyk.io/test/npm/apidly/latest
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/3axap4eHko/apidly.svg?maxAge=43200
