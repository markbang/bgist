import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import ProfileScreen from '../../src/features/profile/screens/ProfileScreen';

jest.mock('../../src/features/gists/api/gists', () => ({
  getUserInfo: jest.fn(),
}));

jest.mock('../../src/features/auth/session/SessionProvider', () => ({
  useSession: jest.fn(() => ({
    status: 'signedIn',
    user: {
      login: 'octocat',
      name: 'The Octocat',
      avatar_url: 'https://example.com/octocat.png',
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
          'profile.title': 'Profile',
          'profile.defaultDisplayName': 'GitHub user',
          'profile.publicGists': 'Public gists',
          'profile.followers': 'Followers',
          'profile.following': 'Following',
          'profile.loadingTitle': 'Loading profile',
          'profile.loadingDescription': 'Fetching your profile card.',
          'profile.emptyTitle': 'No profile',
          'profile.emptyDescription': 'Sign in to continue.',
          'profile.settings': 'Open settings',
        } as Record<string, string>
      )[key] ?? key,
  })),
}));

const {getUserInfo} = jest.requireMock('../../src/features/gists/api/gists') as {
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

afterEach(() => {
  jest.clearAllMocks();
});

test('opens the settings screen from the profile header', async () => {
  getUserInfo.mockResolvedValue({
    login: 'octocat',
    name: 'The Octocat',
    avatar_url: 'https://example.com/octocat.png',
    html_url: 'https://github.com/octocat',
    bio: 'Shipping gists from mobile.',
    public_gists: 12,
    followers: 320,
    following: 5,
  });

  const navigation = {
    navigate: jest.fn(),
  };

  render(<ProfileScreen navigation={navigation as never} route={undefined as never} />, {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(screen.getByText('The Octocat')).toBeTruthy();
  });
  await waitFor(() => {
    expect(screen.queryByText('profile.refreshingTitle')).toBeNull();
  });

  fireEvent.press(screen.getByRole('button', {name: 'Open settings'}));

  expect(navigation.navigate).toHaveBeenCalledWith('Settings');
});
