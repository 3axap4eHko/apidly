import createCompiler from '../createCompiler';

describe('createCompiler test suite', () => {
  it('Should compile endpoint', () => {
    const compile = createCompiler('api/v1/posts/:post/search?search=:query&offset=:offset&count=:count', 'https://localhost/');
    const url = compile({ post: 1, count: 10 });
    expect(url).toEqual('https://localhost/api/v1/posts/1/search?count=10');
  });
})
