# دليل التشغيل الكامل — تطبيق صنعة

> هذا الدليل يشرح تشغيل التطبيق من الصفر حتى تجربته في المتصفح وعلى الموبايل.
> كل أمر منسوخ جاهز — ألصقه في الـ Terminal مباشرة.

---

## 📦 الحصول على الكود

### الطريقة الأولى (الأسرع) — أرشيف مضغوط

الملف موجود داخل المشروع في: **`_delivery/san3a-source.tar.gz`** (6.6 MB)

```bash
# فك الضغط حيث تريد
tar -xzf san3a-source.tar.gz
cd san3a-premium-service-marketplace
```

### الطريقة الثانية — Git Bundle (يحافظ على تاريخ الـ commits)

الملف: **`_delivery/san3a-full.bundle`** (707 KB)

```bash
git clone san3a-full.bundle san3a-premium-service-marketplace
cd san3a-premium-service-marketplace
git checkout claude/arabic-booking-app-S6iSU
```

---

## ⚙️ المتطلبات

قبل أي شيء، ثبّت هذه الأدوات على جهازك:

| الأداة | الرابط | التحقق |
|-------|--------|--------|
| **Bun** (أو Node 20+) | https://bun.sh | `bun --version` |
| **Git** | https://git-scm.com | `git --version` |
| حساب **Convex** مجاني | https://convex.dev | — |

لبناء تطبيق موبايل إضافةً لما سبق:

