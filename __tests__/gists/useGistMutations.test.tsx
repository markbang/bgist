import React from 'react';
import {act, renderHook, waitFor} from '@testing-library/react-native';
import {notifyManager} from '@tanstack/query-core';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useGistMutations} from '../../src/features/gists/hooks/useGistMutations';
import {queryKeys} from '../../src/shared/api/queryKeys';
import {
  addGistComment,
  createGist,
  deleteGist,
  editGist,
  forkGist,
  starGist,
  unstarGist,
} from '../../src/features/gists/api/gists';

jest.mock('../../src/features/gists/api/gists', () => ({
  addGistComment: jest.fn(),
  createGist: jest.fn(),
  deleteGist: jest.fn(),
  editGist: jest.fn(),
  forkGist: jest.fn(),
  starGist: jest.fn(),
  unstarGist: jest.fn(),
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({children}: {children: React.ReactNode}) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

afterEach(() => {
  jest.clearAllMocks();
});

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

function seedCommonCaches(queryClient: QueryClient, gistId: string, username = 'octocat') {
  queryClient.setQueryData(queryKeys.gistDetail(gistId), {id: gistId});
  queryClient.setQueryData(queryKeys.gistSupport(gistId), {starred: true});
  queryClient.setQueryData(queryKeys.gistHistory(gistId), [{version: '1'}]);
  queryClient.setQueryData(queryKeys.myGists, [{id: gistId}]);
  queryClient.setQueryData(queryKeys.starredGists, [{id: gistId}]);
  queryClient.setQueryData(queryKeys.publicGists, [{id: gistId}]);
  queryClient.setQueryData(queryKeys.userGists(username), [{id: gistId}]);
  queryClient.setQueryData(queryKeys.userProfile(username), {login: username});
}

test('star mutation invalidates the gist support cache and starred feed caches', async () => {
  const queryClient = createTestQueryClient();
  const gistId = 'gist-1';

  queryClient.setQueryData(queryKeys.gistDetail(gistId), {id: gistId});
  queryClient.setQueryData(queryKeys.gistSupport(gistId), {starred: false});
  queryClient.setQueryData(queryKeys.myGists, [{id: gistId}]);
  queryClient.setQueryData(queryKeys.starredGists, [{id: gistId}]);
  queryClient.setQueryData(queryKeys.publicGists, [{id: gistId}]);

  (starGist as jest.Mock).mockResolvedValue(undefined);

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.starGistMutation.mutateAsync({gistId});
  });

  await waitFor(() => {
    expect(queryClient.getQueryState(queryKeys.gistSupport(gistId))?.isInvalidated).toBe(true);
  });

  expect(starGist).toHaveBeenCalledWith(gistId);
  expect(queryClient.getQueryState(queryKeys.gistDetail(gistId))?.isInvalidated ?? false).toBe(
    false,
  );
  expect(queryClient.getQueryState(queryKeys.myGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.starredGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.publicGists)?.isInvalidated).toBe(true);
});

test('comment mutation invalidates gist detail and support caches', async () => {
  const queryClient = createTestQueryClient();
  const gistId = 'gist-9';
  seedCommonCaches(queryClient, gistId);

  (addGistComment as jest.Mock).mockResolvedValue({id: 1});

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.addCommentMutation.mutateAsync({body: 'hello', gistId});
  });

  expect(queryClient.getQueryState(queryKeys.gistDetail(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.gistSupport(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.gistHistory(gistId))?.isInvalidated ?? false).toBe(
    false,
  );
});

test('create mutation invalidates gist feeds and user caches', async () => {
  const queryClient = createTestQueryClient();
  const gistId = 'gist-created';
  const username = 'octocat';
  seedCommonCaches(queryClient, 'existing-gist', username);

  (createGist as jest.Mock).mockResolvedValue({id: gistId});

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.createGistMutation.mutateAsync({
      description: 'created',
      files: {'hello.ts': {content: 'export const hello = "world";'}},
      public: true,
    });
  });

  expect(createGist).toHaveBeenCalled();
  expect(queryClient.getQueryState(queryKeys.myGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.starredGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.publicGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.userGists(username))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.userProfile(username))?.isInvalidated).toBe(true);
});

