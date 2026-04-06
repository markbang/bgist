import {pollGitHubDeviceAccessToken} from '../../src/features/auth/api/oauth';

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  Reflect.deleteProperty(globalThis, 'fetch');
});

test('stops polling once the device code lifetime has elapsed before another token request', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-04-06T00:00:00.000Z'));
  globalThis.fetch = jest.fn();

  const pollPromise = pollGitHubDeviceAccessToken({
    deviceCode: 'device-code-1',
    userCode: 'ABCD-EFGH',
    verificationUri: 'https://github.com/login/device',
    expiresAt: Date.now() + 100,
    intervalSeconds: 1,
  });
  const rejection = expect(pollPromise).rejects.toThrow('GITHUB_DEVICE_CODE_EXPIRED');

  await jest.advanceTimersByTimeAsync(1000);

  await rejection;
  expect(globalThis.fetch).not.toHaveBeenCalled();
});
