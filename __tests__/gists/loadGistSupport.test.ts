import {githubClient} from '../../src/shared/api/client';
import {GitHubApiError} from '../../src/shared/api/errors';
import {loadGistSupport} from '../../src/features/gists/api/loadGistSupport';

jest.mock('../../src/shared/api/client', () => ({
  getApiAccessToken: jest.fn(() => 'token-123'),
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

test('loads fork count from the forks API and star count from the public gist page', async () => {
  (githubClient.get as jest.Mock).mockImplementation((path: string) => {
    if (path === '/gists/gist-123/star') {
      return Promise.resolve({status: 204});
    }

    if (path === '/gists/gist-123/forks') {
      return Promise.resolve({
        data: [{id: 'fork-1'}],
        headers: {
          link: '<https://api.github.com/gists/gist-123/forks?page=1859&per_page=1>; rel="last"',
        },
      });
    }

    throw new Error(`Unexpected path: ${path}`);
  });

  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    text: async () => `
      <a href="/octocat/gist-123/stargazers" class="UnderlineNav-item">
        Stars
        <span class="d-flex" aria-hidden="true"><span title="5,000+" data-view-component="true" class="Counter">5,000+</span></span>
      </a>
      <a href="/octocat/gist-123/forks" class="UnderlineNav-item">
        Forks
        <span class="d-flex" aria-hidden="true"><span title="1,859" data-view-component="true" class="Counter">1,859</span></span>
      </a>
    `,
  })) as jest.Mock;

  const result = await loadGistSupport('gist-123', {
    gistUrl: 'https://gist.github.com/octocat/gist-123',
    isPublic: true,
  });

  expect(result.starred).toBe(true);
  expect(result.starredError).toBeNull();
  expect(result.starCount).toBe(5000);
  expect(result.forkCount).toBe(1859);
});
