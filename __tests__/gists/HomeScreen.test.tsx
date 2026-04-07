import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {Gist} from '../../src/types/gist';
import {HomeScreen} from '../../src/features/gists/screens/HomeScreen';
import {ExploreScreen} from '../../src/features/gists/screens/ExploreScreen';
import {parseGistReference} from '../../src/features/gists/utils/parseGistReference';
import {useHomeFeed} from '../../src/features/gists/hooks/useHomeFeed';
import {getPublicGists, searchGists} from '../../src/features/gists/api/gists';

jest.mock('../../src/features/gists/api/gists', () => ({
  getPublicGists: jest.fn(),
  searchGists: jest.fn(),
}));

jest.mock('../../src/features/gists/hooks/useHomeFeed', () => ({
  useHomeFeed: jest.fn(),
}));

function createGist(overrides: Partial<Gist> = {}): Gist {
  return {
    id: 'gist-1',
    node_id: 'node-1',
    url: 'https://api.github.com/gists/gist-1',
    forks_url: 'https://api.github.com/gists/gist-1/forks',
    commits_url: 'https://api.github.com/gists/gist-1/commits',
    git_pull_url: 'https://gist.github.com/gist-1.git',
    git_push_url: 'https://gist.github.com/gist-1.git',
    html_url: 'https://gist.github.com/octocat/gist-1',
    files: {
      'hello.ts': {
        filename: 'hello.ts',
        type: 'application/typescript',
        language: 'TypeScript',
        raw_url: 'https://gist.githubusercontent.com/raw/hello.ts',
        size: 42,
        truncated: false,
        content: 'export const hello = "world";',
      },
    },
    public: true,
    created_at: '2026-04-06T00:00:00Z',
    updated_at: '2026-04-06T00:00:00Z',
    description: 'Useful gist',
    comments: 2,
    user: null,
    owner: {
      login: 'octocat',
      id: 1,
      avatar_url: 'https://example.com/octocat.png',
      gravatar_id: '',
      url: 'https://api.github.com/users/octocat',
      html_url: 'https://github.com/octocat',
      type: 'User',
      site_admin: false,
    },
    truncated: false,
    fork_of: null,
    ...overrides,
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

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

test('switches the home feed from My to Starred when the segment is pressed', () => {
  const setSegment = jest.fn();

  (useHomeFeed as jest.Mock).mockReturnValue({
    segment: 'my',
    setSegment,
    items: [createGist({id: 'mine-1', description: 'My gist'})],
    isLoading: false,
    isRefreshing: false,
    isError: false,
    refetch: jest.fn(),
  });

  render(<HomeScreen navigation={{navigate: jest.fn()}} />);

  expect(screen.getByText('My gist')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Starred'}));

  expect(setSegment).toHaveBeenCalledWith('starred');
});

test('supports native pull-to-refresh on the home feed list', () => {
  const refetch = jest.fn();

  (useHomeFeed as jest.Mock).mockReturnValue({
    segment: 'my',
    setSegment: jest.fn(),
    items: [createGist({id: 'mine-1', description: 'My gist'})],
    isLoading: false,
    isRefreshing: false,
    isError: false,
    refetch,
  });

  render(<HomeScreen navigation={{navigate: jest.fn()}} />);

  screen.getByTestId('home-feed-list').props.onRefresh();

  expect(refetch).toHaveBeenCalled();
});

test('keeps the home header focused by omitting the old descriptive subtitle', () => {
  (useHomeFeed as jest.Mock).mockReturnValue({
    segment: 'my',
    setSegment: jest.fn(),
    items: [createGist({id: 'mine-1', description: 'My gist'})],
    isLoading: false,
    isRefreshing: false,
    isError: false,
    refetch: jest.fn(),
  });

  render(<HomeScreen navigation={{navigate: jest.fn()}} />);

  expect(screen.getByText('Home')).toBeTruthy();
  expect(
    screen.queryByText('Switch between your own gists and the ones you have starred.'),
  ).toBeNull();
});

test('parses gist ids from gist URLs and raw id input', () => {
  expect(parseGistReference('https://gist.github.com/octocat/aa5a315d61ae9438b18d')).toEqual({
    gistId: 'aa5a315d61ae9438b18d',
  });
  expect(parseGistReference('aa5a315d61ae9438b18d')).toEqual({
    gistId: 'aa5a315d61ae9438b18d',
  });
  expect(parseGistReference('not-a-gist')).toBeNull();
});

test('explore screen only auto-navigates once per gist reference and allows a new input to navigate again', async () => {
  const navigate = jest.fn();
  const navigation = {navigate};

  (getPublicGists as jest.Mock).mockImplementation(() => new Promise(() => {}));
  (searchGists as jest.Mock).mockResolvedValue([]);

  const {rerender} = render(<ExploreScreen navigation={navigation} />, {
    wrapper: createWrapper(),
  });

  fireEvent.changeText(
    screen.getByLabelText('Search public gists'),
    'https://gist.github.com/octocat/aa5a315d61ae9438b18d',
  );

  await waitFor(() => {
    expect(getPublicGists).toHaveBeenCalledWith(
      1,
      30,
      expect.objectContaining({aborted: false}),
    );
    expect(navigate).toHaveBeenCalledWith('GistDetail', {
      gistId: 'aa5a315d61ae9438b18d',
    });
  });

  rerender(<ExploreScreen navigation={navigation} />);

  await waitFor(() => {
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  fireEvent.changeText(screen.getByLabelText('Search public gists'), 'bb6b9a4012f0c1234567');

  await waitFor(() => {
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenLastCalledWith('GistDetail', {
      gistId: 'bb6b9a4012f0c1234567',
    });
  });
});

test('explore screen uses the remote gist search api for keyword queries', async () => {
  const navigation = {navigate: jest.fn()};

  (getPublicGists as jest.Mock).mockResolvedValue([createGist({id: 'public-1'})]);
  (searchGists as jest.Mock).mockResolvedValue([createGist({id: 'search-1', description: 'Search match'})]);

  render(<ExploreScreen navigation={navigation} />, {
    wrapper: createWrapper(),
  });

  fireEvent.changeText(screen.getByLabelText('Search public gists'), 'react query');

  await waitFor(() => {
    expect(searchGists).toHaveBeenCalledWith(
      'react query',
      1,
      30,
      expect.objectContaining({aborted: false}),
    );
  });

  expect(await screen.findByText('Search match')).toBeTruthy();
});
