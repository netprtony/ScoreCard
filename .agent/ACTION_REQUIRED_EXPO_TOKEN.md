# 🚨 URGENT: Fix EXPO_TOKEN Access Issue

## Current Status: ❌ EXPO_TOKEN Added but Not Accessible

### Problem:
- ✅ EXPO_TOKEN đã được add vào Codemagic
- ❌ Nhưng workflow không thể access được
- ❌ Build vẫn fail với error: "EXPO_TOKEN is not set"

---

## 🎯 Quick Fix (Choose ONE solution)

### ✅ Solution 1: Make EXPO_TOKEN Global (FASTEST - 1 minute)

**In Codemagic UI:**

1. **Go to Settings:**
   - https://codemagic.io/apps
   - Select: ScoreCard
   - Click: Settings ⚙️

2. **Edit EXPO_TOKEN:**
   - Tab: "Environment variables"
   - Find: `EXPO_TOKEN` (with 🔒)
   - Click: "Edit" or the pencil icon

3. **Make it Global:**
   - Look for: "Available for workflows" or "Scope"
   - Select: **"All workflows"** or **"Global"**
   - OR check: ✅ **"Available for all workflows"**

4. **Save:**
   - Click "Save" or "Update"
   - Should see confirmation

5. **Trigger Build:**
   ```bash
   # Push current changes
   git add .
   git commit -m "Fix EXPO_TOKEN access in workflows"
   git push origin master
   ```

---

### ✅ Solution 2: Assign to Specific Workflows (2 minutes)

**In Codemagic UI:**

1. **Edit EXPO_TOKEN:**
   - Settings → Environment variables
   - Edit `EXPO_TOKEN`

2. **Select Workflows:**
   - Check these workflows:
     - ✅ `android-workflow`
     - ✅ `ios-workflow`
     - ✅ `dev-build`
     - ✅ `qa-workflow`

3. **Save and Build:**
   - Save changes
   - Start new build

---

### ✅ Solution 3: Use Environment Group (3 minutes)

**Step 1: Create Group in Codemagic**
1. Settings → "Environment variable groups"
2. Click "Add group"
3. Name: `expo`
4. Add variable:
   - Name: `EXPO_TOKEN`
   - Value: [your token]
   - Secure: ✅

**Step 2: Update codemagic.yaml**
```yaml
environment:
  groups:
    - expo  # Add this line
  vars:
    PACKAGE_NAME: "com.tienlen.scorecard"
    NODE_VERSION: "20"
```

**Step 3: Commit and Push**
```bash
git add codemagic.yaml
git commit -m "Use expo group for EXPO_TOKEN"
git push origin master
```

---

## 📋 What I Already Fixed

✅ **Updated codemagic.yaml:**
- Removed commented `groups:` section
- Cleaned up environment configuration
- Added helpful comments

✅ **Created Documentation:**
- `.agent/TROUBLESHOOT_EXPO_TOKEN.md` - Full troubleshooting guide
- This file - Quick action guide

---

## 🔍 How to Verify It's Working

### Check in Codemagic UI:

1. **Before starting build:**
   - Go to: Settings → Environment variables
   - Find: `EXPO_TOKEN`
   - Should show: "Available for: All workflows" or specific workflows

2. **During build:**
   - Watch build logs
   - Should see:
     ```
     Step 4: 🔑 Verify EXPO_TOKEN
     ✅ EXPO_TOKEN is set
     ```

3. **If still failing:**
   - Check build logs for "Environment variables" section
   - EXPO_TOKEN should be listed (value hidden as ••••)

---

## 🎯 Recommended Action

**I recommend Solution 1 (Make it Global)** because:
- ✅ Fastest (1 minute)
- ✅ Works for all workflows
- ✅ No code changes needed
- ✅ Easy to verify

### Steps:
1. Open Codemagic UI
2. Edit EXPO_TOKEN
3. Make it "Global" or "Available for all workflows"
4. Save
5. Push this commit:
   ```bash
   git add .
   git commit -m "Update codemagic.yaml and add troubleshooting docs"
   git push origin master
   ```

---

## 📊 Expected Timeline

| Step | Time | Action |
|------|------|--------|
| 1. Make EXPO_TOKEN global | 1 min | In Codemagic UI |
| 2. Commit changes | 1 min | Git push |
| 3. Wait for build | 2-3 min | Auto-triggered |
| 4. Verify success | 1 min | Check logs |
| **Total** | **5-6 min** | **To working build** |

---

## ✅ Success Indicators

### You'll know it's fixed when:

1. **Build logs show:**
   ```
   🔑 Verify EXPO_TOKEN
   ✅ EXPO_TOKEN is set
   
   🏗️ Build Android APK/AAB
   ✔ Logged in as [your-username]
   ```

2. **No more errors about:**
   - "EXPO_TOKEN is not set"
   - "An Expo user account is required"

3. **Build progresses to:**
   - "Compressing project files..."
   - "Uploading to EAS Build..."

---

## 🆘 If Still Not Working

### Try this debug script:

Add to `codemagic.yaml` temporarily:

```yaml
scripts:
  - name: 🐛 Debug EXPO_TOKEN
    script: |
      echo "Checking EXPO_TOKEN..."
      if [ -z "$EXPO_TOKEN" ]; then
        echo "❌ NOT SET"
        echo "Available env vars:"
        env | grep -i token || echo "No token vars"
      else
        echo "✅ SET (${#EXPO_TOKEN} chars)"
      fi
```

This will tell you exactly what's available in the build environment.

---

## 📞 Need Help?

**Check these files:**
- `.agent/TROUBLESHOOT_EXPO_TOKEN.md` - Detailed troubleshooting
- `.agent/EXPO_TOKEN_SETUP.md` - Initial setup guide
- `.agent/CODEMAGIC_SETUP_GUIDE.md` - Full CI/CD guide

**Contact:**
- Email: huynhvikhang6a13@gmail.com
- Codemagic Support: support@codemagic.io

---

## 🎯 Next Action

**RIGHT NOW:**
1. Go to Codemagic UI
2. Make EXPO_TOKEN global (Solution 1)
3. Push this commit
4. Watch build succeed! 🎉

---

**Updated:** 2026-01-14 23:45  
**Priority:** 🔴 URGENT  
**Blocking:** All CI/CD builds  
**ETA to fix:** 5-6 minutes
