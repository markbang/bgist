import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {Gist} from '../../src/types/gist';
import {HomeScreen} from '../../src/features/gists/screens/HomeScreen';
import {ExploreScreen} from '../../src/features/gists/screens/ExploreScreen';
import {parseGistReference} from '../../src/features/gists/utils/parseGistReference';
import {useHomeFeed} from '../../src/features/gists/hooks/useHomeFeed';
import {getPublicGists} from '../../src/features/gists/api/gists';

jest.mock('../../src/features/gists/api/gists', () => ({
  getPublicGists: jest.fn(),
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
    isError: false,
    refetch: jest.fn(),
  });

  render(<HomeScreen navigation={{navigate: jest.fn()}} />);

  expect(screen.getByText('My gist')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Starred'}));

  expect(setSegment).toHaveBeenCalledWith('starred');
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

  const {rerender} = render(<ExploreScreen navigation={navigation} />, {
    wrapper: createWrapper(),
  });

  fireEvent.changeText(
    screen.getByLabelText('Search public gists'),
    'https://gist.github.com/octocat/aa5a315d61ae9438b18d',
  );

  await waitFor(() => {
    expect(getPublicGists).toHaveBeenCalledWith(1);
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
