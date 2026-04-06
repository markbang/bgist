import {QueryClient} from '@tanstack/react-query';
import {GitHubApiError} from './errors';

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (
    error instanceof GitHubApiError &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  ) {
    return false;
  }

  return failureCount < 1;
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        staleTime: 30_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
