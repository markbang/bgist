import axios from 'axios';

type GitHubErrorPayload = {
  message?: string;
  documentation_url?: string;
};

export class GitHubApiError extends Error {
  status: number | null;
  documentationUrl: string | null;
  cause: unknown;

  constructor({
    message,
    status,
    documentationUrl,
    cause,
  }: {
    message: string;
    status: number | null;
    documentationUrl?: string | null;
    cause: unknown;
  }) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.documentationUrl = documentationUrl ?? null;
    this.cause = cause;
  }
}

function getPayloadMessage(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as GitHubErrorPayload;
  return typeof payload.message === 'string' ? payload.message : null;
}

function getDocumentationUrl(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as GitHubErrorPayload;
  return typeof payload.documentation_url === 'string'
    ? payload.documentation_url
    : null;
}

export function normalizeGitHubError(error: unknown) {
  if (error instanceof GitHubApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const message =
      getPayloadMessage(error.response?.data) ?? error.message ?? 'GitHub request failed';

    return new GitHubApiError({
      message,
      status: error.response?.status ?? null,
      documentationUrl: getDocumentationUrl(error.response?.data),
      cause: error,
    });
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown GitHub error');
}
