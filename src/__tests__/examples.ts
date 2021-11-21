import { createClient, createEndpoint } from '../index';

const client = createClient({ base: 'https://virtserver.swaggerhub.com/3axap4eHko/APIDLY.IO/1.0.0/posts' })
  .request(() => {

  });

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

const searchPosts = createEndpoint<Post[], PostSearch, void>('/3axap4eHko/APIDLY.IO/1.0.0/posts?search=:search&page=:page&count=:count');

interface GetPost {
  id: string;
}

const getPost = createEndpoint<Post, GetPost>('/3axap4eHko/APIDLY.IO/1.0.0/posts/:id');

interface CreatePostData {
  title: string;
  content: string;
}

const createPost = createEndpoint<Post, void, CreatePostData>('/3axap4eHko/APIDLY.IO/1.0.0/posts', { method: 'post' });

describe('E2E Apidly test suite', () => {
  it('Should search posts', async () => {
    const posts = await client(searchPosts, { params: { search: 'test', page: 1, count: 1 } });
    expect(posts).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
      })
    );
  });

  it('Should get a post', async () => {
    const posts = await client(getPost, { params: { id: 'test' } });
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
});
