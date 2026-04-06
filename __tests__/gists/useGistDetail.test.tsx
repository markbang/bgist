import React from 'react';
import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {queryKeys} from '../../src/shared/api/queryKeys';
import {useGistDetail} from '../../src/features/gists/hooks/useGistDetail';
import {getGist} from '../../src/features/gists/api/gists';
import {loadGistSupport} from '../../src/features/gists/api/loadGistSupport';

jest.mock('../../src/features/gists/api/gists', () => ({
  getGist: jest.fn(),
}));

jest.mock('../../src/features/gists/api/loadGistSupport', () => ({
  loadGistSupport: jest.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });

  return function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return {promise, resolve, reject};
}

test('defines the shared query keys for session and gist queries', () => {
  expect(queryKeys.session).toEqual(['session']);
  expect(queryKeys.myGists).toEqual(['gists', 'mine']);
  expect(queryKeys.starredGists).toEqual(['gists', 'starred']);
  expect(queryKeys.publicGists).toEqual(['gists', 'public']);
  expect(queryKeys.gistDetail('gist-123')).toEqual(['gists', 'detail', 'gist-123']);
  expect(queryKeys.gistSupport('gist-123')).toEqual(['gists', 'support', 'gist-123']);
  expect(queryKeys.gistHistory('gist-123')).toEqual(['gists', 'history', 'gist-123']);
  expect(queryKeys.userProfile('octocat')).toEqual(['users', 'profile', 'octocat']);
  expect(queryKeys.userGists('octocat')).toEqual(['users', 'gists', 'octocat']);
});

test('waits for gist detail success before loading support data', async () => {
  const gistDeferred = createDeferred<{id: string}>();
  (getGist as jest.Mock).mockReturnValue(gistDeferred.promise);
  (loadGistSupport as jest.Mock).mockResolvedValue({
    starred: false,
    starredError: null,
    comments: [],
    commentsError: null,
  });

  renderHook(() => useGistDetail('gist-123'), {
    wrapper: createWrapper(),
  });

  expect(getGist).toHaveBeenCalledWith('gist-123');
  expect(loadGistSupport).not.toHaveBeenCalled();

  gistDeferred.resolve({id: 'gist-123'});

  await waitFor(() => {
    expect(loadGistSupport).toHaveBeenCalledWith('gist-123');
  });
});
