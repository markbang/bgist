import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Linking} from 'react-native';
import {GistHistoryScreen} from '../../src/features/gists/screens/GistHistoryScreen';
import {getGist} from '../../src/features/gists/api/gists';

jest.mock('../../src/features/gists/api/gists', () => ({
  getGist: jest.fn(),
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

beforeEach(() => {
  jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

test('opens revision links using gist html url instead of the api url', async () => {
  const apiRevisionUrl = 'https://api.github.com/gists/gist-1/abc123456789';

  (getGist as jest.Mock).mockResolvedValue({
    html_url: 'https://gist.github.com/octocat/gist-1',
    history: [
      {
        version: 'abc123456789',
        committed_at: '2026-04-06T00:00:00Z',
        change_status: {
          additions: 3,
          deletions: 1,
          total: 4,
        },
        user: {
          login: 'octocat',
        },
        url: apiRevisionUrl,
      },
    ],
  });

  render(
    <GistHistoryScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{key: 'GistHistory-gist-1', name: 'GistHistory', params: {gistId: 'gist-1'}}}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(await screen.findByText('Revision abc1234')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Open revision'}));

  expect(Linking.openURL).toHaveBeenCalledWith('https://gist.github.com/octocat/gist-1/abc123456789');
  expect(Linking.openURL).not.toHaveBeenCalledWith(apiRevisionUrl);
});
