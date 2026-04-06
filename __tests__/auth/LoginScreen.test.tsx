import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
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
  const signIn = jest.fn(() => deferred.promise);

  (useSession as jest.Mock).mockReturnValue({signIn});

  render(<LoginScreen />);

  fireEvent.press(screen.getByText('Sign in with GitHub'));

  await waitFor(() => {
    expect(screen.getByText('Signing in…')).toBeTruthy();
  });

  fireEvent.press(screen.getByText('Signing in…'));

  expect(signIn).toHaveBeenCalledTimes(1);

  await act(async () => {
    deferred.resolve?.();
    await deferred.promise;
  });
});
