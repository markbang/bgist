export const queryKeys = {
  session: ['session'] as const,
  myGists: ['gists', 'mine'] as const,
  starredGists: ['gists', 'starred'] as const,
  publicGists: ['gists', 'public'] as const,
  gistDetail: (gistId: string) => ['gists', 'detail', gistId] as const,
  gistSupport: (gistId: string) => ['gists', 'support', gistId] as const,
  gistHistory: (gistId: string) => ['gists', 'history', gistId] as const,
  userProfile: (username: string) => ['users', 'profile', username] as const,
  userGists: (username: string) => ['users', 'gists', username] as const,
};
