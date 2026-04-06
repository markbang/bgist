export const githubOAuthConfig = {
  clientId: 'Ov23liaqY7CPrZQDh7fU',
  scopes: ['gist', 'read:user'],
  serviceConfiguration: {
    deviceCodeEndpoint: 'https://github.com/login/device/code',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
  },
};

export function assertOAuthConfig() {
  if (githubOAuthConfig.clientId.startsWith('YOUR_')) {
    throw new Error('GITHUB_OAUTH_CLIENT_ID_MISSING');
  }
}
