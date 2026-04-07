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
    queryFn: () => getGist(gistId),
    enabled,
  });

  const supportQuery = useQuery({
    queryKey: queryKeys.gistSupport(gistId),
    queryFn: () => loadGistSupport(gistId),
    enabled: gistQuery.isSuccess,
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.gistComments(gistId),
    queryFn: () => getGistComments(gistId),
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
