import type {Gist} from '../../../types/gist';

const GIST_WEB_ORIGIN = 'https://gist.github.com';

function normalizeText(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
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

function parseSnippetBlocks(html: string) {
  return html
    .split('<div class="gist-snippet">')
    .slice(1)
    .map(block => `<div class="gist-snippet">${block}`);
}

export function parseGistSearchPage(html: string): Gist[] {
  const gists: Gist[] = [];

  for (const block of parseSnippetBlocks(html)) {
    const gistMatch = block.match(/href="\/([^/"?#]+)\/([a-f0-9]+)"[^>]*><strong[^>]*>([^<]+)<\/strong>/i);
    const updatedAt = block.match(/<relative-time[^>]*datetime="([^"]+)"/)?.[1] ?? '';
    const description = block.match(/<span class="f6 color-fg-muted">\s*([\s\S]*?)\s*<\/span>/)?.[1] ?? '';
    const commentsLabel = block.match(/>\s*(\d+)\s+comments?\s*</i)?.[1] ?? '0';

    if (!gistMatch || !updatedAt) {
      continue;
    }

    const [, ownerLogin, gistId, rawFilename] = gistMatch;
    const filename = normalizeText(rawFilename);
    const normalizedDescription = normalizeText(description);

    gists.push({
      id: gistId,
      node_id: gistId,
      url: `https://api.github.com/gists/${gistId}`,
      forks_url: `https://api.github.com/gists/${gistId}/forks`,
      commits_url: `https://api.github.com/gists/${gistId}/commits`,
      git_pull_url: `${GIST_WEB_ORIGIN}/${gistId}.git`,
      git_push_url: `${GIST_WEB_ORIGIN}/${gistId}.git`,
      html_url: `${GIST_WEB_ORIGIN}/${ownerLogin}/${gistId}`,
      files: {
        [filename]: {
          filename,
          type: 'text/plain',
          language: inferLanguage(filename),
          raw_url: '',
          size: 0,
          truncated: false,
        },
      },
      public: true,
      created_at: updatedAt,
      updated_at: updatedAt,
      description: normalizedDescription,
      comments: Number.parseInt(commentsLabel, 10) || 0,
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
    });
  }

  return gists;
}
