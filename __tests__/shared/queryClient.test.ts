import {createAppQueryClient} from '../../src/shared/api/queryClient';
import {GitHubApiError} from '../../src/shared/api/errors';

test('configures mobile-friendly query defaults for caching and transient retries', () => {
  const client = createAppQueryClient();
  const defaults = client.getDefaultOptions().queries;
  const retry = defaults?.retry as ((failureCount: number, error: unknown) => boolean) | undefined;
  const retryDelay = defaults?.retryDelay as
    | ((failureCount: number, error: unknown) => number)
    | undefined;

  expect(defaults?.staleTime).toBe(120000);
  expect(defaults?.gcTime).toBe(1800000);
  expect(defaults?.refetchOnReconnect).toBe(true);
  expect(retry?.(0, new Error('offline'))).toBe(true);
  expect(retry?.(1, new Error('timeout'))).toBe(true);
  expect(retry?.(2, new Error('still broken'))).toBe(false);
  expect(
    retry?.(
      0,
      new GitHubApiError({
        message: 'Not Found',
        status: 404,
        cause: new Error('404'),
      }),
    ),
  ).toBe(false);
  expect(retryDelay?.(0, new Error('offline'))).toBe(1000);
  expect(retryDelay?.(2, new Error('offline'))).toBe(4000);
  expect(retryDelay?.(8, new Error('offline'))).toBe(8000);
});
