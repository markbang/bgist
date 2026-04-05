/**
 * Format ISO date to relative time like GitHub does
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

/**
 * Format date like GitHub (e.g. "Last active on Jan 15, 2024")
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format full date with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get file icon based on language
 */
export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const icons: Record<string, string> = {
    js: '📜',
    ts: '🔷',
    tsx: '⚛️',
    jsx: '⚛️',
    py: '🐍',
    rb: '💎',
    go: '🔵',
    rs: '🦀',
    java: '☕',
    kt: '🟣',
    swift: '🐦',
    cs: '🟢',
    php: '🐘',
    md: '📝',
    json: '📋',
    yml: '⚙️',
    yaml: '⚙️',
    xml: '📄',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    sh: '💻',
    bash: '💻',
    zsh: '💻',
    sql: '🗄️',
    txt: '📄',
  };
  return icons[ext] || '📄';
}

/**
 * Get language display color (approximate GitHub colors)
 */
export function getLanguageColor(language?: string | null): string {
  if (!language) return '#8b949e';
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    Kotlin: '#A97BFF',
    Swift: '#F05138',
    'C#': '#178600',
    PHP: '#4F5D95',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Shell: '#89e051',
    JSON: '#f1e05a',
    Markdown: '#083fa1',
    YAML: '#cb171e',
  };
  return colors[language] || '#8b949e';
}
