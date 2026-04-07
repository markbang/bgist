import type {
  CreateGistParams,
  EditGistParams,
  Gist,
  GistComment,
  GistWithHistory,
  UserInfo,
} from '../../../types/gist';
import {githubClient} from '../../../shared/api/client';
import {GitHubApiError} from '../../../shared/api/errors';
import {parsePublicGistPage} from './parsePublicGistPage';

function canFallbackToPublicPage(error: unknown) {
  return (
    error instanceof GitHubApiError &&
    (error.status === null || error.status >= 500)
  );
}

export async function getMyGists(page = 1, perPage = 30, signal?: AbortSignal) {
  const {data} = await githubClient.get<Gist[]>('/gists', {
    params: {page, per_page: perPage},
    signal,
  });
  return data;
}

export async function getStarredGists(page = 1, perPage = 30, signal?: AbortSignal) {
  const {data} = await githubClient.get<Gist[]>('/gists/starred', {
    params: {page, per_page: perPage},
    signal,
  });
  return data;
}

export async function getPublicGists(page = 1, perPage = 30, signal?: AbortSignal) {
  const {data} = await githubClient.get<Gist[]>('/gists/public', {
    params: {page, per_page: perPage},
    signal,
  });
  return data;
}

export async function getUserGists(
  username: string,
  page = 1,
  perPage = 30,
  signal?: AbortSignal,
) {
  const {data} = await githubClient.get<Gist[]>(`/users/${username}/gists`, {
    params: {page, per_page: perPage},
    signal,
  });
  return data;
}

export async function getUserInfo(username?: string, signal?: AbortSignal) {
  const {data} = await githubClient.get<UserInfo>(username ? `/users/${username}` : '/user', {
    signal,
  });
  return data;
}

export async function getGist(gistId: string, signal?: AbortSignal) {
  try {
    const {data} = await githubClient.get<GistWithHistory>(`/gists/${gistId}`, {
      signal,
    });
    return data;
  } catch (error) {
    if (!canFallbackToPublicPage(error)) {
      throw error;
    }

    const response = await fetch(`https://gist.github.com/${gistId}`, {signal});

    if (!response.ok) {
      throw error;
    }

    const fallbackGist = parsePublicGistPage(await response.text(), gistId);

    if (!fallbackGist) {
      throw error;
    }

    return fallbackGist;
  }
}

export async function isGistStarred(gistId: string, signal?: AbortSignal) {
  try {
    const {status} = await githubClient.get(`/gists/${gistId}/star`, {signal});
    return status === 204;
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return false;
    }

    throw error;
  }
}

export async function getGistComments(gistId: string, signal?: AbortSignal) {
  const {data} = await githubClient.get<GistComment[]>(`/gists/${gistId}/comments`, {
    signal,
  });
  return data;
}

export async function createGist(params: CreateGistParams) {
  const {data} = await githubClient.post<Gist>('/gists', params);
  return data;
}

export async function editGist(gistId: string, params: EditGistParams) {
  const {data} = await githubClient.patch<Gist>(`/gists/${gistId}`, params);
  return data;
}

export async function deleteGist(gistId: string) {
  await githubClient.delete(`/gists/${gistId}`);
}

export async function starGist(gistId: string) {
  await githubClient.put(`/gists/${gistId}/star`);
}

export async function unstarGist(gistId: string) {
  await githubClient.delete(`/gists/${gistId}/star`);
}

export async function forkGist(gistId: string) {
  const {data} = await githubClient.post<Gist>(`/gists/${gistId}/forks`);
  return data;
}

export async function addGistComment(gistId: string, body: string) {
  const {data} = await githubClient.post<GistComment>(`/gists/${gistId}/comments`, {
    body,
  });
  return data;
}
