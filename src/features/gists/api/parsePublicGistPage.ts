import type {GistFile, GistWithHistory} from '../../../types/gist';

const GIST_WEB_ORIGIN = 'https://gist.github.com';

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function normalizeText(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();
}

function createFileAnchor(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferLanguage(filename: string) {
  const extension = filename.split('.').pop()?.trim().toLowerCase();

  switch (extension) {
    case 'bash':
    case 'sh':
    case 'zsh':
      return 'Shell';
    case 'css':
      return 'CSS';
    case 'go':
      return 'Go';
    case 'htm':
    case 'html':
      return 'HTML';
    case 'java':
      return 'Java';
    case 'js':
      return 'JavaScript';
    case 'json':
      return 'JSON';
    case 'jsx':
      return 'JSX';
    case 'kt':
    case 'kts':
      return 'Kotlin';
    case 'md':
    case 'markdown':
      return 'Markdown';
    case 'py':
      return 'Python';
    case 'rb':
      return 'Ruby';
    case 'rs':
      return 'Rust';
    case 'sql':
      return 'SQL';
    case 'svg':
      return 'SVG';
    case 'swift':
      return 'Swift';
    case 'ts':
      return 'TypeScript';
    case 'tsx':
      return 'TSX';
    case 'xml':
      return 'XML';
    case 'yaml':
    case 'yml':
      return 'YAML';
    default:
      return null;
  }
}

function parseRenderedHtml(html: string, filename: string) {
  const fileAnchor = createFileAnchor(filename);
  const readmePattern = new RegExp(
    `<div id="file-${fileAnchor}-readme"[\\s\\S]*?<article[^>]*itemprop="text">([\\s\\S]*?)<\\/article>`,
  );
  const match = html.match(readmePattern);

  return match?.[1]?.trim() || undefined;
}

function parseFiles(html: string) {
  const files: Record<string, GistFile> = {};
  const fileMatches = html.matchAll(
    /<a href="(?<raw>\/[^"]+\/raw\/[^"]+)"[^>]*>[\s\S]*?<strong[^>]*>\s*(?<filename>[^<]+?)\s*<\/strong>/g,
  );

  for (const match of fileMatches) {
    const filename = normalizeText(match.groups?.filename ?? '');
    const rawPath = match.groups?.raw ?? '';

    if (!filename || !rawPath || files[filename]) {
      continue;
    }

    files[filename] = {
      filename,
      type: 'text/plain',
      language: inferLanguage(filename),
      raw_url: new URL(rawPath, GIST_WEB_ORIGIN).toString(),
      size: 0,
      truncated: false,
      renderedHtml: parseRenderedHtml(html, filename),
    };
  }

  return files;
}

function parseCommentCount(html: string) {
  return new Set([...html.matchAll(/id="gistcomment-(\d+)"/g)].map(match => match[1])).size;
}

export function parsePublicGistPage(html: string, gistId: string): GistWithHistory | null {
  const ownerLogin = html.match(/<span class="author"><a[^>]*href="\/([^/"?#]+)"/)?.[1] ?? null;
  const description = html.match(/<div itemprop="about">\s*([^<]+?)\s*<\/div>/s)?.[1] ?? '';
  const createdAt = html.match(/Created\s*<relative-time[^>]*datetime="([^"]+)"/s)?.[1] ?? null;
  const htmlUrl =
    html.match(/<meta property="og:url" content="([^"]+)"/)?.[1] ??
    (ownerLogin ? `${GIST_WEB_ORIGIN}/${ownerLogin}/${gistId}` : `${GIST_WEB_ORIGIN}/${gistId}`);
  const files = parseFiles(html);

  if (!ownerLogin || !createdAt || Object.keys(files).length === 0) {
    return null;
  }

  const firstRawUrl = Object.values(files)[0]?.raw_url ?? '';
  const historyVersion =
    firstRawUrl.match(/\/raw\/([^/]+)\//)?.[1] ??
    gistId;

  return {
    id: gistId,
    node_id: gistId,
    url: `https://api.github.com/gists/${gistId}`,
    forks_url: `https://api.github.com/gists/${gistId}/forks`,
    commits_url: `https://api.github.com/gists/${gistId}/commits`,
    git_pull_url: `https://gist.github.com/${gistId}.git`,
    git_push_url: `https://gist.github.com/${gistId}.git`,
    html_url: htmlUrl,
    files,
    public: true,
    created_at: createdAt,
    updated_at: createdAt,
    description: normalizeText(description),
    comments: parseCommentCount(html),
    user: null,
    owner: {
      login: ownerLogin,
      id: 0,
      avatar_url: '',
      gravatar_id: '',
      url: `https://api.github.com/users/${ownerLogin}`,
      html_url: `https://github.com/${ownerLogin}`,
      type: 'User',
      site_admin: false,
    },
    truncated: false,
    fork_of: null,
    history: [
      {
        user: {
          login: ownerLogin,
          id: 0,
          avatar_url: '',
          gravatar_id: '',
          url: `https://api.github.com/users/${ownerLogin}`,
          html_url: `https://github.com/${ownerLogin}`,
          type: 'User',
          site_admin: false,
        },
        version: historyVersion,
        committed_at: createdAt,
        change_status: {
          total: 0,
          additions: 0,
          deletions: 0,
        },
        url: htmlUrl,
      },
    ],
  };
}
