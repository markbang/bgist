import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {Gist, UserInfo} from '../../src/types/gist';
import UserProfileScreen from '../../src/features/profile/screens/UserProfileScreen';

jest.mock('../../src/features/gists/api/gists', () => ({
  getUserGists: jest.fn(),
  getUserInfo: jest.fn(),
}));

jest.mock('../../src/features/auth/session/SessionProvider', () => ({
  useSession: jest.fn(() => ({
    status: 'signedIn',
    user: {
      login: 'viewer',
      name: 'Viewer',
      avatar_url: 'https://example.com/viewer.png',
    },
    signOut: jest.fn(),
  })),
}));

jest.mock('../../src/i18n/context', () => ({
  useI18n: jest.fn(() => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: (key: string) =>
      (
        {
          'profile.publicGists': 'Public gists',
          'profile.followers': 'Followers',
          'profile.following': 'Following',
          'userProfile.publicRepos': 'Public repos',
          'userProfile.eyebrow': 'Profile',
          'userProfile.subtitle':
            'Public GitHub identity, follow signals, and published gists in one mobile-first view.',
          'userProfile.publicProfile': 'Public profile',
          'userProfile.openGitHub': 'Open GitHub profile',
          'userProfile.sectionTitle': 'Public gists',
          'userProfile.sectionSubtitle':
            'Open any published gist to inspect files, comments, and history.',
          'userProfile.loadingTitle': 'Loading profile',
          'userProfile.loadingDescription':
            'Fetching public profile details and published gists from GitHub.',
          'userProfile.errorTitle': 'Could not load this profile',
          'userProfile.errorDescription':
            'Retry to fetch the latest profile card and public gist list.',
          'userProfile.emptyTitle': 'No public gists yet',
          'userProfile.emptyDescription':
            'This user has not published any public gists yet.',
        } as Record<string, string>
      )[key] ?? key,
  })),
}));

const {getUserGists, getUserInfo} = jest.requireMock('../../src/features/gists/api/gists') as {
  getUserGists: jest.Mock;
  getUserInfo: jest.Mock;
};

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

function createUserInfo(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    login: 'octocat',
    id: 1,
    avatar_url: 'https://example.com/octocat.png',
    html_url: 'https://github.com/octocat',
    name: 'The Octocat',
    company: '@github',
    blog: 'https://github.blog',
    location: 'San Francisco',
    email: null,
    bio: 'Shipping gists from mobile.',
    public_repos: 8,
    public_gists: 12,
    followers: 320,
    following: 5,
    created_at: '2026-04-06T00:00:00Z',
    ...overrides,
  };
}

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

function renderScreen() {
  const navigation = {
    navigate: jest.fn(),
  };

  render(
    <UserProfileScreen
      navigation={navigation as never}
      route={{
        key: 'UserProfile-octocat',
        name: 'UserProfile',
        params: {username: 'octocat'},
      }}
    />,
    {wrapper: createWrapper()},
  );

  return {navigation};
}

afterEach(() => {
  jest.clearAllMocks();
});

test('renders profile details, stats, public gists, and opens gist detail', async () => {
  getUserInfo.mockResolvedValue(createUserInfo());
  getUserGists.mockResolvedValue([
    createGist(),
    createGist({id: 'gist-2', description: 'Another gist'}),
  ]);

  const {navigation} = renderScreen();

  expect((await screen.findAllByText('The Octocat')).length).toBeGreaterThan(0);
  expect(screen.getAllByText('@octocat').length).toBeGreaterThan(0);
  expect(screen.getByText('Shipping gists from mobile.')).toBeTruthy();
  expect(screen.getByText('12')).toBeTruthy();
  expect(screen.getAllByText('Public gists').length).toBeGreaterThan(0);
  expect(screen.getByText('320')).toBeTruthy();
  expect(screen.getByText('Followers')).toBeTruthy();
  expect(screen.getByText('5')).toBeTruthy();
  expect(screen.getByText('Following')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Useful gist'})).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Another gist'})).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Useful gist'}));

  expect(navigation.navigate).toHaveBeenCalledWith('GistDetail', {gistId: 'gist-1'});
  expect(getUserInfo).toHaveBeenCalledWith('octocat');
  expect(getUserGists).toHaveBeenCalledWith('octocat', 1, 30);
});

test('shows an error state when the profile request fails', async () => {
  getUserInfo.mockRejectedValue(new Error('boom'));
  getUserGists.mockResolvedValue([]);

  renderScreen();

  expect(await screen.findByText('Could not load this profile')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Try again'})).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Try again'}));

  await waitFor(() => {
    expect(getUserInfo).toHaveBeenCalledTimes(2);
  });
});
