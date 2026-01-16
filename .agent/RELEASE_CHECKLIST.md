# ✅ Release Checklist v1.0.4

## 📅 Release Date: _______________

---

## Phase 1: Preparation ⚙️

### Code & Configuration
- [ ] All code changes committed
- [ ] Version updated to 1.0.4 in `app.json` ✅ (Already done)
- [ ] `eas.json` production profile configured ✅ (Already done)
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Code reviewed

### GitHub Setup
- [ ] GitHub Actions workflows committed ✅ (Already done)
- [ ] Workflows pushed to repository
- [ ] `EXPO_TOKEN` secret added to GitHub
  - [ ] Token generated from expo.dev
  - [ ] Token added to Settings → Secrets → Actions
  - [ ] Token tested and working

### Documentation
- [ ] Release notes prepared
- [ ] Changelog updated
- [ ] README updated if needed

---

## Phase 2: Build Process 🏗️

### Trigger Build
- [ ] Method chosen:
  - [ ] Option A: PowerShell script (`.\release-v1.0.4.ps1`)
  - [ ] Option B: GitHub Actions UI
  - [ ] Option C: Git tag command
- [ ] Tag v1.0.4 created
- [ ] Tag pushed to remote
- [ ] GitHub Actions workflow triggered

### Monitor Build
- [ ] GitHub Actions workflow started
- [ ] Android build job running
- [ ] iOS build job running
- [ ] EAS builds queued
- [ ] No errors in GitHub Actions logs

### Build Completion
- [ ] Android build completed successfully
  - Build ID: _______________
  - Build time: _______________
  - Build size: _______________
- [ ] iOS build completed successfully
  - Build ID: _______________
  - Build time: _______________
  - Build size: _______________

---

## Phase 3: Testing 🧪

### Download Builds
- [ ] Android AAB downloaded from EAS
  - File location: _______________
- [ ] iOS Archive downloaded from EAS
  - File location: _______________

### Android Testing
- [ ] AAB file integrity checked
- [ ] Test installation on device
- [ ] App launches successfully
- [ ] Core features working
- [ ] No crashes
- [ ] Performance acceptable

### iOS Testing
- [ ] Archive file integrity checked
- [ ] Test installation on device
- [ ] App launches successfully
- [ ] Core features working
- [ ] No crashes
- [ ] Performance acceptable

---

## Phase 4: Store Submission 📤

### Google Play Store (Android)
- [ ] Login to Google Play Console
- [ ] Navigate to app dashboard
- [ ] Create new release (Production)
- [ ] Upload AAB file
- [ ] Fill release notes
- [ ] Add screenshots (if needed)
- [ ] Review and submit
- [ ] Submission status: _______________

### Apple App Store (iOS)
- [ ] Login to App Store Connect
- [ ] Navigate to app dashboard
- [ ] Create new version (1.0.4)
- [ ] Upload Archive via Xcode/Transporter
- [ ] Fill release notes
- [ ] Add screenshots (if needed)
- [ ] Submit for review
- [ ] Submission status: _______________

---

## Phase 5: Post-Release 🎉

### Verification
- [ ] Android app live on Google Play
  - Live date: _______________
  - Store URL: _______________
- [ ] iOS app live on App Store
  - Live date: _______________
  - Store URL: _______________

### Communication
- [ ] Team notified
- [ ] Users notified (if applicable)
- [ ] Social media announcement (if applicable)
- [ ] Release notes published

### Monitoring
- [ ] Monitor crash reports (first 24h)
- [ ] Monitor user reviews
- [ ] Monitor analytics
- [ ] Check for critical issues

### Documentation
- [ ] Update project documentation
- [ ] Archive build artifacts
- [ ] Update version tracking
- [ ] Create GitHub release
  - [ ] Release created
  - [ ] Release notes added
  - [ ] Assets attached

---

## Issues & Notes 📝

### Build Issues
```
Date: _______________
Issue: _______________
Resolution: _______________
```

### Testing Issues
```
Date: _______________
Issue: _______________
Resolution: _______________
```

### Submission Issues
```
Date: _______________
Issue: _______________
Resolution: _______________
```

---

## Sign-Off ✍️

### Build Engineer
- Name: _______________
- Date: _______________
- Signature: _______________

### QA Lead
- Name: _______________
- Date: _______________
- Signature: _______________

### Release Manager
- Name: _______________
- Date: _______________
- Signature: _______________

---

## Quick Reference 🔗

- **GitHub Actions**: https://github.com/[repo]/actions
- **EAS Dashboard**: https://expo.dev
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com

---

## Status Summary

**Overall Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed | ⬜ Issues

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________

---

**Version**: 1.0.4  
**Created**: 2026-01-15  
**Last Updated**: _______________
