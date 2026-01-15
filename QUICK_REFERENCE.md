# 🚀 Quick Reference - GitHub Actions v1.0.4

## ⚡ Quick Start (3 Steps)

### 1️⃣ Add Secret to GitHub
```
Settings → Secrets → Actions → New secret
Name: EXPO_TOKEN
Value: [your-expo-token]
```

### 2️⃣ Run Release Script
```powershell
.\release-v1.0.4.ps1
# Choose option 1
```

### 3️⃣ Monitor & Download
```
GitHub Actions: github.com/[repo]/actions
EAS Dashboard: expo.dev
```

## 📋 Commands Cheat Sheet

### Create & Push Tag
```bash
# Create tag
git tag -a v1.0.4 -m "Release v1.0.4"

# Push tag (triggers build)
git push origin v1.0.4

# Delete tag (if needed)
git tag -d v1.0.4
git push origin :refs/tags/v1.0.4
```

### Check Status
```bash
# View tags
git tag -l

# View recent commits
git log --oneline -5

# Check remote
git remote -v
```

### EAS Commands
```bash
# Login to Expo
npx eas login

# Check account
npx eas whoami

# Manual build (if needed)
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

## 🎯 Workflow Triggers

| Workflow | Trigger | Platform |
|----------|---------|----------|
| `build-production.yml` | Push tag `v1.0.4` | Android + iOS |
| `build-production.yml` | Manual (Actions UI) | Selectable |
| `create-release.yml` | Manual only | N/A |

## 📱 Build Outputs

| Platform | Format | Size | Target |
|----------|--------|------|--------|
| Android | AAB | ~20-50 MB | Google Play |
| iOS | Archive | ~30-60 MB | App Store |

## 🔗 Important URLs

```
GitHub Actions:
https://github.com/[username]/[repo]/actions

EAS Dashboard:
https://expo.dev

Expo Tokens:
https://expo.dev/accounts/[account]/settings/access-tokens

Google Play Console:
https://play.google.com/console

App Store Connect:
https://appstoreconnect.apple.com
```

## ⏱️ Timeline

```
0 min    → Push tag / Run workflow
1 min    → GitHub Actions starts
2 min    → Jobs running on runners
5 min    → EAS Build queued
10-30 min → Building...
30+ min  → Build complete
         → Download from EAS
         → Submit to stores
```

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Invalid credentials | Check `EXPO_TOKEN` secret |
| Build fails | Check EAS Dashboard logs |
| Tag exists | Delete and recreate tag |
| Workflow not running | Check GitHub Actions tab |
| Build stuck | Cancel and retry |

## 📞 Support Files

- **Vietnamese**: `HUONG_DAN_RELEASE.md`
- **English**: `.github/README.md`
- **Complete Guide**: `GITHUB_ACTIONS_SETUP_COMPLETE.md`
- **Summary**: `.github/SETUP_SUMMARY.md`

## 🎨 Project Info

```json
{
  "name": "Koya Score",
  "version": "1.0.4",
  "ios": "com.tienlen.scorecard",
  "android": "com.tienlen.scorecard",
  "projectId": "af01253e-afef-4bb5-9ff4-9a407733cf46"
}
```

---

**💡 Tip**: Bookmark this file for quick reference!
