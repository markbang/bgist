import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Clipboard from '@react-native-clipboard/clipboard';
import {GistViewerScreen} from '../../src/features/gists/screens/GistViewerScreen';

jest.mock('../../src/features/gists/utils/renderCodePreview', () => {
  const actual = jest.requireActual('../../src/features/gists/utils/renderCodePreview');

  return {
    ...actual,
    renderCodePreviewDocument: jest.fn(async ({filename}: {filename: string}) => {
      return `<html><body><pre data-filename="${filename}">highlighted</pre></body></html>`;
    }),
  };
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

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'fetch');
  jest.clearAllMocks();
});

test('renders an empty file in rendered mode without treating it as missing remote content', async () => {
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
  expect(await screen.findByTestId('gist-render-preview')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', {name: 'View raw'}));
  expect(screen.getByTestId('app-code-block-vertical-scroll')).toBeTruthy();
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

test('uses icon-only viewer actions while preserving accessibility labels', async () => {
  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-actions',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'notes.txt',
          content: 'hello world',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/notes.txt',
          truncated: false,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(await screen.findByTestId('gist-render-preview')).toBeTruthy();
  expect(screen.queryByText('Copy content')).toBeNull();
  expect(screen.queryByText('Share link')).toBeNull();
  expect(
    screen.queryByText('Read the file content, toggle line numbers, and share the source link.'),
  ).toBeNull();
  expect(screen.getByRole('button', {name: 'Copy content'})).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Share link'})).toBeTruthy();
});

test('defaults code files to rendered mode and lets people switch to raw', async () => {
  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-typescript',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'hello.ts',
          content: 'export const hello = "world";',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/hello.ts',
          truncated: false,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(await screen.findByTestId('gist-render-preview')).toBeTruthy();
  expect(screen.queryByTestId('app-code-block-vertical-scroll')).toBeNull();
  fireEvent.press(screen.getByRole('button', {name: 'View raw'}));
  expect(screen.queryByTestId('gist-render-preview')).toBeNull();
  expect(screen.getByTestId('app-code-block-vertical-scroll')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'View rendered'})).toBeTruthy();
});

test('renders markdown files in preview mode and allows switching back to raw', async () => {
  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-markdown',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'README.md',
          content: '# Hello\n\nThis is **bold**.',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/README.md',
          truncated: false,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(await screen.findByTestId('gist-render-preview')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', {name: 'View raw'}));
  expect(screen.queryByTestId('gist-render-preview')).toBeNull();
  expect(screen.getByText('# Hello')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'View rendered'})).toBeTruthy();
});
