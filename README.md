# APIDLY

Node and Browser API module.

[![Build Status][github-image]][github-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Maintainability][codeclimate-image]][codeclimate-url]
[![Snyk][snyk-image]][snyk-url]

## Usage

### General Example

```typescript
import { createClient, createEndpoint } from 'apidly';

const client = createClient({ base: 'https://:region.example.com' });

interface SearchParams {
  searchParam: string;
  pageParam: number;
  countParam: number;
}

interface Post {
  title: string;
  content: string;
}

const postsSearchEndpoint = createEndpoint<Post, SearchParams>('/api/v1/posts?search=:searchParam&page=:pageParam&count=:countParam');

export function searchPosts(searchParam: string, pageParam: number, countParam: number = 20) {
  return client(postsSearchEndpoint, { params: { searchParam, pageParam, countParam } });
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
