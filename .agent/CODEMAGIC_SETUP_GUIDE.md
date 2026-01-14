# Codemagic CI/CD Setup Guide

## 📋 Tổng quan

File này hướng dẫn cách setup Codemagic CI/CD cho dự án **Koya Score** (ScoreCard).

## 🚀 Quick Start

### 1. Tạo EXPO_TOKEN

**Bước 1:** Đăng nhập vào Expo
```bash
npx expo login
```

**Bước 2:** Tạo Access Token
- Truy cập: https://expo.dev/accounts/[your-account]/settings/access-tokens
- Click "Create Token"
- Name: `Codemagic CI`
- Permissions: **Read and write**
- Copy token (chỉ hiển thị 1 lần!)

**Bước 3:** Thêm vào Codemagic
1. Vào Codemagic project settings
2. Environment variables
3. Add variable:
   - Name: `EXPO_TOKEN`
   - Value: [paste token]
   - ✅ Secure (check this box)

### 2. Setup EAS Build (Lần đầu tiên)

**Chạy build local để setup credentials:**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Android (sẽ setup credentials)
eas build --platform android --profile preview

# Build iOS (nếu cần)
eas build --platform ios --profile preview
```

**Lưu ý:** Lần đầu tiên EAS sẽ hỏi:
- Android: Tạo keystore mới? → Yes (hoặc upload keystore có sẵn)
- iOS: Apple Developer account credentials

### 3. Connect Repository to Codemagic

**Bước 1:** Đăng nhập Codemagic
- Truy cập: https://codemagic.io
- Sign in with GitHub/GitLab/Bitbucket

**Bước 2:** Add Application
1. Click "Add application"
2. Select repository: `netprtony/ScoreCard`
3. Codemagic sẽ tự động detect `codemagic.yaml`

**Bước 3:** Configure
1. Select workflow (android-workflow, ios-workflow, etc.)
2. Add EXPO_TOKEN (nếu chưa)
3. Start first build!

## 📱 Build Profiles

### Development Build
- **Profile:** `development`
- **Output:** APK with dev client
- **Use case:** Development testing
- **Trigger:** Push to `develop` or `feature/*`

```bash
# Local test
eas build --platform android --profile development
```

### Preview Build
- **Profile:** `preview`
- **Output:** APK for internal testing
- **Use case:** QA, beta testing
- **Trigger:** Push to `main`

```bash
# Local test
eas build --platform android --profile preview
```

### Production Build
- **Profile:** `production`
- **Output:** AAB for Google Play
- **Use case:** Store submission
- **Trigger:** Tag `v*` (e.g., `v1.0.5`)

```bash
# Local test
eas build --platform android --profile production
```

## 🔧 Workflows

### 1. Android Build & Release (`android-workflow`)
- ✅ TypeScript check
- ✅ Build APK/AAB
- ✅ Email notification
- 📦 Artifacts: APK/AAB files

**Triggers:**
- Push to `main` or `develop`
- Tags `v*`
- Pull requests

### 2. iOS Build & Release (`ios-workflow`)
- ✅ TypeScript check
- ✅ CocoaPods install
- ✅ Build IPA
- ✅ Email notification
- 📦 Artifacts: IPA files

**Triggers:**
- Push to `main`
- Tags `v*`

### 3. Development Build (`dev-build`)
- ✅ Quick build for testing
- ✅ Debug APK only
- 📦 Artifacts: Debug APK

**Triggers:**
- Push to `develop`
- Push to `feature/*`

### 4. Quality Assurance (`qa-workflow`)
- ✅ TypeScript check
- ✅ Build verification
- ✅ Code quality checks

**Triggers:**
- Pull requests

## 🎯 Git Workflow

### Feature Development
```bash
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature
# → Triggers: dev-build
```

### Pull Request
```bash
# Create PR on GitHub
# → Triggers: qa-workflow (type check + verification)
```

### Merge to Main
```bash
git checkout master  # or main
git merge feature/new-feature
git push origin master
# → Triggers: android-workflow + ios-workflow
```

### Release
```bash
# Update version in app.json
git commit -m "Bump version to 1.0.5"
git tag v1.0.5
git push origin master --tags
# → Triggers: android-workflow + ios-workflow (production build)
```

## 📧 Email Notifications

Cấu hình email trong `codemagic.yaml`:

```yaml
publishing:
  email:
    recipients:
      - huynhvikhang6a13@gmail.com  # ← Your email
    notify:
      success: true   # Notify on success
      failure: true   # Notify on failure
```

## 🐛 Troubleshooting

### ❌ Error: "EXPO_TOKEN not found"
**Solution:**
1. Check EXPO_TOKEN in Codemagic environment variables
2. Make sure it's marked as "Secure"
3. Regenerate token if expired

### ❌ Error: "No credentials configured"
**Solution:**
```bash
# Run locally first to setup
eas build --platform android --profile preview
```

### ❌ Error: "Build timeout"
**Solution:**
- EAS builds take 10-20 minutes
- Increase `max_build_duration` in codemagic.yaml if needed

### ❌ Error: "Invalid project root"
**Solution:**
- ✅ Fixed! Now using correct `eas build` commands
- Old: `npx expo export:android` ❌
- New: `eas build --platform android --profile preview` ✅

### ❌ Build fails on iOS
**Solution:**
1. Check Apple Developer account credentials
2. Verify provisioning profiles
3. Check bundle ID matches: `com.tienlen.scorecard`

## 📊 Build Status

### Check Build Status
1. Go to Codemagic dashboard
2. Select your app
3. View build history

### Download Artifacts
1. Click on completed build
2. Scroll to "Artifacts" section
3. Download APK/AAB/IPA

## 🔐 Security Best Practices

### ✅ Do:
- Store EXPO_TOKEN as secret variable
- Use separate tokens for CI/CD
- Rotate tokens periodically
- Use different keystores for dev/prod

### ❌ Don't:
- Commit tokens to git
- Share tokens publicly
- Use personal tokens for CI

## 📚 Resources

- **Codemagic Docs:** https://docs.codemagic.io
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Expo Docs:** https://docs.expo.dev
- **Project EAS ID:** `af01253e-afef-4bb5-9ff4-9a407733cf46`

## 🎉 Next Steps

1. ✅ Setup EXPO_TOKEN
2. ✅ Run first build locally
3. ✅ Connect to Codemagic
4. ✅ Trigger first CI build
5. 🚀 Automate releases!

---

**Last Updated:** 2026-01-14  
**Maintainer:** Koya Score Team  
**Support:** huynhvikhang6a13@gmail.com
