import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
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
  jest.useRealTimers();
});

test('renders an empty file in raw mode without treating it as missing remote content', async () => {
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
  expect(await screen.findByTestId('gist-raw-code-view')).toBeTruthy();
  expect(screen.queryByTestId('gist-render-preview')).toBeNull();
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

  expect(await screen.findByTestId('gist-raw-code-view')).toBeTruthy();
  expect(screen.queryByText('Copy content')).toBeNull();
  expect(screen.queryByText('Share link')).toBeNull();
  expect(
    screen.queryByText('Read the file content, toggle line numbers, and share the source link.'),
  ).toBeNull();
  expect(screen.getByRole('button', {name: 'Copy content'})).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Share link'})).toBeTruthy();
});

test('defaults code files to raw shiki highlighting', async () => {
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

  expect(await screen.findByTestId('gist-raw-code-view')).toBeTruthy();
  expect(screen.queryByTestId('gist-render-preview')).toBeNull();
  expect(screen.queryByRole('button', {name: 'View rendered'})).toBeNull();
});

test('renders truncated markdown from inline content before the full raw file finishes loading', async () => {
  globalThis.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-truncated-inline',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'README.md',
          content: '# Partial heading\n\nStill visible while loading.',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/README.md',
          truncated: true,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(screen.getByTestId('app-code-block-vertical-scroll')).toBeTruthy();
  expect(screen.queryByText('Loading full file')).toBeNull();

  const copyButton = screen.getByRole('button', {name: 'Copy content'});
  expect(copyButton.props.accessibilityState.disabled).toBe(true);

  expect(screen.getByText(/# Partial heading/)).toBeTruthy();
});

test('renders provided GitHub preview html before the raw source finishes loading', async () => {
  globalThis.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-rendered-html',
        name: 'GistViewer',
        params: {
          gistId: 'gist-1',
          filename: 'README.md',
          gistUrl: 'https://gist.github.com/octocat/gist-1',
          rawUrl: 'https://gist.githubusercontent.com/raw/README.md',
          renderedHtml: '<h1>LLM Wiki</h1><p>Rendered preview</p>',
          truncated: true,
        },
      }}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(screen.getByText('Loading full file')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', {name: 'View rendered'}));
  const preview = await screen.findByTestId('gist-render-preview');
  expect(preview.props.source.html).toContain('Rendered preview');
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

  expect(screen.queryByTestId('gist-render-preview')).toBeNull();
  expect(screen.getByText(/# Hello/)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', {name: 'View rendered'}));
  expect(await screen.findByTestId('gist-render-preview')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'View raw'})).toBeTruthy();
});

test('shows an error instead of loading forever when remote file content never resolves', async () => {
  jest.useFakeTimers();

  globalThis.fetch = jest.fn((_input?: unknown, init?: RequestInit) => {
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        reject(error);
      });
    });
  }) as jest.Mock;

  render(
    <GistViewerScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{
        key: 'GistViewer-timeout',
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

  await act(async () => {
    jest.advanceTimersByTime(15000);
  });

  expect(await screen.findByText('Could not load this file')).toBeTruthy();
});