| المنصة | الأداة |
|---------|-------|
| Android | [Android Studio](https://developer.android.com/studio) + JDK 17 |
| iOS | macOS + [Xcode 15+](https://apps.apple.com/us/app/xcode/id497799835) + CocoaPods |

---

## 🚀 الخطوة 1: تثبيت الاعتماديات

```bash
bun install
```
سيثبّت جميع الحزم (قد يأخذ دقيقتين أول مرة).

---

## 🗄️ الخطوة 2: تهيئة قاعدة البيانات (Convex)

التطبيق يستخدم **Convex** للـ backend (قاعدة بيانات + auth + real-time).

### 2.1 أنشئ مشروع Convex

```bash
bunx convex login
bunx convex dev
```

عند الأمر الثاني:
- اختر **"Create a new project"**
- سمّه `san3a`
- سيفتح الإعداد تلقائياً متصفحك ويُنشئ الـ deployment

سيُنشأ لك ملف `.env.local` تلقائياً فيه:
```
CONVEX_DEPLOYMENT=prod:xxxxx
VITE_CONVEX_URL=https://xxxxx.convex.cloud
```

### 2.2 اتركه يعمل في نافذة منفصلة

`bunx convex dev` يشتغل دائماً ويزامن التغييرات في backend (مجلد `convex/`). **افتح terminal ثانية** للأمر التالي.

---

## 🌐 الخطوة 3: تشغيل الواجهة (متصفح)

في terminal ثانية:

```bash
bun run dev
```

افتح **http://localhost:3000** في المتصفح.

### ما ستراه:
1. شاشة البداية بالعربية مع شعار "صنعة"
2. اختيار دور: **عميل** أو **فني**
3. تسجيل دخول OTP (لرقم موريتاني مثل `+222xxxxxxx`)

### في وضع التطوير
تسجيل OTP يطبع الكود في الـ Terminal (لا يُرسل SMS فعلي). انسخه من نافذة `convex dev`.

### جرّب الميزات الرئيسية:

| الشاشة | الرابط | ملاحظات |
|--------|--------|---------|
| الصفحة الرئيسية | `/` | اختيار الدور |
| لوحة العميل | `/client` | خريطة الفنيين + طلب خدمة بالصوت |
| طلبات العميل | `/orders` | سجل الطلبات |
| لوحة الفني | `/worker` | مفتاح "متاح" + زر مشاركة ملف الثقة |
| تحرير ملف الفني | `/worker/profile-editor` | معرض أعمال 12 صورة |
| محفظة الفني | `/wallet` | سحب أرباح |
| **ملف الثقة العام ⭐** | `/trust/:workerId` | QR للمشاركة — لا يحتاج تسجيل |
| الإدارة | `/admin` | توثيق الفنيين (تحتاج `role: "admin"` يدوياً) |

### كيف تجعل حسابك أدمن؟

```bash
# في نافذة Convex dev، اذهب إلى dashboard
bunx convex dashboard
# اذهب إلى Data → users → افتح صفّك → غيّر role إلى "admin"
```

---

## 📱 الخطوة 4: تشغيل التطبيق الأصلي (Android / iPhone)

### 4.1 بناء الواجهة + توليد المنصّتين الأصليتين

```bash
# بناء أول مرة — ينشئ مجلدي android/ و ios/
bun run mobile:build
bunx cap add android
bunx cap add ios       # (على macOS فقط)
bunx cap sync
```

### 4.2 Android

```bash
# أسهل طريقة — يفتح Android Studio
bun run mobile:open:android
```

في Android Studio:
1. انتظر Gradle Sync (3-5 دقائق أول مرة)
2. وصّل هاتف أندرويد (مع تفعيل USB Debugging) أو استخدم Emulator
3. اضغط ▶️ **Run**

**لإنشاء APK تجريبي مباشرة من الـ terminal:**
```bash
cd android
./gradlew assembleDebug
# الإخراج: android/app/build/outputs/apk/debug/app-debug.apk
```
انسخ الـ APK إلى هاتفك وثبّته.

**لإنشاء AAB للنشر على Google Play:**
```bash
cd android
./gradlew bundleRelease
# الإخراج: android/app/build/outputs/bundle/release/app-release.aab
```
ثم ارفعه إلى https://play.google.com/console

### 4.3 iOS (macOS فقط)

```bash
bun run mobile:open:ios
```

في Xcode:
1. اختر جهازك أو Simulator من الأعلى
2. أول مرة: اختر Team (حسابك المطوّر Apple) من Signing & Capabilities
3. اضغط ▶️ **Run**

**للنشر على App Store / TestFlight:**
- Product → Archive → Distribute App

### 4.4 بعد أي تعديل على الواجهة

```bash
bun run mobile:build    # يُعيد البناء ويزامن Android و iOS
```

---

## 🎨 الخطوة 5 (اختياري): أيقونات مخصصة

```bash
bun add -D @capacitor/assets
# ضع icon.png (1024×1024) و splash.png (2732×2732) في assets/
bunx capacitor-assets generate
```

---

## 🧪 سيناريو اختبار كامل

1. افتح الواجهة في المتصفح → سجّل دخول كـ **عميل** برقم A
2. اطلب خدمة "سباكة" مع تسجيل صوتي
3. في نافذة خاصة جديدة → سجّل دخول كـ **فني** برقم B → أكمل KYC
4. من Convex dashboard غيّر `kycStatus` إلى `"verified"` لحساب الفني
5. فعّل مفتاح "متاح" في لوحة الفني
6. ستظهر له المهمة فوراً (real-time)
7. اضغط "قبول" → يفتح عقد رقمي → اقبل
8. في نافذة العميل ستظهر حالة "جاري العمل" مع تتبع خريطة لحظي

---

## 🐛 حل المشاكل الشائعة

| المشكلة | الحل |
|---------|------|
| `CONVEX_DEPLOYMENT is not set` | `bunx convex dev --once` |
| الأيقونات لا تظهر على الموبايل | `bunx capacitor-assets generate` |
| `gradlew: Permission denied` | `chmod +x android/gradlew` |
| iOS build يفشل بـ signing error | في Xcode → Signing & Capabilities → اختر Team |
| بطء Gradle sync أول مرة | طبيعي — قد يستغرق 10 دقائق |
| Android Studio لا يرى الجهاز | فعّل USB Debugging في Developer Options |

---

## 📂 هيكل المشروع

```
san3a-premium-service-marketplace/
├── convex/                     # Backend (قاعدة البيانات + API)
│   ├── schema.ts               # تعريف الجداول
│   ├── users.ts                # المستخدمين والفنيين
│   ├── requests.ts             # طلبات الخدمة
│   ├── trust.ts                # ⭐ Trust Profile العام
│   └── files.ts                # رفع الملفات
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx        # الصفحة الرئيسية
│   │   ├── client/             # شاشات العميل
│   │   ├── worker/             # شاشات الفني
│   │   ├── admin/              # لوحة الإدارة
│   │   └── shared/
│   │       └── TrustProfile.tsx # ⭐ ملف الثقة العام
│   ├── components/
│   │   ├── layout/RtlLayout.tsx # شريط التنقل RTL
│   │   └── client/ServiceRequestDialog.tsx # طلب صوتي
│   └── lib/
│       └── native.ts           # جسر APIs الجهاز الأصلية
├── android/                    # (يُولَّد) — مشروع Android Studio
├── ios/                        # (يُولَّد) — مشروع Xcode
├── capacitor.config.ts         # إعدادات التطبيق الأصلي
└── MOBILE.md                   # تفاصيل تقنية للموبايل
```

---

## 📞 المساعدة

- توثيق Convex: https://docs.convex.dev
- توثيق Capacitor: https://capacitorjs.com/docs
- مشاكل في الـ backend: شغّل `bunx convex dashboard` لرؤية الـ logs لحظياً
