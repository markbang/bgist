package com.bgist

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import java.io.File

class AppUpdateInstallerModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "BGistAppUpdateInstaller"

  @ReactMethod
  fun canRequestPackageInstalls(promise: Promise) {
    val canInstall =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.O ||
            reactContext.packageManager.canRequestPackageInstalls()
    promise.resolve(canInstall)
  }

  @ReactMethod
  fun openInstallPermissionSettings(promise: Promise) {
    try {
      val intent =
          Intent(
              Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
              Uri.parse("package:${reactContext.packageName}"),
          )
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("open_install_settings_failed", error)
    }
  }

  @ReactMethod
  fun downloadAndInstallApk(url: String, fileName: String, promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        !reactContext.packageManager.canRequestPackageInstalls()) {
      promise.reject("install_permission_required", "BGist needs permission to install APK files.")
      return
    }

    val safeFileName = fileName.replace(Regex("[^a-zA-Z0-9._-]"), "-")
    if (!safeFileName.endsWith(".apk", ignoreCase = true)) {
      promise.reject("invalid_update_asset", "The selected update asset is not an APK.")
      return
    }

    try {
      val downloadsDir = reactContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
      if (downloadsDir == null) {
        promise.reject("download_directory_unavailable", "Download directory is unavailable.")
        return
      }

      val targetFile = File(downloadsDir, safeFileName)
      if (targetFile.exists()) {
        targetFile.delete()
      }

      val request =
          DownloadManager.Request(Uri.parse(url))
              .setTitle(safeFileName)
              .setDescription("BGist update")
              .setMimeType(APK_MIME_TYPE)
              .setAllowedOverMetered(true)
              .setAllowedOverRoaming(false)
              .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
              .setDestinationUri(Uri.fromFile(targetFile))

      val downloadManager = reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
      val downloadId = downloadManager.enqueue(request)
      val receiver =
          object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
              val completedDownloadId =
                  intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L) ?: -1L
              if (completedDownloadId != downloadId) {
                return
              }

              try {
                reactContext.unregisterReceiver(this)
              } catch (_: IllegalArgumentException) {}

              handleCompletedDownload(downloadManager, downloadId, targetFile, promise)
            }
          }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        reactContext.registerReceiver(
            receiver,
            IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
            Context.RECEIVER_NOT_EXPORTED,
        )
      } else {
        reactContext.registerReceiver(receiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
      }
    } catch (error: Exception) {
      promise.reject("download_start_failed", error)
    }
  }

  private fun handleCompletedDownload(
      downloadManager: DownloadManager,
      downloadId: Long,
      targetFile: File,
      promise: Promise,
  ) {
    val query = DownloadManager.Query().setFilterById(downloadId)
    val cursor = downloadManager.query(query)

    cursor.use {
      if (!it.moveToFirst()) {
        promise.reject("download_missing", "The update download could not be found.")
        return
      }

      val statusIndex = it.getColumnIndex(DownloadManager.COLUMN_STATUS)
      val reasonIndex = it.getColumnIndex(DownloadManager.COLUMN_REASON)
      val status = it.getInt(statusIndex)

      if (status != DownloadManager.STATUS_SUCCESSFUL) {
        val reason = if (reasonIndex >= 0) it.getInt(reasonIndex) else 0
        promise.reject("download_failed", "The update download failed with reason $reason.")
        return
      }
    }

    try {
      openApkInstaller(targetFile)
      val result = WritableNativeMap()
      result.putString("status", "installing")
      result.putDouble("downloadId", downloadId.toDouble())
      result.putString("fileName", targetFile.name)
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("install_start_failed", error)
    }
  }

  private fun openApkInstaller(targetFile: File) {
    val uri =
        FileProvider.getUriForFile(
            reactContext,
            "${reactContext.packageName}.updateprovider",
            targetFile,
        )
    val intent =
        Intent(Intent.ACTION_VIEW)
            .setDataAndType(uri, APK_MIME_TYPE)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    reactContext.startActivity(intent)
  }

  private companion object {
    const val APK_MIME_TYPE = "application/vnd.android.package-archive"
  }
}
