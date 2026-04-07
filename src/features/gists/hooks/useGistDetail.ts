import {useQuery} from '@tanstack/react-query';
import {loadGistSupport} from '../api/loadGistSupport';
import {getGist, getGistComments} from '../api/gists';
import {queryKeys} from '../../../shared/api/queryKeys';

export function useGistDetail(
  gistId: string,
  options?: {
    loadComments?: boolean;
  },
) {
  const enabled = Boolean(gistId);

  const gistQuery = useQuery({
    queryKey: queryKeys.gistDetail(gistId),
    queryFn: ({signal}) => getGist(gistId, signal),
    enabled,
  });

  const supportQuery = useQuery({
    queryKey: queryKeys.gistSupport(gistId),
    queryFn: ({signal}) =>
      loadGistSupport(gistId, {
        gistUrl: gistQuery.data?.html_url,
        isPublic: gistQuery.data?.public,
      }, signal),
    enabled: gistQuery.isSuccess,
    staleTime: 5 * 60_000,
    refetchOnReconnect: false,
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.gistComments(gistId),
    queryFn: ({signal}) => getGistComments(gistId, signal),
    enabled: gistQuery.isSuccess && options?.loadComments === true,
  });

  return {
    gistQuery,
    supportQuery,
    commentsQuery,
    gist: gistQuery.data ?? null,
    support: supportQuery.data ?? null,
    comments: commentsQuery.data ?? [],
  };
}
