import axios, {AxiosHeaders} from 'axios';
import {normalizeGitHubError} from './errors';

const GITHUB_API_BASE_URL = 'https://api.github.com';

let accessToken: string | null = null;

export const githubClient = axios.create({
  baseURL: GITHUB_API_BASE_URL,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});

githubClient.interceptors.request.use(config => {
  const headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  } else {
    headers.delete('Authorization');
  }

  config.headers = headers;
  return config;
});

githubClient.interceptors.response.use(
  response => response,
  error => Promise.reject(normalizeGitHubError(error)),
);

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function getApiAccessToken() {
  return accessToken;
}
