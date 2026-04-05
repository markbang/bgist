# React Native ProGuard rules

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep JavaScript interface methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep async-storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep clipboard
-keep class com.reactnativecommunity.clipboard.** { *; }

# Keep webview
-keep class com.reactnativecommunity.webview.** { *; }

# Keep safe-area-context
-keep class com.th3rdwave.safeareacontext.** { *; }

# Keep screens
-keep class com.swmansion.rnscreens.** { *; }

# Keep navigation
-keep class com.swmansion.gesturehandler.** { *; }
