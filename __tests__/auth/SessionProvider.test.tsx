import React from 'react';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import {Text} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import * as AppAuth from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';
import {RootNavigator} from '../../src/app/navigation/RootNavigator';
import {assertOAuthConfig, githubOAuthConfig} from '../../src/features/auth/config/oauth';
import {SessionProvider, useSession} from '../../src/features/auth/session/SessionProvider';
import {queryKeys} from '../../src/shared/api/queryKeys';

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(),
}));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => <>{children}</>,
  DefaultTheme: {colors: {}},
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: ({component: Component}: {component: React.ComponentType}) => <Component />,
  }),
}));

function Probe() {
  const {status, user} = useSession();
  return <Text>{status}:{user?.login ?? 'none'}</Text>;
}

const originalClientId = githubOAuthConfig.clientId;

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

function renderWithSession(
  children: React.ReactNode,
  queryClient = createTestQueryClient(),
) {
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>,
    ),
  };
}

afterEach(() => {
  githubOAuthConfig.clientId = originalClientId;
  jest.clearAllMocks();
  jest.restoreAllMocks();
  delete (global as {fetch?: typeof fetch}).fetch;
});

test('restores a stored session', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
    username: 'oauth',
    password: JSON.stringify({
      accessToken: 'token-123',
      user: {login: 'bangwu'},
    }),
  });

  renderWithSession(<Probe />);

  await waitFor(() => {
    expect(screen.getByText('signedIn:bangwu')).toBeTruthy();
  });
});

test('falls back to signedOut when session restore fails', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
    new Error('keychain unavailable'),
  );

  renderWithSession(<Probe />);

  await waitFor(() => {
    expect(screen.getByText('signedOut:none')).toBeTruthy();
  });
});

test('waits for secure session restore before showing the login screen', async () => {
  let resolveReadSession: ((value: false) => void) | undefined;

  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    () =>
      new Promise(resolve => {
        resolveReadSession = resolve;
      }),
  );

  renderWithSession(<RootNavigator />);

  expect(screen.queryByText('Sign in with GitHub')).toBeNull();
  expect(screen.getByText('Restoring session…')).toBeTruthy();

  resolveReadSession?.(false);

  await waitFor(() => {
    expect(screen.getByText('Sign in with GitHub')).toBeTruthy();
  });
});

test('assertOAuthConfig throws while the client id is still a placeholder', () => {
  githubOAuthConfig.clientId = 'YOUR_GITHUB_OAUTH_CLIENT_ID';

  expect(() => assertOAuthConfig()).toThrow('GITHUB_OAUTH_CLIENT_ID_MISSING');
});

test('signIn stores the OAuth session', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
  (AppAuth.authorize as jest.Mock).mockResolvedValue({
    accessToken: 'token-456',
  });
  githubOAuthConfig.clientId = 'bgist-test-client-id';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({login: 'octocat'}),
  }) as jest.Mock;

  let sessionApi: ReturnType<typeof useSession> | null = null;

  function SignInProbe() {
    sessionApi = useSession();
    return <Text>{sessionApi.status}:{sessionApi.user?.login ?? 'none'}</Text>;
  }

  renderWithSession(<SignInProbe />);

  await waitFor(() => {
    expect(screen.getByText('signedOut:none')).toBeTruthy();
  });

  await act(async () => {
    await sessionApi?.signIn();
  });

  expect(Keychain.setGenericPassword).toHaveBeenCalled();

  await waitFor(() => {
    expect(screen.getByText('signedIn:octocat')).toBeTruthy();
  });
});

test('clears query cache on signIn and signOut transitions', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
  (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);
  (AppAuth.authorize as jest.Mock).mockResolvedValue({
    accessToken: 'token-789',
  });
  githubOAuthConfig.clientId = 'bgist-test-client-id';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({login: 'octocat'}),
  }) as jest.Mock;

  let sessionApi: ReturnType<typeof useSession> | null = null;

  function CacheProbe() {
    sessionApi = useSession();
    return <Text>{sessionApi.status}:{sessionApi.user?.login ?? 'none'}</Text>;
  }

  const {queryClient} = renderWithSession(<CacheProbe />);

  await waitFor(() => {
    expect(screen.getByText('signedOut:none')).toBeTruthy();
  });

  queryClient.setQueryData(queryKeys.myGists, [{id: 'before-sign-in'}]);
  expect(queryClient.getQueryData(queryKeys.myGists)).toEqual([{id: 'before-sign-in'}]);

  await act(async () => {
    await sessionApi?.signIn();
  });

  await waitFor(() => {
    expect(screen.getByText('signedIn:octocat')).toBeTruthy();
  });
  expect(queryClient.getQueryData(queryKeys.myGists)).toBeUndefined();

  queryClient.setQueryData(queryKeys.myGists, [{id: 'before-sign-out'}]);
  expect(queryClient.getQueryData(queryKeys.myGists)).toEqual([{id: 'before-sign-out'}]);

  await act(async () => {
    await sessionApi?.signOut();
  });

  await waitFor(() => {
    expect(screen.getByText('signedOut:none')).toBeTruthy();
  });
  expect(Keychain.resetGenericPassword).toHaveBeenCalled();
  expect(queryClient.getQueryData(queryKeys.myGists)).toBeUndefined();
});
