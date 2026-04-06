export const queryKeys = {
  gists: {
    detail: (gistId: string) => ['gists', 'detail', gistId] as const,
    support: (gistId: string) => ['gists', 'support', gistId] as const,
  },
};
