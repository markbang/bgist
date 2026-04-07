import React from 'react';
import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useHomeFeed} from '../../src/features/gists/hooks/useHomeFeed';
import {getMyGists, getStarredGists} from '../../src/features/gists/api/gists';

jest.mock('../../src/features/gists/api/gists', () => ({
  getMyGists: jest.fn(),
  getStarredGists: jest.fn(),
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
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

test('prefetches the other home feed after the current feed loads', async () => {
  (getMyGists as jest.Mock).mockResolvedValue([{id: 'mine-1'}]);
  (getStarredGists as jest.Mock).mockResolvedValue([{id: 'star-1'}]);

  const {result} = renderHook(() => useHomeFeed(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.items).toEqual([{id: 'mine-1'}]);
  });

  await waitFor(() => {
    expect(getStarredGists).toHaveBeenCalledTimes(1);
  });
});
