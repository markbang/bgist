import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {QueryClient} from '@tanstack/react-query';
import type {CreateGistParams, EditGistParams} from '../../../types/gist';
import {queryKeys} from '../../../shared/api/queryKeys';
import {
  addGistComment,
  createGist,
  deleteGist,
  editGist,
  forkGist,
  starGist,
  unstarGist,
} from '../api/gists';

type GistIdInput = {
  gistId: string;
};

type EditGistInput = GistIdInput & {
  params: EditGistParams;
};

type AddCommentInput = GistIdInput & {
  body: string;
};

async function invalidateListCaches(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({queryKey: queryKeys.myGists}),
    queryClient.invalidateQueries({queryKey: queryKeys.starredGists}),
    queryClient.invalidateQueries({queryKey: queryKeys.publicGists}),
    queryClient.invalidateQueries({queryKey: queryKeys.userGistLists}),
  ]);
}

async function invalidateUserCaches(queryClient: QueryClient) {
  await queryClient.invalidateQueries({queryKey: queryKeys.userProfiles});
}

async function invalidateGistDetailCaches(queryClient: QueryClient, gistId: string) {
  await Promise.all([
    queryClient.invalidateQueries({queryKey: queryKeys.gistDetail(gistId)}),
    queryClient.invalidateQueries({queryKey: queryKeys.gistSupport(gistId)}),
  ]);
}

export function useGistMutations() {
  const queryClient = useQueryClient();

  const createGistMutation = useMutation({
    mutationFn: (params: CreateGistParams) => createGist(params),
    onSuccess: async () => {
      await Promise.all([invalidateListCaches(queryClient), invalidateUserCaches(queryClient)]);
    },
  });

  const editGistMutation = useMutation({
    mutationFn: ({gistId, params}: EditGistInput) => editGist(gistId, params),
    onSuccess: async (_, {gistId}) => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.gistDetail(gistId)}),
        queryClient.invalidateQueries({queryKey: queryKeys.gistHistory(gistId)}),
        invalidateListCaches(queryClient),
      ]);
    },
  });

  const deleteGistMutation = useMutation({
    mutationFn: ({gistId}: GistIdInput) => deleteGist(gistId),
    onSuccess: async (_, {gistId}) => {
      await Promise.all([
        invalidateGistDetailCaches(queryClient, gistId),
        queryClient.invalidateQueries({queryKey: queryKeys.gistHistory(gistId)}),
        invalidateListCaches(queryClient),
        invalidateUserCaches(queryClient),
      ]);
    },
  });

  const starGistMutation = useMutation({
    mutationFn: ({gistId}: GistIdInput) => starGist(gistId),
    onSuccess: async (_, {gistId}) => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.gistSupport(gistId)}),
        invalidateListCaches(queryClient),
      ]);
    },
  });

  const unstarGistMutation = useMutation({
    mutationFn: ({gistId}: GistIdInput) => unstarGist(gistId),
    onSuccess: async (_, {gistId}) => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.gistSupport(gistId)}),
        invalidateListCaches(queryClient),
      ]);
    },
  });

  const forkGistMutation = useMutation({
    mutationFn: ({gistId}: GistIdInput) => forkGist(gistId),
    onSuccess: async () => {
      await Promise.all([invalidateListCaches(queryClient), invalidateUserCaches(queryClient)]);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({gistId, body}: AddCommentInput) => addGistComment(gistId, body),
    onSuccess: async (_, {gistId}) => {
      await invalidateGistDetailCaches(queryClient, gistId);
    },
  });

  return {
    createGistMutation,
    editGistMutation,
    deleteGistMutation,
    starGistMutation,
    unstarGistMutation,
    forkGistMutation,
    addCommentMutation,
  };
}
