import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {useQueryClient} from '@tanstack/react-query';
import type {Gist} from '../../../types/gist';
import {queryKeys} from '../../../shared/api/queryKeys';
import {getMyGists, getStarredGists} from '../api/gists';

export type HomeFeedSegment = 'my' | 'starred';

export function useHomeFeed() {
  const queryClient = useQueryClient();
  const [segment, setSegment] = React.useState<HomeFeedSegment>('my');

  const myQuery = useQuery<Gist[]>({
    queryKey: queryKeys.myGists,
    queryFn: ({signal}) => getMyGists(1, 30, signal),
    enabled: segment === 'my',
  });

  const starredQuery = useQuery<Gist[]>({
    queryKey: queryKeys.starredGists,
    queryFn: ({signal}) => getStarredGists(1, 30, signal),
    enabled: segment === 'starred',
  });

  const activeQuery = segment === 'my' ? myQuery : starredQuery;
  const inactiveSegment = segment === 'my' ? 'starred' : 'my';

  React.useEffect(() => {
    if (!activeQuery.isSuccess) {
      return;
    }

    if (inactiveSegment === 'my') {
      queryClient.prefetchQuery({
        queryKey: queryKeys.myGists,
        queryFn: ({signal}) => getMyGists(1, 30, signal),
      });
      return;
    }

    queryClient.prefetchQuery({
      queryKey: queryKeys.starredGists,
      queryFn: ({signal}) => getStarredGists(1, 30, signal),
    });
  }, [activeQuery.isSuccess, inactiveSegment, queryClient]);

  return {
    segment,
    setSegment,
    items: activeQuery.data ?? [],
    isLoading: activeQuery.isLoading,
    isRefreshing: activeQuery.isRefetching,
    isError: activeQuery.isError,
    refetch: activeQuery.refetch,
  };
}
