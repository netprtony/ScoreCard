# 🚀 GitHub Actions CI/CD Guide

## 📋 Overview

This repository uses GitHub Actions to automate the build and release process for Koya Score v1.0.4.

## 🔧 Setup Requirements

### 1. Configure GitHub Secrets

You need to add the following secret to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `EXPO_TOKEN` | Expo authentication token | Run `npx eas login` then `npx eas whoami --json` to get your token, or generate one at https://expo.dev/accounts/[account]/settings/access-tokens |

### 2. EAS Configuration

Ensure you have:
- ✅ `eas.json` configured with production profile
- ✅ `app.json` with correct version (1.0.4)
- ✅ EAS project created and linked

## 📦 Available Workflows

### 1. Build Production Release (`build-production.yml`)

**Triggers:**
- Automatically when tag `v1.0.4` is pushed
- Manually via GitHub Actions UI

**What it does:**
- Builds Android production (AAB format for Google Play)
- Builds iOS production (Archive for App Store)
- Uses EAS Build service

**Manual Trigger:**
1. Go to **Actions** tab on GitHub
2. Select **Build Production Release v1.0.4**
3. Click **Run workflow**
4. Choose platform (all, android, or ios)
5. Click **Run workflow** button

### 2. Create Release (`create-release.yml`)

**Triggers:**
- Manually via GitHub Actions UI

**What it does:**
- Creates Git tag `v1.0.4`
- Creates GitHub Release with release notes
- Publishes release on GitHub

**Manual Trigger:**
1. Go to **Actions** tab on GitHub
2. Select **Create Release v1.0.4**
3. Click **Run workflow**
4. Click **Run workflow** button

## 🎯 Complete Release Process

Follow these steps to create a complete release:

### Step 1: Create GitHub Release
```bash
# Option A: Use GitHub Actions UI
1. Go to Actions → Create Release v1.0.4 → Run workflow

# Option B: Create tag manually
git tag -a v1.0.4 -m "Release version 1.0.4"
git push origin v1.0.4
```

### Step 2: Build Production Apps
The build will automatically start when you push the tag, or you can trigger manually:

```bash
# Go to Actions → Build Production Release v1.0.4 → Run workflow
# Select platform: all (or android/ios individually)
```

### Step 3: Monitor Build Progress
1. Check GitHub Actions tab for workflow status
2. Check EAS Dashboard: https://expo.dev
3. Wait for builds to complete (usually 10-30 minutes)

### Step 4: Download Builds
Once builds complete:
- **Android**: Download AAB from EAS dashboard
- **iOS**: Download Archive from EAS dashboard

### Step 5: Submit to Stores
- **Google Play**: Upload AAB via Google Play Console
- **App Store**: Upload Archive via App Store Connect

## 🔍 Build Profiles

### Production Profile (from `eas.json`)

**Android:**
- Build Type: `app-bundle` (AAB)
- Distribution: Store (Google Play)

**iOS:**
- Build Type: Archive
- Distribution: Store (App Store)

## 📱 App Information

- **App Name**: Koya Score
- **Version**: 1.0.4
- **iOS Bundle ID**: com.tienlen.scorecard
- **Android Package**: com.tienlen.scorecard
- **EAS Project ID**: af01253e-afef-4bb5-9ff4-9a407733cf46

## 🐛 Troubleshooting

### Build Fails with "Invalid Credentials"
- Check that `EXPO_TOKEN` secret is set correctly
- Regenerate token at https://expo.dev/accounts/[account]/settings/access-tokens
- Update the secret in GitHub repository settings

### Build Fails with "Project Not Found"
- Ensure you're logged into the correct Expo account
- Verify `extra.eas.projectId` in `app.json` matches your EAS project

### Build Stuck or Taking Too Long
- Check EAS dashboard for detailed build logs
- EAS builds typically take 10-30 minutes
- If stuck, cancel and retry the workflow

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Documentation](https://docs.expo.dev/)

## 🔗 Quick Links

- [EAS Dashboard](https://expo.dev)
- [GitHub Actions](../../actions)
- [Releases](../../releases)

---

**Note**: Make sure all secrets are properly configured before running workflows!
