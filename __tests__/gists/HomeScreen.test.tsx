import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import type {Gist} from '../../src/types/gist';
import {HomeScreen} from '../../src/features/gists/screens/HomeScreen';
import {parseGistReference} from '../../src/features/gists/utils/parseGistReference';
import {useHomeFeed} from '../../src/features/gists/hooks/useHomeFeed';

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

test('switches the home feed from My to Starred when the segment is pressed', () => {
  (useHomeFeed as jest.Mock).mockImplementation((segment: 'my' | 'starred') => ({
    segment,
    setSegment: jest.fn(),
    gists: segment === 'my' ? [createGist({id: 'mine-1', description: 'My gist'})] : [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }));

  render(<HomeScreen navigation={{navigate: jest.fn()}} />);

  expect(screen.getByText('My gist')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Starred'}));

  expect(useHomeFeed).toHaveBeenLastCalledWith('starred');
});

test('parses gist ids from gist URLs and raw id input', () => {
  expect(parseGistReference('https://gist.github.com/octocat/aa5a315d61ae9438b18d')).toEqual({
    gistId: 'aa5a315d61ae9438b18d',
    kind: 'url',
  });
  expect(parseGistReference('aa5a315d61ae9438b18d')).toEqual({
    gistId: 'aa5a315d61ae9438b18d',
    kind: 'id',
  });
  expect(parseGistReference('not-a-gist')).toBeNull();
});
