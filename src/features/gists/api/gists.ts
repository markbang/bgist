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

export async function getMyGists(page = 1, perPage = 30) {
  const {data} = await githubClient.get<Gist[]>('/gists', {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getStarredGists(page = 1, perPage = 30) {
  const {data} = await githubClient.get<Gist[]>('/gists/starred', {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getPublicGists(page = 1, perPage = 30) {
  const {data} = await githubClient.get<Gist[]>('/gists/public', {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getUserGists(username: string, page = 1, perPage = 30) {
  const {data} = await githubClient.get<Gist[]>(`/users/${username}/gists`, {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getUserInfo(username?: string) {
  const {data} = await githubClient.get<UserInfo>(username ? `/users/${username}` : '/user');
  return data;
}

export async function getGist(gistId: string) {
  const {data} = await githubClient.get<GistWithHistory>(`/gists/${gistId}`);
  return data;
}

export async function isGistStarred(gistId: string) {
  try {
    const {status} = await githubClient.get(`/gists/${gistId}/star`);
    return status === 204;
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return false;
    }

    throw error;
  }
}

export async function getGistComments(gistId: string) {
  const {data} = await githubClient.get<GistComment[]>(`/gists/${gistId}/comments`);
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
