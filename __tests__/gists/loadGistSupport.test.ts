import type {GistComment} from '../../src/types/gist';
import {getGistComments, isGistStarred} from '../../src/features/gists/api/gists';
import {loadGistSupport} from '../../src/features/gists/api/loadGistSupport';

jest.mock('../../src/features/gists/api/gists', () => ({
  getGistComments: jest.fn(),
  isGistStarred: jest.fn(),
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

test('loads comments even when the star status request fails', async () => {
  (isGistStarred as jest.Mock).mockRejectedValue(new Error('404'));
  (getGistComments as jest.Mock).mockResolvedValue([createComment()]);

  const result = await loadGistSupport('gist-123');

  expect(result.starred).toBeNull();
  expect(result.starredError).toBe('404');
  expect(result.comments).toHaveLength(1);
});
