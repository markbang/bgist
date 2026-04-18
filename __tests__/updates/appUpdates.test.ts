import {
  compareVersionNumbers,
  createAppUpdateSnapshot,
  normalizeReleaseVersion,
  selectPreferredReleaseAsset,
  type GitHubRelease,
} from '../../src/features/updates/api/appUpdates';

function createRelease(overrides: Partial<GitHubRelease> = {}): GitHubRelease {
  return {
    id: 1,
    assets: [],
    body: '',
    draft: false,
    html_url: 'https://github.com/markbang/bgist/releases/tag/v0.2.10',
    name: 'BGist v0.2.10',
    prerelease: false,
    published_at: '2026-04-19T10:00:00Z',
    tag_name: 'v0.2.10',
    ...overrides,
  };
}

test('normalizes release tags before comparing versions', () => {
  expect(normalizeReleaseVersion('v0.2.10')).toBe('0.2.10');
  expect(compareVersionNumbers('0.2.10', '0.2.9')).toBeGreaterThan(0);
  expect(compareVersionNumbers('0.2.9', '0.2.9')).toBe(0);
});

test('prefers arm64 release assets over universal builds', () => {
  const asset = selectPreferredReleaseAsset([
    {
      id: 1,
      name: 'BGist-v0-2-10-universal.apk',
      browser_download_url: 'https://example.com/universal.apk',
    },
    {
      id: 2,
      name: 'BGist-v0-2-10-arm64-v8a.apk',
      browser_download_url: 'https://example.com/arm64.apk',
    },
  ]);

  expect(asset?.browser_download_url).toBe('https://example.com/arm64.apk');
});

test('creates an update snapshot with preferred asset download urls', () => {
  const snapshot = createAppUpdateSnapshot(
    '0.2.9',
    createRelease({
      assets: [
        {
          id: 2,
          name: 'BGist-v0-2-10-arm64-v8a.apk',
          browser_download_url: 'https://example.com/arm64.apk',
        },
      ],
    }),
  );

  expect(snapshot.updateAvailable).toBe(true);
  expect(snapshot.latestVersion).toBe('0.2.10');
  expect(snapshot.downloadUrl).toBe('https://example.com/arm64.apk');
  expect(snapshot.releaseUrl).toBe('https://github.com/markbang/bgist/releases/tag/v0.2.10');
});
