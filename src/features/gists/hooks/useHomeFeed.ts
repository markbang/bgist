import {useQuery} from '@tanstack/react-query';
import type {Gist} from '../../../types/gist';
import {queryKeys} from '../../../shared/api/queryKeys';
import {getMyGists, getStarredGists} from '../api/gists';

export type HomeFeedSegment = 'my' | 'starred';

export function useHomeFeed(segment: HomeFeedSegment) {
  const myQuery = useQuery<Gist[]>({
    queryKey: queryKeys.myGists,
    queryFn: () => getMyGists(),
    enabled: segment === 'my',
  });

  const starredQuery = useQuery<Gist[]>({
    queryKey: queryKeys.starredGists,
    queryFn: () => getStarredGists(),
    enabled: segment === 'starred',
  });

  const activeQuery = segment === 'my' ? myQuery : starredQuery;

  return {
    gists: activeQuery.data ?? [],
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  };
}
