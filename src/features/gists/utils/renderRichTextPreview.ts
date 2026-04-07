import type {AppTheme} from '../../../app/theme/tokens';
import {wrapPreviewDocument} from './renderCodePreview';

function isMarkdownFile(filename: string) {
  return /\.(md|markdown|mdown|mkd|mkdn)$/i.test(filename);
}

function isHtmlFile(filename: string) {
  return /\.(html?|xhtml)$/i.test(filename);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(value: string) {
  let result = escapeHtml(value);

  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');

  return result;
}

function renderMarkdownDocument(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  const paragraphBuffer: string[] = [];
  const listBuffer: string[] = [];
  const codeBuffer: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraphBuffer.join('<br />'))}</p>`);
    paragraphBuffer.length = 0;
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    blocks.push(`<ul>${listBuffer.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
    listBuffer.length = 0;
  };

  const flushCode = () => {
    if (codeBuffer.length === 0) {
      return;
    }

    blocks.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
    codeBuffer.length = 0;
  };

  lines.forEach(line => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    const listMatch = line.match(/^\s*[-*+]\s+(.+)$/);

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushParagraph();
        flushList();
      }

      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      return;
    }

    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }

    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
      return;
    }

    paragraphBuffer.push(line);
  });

  flushParagraph();
  flushList();
  flushCode();

  return blocks.join('');
}

export function buildRichTextPreviewDocument({
  filename,
  content,
  renderedHtml,
  theme,
  isDark,
}: {
  filename: string;
  content?: string;
  renderedHtml?: string;
  theme: AppTheme;
  isDark: boolean;
}) {
  if (renderedHtml) {
    return wrapPreviewDocument(filename, renderedHtml, theme, isDark);
  }

  if (typeof content !== 'string') {
    return null;
  }

  if (isMarkdownFile(filename)) {
    return wrapPreviewDocument(filename, renderMarkdownDocument(content), theme, isDark);
  }

  if (isHtmlFile(filename)) {
    if (/<html[\s>]/i.test(content) || /<!doctype/i.test(content)) {
      return content;
    }

    return wrapPreviewDocument(filename, content, theme, isDark);
  }

  return null;
}
