import {isGistStarred} from './gists';

export type GistSupportData = {
  starred: boolean | null;
  starredError: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export async function loadGistSupport(gistId: string): Promise<GistSupportData> {
  const [starredResult] = await Promise.allSettled([isGistStarred(gistId)]);

  return {
    starred: starredResult.status === 'fulfilled' ? starredResult.value : null,
    starredError:
      starredResult.status === 'rejected' ? getErrorMessage(starredResult.reason) : null,
  };
}
