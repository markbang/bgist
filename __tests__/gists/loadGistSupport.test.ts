import {githubClient} from '../../src/shared/api/client';
import {GitHubApiError} from '../../src/shared/api/errors';
import {loadGistSupport} from '../../src/features/gists/api/loadGistSupport';

jest.mock('../../src/shared/api/client', () => ({
  githubClient: {
    get: jest.fn(),
  },
}));

test('treats a 404 starred check as unstarred', async () => {
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

    throw new Error(`Unexpected path: ${path}`);
  });

  const result = await loadGistSupport('gist-123');

  expect(result.starred).toBe(false);
  expect(result.starredError).toBeNull();
});
