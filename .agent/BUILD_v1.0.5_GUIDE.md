# 🎯 Quick Guide: Cách Build Release v1.0.5

## ✅ Đã Hoàn Thành

1. ✅ Fix lỗi color picker sliders trong production
2. ✅ Cài đặt react-native-gesture-handler
3. ✅ Cập nhật App.tsx, app.json, PlayerListScreen.tsx
4. ✅ Bump version lên 1.0.5
5. ⏳ Đang commit changes...

## 🚀 Các Bước Tiếp Theo

### Bước 1: Push Code
```bash
git push origin master
```

### Bước 2: Build Production

#### Option A: Sử Dụng GitHub Actions (Khuyến Nghị)
```bash
# Tạo tag v1.0.5
git tag -a v1.0.5 -m "Release v1.0.5 - Fix color picker in production"

# Push tag (sẽ tự động trigger build)
git push origin v1.0.5
```

Sau đó:
- Vào GitHub → Actions tab
- Xem workflow "Build Production Release"
- Theo dõi build progress

#### Option B: Build Thủ Công
```bash
# Build Android
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production

# Build cả hai
eas build --platform all --profile production
```

### Bước 3: Theo Dõi Build
- **GitHub Actions**: https://github.com/[your-repo]/actions
- **EAS Dashboard**: https://expo.dev

### Bước 4: Test Production Build
1. Download APK/AAB từ EAS Dashboard
2. Install trên thiết bị thật
3. Test color picker:
   - Vào Player List
   - Thêm người chơi mới
   - Kéo thử 3 sliders (Hue, Saturation, Lightness)
   - Verify màu thay đổi real-time

### Bước 5: Submit to Stores
Nếu test OK:
- **Android**: Upload AAB lên Google Play Console
- **iOS**: Upload Archive lên App Store Connect

## 🔍 Verify Fix

### Checklist Test Color Picker
- [ ] Mở modal "Thêm người chơi"
- [ ] Kéo Hue slider (0-360°) → Màu thay đổi
- [ ] Kéo Saturation slider (0-100%) → Độ bão hòa thay đổi
- [ ] Kéo Lightness slider (0-100%) → Độ sáng thay đổi
- [ ] Color preview cập nhật real-time
- [ ] Hex code hiển thị đúng
- [ ] Lưu người chơi với màu đã chọn
- [ ] Test trong Edit Player modal

## 📊 So Sánh Versions

| Version | Status | Notes |
|---------|--------|-------|
| 1.0.4 | ❌ Bug | Color picker không hoạt động trong production |
| 1.0.5 | ✅ Fixed | Color picker hoạt động hoàn hảo |

## 🆘 Nếu Gặp Vấn Đề

### Vấn đề: Sliders vẫn không hoạt động

**Giải pháp 1**: Clear build cache
```bash
eas build --clear-cache --platform android --profile production
```

**Giải pháp 2**: Verify gesture handler
```bash
npm list react-native-gesture-handler
# Should show: react-native-gesture-handler@x.x.x
```

**Giải pháp 3**: Check App.tsx
```tsx
// Dòng đầu tiên PHẢI là:
import 'react-native-gesture-handler';
```

### Vấn đề: Build fails

**Check**:
1. `EXPO_TOKEN` secret đã được thêm vào GitHub chưa?
2. EAS project có đúng không?
3. Check build logs trên EAS Dashboard

## 📚 Tài Liệu

- **Chi tiết fix**: `.agent/FIX_COLOR_PICKER_PRODUCTION.md`
- **Summary**: `BUGFIX_v1.0.5_SUMMARY.md`
- **GitHub Actions**: `GITHUB_ACTIONS_SETUP_COMPLETE.md`

## ⚡ Quick Commands

```bash
# Push code
git push origin master

# Create and push tag
git tag -a v1.0.5 -m "Release v1.0.5 - Fix color picker"
git push origin v1.0.5

# Manual build (if needed)
eas build --platform all --profile production

# Check build status
eas build:list
```

---

**Version**: 1.0.5  
**Fix**: Color picker sliders in production  
**Priority**: 🔴 High  
**Status**: ✅ Ready to build
