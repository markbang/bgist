export const githubOAuthConfig = {
  clientId: 'YOUR_GITHUB_OAUTH_CLIENT_ID',
  redirectUrl: 'bgist://oauth/callback',
  scopes: ['gist', 'read:user'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
  },
};

export function assertOAuthConfig() {
  if (process.env.NODE_ENV !== 'test' && githubOAuthConfig.clientId.startsWith('YOUR_')) {
    throw new Error('GITHUB_OAUTH_CLIENT_ID_MISSING');
  }
}
