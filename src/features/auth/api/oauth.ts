import {githubOAuthConfig, assertOAuthConfig} from '../config/oauth';

export type GitHubDeviceAuthorization = {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresAt: number;
  intervalSeconds: number;
};

type GitHubDeviceTokenResult = {
  accessToken: string;
};

type GitHubDeviceTokenResponse = {
  access_token?: string;
  error?: string;
  interval?: number;
};

function createOAuthRequestBody(params: Record<string, string>) {
  const body = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    body.append(key, value);
  });

  return body.toString();
}

async function sleep(seconds: number) {
  await new Promise<void>(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}

export async function requestGitHubDeviceAuthorization(): Promise<GitHubDeviceAuthorization> {
  assertOAuthConfig();

  const response = await fetch(githubOAuthConfig.serviceConfiguration.deviceCodeEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: createOAuthRequestBody({
      client_id: githubOAuthConfig.clientId,
      scope: githubOAuthConfig.scopes.join(' '),
    }),
  });

  if (!response.ok) {
    throw new Error('GITHUB_DEVICE_CODE_REQUEST_FAILED');
  }

  const payload = (await response.json()) as {
    device_code?: string;
    user_code?: string;
    verification_uri?: string;
    expires_in?: number;
    interval?: number;
  };

  if (
    !payload.device_code ||
    !payload.user_code ||
    !payload.verification_uri ||
    typeof payload.expires_in !== 'number' ||
    typeof payload.interval !== 'number'
  ) {
    throw new Error('GITHUB_DEVICE_CODE_RESPONSE_INVALID');
  }

  return {
    deviceCode: payload.device_code,
    userCode: payload.user_code,
    verificationUri: payload.verification_uri,
    expiresAt: Date.now() + payload.expires_in * 1000,
    intervalSeconds: payload.interval,
  };
}

export async function pollGitHubDeviceAccessToken({
  deviceCode,
  expiresAt,
  intervalSeconds,
}: GitHubDeviceAuthorization): Promise<GitHubDeviceTokenResult> {
  assertOAuthConfig();

  let nextIntervalSeconds = intervalSeconds;

  while (true) {
    const remainingSeconds = (expiresAt - Date.now()) / 1000;

    if (remainingSeconds <= 0) {
      throw new Error('GITHUB_DEVICE_CODE_EXPIRED');
    }

    await sleep(Math.min(nextIntervalSeconds, remainingSeconds));

    if (Date.now() >= expiresAt) {
      throw new Error('GITHUB_DEVICE_CODE_EXPIRED');
    }

    const response = await fetch(githubOAuthConfig.serviceConfiguration.tokenEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: createOAuthRequestBody({
        client_id: githubOAuthConfig.clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    if (!response.ok) {
      throw new Error('GITHUB_DEVICE_TOKEN_REQUEST_FAILED');
    }

    const payload = (await response.json()) as GitHubDeviceTokenResponse;

    if (payload.access_token) {
      return {
        accessToken: payload.access_token,
      };
    }

    if (payload.error === 'authorization_pending') {
      continue;
    }

    if (payload.error === 'slow_down') {
      nextIntervalSeconds = payload.interval ?? nextIntervalSeconds + 5;
      continue;
    }

    if (payload.error === 'access_denied') {
      throw new Error('GITHUB_DEVICE_ACCESS_DENIED');
    }

    if (payload.error === 'expired_token') {
      throw new Error('GITHUB_DEVICE_CODE_EXPIRED');
    }

    if (payload.error === 'device_flow_disabled') {
      throw new Error('GITHUB_DEVICE_FLOW_DISABLED');
    }

    throw new Error('GITHUB_DEVICE_TOKEN_REQUEST_FAILED');
  }
}
