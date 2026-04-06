import {githubClient} from '../../src/shared/api/client';
import {GitHubApiError} from '../../src/shared/api/errors';
import type {GistComment} from '../../src/types/gist';
import {loadGistSupport} from '../../src/features/gists/api/loadGistSupport';

jest.mock('../../src/shared/api/client', () => ({
  githubClient: {
    get: jest.fn(),
  },
}));

function createComment(): GistComment {
  return {
    id: 1,
    body: 'Looks good',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user: {
      login: 'octocat',
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/octocat',
      html_url: 'https://github.com/octocat',
      type: 'User',
      site_admin: false,
    },
  };
}

test('treats a 404 starred check as unstarred while still loading comments', async () => {
  (githubClient.get as jest.Mock).mockImplementation((path: string) => {
    if (path === '/gists/gist-123/star') {
      return Promise.reject(
        new GitHubApiError({
          message: 'Not Found',
          status: 404,
          cause: new Error('404'),
        }),
      );
    }

    if (path === '/gists/gist-123/comments') {
      return Promise.resolve({data: [createComment()]});
    }

    throw new Error(`Unexpected path: ${path}`);
  });

  const result = await loadGistSupport('gist-123');

  expect(result.starred).toBe(false);
  expect(result.starredError).toBeNull();
  expect(result.comments).toHaveLength(1);
});
