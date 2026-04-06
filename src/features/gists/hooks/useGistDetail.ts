import {useQuery} from '@tanstack/react-query';
import {loadGistSupport} from '../api/loadGistSupport';
import {getGist} from '../api/gists';
import {queryKeys} from '../../../shared/api/queryKeys';

export function useGistDetail(gistId: string) {
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

  return {
    gistQuery,
    supportQuery,
    gist: gistQuery.data ?? null,
    support: supportQuery.data ?? null,
  };
}
