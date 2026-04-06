import {useQuery} from '@tanstack/react-query';
import {loadGistSupport} from '../api/loadGistSupport';
import {getGist} from '../api/gists';
import {queryKeys} from '../../../shared/api/queryKeys';

export function useGistDetail(gistId: string) {
  const enabled = Boolean(gistId);

  const gistQuery = useQuery({
    queryKey: queryKeys.gists.detail(gistId),
    queryFn: () => getGist(gistId),
    enabled,
  });

  const supportQuery = useQuery({
    queryKey: queryKeys.gists.support(gistId),
    queryFn: () => loadGistSupport(gistId),
    enabled,
  });

  return {
    gistQuery,
    supportQuery,
    gist: gistQuery.data ?? null,
    support: supportQuery.data ?? null,
  };
}
