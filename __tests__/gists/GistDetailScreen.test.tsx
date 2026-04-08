import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {RootStackScreenProps} from '../../src/app/navigation/types';
import type {GistWithHistory} from '../../src/types/gist';
import {GistDetailScreen} from '../../src/features/gists/screens/GistDetailScreen';
import {useGistDetail} from '../../src/features/gists/hooks/useGistDetail';
import {useGistMutations} from '../../src/features/gists/hooks/useGistMutations';
import {useSession} from '../../src/features/auth/session/SessionProvider';

jest.mock('../../src/features/gists/utils/renderCodePreview', () => {
  const actual = jest.requireActual('../../src/features/gists/utils/renderCodePreview');

  return {
    ...actual,
    renderCodePreviewDocument: jest.fn(async ({filename}: {filename: string}) => {
      return `<html><body><pre data-filename="${filename}">highlighted</pre></body></html>`;
    }),
  };
});

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));

jest.mock('../../src/features/gists/hooks/useGistDetail', () => ({
  useGistDetail: jest.fn(),
}));

jest.mock('../../src/features/gists/hooks/useGistMutations', () => ({
  useGistMutations: jest.fn(),
}));

jest.mock('../../src/features/auth/session/SessionProvider', () => ({
  useSession: jest.fn(),
}));

function createGist(overrides: Partial<GistWithHistory> = {}): GistWithHistory {
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
    history: [
      {
        version: 'abc1234',
        committed_at: '2026-04-06T00:00:00Z',
        url: 'https://gist.github.com/abc1234',
        user: {
          login: 'octocat',
          id: 1,
          avatar_url: 'https://example.com/octocat.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/octocat',
          html_url: 'https://github.com/octocat',
          type: 'User',
          site_admin: false,
        },
        change_status: {
          total: 1,
          additions: 1,
          deletions: 0,
        },
      },
    ],
    ...overrides,
  };
}

function createMutationResult() {
  return {
    mutateAsync: jest.fn(),
    isPending: false,
  };
}

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

function renderDetail(screenNode: React.ReactElement) {
  return render(screenNode, {wrapper: createWrapper()});
}

beforeEach(() => {
  (useSession as jest.Mock).mockReturnValue({
    status: 'signedIn',
    user: {login: 'octocat'},
  });

  (useGistMutations as jest.Mock).mockReturnValue({
    addCommentMutation: createMutationResult(),
    createGistMutation: createMutationResult(),
    deleteGistMutation: createMutationResult(),
    editGistMutation: createMutationResult(),
    forkGistMutation: createMutationResult(),
    starGistMutation: createMutationResult(),
    unstarGistMutation: createMutationResult(),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders gist core content even when support data degrades', () => {
  const refetch = jest.fn();
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as RootStackScreenProps<'GistDetail'>['navigation'];

  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist(),
    support: {
      starred: null,
      starredError: 'Star status is unavailable right now.',
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch,
    },
    commentsQuery: {
      isLoading: false,
      isError: true,
      refetch,
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={navigation}
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(screen.getByText('Useful gist')).toBeTruthy();
  expect(screen.getByText('hello.ts')).toBeTruthy();
  expect(screen.getByText('Star status is unavailable right now.')).toBeTruthy();
  expect(screen.getByText('Comments failed to load.')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Retry comments'})).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Retry comments'}));

  expect(refetch).toHaveBeenCalled();
});

test('renders markdown files as a preview card instead of raw text in gist detail', async () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      files: {
        'README.md': {
          filename: 'README.md',
          type: 'text/markdown',
          language: 'Markdown',
          raw_url: 'https://gist.githubusercontent.com/raw/README.md',
          size: 128,
          truncated: false,
          content: '# Hello\n\nThis is **bold**.',
        },
      },
    }),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  const preview = await screen.findByTestId('gist-file-preview-README.md');
  const previewShell = screen.getByTestId('gist-file-preview-README.md-shell');

  expect(preview).toBeTruthy();
  expect(preview.props.source.html).toContain('<h1>Hello</h1>');
  expect(previewShell.props.style.height).toBeUndefined();
  expect(preview.props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({height: expect.any(Number)})]),
  );
  expect(screen.queryByText('# Hello')).toBeNull();
});

test('keeps short markdown previews compact instead of leaving a tall blank area', async () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      files: {
        'README.md': {
          filename: 'README.md',
          type: 'text/markdown',
          language: 'Markdown',
          raw_url: 'https://gist.githubusercontent.com/raw/README.md',
          size: 32,
          truncated: false,
          content: '# Hi',
        },
      },
    }),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  const preview = await screen.findByTestId('gist-file-preview-README.md');
  const heightStyle = preview.props.style.find(
    (style: Record<string, unknown>) => typeof style?.height === 'number',
  );

  expect(heightStyle.height).toBeLessThanOrEqual(120);
});

