import { githubClient } from '../../../shared/api/client';
import { appRepositoryName, appRepositoryOwner } from '../../../shared/appInfo';

export type GitHubReleaseAsset = {
  id: number;
  name: string;
  browser_download_url: string;
  content_type?: string;
  size?: number;
};

export type GitHubRelease = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
  published_at?: string;
  assets: GitHubReleaseAsset[];
};

export type AppUpdateChannel = 'stable' | 'preview';

export type AppUpdateSnapshot = {
  channel: AppUpdateChannel;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  release: GitHubRelease;
  preferredAsset: GitHubReleaseAsset | null;
  downloadUrl: string | null;
  releaseUrl: string;
};

function parseVersion(value: string) {
  const normalized = normalizeReleaseVersion(value);
  const [coreVersion, prereleaseVersion] = normalized.split('-', 2);
  const coreParts = coreVersion.split('.').map(part => {
    const match = part.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : 0;
  });

  const prereleaseParts = prereleaseVersion?.split('.').map(part => {
    const match = part.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : part;
  });

  return {
    coreParts,
    prereleaseParts: prereleaseParts ?? null,
  };
}

export function normalizeReleaseVersion(value: string) {
  return value.trim().replace(/^v/i, '');
}

export function compareVersionNumbers(left: string, right: string) {
  const leftVersion = parseVersion(left);
  const rightVersion = parseVersion(right);
  const leftParts = leftVersion.coreParts;
  const rightParts = rightVersion.coreParts;
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  if (leftVersion.prereleaseParts && !rightVersion.prereleaseParts) {
    return -1;
  }

  if (!leftVersion.prereleaseParts && rightVersion.prereleaseParts) {
    return 1;
  }

  if (leftVersion.prereleaseParts && rightVersion.prereleaseParts) {
    const prereleaseLength = Math.max(
      leftVersion.prereleaseParts.length,
      rightVersion.prereleaseParts.length,
    );

    for (let index = 0; index < prereleaseLength; index += 1) {
      const leftValue = leftVersion.prereleaseParts[index] ?? 0;
      const rightValue = rightVersion.prereleaseParts[index] ?? 0;

      if (leftValue === rightValue) {
        continue;
      }

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return leftValue - rightValue;
      }

      return String(leftValue).localeCompare(String(rightValue));
    }
  }

  return 0;
}

export function selectPreferredReleaseAsset(assets: GitHubReleaseAsset[]) {
  const apkAssets = assets.filter(asset =>
    asset.name.toLowerCase().endsWith('.apk'),
  );

  if (apkAssets.length === 0) {
    return null;
  }

  const getScore = (asset: GitHubReleaseAsset) => {
    const name = asset.name.toLowerCase();

    if (name.includes('universal')) {
      return 4;
    }

    if (name.includes('arm64-v8a')) {
      return 3;
    }

    if (name.includes('armeabi-v7a')) {
      return 2;
    }

    return 1;
  };

  return (
    [...apkAssets].sort((left, right) => getScore(right) - getScore(left))[0] ??
    null
  );
}

export async function fetchLatestStableRelease() {
  const response = await githubClient.get<GitHubRelease>(
    `/repos/${appRepositoryOwner}/${appRepositoryName}/releases/latest`,
  );

  return response.data;
}

export async function fetchLatestPreviewRelease() {
  const response = await githubClient.get<GitHubRelease[]>(
    `/repos/${appRepositoryOwner}/${appRepositoryName}/releases`,
    {
      params: {
        per_page: 20,
      },
    },
  );
  const release = response.data.find(item => !item.draft);

  if (!release) {
    throw new Error('No GitHub releases available.');
  }

  return release;
}

export async function fetchLatestRelease(channel: AppUpdateChannel = 'stable') {
  if (channel === 'preview') {
    return fetchLatestPreviewRelease();
  }

  return fetchLatestStableRelease();
}

export function createAppUpdateSnapshot(
  currentVersion: string,
  release: GitHubRelease,
  channel: AppUpdateChannel = 'stable',
): AppUpdateSnapshot {
  const latestVersion = normalizeReleaseVersion(
    release.tag_name || release.name || currentVersion,
  );
  const preferredAsset = selectPreferredReleaseAsset(release.assets);

  return {
    channel,
    currentVersion,
    latestVersion,
    updateAvailable: compareVersionNumbers(latestVersion, currentVersion) > 0,
    release,
    preferredAsset,
    downloadUrl: preferredAsset?.browser_download_url ?? null,
    releaseUrl: release.html_url,
  };
}

export async function checkForAppUpdate(
  currentVersion: string,
  channel: AppUpdateChannel = 'stable',
) {
  const release = await fetchLatestRelease(channel);

  return createAppUpdateSnapshot(currentVersion, release, channel);
}
