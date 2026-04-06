import React from 'react';
import {render, screen, waitFor} from '@testing-library/react-native';
import {Text} from 'react-native';
import * as AppAuth from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';
import {SessionProvider, useSession} from '../../src/features/auth/session/SessionProvider';

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(),
}));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

function Probe() {
  const {status, user} = useSession();
  return <Text>{status}:{user?.login ?? 'none'}</Text>;
}

test('restores a stored session', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
    username: 'oauth',
    password: JSON.stringify({
      accessToken: 'token-123',
      user: {login: 'bangwu'},
    }),
  });

  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText('signedIn:bangwu')).toBeTruthy();
  });
});

test('signIn stores the OAuth session', async () => {
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
  (AppAuth.authorize as jest.Mock).mockResolvedValue({
    accessToken: 'token-456',
  });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({login: 'octocat'}),
  }) as jest.Mock;

  let sessionApi: ReturnType<typeof useSession> | null = null;

  function SignInProbe() {
    sessionApi = useSession();
    return <Text>ready</Text>;
  }

  render(
    <SessionProvider>
      <SignInProbe />
    </SessionProvider>,
  );

  await waitFor(async () => {
    await sessionApi?.signIn();
    expect(Keychain.setGenericPassword).toHaveBeenCalled();
  });
});
