import type {Gist, GistComment, GistWithHistory, UserInfo} from '../../../types/gist';
import {githubClient} from '../../../shared/api/client';

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
  const {status} = await githubClient.get(`/gists/${gistId}/star`);
  return status === 204;
}

export async function getGistComments(gistId: string) {
  const {data} = await githubClient.get<GistComment[]>(`/gists/${gistId}/comments`);
  return data;
}
