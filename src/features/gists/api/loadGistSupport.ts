import {isGistStarred} from './gists';
import {githubClient} from '../../../shared/api/client';

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

async function getGistForkCount(gistId: string) {
  const response = await githubClient.get<unknown[]>(`/gists/${gistId}/forks`, {
    params: {
      per_page: 1,
      page: 1,
    },
  });

  return parseLastPage(response.headers.link) ?? response.data.length;
}

function parsePublicCount(html: string, pathPattern: string) {
  const pattern = new RegExp(
    `href="${pathPattern}"[^>]*>[\\s\\S]*?<span title="([^"]+)"[^>]*class="Counter"`,
    'i',
  );
  const match = html.match(pattern);

  return match?.[1] ? parseCountLabel(match[1]) : null;
}

async function getPublicGistCounts(gistUrl: string) {
  const response = await fetch(gistUrl);

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
): Promise<GistSupportData> {
  const [starredResult, forkCountResult, publicCountsResult] = await Promise.allSettled([
    isGistStarred(gistId),
    getGistForkCount(gistId),
    options?.isPublic && options.gistUrl ? getPublicGistCounts(options.gistUrl) : Promise.resolve(null),
  ]);

  const publicCounts =
    publicCountsResult.status === 'fulfilled' ? publicCountsResult.value : null;

  return {
    starred: starredResult.status === 'fulfilled' ? starredResult.value : null,
    starredError:
      starredResult.status === 'rejected' ? getErrorMessage(starredResult.reason) : null,
    starCount: publicCounts?.starCount ?? null,
    forkCount:
      forkCountResult.status === 'fulfilled'
        ? forkCountResult.value
        : publicCounts?.forkCount ?? null,
  };
}