test('renders html files as a preview card instead of raw markup in gist detail', async () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      files: {
        'index.html': {
          filename: 'index.html',
          type: 'text/html',
          language: 'HTML',
          raw_url: 'https://gist.githubusercontent.com/raw/index.html',
          size: 256,
          truncated: false,
          content: '<h1>Hello</h1><p>Rendered from html.</p>',
        },
      },
    }),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  const preview = await screen.findByTestId('gist-file-preview-index.html');
  const previewShell = screen.getByTestId('gist-file-preview-index.html-shell');

  expect(preview).toBeTruthy();
  expect(preview.props.source.html).toContain('<h1>Hello</h1><p>Rendered from html.</p>');
  expect(previewShell.props.style.height).toBeUndefined();
  expect(screen.queryByText('<h1>Hello</h1><p>Rendered from html.</p>')).toBeNull();
});

test('renders code files as shiki-highlighted previews in gist detail', async () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist(),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  const preview = await screen.findByTestId('gist-file-preview-hello.ts');

  expect(preview).toBeTruthy();
  expect(preview.props.source.html).toContain('highlighted');
  expect(screen.queryByText('export const hello = "world";')).toBeNull();
});

test('renders icon actions with engagement counts in gist detail', () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      comments: 24,
      history: [
        createGist().history[0],
        {
          ...createGist().history[0],
          version: 'def5678',
        },
      ],
    }),
    support: {
      starred: false,
      starredError: null,
      starCount: 120,
      forkCount: 18,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(screen.getByTestId('gist-action-star-count')).toHaveTextContent('120');
  expect(screen.getByTestId('gist-action-fork-count')).toHaveTextContent('18');
  expect(screen.getByTestId('gist-action-history-count')).toHaveTextContent('2');
  expect(screen.getByTestId('gist-action-comments-count')).toHaveTextContent('24');
  expect(screen.queryByText('History')).toBeNull();
  expect(screen.queryByText('More')).toBeNull();
});

