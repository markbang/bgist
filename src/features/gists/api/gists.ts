import type {GistComment, GistWithHistory} from '../../../types/gist';
import {githubClient} from '../../../shared/api/client';

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
