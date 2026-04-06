import {authorize} from 'react-native-app-auth';
import {githubOAuthConfig, assertOAuthConfig} from '../config/oauth';

export async function startGitHubOAuth() {
  assertOAuthConfig();
  return authorize(githubOAuthConfig);
}
