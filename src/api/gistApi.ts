import axios from 'axios';
import type {
  Gist,
  GistWithHistory,
  GistComment,
  CreateGistParams,
  EditGistParams,
  UserInfo,
} from '../types/gist';

const API_BASE = 'https://api.github.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.Authorization;
  }
}

// ============ Auth ============

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<string> {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    },
    {
      headers: {Accept: 'application/json'},
    },
  );
  if (response.data.access_token) {
    return response.data.access_token;
  }
  throw new Error(response.data.error_description || 'Failed to get access token');
}

// ============ Gists ============

export async function getMyGists(page = 1, perPage = 30): Promise<Gist[]> {
  const {data} = await api.get<Gist[]>('/gists', {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getPublicGists(page = 1, perPage = 30): Promise<Gist[]> {
  const {data} = await api.get<Gist[]>('/gists/public', {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getStarredGists(
  page = 1,
  perPage = 30,
): Promise<Gist[]> {
  const {data} = await api.get<Gist[]>('/gists/starred', {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getUserGists(
  username: string,
  page = 1,
  perPage = 30,
): Promise<Gist[]> {
  const {data} = await api.get<Gist[]>(`/users/${username}/gists`, {
    params: {page, per_page: perPage},
  });
  return data;
}

export async function getGist(id: string): Promise<GistWithHistory> {
  const {data} = await api.get<GistWithHistory>(`/gists/${id}`);
  return data;
}

export async function searchGists(
  query: string,
  page = 1,
  perPage = 30,
): Promise<Gist[]> {
  const {data} = await api.get<{items: Gist[]}>('/gists/search', {
    params: {q: query, page, per_page: perPage},
  });
  return data.items || [];
}

export async function createGist(params: CreateGistParams): Promise<Gist> {
  const {data} = await api.post<Gist>('/gists', params);
  return data;
}

export async function editGist(
  id: string,
  params: EditGistParams,
): Promise<Gist> {
  const {data} = await api.patch<Gist>(`/gists/${id}`, params);
  return data;
}

export async function deleteGist(id: string): Promise<void> {
  await api.delete(`/gists/${id}`);
}

export async function starGist(id: string): Promise<void> {
  await api.put(`/gists/${id}/star`);
}

export async function unstarGist(id: string): Promise<void> {
  await api.delete(`/gists/${id}/star`);
}

export async function isGistStarred(id: string): Promise<boolean> {
  const {status} = await api.get(`/gists/${id}/star`);
  return status === 204;
}

export async function forkGist(id: string): Promise<Gist> {
  const {data} = await api.post<Gist>(`/gists/${id}/forks`);
  return data;
}

// ============ Comments ============

export async function getGistComments(gistId: string): Promise<GistComment[]> {
  const {data} = await api.get<GistComment[]>(`/gists/${gistId}/comments`);
  return data;
}

export async function addGistComment(
  gistId: string,
  body: string,
): Promise<GistComment> {
  const {data} = await api.post<GistComment>(`/gists/${gistId}/comments`, {
    body,
  });
  return data;
}

export async function editGistComment(
  gistId: string,
  commentId: number,
  body: string,
): Promise<GistComment> {
  const {data} = await api.patch<GistComment>(
    `/gists/${gistId}/comments/${commentId}`,
    {body},
  );
  return data;
}

export async function deleteGistComment(
  gistId: string,
  commentId: number,
): Promise<void> {
  await api.delete(`/gists/${gistId}/comments/${commentId}`);
}

// ============ User ============

export async function getUserInfo(username?: string): Promise<UserInfo> {
  const path = username ? `/users/${username}` : '/user';
  const {data} = await api.get<UserInfo>(path);
  return data;
}
