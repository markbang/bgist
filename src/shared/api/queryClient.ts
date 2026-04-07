import {QueryClient} from '@tanstack/react-query';
import {GitHubApiError} from './errors';

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (
    error instanceof GitHubApiError &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  ) {
    return false;
  }

  return failureCount < 2;
}

function getRetryDelay(attemptIndex: number) {
  return Math.min(1000 * 2 ** attemptIndex, 8000);
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        retryDelay: getRetryDelay,
        staleTime: 120_000,
        gcTime: 30 * 60_000,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
