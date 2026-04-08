import {isGistStarred} from './gists';
import {getApiAccessToken, githubClient} from '../../../shared/api/client';

export type GistSupportData = {
  starred: boolean | null;
  starredError: string | null;
  starCount: number | null;
  forkCount: number | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function parseCountLabel(value: string) {
  const normalized = value.replace(/[,\s+]/g, '');
  const parsed = Number.parseInt(normalized, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseLastPage(linkHeader: string | null | undefined) {
  if (!linkHeader) {
    return null;
  }

  const match = linkHeader.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);

  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getGistForkCount(gistId: string, signal?: AbortSignal) {
  const response = await githubClient.get<unknown[]>(`/gists/${gistId}/forks`, {
    params: {
      per_page: 1,
      page: 1,
    },
    signal,
  });

  return parseLastPage(response.headers.link) ?? response.data.length;
}

function parsePublicCount(html: string, pathPattern: string) {
  const pattern = new RegExp(
    `href="${pathPattern}"[^>]*>[\\s\\S]{0,400}?<span[^>]*class="Counter"[^>]*>([^<]+)<\\/span>`,
    'i',
  );
  const match = html.match(pattern);

  return match?.[1] ? parseCountLabel(match[1]) : null;
}

async function getPublicGistCounts(gistUrl: string, signal?: AbortSignal) {
  const response = await fetch(gistUrl, {signal});

  if (!response.ok) {
    throw new Error('GIST_PUBLIC_COUNTS_FAILED');
  }

  const html = await response.text();

  return {
    starCount: parsePublicCount(html, '[^"]+/stargazers'),
    forkCount: parsePublicCount(html, '[^"]+/forks'),
  };
}

export async function loadGistSupport(
  gistId: string,
  options?: {
    gistUrl?: string;
    isPublic?: boolean;
  },
  signal?: AbortSignal,
): Promise<GistSupportData> {
  const shouldLoadPublicCounts = Boolean(options?.isPublic && options.gistUrl);
  const shouldCheckStarred = Boolean(getApiAccessToken());
  const [starredResult, forkCountResult, publicCountsResult] = await Promise.allSettled([
    shouldCheckStarred ? isGistStarred(gistId, signal) : Promise.resolve(null),
    shouldLoadPublicCounts ? Promise.resolve(null) : getGistForkCount(gistId, signal),
    shouldLoadPublicCounts && options?.gistUrl
      ? getPublicGistCounts(options.gistUrl, signal)
      : Promise.resolve(null),
  ]);

  const publicCounts =
    publicCountsResult.status === 'fulfilled' ? publicCountsResult.value : null;

  return {
    starred:
      starredResult.status === 'fulfilled' && typeof starredResult.value === 'boolean'
        ? starredResult.value
        : null,
    starredError:
      starredResult.status === 'rejected' ? getErrorMessage(starredResult.reason) : null,
    starCount: publicCounts?.starCount ?? null,
    forkCount:
      forkCountResult.status === 'fulfilled' && typeof forkCountResult.value === 'number'
        ? forkCountResult.value
        : publicCounts?.forkCount ?? null,
  };
}
