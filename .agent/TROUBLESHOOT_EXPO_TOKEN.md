# 🔧 Troubleshooting: EXPO_TOKEN Not Found

## ❌ Problem
```
❌ ERROR: EXPO_TOKEN is not set!
Step 4 script `🔑 Verify EXPO_TOKEN` exited with status code 1
```

## 🔍 Root Cause
EXPO_TOKEN đã được add vào Codemagic nhưng **chưa được assign cho workflow**.

---

## ✅ Solution 1: Assign to Workflow (RECOMMENDED)

### Step 1: Check Current Setup
1. Go to Codemagic: https://codemagic.io/apps
2. Select **ScoreCard** project
3. Click **Settings** (⚙️)
4. Go to **Environment variables** tab
5. Verify `EXPO_TOKEN` exists with 🔒 icon

### Step 2: Assign to Workflow
1. Still in **Environment variables** tab
2. Find `EXPO_TOKEN` in the list
3. Look for **"Available for"** column
4. Click **"Edit"** or **"Configure"**
5. Make sure it's available for:
   - ✅ `android-workflow`
   - ✅ `ios-workflow`
   - ✅ `dev-build`
   - ✅ All workflows (recommended)

### Step 3: Save and Rebuild
1. Click **"Save"**
2. Go back to **Builds** tab
3. Click **"Start new build"**
4. Select workflow: `android-workflow`
5. Click **"Start build"**

---

## ✅ Solution 2: Use Global Variable

### Option A: Make it Global
1. In Codemagic UI
2. Environment variables tab
3. Edit `EXPO_TOKEN`
4. Check: **"Available for all workflows"** ✅
5. Save

### Option B: Add to Application Environment
1. Codemagic project settings
2. **Application environment variables** (not workflow-specific)
3. Add `EXPO_TOKEN` there
4. This makes it available globally

---

## ✅ Solution 3: Verify in Build Settings

### Check Build Configuration:
1. Go to specific build that failed
2. Click on build number
3. Look for **"Environment variables"** section
4. Should see:
   ```
   EXPO_TOKEN: ••••••••••••••••••
   PACKAGE_NAME: com.tienlen.scorecard
   NODE_VERSION: 20
   ```

### If EXPO_TOKEN is missing:
- It's not assigned to this workflow
- Use Solution 1 or 2 above

---

## ✅ Solution 4: Alternative - Use Group

### Create Environment Group:
1. Codemagic settings
2. **Environment variable groups** tab
3. Click **"Add group"**
4. Name: `expo`
5. Add variable:
   - Name: `EXPO_TOKEN`
   - Value: [your token]
   - Secure: ✅

### Update codemagic.yaml:
```yaml
environment:
  groups:
    - expo  # Reference the group
  vars:
    PACKAGE_NAME: "com.tienlen.scorecard"
    NODE_VERSION: "20"
```

### Commit and push:
```bash
git add codemagic.yaml
git commit -m "Use expo group for EXPO_TOKEN"
git push origin master
```

---

## 🧪 Quick Test

### Test if EXPO_TOKEN is accessible:

Add this temporary script to `codemagic.yaml`:

```yaml
scripts:
  - name: 🧪 Debug Environment
    script: |
      echo "=== Environment Variables ==="
      echo "EXPO_TOKEN length: ${#EXPO_TOKEN}"
      if [ -z "$EXPO_TOKEN" ]; then
        echo "❌ EXPO_TOKEN is NOT set"
      else
        echo "✅ EXPO_TOKEN is set (${#EXPO_TOKEN} characters)"
      fi
      echo "=== All env vars (filtered) ==="
      env | grep -i expo || echo "No EXPO vars found"
```

This will show you if the token is actually available in the build environment.

---

## 📊 Verification Checklist

Before next build:

- [ ] ✅ EXPO_TOKEN exists in Codemagic environment variables
- [ ] ✅ EXPO_TOKEN is marked as "Secure" (🔒)
- [ ] ✅ EXPO_TOKEN is assigned to workflow(s)
- [ ] ✅ OR EXPO_TOKEN is in a group that's referenced in yaml
- [ ] ✅ OR EXPO_TOKEN is global (available for all workflows)
- [ ] ✅ Committed latest codemagic.yaml changes
- [ ] ✅ Triggered NEW build (not re-run)

---

## 🎯 Expected Success Output

When fixed, you should see:

```
Step 4: 🔑 Verify EXPO_TOKEN
if [ -z "$EXPO_TOKEN" ]; then
✅ EXPO_TOKEN is set

Step 5: 🏗️ Build Android APK/AAB
Building Android app with Expo...
npm install -g eas-cli
✔ Logged in as [your-username]
```

---

## 🔍 Common Mistakes

### ❌ Mistake 1: Re-running old build
- **Problem:** Old builds don't pick up new env vars
- **Solution:** Start NEW build, don't re-run

### ❌ Mistake 2: Variable not assigned to workflow
- **Problem:** Added to Codemagic but not linked to workflow
- **Solution:** Check "Available for" settings

### ❌ Mistake 3: Typo in variable name
- **Problem:** Named it `EXPO-TOKEN` or `expo_token`
- **Solution:** Must be exactly `EXPO_TOKEN` (case-sensitive)

### ❌ Mistake 4: Token expired
- **Problem:** Expo tokens can expire
- **Solution:** Regenerate at expo.dev

---

## 🆘 Still Not Working?

### Debug Steps:

1. **Check Codemagic UI:**
   - Screenshot environment variables page
   - Verify EXPO_TOKEN is there

2. **Check Build Logs:**
   - Look for "Environment variables" section
   - See if EXPO_TOKEN is listed

3. **Test Locally:**
   ```bash
   export EXPO_TOKEN="your-token-here"
   eas build --platform android --profile preview
   ```
   If this works, problem is Codemagic config.

4. **Contact Support:**
   - Codemagic support: support@codemagic.io
   - Include: Build ID, screenshots, error logs

---

## 📝 Next Steps

1. **Try Solution 1** (Assign to workflow) - Most common fix
2. If that doesn't work, try **Solution 2** (Global variable)
3. If still failing, try **Solution 4** (Use group)
4. Add debug script to see actual environment

---

**Last Updated:** 2026-01-14 23:45  
**Status:** 🔴 Troubleshooting in progress  
**Priority:** HIGH - Blocking builds

---

## ✅ Success Criteria

Build passes when:
```
✅ EXPO_TOKEN is set
✔ Logged in
› Build started
```

**Then you're good! 🎉**
