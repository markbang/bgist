import type {AppTheme} from '../../../app/theme/tokens';

const extensionLanguageMap: Record<string, string> = {
  bash: 'bash',
  cjs: 'javascript',
  css: 'css',
  diff: 'diff',
  go: 'go',
  htm: 'html',
  html: 'html',
  java: 'java',
  js: 'javascript',
  json: 'json',
  jsx: 'jsx',
  kt: 'kotlin',
  kts: 'kotlin',
  md: 'markdown',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  sh: 'bash',
  sql: 'sql',
  svg: 'html',
  swift: 'swift',
  text: 'text',
  ts: 'typescript',
  tsx: 'tsx',
  txt: 'text',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  zsh: 'bash',
};

const languageAliasMap: Record<string, string> = {
  'c++': 'cpp',
  'java script': 'javascript',
  javascript: 'javascript',
  json: 'json',
  jsx: 'jsx',
  kotlin: 'kotlin',
  markdown: 'markdown',
  plaintext: 'text',
  'plain text': 'text',
  python: 'python',
  ruby: 'ruby',
  rust: 'rust',
  shell: 'bash',
  shellscript: 'bash',
  sql: 'sql',
  svg: 'html',
  swift: 'swift',
  text: 'text',
  toml: 'toml',
  tsx: 'tsx',
  typescript: 'typescript',
  xml: 'xml',
  yaml: 'yaml',
};

let shikiBundlePromise: Promise<typeof import('shiki/bundle/web')> | null = null;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getShikiBundle() {
  if (!shikiBundlePromise) {
    shikiBundlePromise = import('shiki/bundle/web');
  }

  return shikiBundlePromise;
}

function resolveCodeLanguage(filename: string, language?: string | null) {
  const normalizedLanguage = language?.trim().toLowerCase();

  if (normalizedLanguage && languageAliasMap[normalizedLanguage]) {
    return languageAliasMap[normalizedLanguage];
  }

  const extension = filename.split('.').pop()?.trim().toLowerCase();

  if (extension && extensionLanguageMap[extension]) {
    return extensionLanguageMap[extension];
  }

  return 'text';
}

export function wrapPreviewDocument(
  title: string,
  body: string,
  theme: AppTheme,
  isDark: boolean,
) {
  const backgroundColor = theme.colors.surface;
  const textColor = theme.colors.textPrimary;
  const headingColor = theme.colors.textPrimary;
  const linkColor = theme.colors.accent;
  const inlineCodeBackground = theme.colors.accentSoft;
  const inlineCodeColor = theme.colors.accent;
  const preBackground = theme.colors.codeBg;
  const preColor = theme.colors.codeText;

  return `<!DOCTYPE html>
<html class="${isDark ? 'dark' : 'light'}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: ${isDark ? 'dark' : 'light'};
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 16px;
        color: ${textColor};
        background: ${backgroundColor};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.65;
        word-break: break-word;
      }
      h1, h2, h3, h4, h5, h6 {
        color: ${headingColor};
        line-height: 1.25;
        margin: 0 0 12px;
      }
      p, ul, ol, pre, blockquote {
        margin: 0 0 14px;
      }
      ul, ol {
        padding-left: 20px;
      }
      a {
        color: ${linkColor};
      }
      code {
        font-family: Menlo, monospace;
        background: ${inlineCodeBackground};
        color: ${inlineCodeColor};
        border-radius: 6px;
        padding: 2px 5px;
      }
      pre {
        overflow: auto;
        background: ${preBackground};
        color: ${preColor};
        border-radius: 14px;
        padding: 14px;
      }
      pre code {
        padding: 0;
        background: transparent;
        color: inherit;
      }
      img, iframe, table {
        max-width: 100%;
      }
      .shiki {
        margin: 0;
        border-radius: 14px;
        padding: 16px;
        overflow: auto;
      }
      .shiki code {
        display: block;
        min-width: max-content;
      }
      .shiki .line {
        display: block;
      }
      html.dark .shiki,
      html.dark .shiki span {
        color: var(--shiki-dark) !important;
        background-color: var(--shiki-dark-bg) !important;
        font-style: var(--shiki-dark-font-style) !important;
        font-weight: var(--shiki-dark-font-weight) !important;
        text-decoration: var(--shiki-dark-text-decoration) !important;
      }
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

export async function renderCodePreviewDocument({
  filename,
  language,
  content,
  theme,
  isDark,
}: {
  filename: string;
  language?: string | null;
  content: string;
  theme: AppTheme;
  isDark: boolean;
}) {
  const {codeToHtml} = await getShikiBundle();
  const highlighted = await codeToHtml(content || ' ', {
    lang: resolveCodeLanguage(filename, language),
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  });

  return wrapPreviewDocument(filename, highlighted, theme, isDark);
}
