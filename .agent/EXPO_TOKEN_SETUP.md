# 🔑 EXPO_TOKEN Setup - Quick Guide

## ❌ Current Error:
```
An Expo user account is required to proceed.
Either log in with eas login or set the EXPO_TOKEN environment variable
```

## ✅ Solution: Create and Add EXPO_TOKEN

### Step 1: Create EXPO_TOKEN

#### Option A: Via Web (Recommended)
1. **Login to Expo:**
   - Go to: https://expo.dev/login
   - Login with your account

2. **Create Access Token:**
   - Go to: https://expo.dev/accounts/[your-username]/settings/access-tokens
   - Click **"Create Token"**
   - Settings:
     - **Name:** `Codemagic CI/CD`
     - **Permissions:** ✅ **Read and write**
   - Click **"Create"**
   - **⚠️ COPY THE TOKEN NOW** (only shown once!)

#### Option B: Via CLI
```bash
# Login first
npx expo login

# Then create token via web interface
# (CLI doesn't support token creation directly)
```

### Step 2: Add to Codemagic

1. **Go to Codemagic:**
   - Login: https://codemagic.io/apps
   - Select project: **ScoreCard**

2. **Add Environment Variable:**
   - Click **"Settings"** (⚙️ icon)
   - Go to **"Environment variables"** tab
   - Click **"Add variable"**

3. **Configure Variable:**
   ```
   Variable name:  EXPO_TOKEN
   Variable value: [paste your token here]
   Group:          (leave empty or create "expo" group)
   ✅ Secure:      CHECK THIS BOX!
   ```

4. **Save:**
   - Click **"Add"**
   - Variable should appear in list with 🔒 icon

### Step 3: Verify Setup

1. **Check Variable:**
   - In Codemagic settings
   - Should see: `EXPO_TOKEN` with 🔒 icon
   - Value should be hidden (shows as `••••••••`)

2. **Trigger New Build:**
   ```bash
   # Make a small change
   git commit --allow-empty -m "Trigger build with EXPO_TOKEN"
   git push origin master
   ```

3. **Monitor Build:**
   - Go to Codemagic dashboard
   - Watch build logs
   - Should see: "Building Android app with Expo..." ✅

## 🎯 Expected Result

### Before (❌):
```
An Expo user account is required to proceed.
Error: build command failed.
```

### After (✅):
```
Building Android app with Expo...
✔ Logged in
› Compressing project files...
› Uploading to EAS Build...
› Build started...
```

## 🔐 Security Notes

### ✅ DO:
- Store token as **Secure** variable in Codemagic
- Use separate token for CI/CD (not your personal token)
- Name token clearly: "Codemagic CI/CD"
- Set expiration if possible

### ❌ DON'T:
- Commit token to git
- Share token publicly
- Use same token for multiple services
- Store in plain text

## 🐛 Troubleshooting

### Error: "Token expired"
**Solution:**
1. Create new token at expo.dev
2. Update in Codemagic environment variables
3. Trigger new build

### Error: "Invalid token"
**Solution:**
1. Check token was copied correctly (no extra spaces)
2. Verify token has "Read and write" permissions
3. Regenerate if needed

### Error: "Token not found in environment"
**Solution:**
1. Check variable name is exactly: `EXPO_TOKEN` (case-sensitive)
2. Verify it's marked as "Secure"
3. Check it's in correct workflow environment

### Build still fails after adding token
**Solution:**
1. Wait 1-2 minutes for Codemagic to sync
2. Trigger new build (don't re-run old build)
3. Check build logs for actual error

## 📱 Alternative: Local Builds (Temporary)

If you need builds immediately while setting up EXPO_TOKEN:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build locally
eas build --platform android --profile preview --local
```

## 🎓 Learn More

- **Expo Access Tokens:** https://docs.expo.dev/accounts/programmatic-access/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Codemagic Environment Variables:** https://docs.codemagic.io/yaml-basic-configuration/configuring-environment-variables/

## ✅ Checklist

Before triggering next build:

- [ ] Created EXPO_TOKEN at expo.dev
- [ ] Copied token (only shown once!)
- [ ] Added to Codemagic as environment variable
- [ ] Variable name is exactly: `EXPO_TOKEN`
- [ ] Marked as "Secure" ✅
- [ ] Saved changes
- [ ] Triggered new build (not re-run)

---

**Next:** Once EXPO_TOKEN is added, push any commit to trigger a new build!

```bash
git commit --allow-empty -m "Test build with EXPO_TOKEN"
git push origin master
```

**Expected build time:** 10-20 minutes for EAS Build

---

**Need Help?**
- Check Codemagic build logs
- Verify token at: https://expo.dev/accounts/[username]/settings/access-tokens
- Contact: huynhvikhang6a13@gmail.com
