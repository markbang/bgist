import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Gist} from '../../../types/gist';
import {queryKeys} from '../../../shared/api/queryKeys';
import {getMyGists, getStarredGists} from '../api/gists';

export type HomeFeedSegment = 'my' | 'starred';

export function useHomeFeed() {
  const [segment, setSegment] = useState<HomeFeedSegment>('my');

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
    segment,
    setSegment,
    items: activeQuery.data ?? [],
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    refetch: activeQuery.refetch,
  };
}
