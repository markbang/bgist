import React from 'react';
import {act, renderHook, waitFor} from '@testing-library/react-native';
import {notifyManager} from '@tanstack/query-core';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {queryKeys} from '../../src/shared/api/queryKeys';
import {useGistDetail} from '../../src/features/gists/hooks/useGistDetail';
import {getGist, getGistComments} from '../../src/features/gists/api/gists';
import {loadGistSupport} from '../../src/features/gists/api/loadGistSupport';

jest.mock('../../src/features/gists/api/gists', () => ({
  getGist: jest.fn(),
  getGistComments: jest.fn(),
}));

jest.mock('../../src/features/gists/api/loadGistSupport', () => ({
  loadGistSupport: jest.fn(),
}));

const testQueryClients: QueryClient[] = [];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
  testQueryClients.push(queryClient);

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

beforeAll(() => {
  notifyManager.setNotifyFunction(callback => {
    act(callback);
  });
});

afterAll(() => {
  notifyManager.setNotifyFunction(callback => {
    callback();
  });
});

afterEach(async () => {
  await Promise.all(
    testQueryClients.map(async queryClient => {
      await queryClient.cancelQueries();
      queryClient.clear();
    }),
  );
  testQueryClients.length = 0;
  jest.clearAllMocks();
});

test('defines the shared query keys for session and gist queries', () => {
  expect(queryKeys.session).toEqual(['session']);
  expect(queryKeys.myGists).toEqual(['gists', 'mine']);
  expect(queryKeys.starredGists).toEqual(['gists', 'starred']);
  expect(queryKeys.publicGists).toEqual(['gists', 'public']);
  expect(queryKeys.gistDetail('gist-123')).toEqual(['gists', 'detail', 'gist-123']);
  expect(queryKeys.gistSupport('gist-123')).toEqual(['gists', 'support', 'gist-123']);
  expect(queryKeys.gistComments('gist-123')).toEqual(['gists', 'comments', 'gist-123']);
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
  });

  renderHook(() => useGistDetail('gist-123'), {
    wrapper: createWrapper(),
  });

  expect(getGist).toHaveBeenCalledWith('gist-123', expect.any(Object));
  expect(loadGistSupport).not.toHaveBeenCalled();

  await act(async () => {
    gistDeferred.resolve({id: 'gist-123'});
  });

  await waitFor(() => {
    expect(loadGistSupport).toHaveBeenCalledWith(
      'gist-123',
      {
        gistUrl: undefined,
        isPublic: undefined,
      },
      expect.any(Object),
    );
  });
});

test('does not load gist comments until comments are explicitly enabled', async () => {
  const gistDeferred = createDeferred<{id: string}>();
  (getGist as jest.Mock).mockReturnValue(gistDeferred.promise);
  (loadGistSupport as jest.Mock).mockResolvedValue({
    starred: false,
    starredError: null,
  });
  (getGistComments as jest.Mock).mockResolvedValue([]);

  let loadComments = false;

  const {rerender} = renderHook(() => useGistDetail('gist-123', {loadComments}), {
    wrapper: createWrapper(),
  });

  await act(async () => {
    gistDeferred.resolve({id: 'gist-123'});
  });

  await waitFor(() => {
    expect(loadGistSupport).toHaveBeenCalledWith(
      'gist-123',
      {
        gistUrl: undefined,
        isPublic: undefined,
      },
      expect.any(Object),
    );
  });

  expect(getGistComments).not.toHaveBeenCalled();

  loadComments = true;
  rerender({});

  await waitFor(() => {
    expect(getGistComments).toHaveBeenCalledWith('gist-123', expect.any(Object));
  });
});
