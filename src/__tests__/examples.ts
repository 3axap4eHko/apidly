import { createClient, createEndpoint, RequestOptions } from '../index';

interface CommonParams {
  clientId: string;
}

const client = createClient<CommonParams>({ base: 'https://virtserver.swaggerhub.com' });

interface OAuthToken {
  access_token: string;
  type: string;
  expires_in: number;
}

interface Credentials {
  grant_type: string;
  client_id: string;
  client_secret: string;
}

const oauthTokenEndpoint = createEndpoint<OAuthToken, never, Credentials>('/3axap4eHko/APIDLY.IO/1.0.0/oauth/token', { method: 'post' });
const oauthToken = () => client(oauthTokenEndpoint);

const accessTokens = new Map<string, Promise<string>>();
const createAuthenticatedEndpoint = <Output, Params = any, Data = any>(path: string, options?: RequestOptions<Output, Partial<Params & CommonParams>, Partial<Data>>) => {
  return createEndpoint(path, options).request(async (url, req) => {
    if (!accessTokens.has(req.params.clientId)) {
      accessTokens.set(
        req.params.clientId,
        (async () => {
          const { access_token, expires_in } = await oauthToken();
          setTimeout(() => accessTokens.delete(req.params.clientId), expires_in * 1000 * 0.9).unref();

          return access_token;
        })()
      );
    }
    req.headers.set('authorization', await accessTokens.get(req.params.clientId));
  });
};

interface Post {
  id: string;
  title: string;
  content: string;
}

interface PostSearch {
  search?: string;
  page?: number;
  count?: number;
}

const searchPostsEndpoint = createEndpoint<Post[], PostSearch, void>('/3axap4eHko/APIDLY.IO/1.0.0/posts?search={search}&page={page}&count={count}');

interface GetPost {
  id: string;
}

const getPostEndpoint = createEndpoint<Post, GetPost>('/3axap4eHko/APIDLY.IO/1.0.0/posts/{id}');

interface CreatePostData {
  title: string;
  content: string;
}

const createPostNoAuth = createEndpoint<Post, void, CreatePostData>('/3axap4eHko/APIDLY.IO/1.0.0/posts', { method: 'post' });
const createPost = createAuthenticatedEndpoint<Post, void, CreatePostData>('/3axap4eHko/APIDLY.IO/1.0.0/posts', { method: 'post' });

describe('E2E Apidly test suite', () => {
  it('Should search posts', async () => {
    const posts = await client(searchPostsEndpoint, { params: { search: 'test', page: 1, count: 1 } });
    expect(posts).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
      })
    );
  });

  it('Should get a post', async () => {
    const posts = await client(getPostEndpoint, { params: { id: 'test' } });
    expect(posts).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      content: expect.any(String),
    });
  });

  it('Should create a post', async () => {
    const posts = await client(createPost, { data: { title: 'string', content: 'string' } });
    expect(posts).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      content: expect.any(String),
    });
  });

  it('Should not create a post', async () => {
    const posts = await client(createPostNoAuth, { data: { title: 'string', content: 'string' } });
    expect(posts).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      content: expect.any(String),
    });
  });
});
