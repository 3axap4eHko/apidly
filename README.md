# APIDLY

Node and Browser API module.

[![Build Status][github-image]][github-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Maintainability][codeclimate-image]][codeclimate-url]
[![Snyk][snyk-image]][snyk-url]

## Usage

### Simple Example

```typescript
import { createClient, createEndpoint } from 'apidly';

const client = createClient({ base: 'https://api.example.com' });

interface Post {
  id: string;
  title: string;
  content: string;
}

const postsListEndpoint = createEndpoint<Post[]>('/api/v1/posts');

export const listPosts = () => client(postsSearchEndpoint);
```

### Advanced Example

```typescript
import { createClient, createEndpoint, formRequest, ApidlyRequest } from '../index';
import { getAccessToken } from './authorization';

const client = createClient({
  base: 'https://api.example.com',
  headers: { locale: 'en_US' }, // default client's headers
  requestType: formRequest, // use form-urlencoded request type
})
  .request(async (url: URL, request: ApidlyRequest) => {
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

const postsUpdateEndpoint = createEndpoint<Post, UpdatePostParams, UpdatePostData>('/api/v1/posts/:id', { method: 'put' });

export function updatePost(id: string, post: UpdatePostData) {
  return client(postsUpdateEndpoint, { params: { id }, data: post });
}
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
[codecov-image]: https://codecov.io/gh/3axap4eHko/apidly/branch/master/graph/badge.svg?token=JZ8QCGH6PI
[codeclimate-url]: https://codeclimate.com/github/3axap4eHko/apidly/maintainability
[codeclimate-image]: https://api.codeclimate.com/v1/badges/0ba20f27f6db2b0fec8c/maintainability
[snyk-url]: https://snyk.io/test/npm/apidly/latest
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/3axap4eHko/apidly.svg?maxAge=43200
