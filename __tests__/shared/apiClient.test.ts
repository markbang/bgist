import {githubClient} from '../../src/shared/api/client';

test('sets a hard timeout for GitHub API requests', () => {
  expect(githubClient.defaults.timeout).toBe(15000);
});
