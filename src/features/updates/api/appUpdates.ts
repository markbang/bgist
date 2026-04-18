import {githubClient} from '../../../shared/api/client';
import {appRepositoryName, appRepositoryOwner} from '../../../shared/appInfo';

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

export type AppUpdateSnapshot = {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  release: GitHubRelease;
  preferredAsset: GitHubReleaseAsset | null;
  downloadUrl: string | null;
  releaseUrl: string;
};

function parseVersionParts(value: string) {
  const normalized = normalizeReleaseVersion(value);

  return normalized.split('.').map(part => {
    const match = part.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : 0;
  });
}

export function normalizeReleaseVersion(value: string) {
  return value.trim().replace(/^v/i, '');
}

export function compareVersionNumbers(left: string, right: string) {
  const leftParts = parseVersionParts(left);
  const rightParts = parseVersionParts(right);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

export function selectPreferredReleaseAsset(assets: GitHubReleaseAsset[]) {
  const apkAssets = assets.filter(asset => asset.name.toLowerCase().endsWith('.apk'));

  if (apkAssets.length === 0) {
    return null;
  }

  const getScore = (asset: GitHubReleaseAsset) => {
    const name = asset.name.toLowerCase();

    if (name.includes('arm64-v8a')) {
      return 3;
    }

    if (name.includes('universal')) {
      return 2;
    }

    return 1;
  };

  return [...apkAssets].sort((left, right) => getScore(right) - getScore(left))[0] ?? null;
}

export async function fetchLatestRelease() {
  const response = await githubClient.get<GitHubRelease>(
    `/repos/${appRepositoryOwner}/${appRepositoryName}/releases/latest`,
  );

  return response.data;
}

export function createAppUpdateSnapshot(currentVersion: string, release: GitHubRelease): AppUpdateSnapshot {
  const latestVersion = normalizeReleaseVersion(release.tag_name || release.name || currentVersion);
  const preferredAsset = selectPreferredReleaseAsset(release.assets);

  return {
    currentVersion,
    latestVersion,
    updateAvailable: compareVersionNumbers(latestVersion, currentVersion) > 0,
    release,
    preferredAsset,
    downloadUrl: preferredAsset?.browser_download_url ?? null,
    releaseUrl: release.html_url,
  };
}

export async function checkForAppUpdate(currentVersion: string) {
  const release = await fetchLatestRelease();

  return createAppUpdateSnapshot(currentVersion, release);
}
