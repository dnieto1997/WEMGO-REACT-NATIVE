# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ----------- FRESCO / React Native Image -----------
-keep class com.facebook.fresco.** { *; }
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.drawee.** { *; }
-keep class com.facebook.common.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.** { *; }

-dontwarn com.facebook.imagepipeline.**
-dontwarn com.facebook.drawee.**
-dontwarn com.facebook.fresco.**
-dontwarn com.facebook.common.**
-dontwarn com.facebook.soloader.**
-dontwarn com.facebook.**

# Visibilidad interna
-keep class com.facebook.common.internal.VisibleForTesting

# Por seguridad, mantener constructores públicos
-keepclassmembers class * {
    public <init>(...);
}

# Evitar que se eliminen anotaciones (por si alguna clase las usa)
-keepattributes *Annotat