test('edit mutation invalidates gist detail, history, and feed caches', async () => {
  const queryClient = createTestQueryClient();
  const gistId = 'gist-9';
  seedCommonCaches(queryClient, gistId);

  (editGist as jest.Mock).mockResolvedValue({id: gistId});

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.editGistMutation.mutateAsync({
      gistId,
      params: {
        description: 'updated',
        files: {'hello.ts': {content: 'updated'}},
      },
    });
  });

  expect(editGist).toHaveBeenCalledWith(gistId, {
    description: 'updated',
    files: {'hello.ts': {content: 'updated'}},
  });
  expect(queryClient.getQueryState(queryKeys.gistDetail(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.gistHistory(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.gistSupport(gistId))?.isInvalidated ?? false).toBe(
    false,
  );
  expect(queryClient.getQueryState(queryKeys.myGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.starredGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.publicGists)?.isInvalidated).toBe(true);
});

test('delete mutation invalidates gist detail, support, history, feed, and user caches', async () => {
  const queryClient = createTestQueryClient();
  const gistId = 'gist-9';
  const username = 'octocat';
  seedCommonCaches(queryClient, gistId, username);

  (deleteGist as jest.Mock).mockResolvedValue(undefined);

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.deleteGistMutation.mutateAsync({gistId});
  });

  expect(deleteGist).toHaveBeenCalledWith(gistId);
  expect(queryClient.getQueryState(queryKeys.gistDetail(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.gistSupport(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.gistHistory(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.myGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.starredGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.publicGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.userGists(username))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.userProfile(username))?.isInvalidated).toBe(true);
});

test('unstar mutation invalidates gist support and feed caches', async () => {
  const queryClient = createTestQueryClient();
  const gistId = 'gist-9';
  seedCommonCaches(queryClient, gistId);

  (unstarGist as jest.Mock).mockResolvedValue(undefined);

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.unstarGistMutation.mutateAsync({gistId});
  });

  expect(unstarGist).toHaveBeenCalledWith(gistId);
  expect(queryClient.getQueryState(queryKeys.gistSupport(gistId))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.gistDetail(gistId))?.isInvalidated ?? false).toBe(
    false,
  );
  expect(queryClient.getQueryState(queryKeys.myGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.starredGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.publicGists)?.isInvalidated).toBe(true);
});

test('fork mutation invalidates gist feeds and user caches', async () => {
  const queryClient = createTestQueryClient();
  const username = 'octocat';
  seedCommonCaches(queryClient, 'gist-9', username);

  (forkGist as jest.Mock).mockResolvedValue({id: 'gist-forked'});

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.forkGistMutation.mutateAsync({gistId: 'gist-9'});
  });

  expect(forkGist).toHaveBeenCalledWith('gist-9');
  expect(queryClient.getQueryState(queryKeys.myGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.starredGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.publicGists)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.userGists(username))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(queryKeys.userProfile(username))?.isInvalidated).toBe(true);
});

test('comment, create, edit, delete, unstar, and fork mutations call their matching APIs', async () => {
  const queryClient = createTestQueryClient();
  const gistId = 'gist-9';
  seedCommonCaches(queryClient, gistId);

  (addGistComment as jest.Mock).mockResolvedValue({id: 1});
  (createGist as jest.Mock).mockResolvedValue({id: 'gist-created'});
  (editGist as jest.Mock).mockResolvedValue({id: gistId});
  (deleteGist as jest.Mock).mockResolvedValue(undefined);
  (unstarGist as jest.Mock).mockResolvedValue(undefined);
  (forkGist as jest.Mock).mockResolvedValue({id: 'gist-forked'});

  const {result} = renderHook(() => useGistMutations(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.addCommentMutation.mutateAsync({body: 'hello', gistId});
    await result.current.createGistMutation.mutateAsync({
      description: 'created',
      files: {'hello.ts': {content: 'export const hello = "world";'}},
      public: true,
    });
    await result.current.editGistMutation.mutateAsync({
      gistId,
      params: {
        description: 'updated',
        files: {'hello.ts': {content: 'updated'}},
      },
    });
    await result.current.deleteGistMutation.mutateAsync({gistId});
    await result.current.unstarGistMutation.mutateAsync({gistId});
    await result.current.forkGistMutation.mutateAsync({gistId});
  });

  expect(addGistComment).toHaveBeenCalledWith(gistId, 'hello');
  await act(async () => {
    await Promise.resolve();
  });

  expect(createGist).toHaveBeenCalled();
  expect(editGist).toHaveBeenCalledWith(gistId, {
    description: 'updated',
    files: {'hello.ts': {content: 'updated'}},
  });
  expect(deleteGist).toHaveBeenCalledWith(gistId);
  expect(unstarGist).toHaveBeenCalledWith(gistId);
  expect(forkGist).toHaveBeenCalledWith(gistId);
});