test('shows a page error when the gist itself cannot load', () => {
  const refetch = jest.fn();
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as RootStackScreenProps<'GistDetail'>['navigation'];

  (useGistDetail as jest.Mock).mockReturnValue({
    gist: null,
    support: null,
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: true,
      refetch,
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={navigation}
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(screen.getByText('Could not load this gist')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', {name: 'Try again'}));
  expect(refetch).toHaveBeenCalled();
});

test('keeps hook order stable when the gist query transitions from loading to success', () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as RootStackScreenProps<'GistDetail'>['navigation'];

  let detailState: any = {
    gist: null,
    support: null,
    comments: [],
    gistQuery: {
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  };

  (useGistDetail as jest.Mock).mockImplementation(() => detailState);

  const {rerender} = renderDetail(
    <GistDetailScreen
      navigation={navigation}
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(screen.getByText('Loading gist')).toBeTruthy();

  detailState = {
    gist: createGist(),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  };

  expect(() =>
    rerender(
      <GistDetailScreen
        navigation={navigation}
        route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
      />,
    ),
  ).not.toThrow();

  expect(screen.getByText('Useful gist')).toBeTruthy();
});

test('renders safely when the gist owner is missing', () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      owner: null as unknown as GistWithHistory['owner'],
      user: {
        login: 'ghost',
        id: 2,
        avatar_url: 'https://example.com/ghost.png',
        gravatar_id: '',
        url: 'https://api.github.com/users/ghost',
        html_url: 'https://github.com/ghost',
        type: 'User',
        site_admin: false,
      },
    }),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(screen.getByText('@ghost')).toBeTruthy();
  expect(screen.getByText('Useful gist')).toBeTruthy();
});

test('routes profile, history, viewer, and editor actions through the new stack screens', () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as RootStackScreenProps<'GistDetail'>['navigation'];

  (useGistDetail as jest.Mock).mockImplementation((_gistId: string, options?: {loadComments?: boolean}) => ({
    gist: createGist(),
    support: {
      starred: false,
      starredError: null,
    },
    comments: options?.loadComments
      ? [
          {
            id: 7,
            body: 'Nice gist',
            created_at: '2026-04-06T00:00:00Z',
            updated_at: '2026-04-06T00:00:00Z',
            user: {
              login: 'friend',
              id: 2,
              avatar_url: 'https://example.com/friend.png',
              gravatar_id: '',
              url: 'https://api.github.com/users/friend',
              html_url: 'https://github.com/friend',
              type: 'User',
              site_admin: false,
            },
          },
        ]
      : [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  }));

  renderDetail(
    <GistDetailScreen
      navigation={navigation}
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  fireEvent.press(screen.getByLabelText('Open octocat profile'));
  fireEvent.press(screen.getByRole('button', {name: 'History'}));
  fireEvent.press(screen.getByLabelText('hello.ts'));
  fireEvent.press(screen.getByRole('button', {name: 'Load comments'}));
  fireEvent.press(screen.getByRole('button', {name: 'Open friend profile'}));
  fireEvent.press(screen.getByRole('button', {name: 'More'}));
  fireEvent.press(screen.getByRole('button', {name: 'Edit gist'}));

  expect(navigation.navigate).toHaveBeenCalledWith('UserProfile', {username: 'octocat'});
  expect(navigation.navigate).toHaveBeenCalledWith('GistHistory', {gistId: 'gist-1'});
  expect(navigation.navigate).toHaveBeenCalledWith('GistViewer', {
    gistId: 'gist-1',
    filename: 'hello.ts',
    language: 'TypeScript',
    content: 'export const hello = "world";',
    gistUrl: 'https://gist.github.com/octocat/gist-1',
    rawUrl: 'https://gist.githubusercontent.com/raw/hello.ts',
    truncated: false,
  });
  expect(navigation.navigate).toHaveBeenCalledWith('UserProfile', {username: 'friend'});
  expect(navigation.navigate).toHaveBeenCalledWith('GistEditor', {
    mode: 'edit',
    gistId: 'gist-1',
  });
});

test('keeps comments lazy until the user explicitly loads them', () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as RootStackScreenProps<'GistDetail'>['navigation'];

  (useGistDetail as jest.Mock).mockImplementation((_gistId: string, options?: {loadComments?: boolean}) => ({
    gist: createGist({comments: 1}),
    support: {
      starred: false,
      starredError: null,
    },
    comments: options?.loadComments
      ? [
          {
            id: 7,
            body: 'Nice gist',
            created_at: '2026-04-06T00:00:00Z',
            updated_at: '2026-04-06T00:00:00Z',
            user: {
              login: 'friend',
              id: 2,
              avatar_url: 'https://example.com/friend.png',
              gravatar_id: '',
              url: 'https://api.github.com/users/friend',
              html_url: 'https://github.com/friend',
              type: 'User',
              site_admin: false,
            },
          },
        ]
      : [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  }));

  renderDetail(
    <GistDetailScreen
      navigation={navigation}
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(screen.getByRole('button', {name: 'Load comments'})).toBeTruthy();
  expect(screen.queryByText('Nice gist')).toBeNull();

  fireEvent.press(screen.getByRole('button', {name: 'Load comments'}));

  expect(screen.getByText('Nice gist')).toBeTruthy();
});

test('passes truncated inline content into the viewer route for immediate preview', () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as RootStackScreenProps<'GistDetail'>['navigation'];

  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      files: {
        'README.md': {
          filename: 'README.md',
          type: 'text/markdown',
          language: 'Markdown',
          raw_url: 'https://gist.githubusercontent.com/raw/README.md',
          size: 12000,
          truncated: true,
          content: '# Partial heading\n\nRendered first.',
        },
      },
    }),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={navigation}
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  fireEvent.press(screen.getByLabelText('README.md'));

  expect(navigation.navigate).toHaveBeenCalledWith('GistViewer', {
    gistId: 'gist-1',
    filename: 'README.md',
    language: 'Markdown',
    content: '# Partial heading\n\nRendered first.',
    gistUrl: 'https://gist.github.com/octocat/gist-1',
    rawUrl: 'https://gist.githubusercontent.com/raw/README.md',
    truncated: true,
  });
});

test('shows the viewer preview hint when a file has no inline content yet', () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      files: {
        'notes.txt': {
          filename: 'notes.txt',
          type: 'text/plain',
          language: 'Plain Text',
          raw_url: 'https://gist.githubusercontent.com/raw/notes.txt',
          size: 512,
          truncated: false,
          content: undefined,
        },
      },
    }),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(
    screen.getByText('Preview unavailable for large files. Open the viewer to load the full content.'),
  ).toBeTruthy();
});

test('renders GitHub-style preview cards when rendered html is available', () => {
  (useGistDetail as jest.Mock).mockReturnValue({
    gist: createGist({
      files: {
        'README.md': {
          filename: 'README.md',
          type: 'text/markdown',
          language: 'Markdown',
          raw_url: 'https://gist.githubusercontent.com/raw/README.md',
          size: 12000,
          truncated: false,
          content: undefined,
          renderedHtml: '<h1>LLM Wiki</h1><p>Rendered preview</p>',
        },
      },
    }),
    support: {
      starred: false,
      starredError: null,
    },
    comments: [],
    gistQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    supportQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
    commentsQuery: {
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    },
  });

  renderDetail(
    <GistDetailScreen
      navigation={
        {
          goBack: jest.fn(),
          navigate: jest.fn(),
        } as unknown as RootStackScreenProps<'GistDetail'>['navigation']
      }
      route={{key: 'GistDetail-gist-1', name: 'GistDetail', params: {gistId: 'gist-1'}}}
    />,
  );

  expect(screen.getByTestId('gist-file-preview-README.md')).toBeTruthy();
  expect(
    screen.queryByText('Preview unavailable for large files. Open the viewer to load the full content.'),
  ).toBeNull();
});
