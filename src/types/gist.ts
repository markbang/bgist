export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  truncated: boolean;
  content?: string;
  renderedHtml?: string;
}

export interface GistComment {
  id: number;
  body: string;
  user: GistUser;
  created_at: string;
  updated_at: string;
}

export interface GistUser {
  login: string;
  id: number;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
}

export interface Gist {
  id: string;
  node_id: string;
  url: string;
  forks_url: string;
  commits_url: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: Record<string, GistFile>;
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  comments: number;
  user: GistUser | null;
  owner: GistUser;
  truncated: boolean;
  fork_of: {
    id: string;
    url: string;
    forks_url: string;
    commits_url: string;
    node_id: string;
    created_at: string;
    updated_at: string;
    user: GistUser | null;
  } | null;
}

export interface CreateGistParams {
  description?: string;
  public: boolean;
  files: Record<string, { content: string }>;
}

export interface EditGistParams {
  description?: string;
  files: Record<string, { content: string; filename?: string } | null>;
}

export interface UserInfo {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GistHistoryEntry {
  user: GistUser;
  version: string;
  committed_at: string;
  change_status: {
    total: number;
    additions: number;
    deletions: number;
  };
  url: string;
}

export interface GistWithHistory extends Gist {
  history: GistHistoryEntry[];
}
