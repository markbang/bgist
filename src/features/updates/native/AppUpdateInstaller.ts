import { NativeModules, Platform } from 'react-native';

export type NativeInstallResult = {
  downloadId?: number;
  fileName?: string;
  status: 'installing' | 'opened';
};

type NativeAppUpdateInstaller = {
  canRequestPackageInstalls: () => Promise<boolean>;
  downloadAndInstallApk: (
    url: string,
    fileName: string,
  ) => Promise<NativeInstallResult>;
  openInstallPermissionSettings: () => Promise<void>;
};

type NativeModuleRegistry = {
  BGistAppUpdateInstaller?: NativeAppUpdateInstaller;
};

const nativeInstaller = (NativeModules as NativeModuleRegistry)
  .BGistAppUpdateInstaller;

export const supportsNativeApkInstall =
  Platform.OS === 'android' && Boolean(nativeInstaller?.downloadAndInstallApk);

function sanitizeApkFileName(fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');

  return safeName.toLowerCase().endsWith('.apk') ? safeName : `${safeName}.apk`;
}

export function createUpdateApkFileName(
  version: string,
  assetName?: string | null,
) {
  if (assetName) {
    return sanitizeApkFileName(assetName);
  }

  return sanitizeApkFileName(`BGist-v${version}.apk`);
}

export async function canRequestPackageInstalls() {
  if (
    !supportsNativeApkInstall ||
    !nativeInstaller?.canRequestPackageInstalls
  ) {
    return false;
  }

  return nativeInstaller.canRequestPackageInstalls();
}

export async function openInstallPermissionSettings() {
  if (!nativeInstaller?.openInstallPermissionSettings) {
    return;
  }

  await nativeInstaller.openInstallPermissionSettings();
}

export async function downloadAndInstallApk(url: string, fileName: string) {
  if (!supportsNativeApkInstall || !nativeInstaller?.downloadAndInstallApk) {
    throw Object.assign(new Error('Native APK install is not available.'), {
      code: 'native_install_unavailable',
    });
  }

  return nativeInstaller.downloadAndInstallApk(
    url,
    sanitizeApkFileName(fileName),
  );
}
