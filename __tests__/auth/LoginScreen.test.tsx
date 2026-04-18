import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {Linking} from 'react-native';
import LoginScreen from '../../src/features/auth/screens/LoginScreen';
import {useSession} from '../../src/features/auth/session/SessionProvider';

jest.mock('../../src/features/auth/session/SessionProvider', () => ({
  useSession: jest.fn(),
}));

function createDeferred() {
  let resolve: (() => void) | undefined;

  const promise = new Promise<void>(nextResolve => {
    resolve = nextResolve;
  });

  return {promise, resolve};
}

afterEach(() => {
  jest.clearAllMocks();
});

test('ignores repeat sign-in presses while a sign-in request is pending', async () => {
  const deferred = createDeferred();
  const signIn = jest.fn((options?: {onVerification?: (authorization: unknown) => void}) => {
    options?.onVerification?.({
      deviceCode: 'device-code-1',
      userCode: 'WXYZ-1234',
      verificationUri: 'https://github.com/login/device',
      expiresAt: Date.now() + 900_000,
      intervalSeconds: 5,
    });
    return deferred.promise;
  });

  (useSession as jest.Mock).mockReturnValue({signIn});

  render(<LoginScreen />);

  fireEvent.press(screen.getByRole('button', {name: 'Sign in with GitHub'}));

  await waitFor(() => {
    expect(screen.getByText('Waiting for GitHub authorization…')).toBeTruthy();
    expect(screen.getByText('WXYZ-1234')).toBeTruthy();
  });

  fireEvent.press(screen.getByText('Waiting for GitHub authorization…'));

  expect(signIn).toHaveBeenCalledTimes(1);

  await act(async () => {
    deferred.resolve?.();
    await deferred.promise;
  });
});

test('shows device flow actions for copying the code and opening GitHub verification', async () => {
  const deferred = createDeferred();
  const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  const signIn = jest.fn((options?: {onVerification?: (authorization: unknown) => void}) => {
    options?.onVerification?.({
      deviceCode: 'device-code-2',
      userCode: 'ABCD-EFGH',
      verificationUri: 'https://github.com/login/device',
      expiresAt: Date.now() + 900_000,
      intervalSeconds: 5,
    });
    return deferred.promise;
  });

  (useSession as jest.Mock).mockReturnValue({signIn});

  render(<LoginScreen />);

  fireEvent.press(screen.getByRole('button', {name: 'Sign in with GitHub'}));

  expect(await screen.findByText('ABCD-EFGH')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Copy code'}));
  fireEvent.press(screen.getByRole('button', {name: 'Open GitHub verification'}));

  expect(Clipboard.setString).toHaveBeenCalledWith('ABCD-EFGH');
  expect(openUrl).toHaveBeenCalledWith('https://github.com/login/device');
});

test('clears stale verification details when authorization fails after code display', async () => {
  const signIn = jest.fn(async (options?: {onVerification?: (authorization: unknown) => void}) => {
    options?.onVerification?.({
      deviceCode: 'device-code-3',
      userCode: 'ZZZZ-9999',
      verificationUri: 'https://github.com/login/device',
      expiresAt: Date.now() + 900_000,
      intervalSeconds: 5,
    });
    throw new Error('GITHUB_DEVICE_ACCESS_DENIED');
  });

  (useSession as jest.Mock).mockReturnValue({signIn});

  render(<LoginScreen />);

  fireEvent.press(screen.getByRole('button', {name: 'Sign in with GitHub'}));

  expect(await screen.findByText('GitHub authorization was denied. Start again to request a new code.')).toBeTruthy();
  expect(screen.queryByText('ZZZZ-9999')).toBeNull();
  expect(screen.queryByRole('button', {name: 'Copy code'})).toBeNull();
  expect(screen.queryByRole('button', {name: 'Open GitHub verification'})).toBeNull();
});
