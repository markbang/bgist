import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {MainTabScreenProps} from '../../src/app/navigation/types';
import {ComposeScreen} from '../../src/features/gists/screens/ComposeScreen';
import {GistEditorScreen} from '../../src/features/gists/screens/GistEditorScreen';
import {useGistMutations} from '../../src/features/gists/hooks/useGistMutations';
import {getGist} from '../../src/features/gists/api/gists';

jest.mock('../../src/features/gists/hooks/useGistMutations', () => ({
  useGistMutations: jest.fn(),
}));

jest.mock('../../src/features/gists/api/gists', () => ({
  getGist: jest.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
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

  return function Wrapper({children}: {children: React.ReactNode}) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createMutationResult(result: unknown = {id: 'gist-1'}) {
  return {
    mutateAsync: jest.fn().mockResolvedValue(result),
    isPending: false,
  };
}

beforeEach(() => {
  (useGistMutations as jest.Mock).mockReturnValue({
    addCommentMutation: createMutationResult(),
    createGistMutation: createMutationResult({id: 'created-gist'}),
    deleteGistMutation: createMutationResult(),
    editGistMutation: createMutationResult({id: 'edited-gist'}),
    forkGistMutation: createMutationResult(),
    starGistMutation: createMutationResult(),
    unstarGistMutation: createMutationResult(),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('submits a new gist from create mode', async () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
  const createGistMutation = createMutationResult({id: 'created-gist'});

  (useGistMutations as jest.Mock).mockReturnValue({
    addCommentMutation: createMutationResult(),
    createGistMutation,
    deleteGistMutation: createMutationResult(),
    editGistMutation: createMutationResult({id: 'edited-gist'}),
    forkGistMutation: createMutationResult(),
    starGistMutation: createMutationResult(),
    unstarGistMutation: createMutationResult(),
  });

  render(
    <GistEditorScreen
      navigation={navigation as never}
      route={{key: 'GistEditor-create', name: 'GistEditor', params: {mode: 'create'}} as never}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  fireEvent.changeText(screen.getByLabelText('Gist description'), 'Demo gist');
  fireEvent.changeText(screen.getByLabelText('Current filename'), 'index.ts');
  fireEvent.changeText(screen.getByLabelText('Current content'), 'export {}');
  fireEvent.press(screen.getByRole('button', {name: 'Create Gist'}));

  await waitFor(() => {
    expect(createGistMutation.mutateAsync).toHaveBeenCalledWith({
      description: 'Demo gist',
      public: true,
      files: {
        'index.ts': {
          content: 'export {}',
        },
      },
    });
  });

  expect(navigation.navigate).toHaveBeenCalledWith('GistDetail', {gistId: 'created-gist'});
});

test('loads an existing gist in edit mode and submits changed files', async () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
  const editGistMutation = createMutationResult({id: 'edited-gist'});

  (useGistMutations as jest.Mock).mockReturnValue({
    addCommentMutation: createMutationResult(),
    createGistMutation: createMutationResult({id: 'created-gist'}),
    deleteGistMutation: createMutationResult(),
    editGistMutation,
    forkGistMutation: createMutationResult(),
    starGistMutation: createMutationResult(),
    unstarGistMutation: createMutationResult(),
  });
  (getGist as jest.Mock).mockResolvedValue({
    id: 'gist-1',
    description: 'Existing gist',
    public: false,
    html_url: 'https://gist.github.com/octocat/gist-1',
    files: {
      'hello.ts': {
        filename: 'hello.ts',
        content: 'console.log("hello")',
        language: 'TypeScript',
        raw_url: 'https://gist.githubusercontent.com/raw/hello.ts',
        truncated: false,
      },
    },
  });

  render(
    <GistEditorScreen
      navigation={navigation as never}
      route={{key: 'GistEditor-edit', name: 'GistEditor', params: {mode: 'edit', gistId: 'gist-1'}} as never}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(await screen.findByDisplayValue('Existing gist')).toBeTruthy();
  expect(screen.getByDisplayValue('hello.ts')).toBeTruthy();

  fireEvent.changeText(screen.getByLabelText('Current filename'), 'main.ts');
  fireEvent.changeText(screen.getByLabelText('Current content'), 'console.log("updated")');
  fireEvent.press(screen.getByRole('button', {name: 'Save changes'}));

  await waitFor(() => {
    expect(editGistMutation.mutateAsync).toHaveBeenCalledWith({
      gistId: 'gist-1',
      params: {
        description: 'Existing gist',
        files: {
          'hello.ts': {
            filename: 'main.ts',
            content: 'console.log("updated")',
          },
        },
      },
    });
  });

  expect(navigation.navigate).toHaveBeenCalledWith('GistDetail', {gistId: 'edited-gist'});
});

test('switches between files, preserves draft changes, and removes the active file', async () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
  const createGistMutation = createMutationResult({id: 'created-gist'});

  (useGistMutations as jest.Mock).mockReturnValue({
    addCommentMutation: createMutationResult(),
    createGistMutation,
    deleteGistMutation: createMutationResult(),
    editGistMutation: createMutationResult({id: 'edited-gist'}),
    forkGistMutation: createMutationResult(),
    starGistMutation: createMutationResult(),
    unstarGistMutation: createMutationResult(),
  });

  render(
    <GistEditorScreen
      navigation={navigation as never}
      route={{
        key: 'GistEditor-create',
        name: 'GistEditor',
        params: {
          mode: 'create',
          description: 'Two files',
          files: [
            {filename: 'alpha.ts', content: 'export const alpha = 1;'},
            {filename: 'beta.ts', content: 'export const beta = 1;'},
          ],
        },
      } as never}
    />,
    {
      wrapper: createWrapper(),
    },
  );

  expect(screen.getByDisplayValue('alpha.ts')).toBeTruthy();

  fireEvent.press(screen.getByText('beta.ts'));

  expect(screen.getByDisplayValue('beta.ts')).toBeTruthy();

  fireEvent.changeText(screen.getByLabelText('Current content'), 'export const beta = 2;');
  fireEvent.press(screen.getByText('alpha.ts'));
  fireEvent.press(screen.getByText('beta.ts'));

  expect(screen.getByDisplayValue('export const beta = 2;')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Remove current file'}));

  expect(screen.getByDisplayValue('alpha.ts')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Create Gist'}));

  await waitFor(() => {
    expect(createGistMutation.mutateAsync).toHaveBeenCalledWith({
      description: 'Two files',
      public: true,
      files: {
        'alpha.ts': {
          content: 'export const alpha = 1;',
        },
      },
    });
  });
});

test('compose screen opens the create editor flow', () => {
  const navigation = {
    navigate: jest.fn(),
  } as unknown as MainTabScreenProps<'Compose'>['navigation'];

  render(
    <ComposeScreen
      navigation={navigation}
      route={{key: 'Compose', name: 'Compose'}}
    />,
  );

  fireEvent.press(screen.getByRole('button', {name: 'Create a gist'}));

  expect(navigation.navigate).toHaveBeenCalledWith('GistEditor', {mode: 'create'});
});
