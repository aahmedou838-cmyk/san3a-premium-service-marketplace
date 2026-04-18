# تطبيق صنعة — نسخة Android / iOS

التطبيق الآن يعمل كتطبيق أصلي (Native) على:

- **Android** عبر Capacitor + Android Studio (APK / AAB للـ Google Play)
- **iOS** عبر Capacitor + Xcode (IPA للـ App Store / TestFlight)

نفس الكود (React + Convex) يُغلَّف داخل قشرة أصلية، ويستخدم أذونات الجهاز الحقيقية (GPS، كاميرا، ميكروفون، إشعارات Push).

---

## المتطلبات

| المنصة | الأدوات |
|--------|---------|
| Android | [Android Studio](https://developer.android.com/studio) + JDK 17 + Android SDK 34 |
| iOS | macOS + [Xcode 15+](https://apps.apple.com/us/app/xcode/id497799835) + CocoaPods (`sudo gem install cocoapods`) |
| مشترك | Node 20+ / Bun، وحساب مطور (Google Play / Apple Developer) |

---

## البناء لأول مرة

```bash
# 1) ثبّت الاعتماديات
bun install

# 2) ابنِ الواجهة ثم انسخها داخل المشروعين الأصليين
bun run mobile:build
```

---

## تشغيل على جهاز / محاكي

```bash
# Android — يفتح Android Studio ويُطلِق على جهاز موصول/Emulator
bun run mobile:android

# iOS — يفتح Xcode
bun run mobile:ios
```

أو افتح المشاريع يدويا:

```bash
bun run mobile:open:android   # Android Studio
bun run mobile:open:ios       # Xcode
```

---

## إنشاء APK للاختبار (Android)

```bash
cd android
./gradlew assembleDebug
# الإخراج: android/app/build/outputs/apk/debug/app-debug.apk
```

## إنشاء AAB للنشر على Google Play

```bash
cd android
./gradlew bundleRelease
# الإخراج: android/app/build/outputs/bundle/release/app-release.aab
```
ثم وقّع الحزمة بمفتاحك قبل الرفع إلى [Google Play Console](https://play.google.com/console).

## إنشاء IPA (iOS)

1. `bun run mobile:open:ios`
2. في Xcode: Product → Archive
3. Distribute App → App Store Connect أو Ad Hoc / TestFlight

---

## الأذونات المُهيأة مسبقا

**Android** (`android/app/src/main/AndroidManifest.xml`):
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` — خريطة الفنيين وتتبع الخدمة
- `CAMERA` — صورة الهوية والسيلفي للتوثيق
- `RECORD_AUDIO` — الرسائل الصوتية في طلب الخدمة
- `POST_NOTIFICATIONS` — إشعارات قبول الطلبات

**iOS** (`ios/App/App/Info.plist`) — نصوص الأذونات بالعربية جاهزة وتتطابق مع سياسة App Store.

---

## إعدادات التطبيق

`capacitor.config.ts`:
- `appId`: `com.san3a.marketplace`
- `appName`: صنعة
- `backgroundColor`: `#0f172a` (أزرق سماوي عميق)
- StatusBar معتم، Splash 1.5s

لتغيير الـ Bundle ID:
1. عدّل `capacitor.config.ts`
2. في Android: `android/app/build.gradle` → `applicationId`
3. في iOS: `ios/App/App.xcodeproj` → Bundle Identifier في Xcode
4. `bunx cap sync`

---

## الأيقونات وشاشة البدء

ضع أيقونة 1024×1024 + Splash، ثم:
```bash
bun add -D @capacitor/assets
bunx capacitor-assets generate
```

---

## بعد كل تعديل على الواجهة

```bash
bun run mobile:build   # يعيد بناء dist/client ويزامن الإندرويد والـ iOS
```
