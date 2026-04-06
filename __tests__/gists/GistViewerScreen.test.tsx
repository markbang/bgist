import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Clipboard from '@react-native-clipboard/clipboard';
import {GistViewerScreen} from '../../src/features/gists/screens/GistViewerScreen';

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
  Reflect.deleteProperty(globalThis, 'fetch');
  jest.clearAllMocks();
});

test('renders an empty file without treating it as missing remote content', () => {
  globalThis.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-empty',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'empty.txt',
          content: '',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/empty.txt',
          truncated: false,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(screen.getAllByText('empty.txt').length).toBeGreaterThan(0);
  expect(screen.queryByText('Loading full file')).toBeNull();
});

test('keeps copy content disabled while remote file content is still loading', () => {
  globalThis.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-loading',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'large.txt',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/large.txt',
          truncated: true,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(screen.getByText('Loading full file')).toBeTruthy();
  const copyButton = screen.getByRole('button', {name: 'Copy content'});

  expect(copyButton.props.accessibilityState.disabled).toBe(true);

  fireEvent.press(copyButton);

  expect(Clipboard.setString).not.toHaveBeenCalled();
});

test('keeps copy content disabled when remote file content fails to load', async () => {
  globalThis.fetch = jest.fn(async () => ({
    ok: false,
    text: async () => '',
  })) as jest.Mock;

  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-error',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'large.txt',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/large.txt',
          truncated: true,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(await screen.findByText('Could not load this file')).toBeTruthy();

  await waitFor(() => {
    const copyButton = screen.getByRole('button', {name: 'Copy content'});

    expect(copyButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(copyButton);

    expect(Clipboard.setString).not.toHaveBeenCalled();
  });
});
