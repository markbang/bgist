import type {GistComment} from '../../../types/gist';
import {getGistComments, isGistStarred} from './gists';

export type GistSupportData = {
  starred: boolean | null;
  starredError: string | null;
  comments: GistComment[];
  commentsError: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export async function loadGistSupport(gistId: string): Promise<GistSupportData> {
  const [starredResult, commentsResult] = await Promise.allSettled([
    isGistStarred(gistId),
    getGistComments(gistId),
  ]);

  return {
    starred: starredResult.status === 'fulfilled' ? starredResult.value : null,
    starredError:
      starredResult.status === 'rejected' ? getErrorMessage(starredResult.reason) : null,
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value : [],
    commentsError:
      commentsResult.status === 'rejected' ? getErrorMessage(commentsResult.reason) : null,
  };
}
