import React from 'react';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import * as Keychain from 'react-native-keychain';
import App from '../App';
import {AppProviders} from '../src/app/providers/AppProviders';

function CaptureClient({onClient}: {onClient: (client: unknown) => void}) {
  const client = useQueryClient();

  React.useEffect(() => {
    onClient(client);
  }, [client, onClient]);

  return null;
}

describe('App shell', () => {
  it('renders the signed-out entry screen after session restore completes', async () => {
    let resolveReadSession: ((value: false) => void) | undefined;

    (Keychain.getGenericPassword as jest.Mock).mockImplementation(
      () =>
        new Promise(resolve => {
          resolveReadSession = resolve;
        }),
    );

    const {UNSAFE_getByType} = render(<App />);

    expect(screen.queryByText('Sign in with GitHub')).toBeNull();

    await act(async () => {
      resolveReadSession?.(false);
    });

    await waitFor(() => {
      expect(screen.getByText('BGist')).toBeTruthy();
      expect(screen.getByText('Sign in with GitHub')).toBeTruthy();
    });
    expect(UNSAFE_getByType(NavigationContainer)).toBeTruthy();
  });

  it('creates an isolated query client per provider instance', () => {
    const firstCapture = jest.fn();
    const secondCapture = jest.fn();

    (Keychain.getGenericPassword as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );

    const {unmount} = render(
      <AppProviders>
        <CaptureClient onClient={firstCapture} />
      </AppProviders>,
    );

    expect(firstCapture).toHaveBeenCalled();
    const firstClient = firstCapture.mock.calls[0][0];

    unmount();

    render(
      <AppProviders>
        <CaptureClient onClient={secondCapture} />
      </AppProviders>,
    );

    expect(secondCapture).toHaveBeenCalled();
    const secondClient = secondCapture.mock.calls[0][0];

    expect(firstClient).not.toBe(secondClient);
  });
});
