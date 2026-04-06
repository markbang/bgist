const GIST_ID_PATTERN = /^[0-9a-f]{8,}$/i;

export function parseGistReference(input: string) {
  const value = input.trim();

  if (!value) {
    return null;
  }

  if (GIST_ID_PATTERN.test(value)) {
    return {
      gistId: value,
      kind: 'id' as const,
    };
  }

  try {
    const url = new URL(value);
    const segments = url.pathname.split('/').filter(Boolean);

    if (url.hostname === 'gist.github.com') {
      const gistId = segments.at(-1);

      if (gistId && GIST_ID_PATTERN.test(gistId)) {
        return {
          gistId,
          kind: 'url' as const,
        };
      }
    }

    if (url.hostname === 'gist.githubusercontent.com' && segments.length >= 2) {
      const gistId = segments[1];

      if (GIST_ID_PATTERN.test(gistId)) {
        return {
          gistId,
          kind: 'url' as const,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}
