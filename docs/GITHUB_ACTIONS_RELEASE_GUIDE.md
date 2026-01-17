# GitHub Actions Release Guide

Hướng dẫn chi tiết cách sử dụng GitHub Actions để build và release phiên bản mới của Koya Score.

## 📋 Tổng quan Workflows

| Workflow | File | Mục đích |
|----------|------|----------|
| Build Production | `build-production.yml` | Build APK/AAB cho Android và Archive cho iOS |
| Create Release | `create-release.yml` | Tạo GitHub Release với tag và release notes |

---

## 🔧 Yêu cầu trước khi release

### 1. Cấu hình Secrets

Vào **Settings > Secrets and variables > Actions** và thêm:

| Secret | Mô tả | Cách lấy |
|--------|-------|----------|
| `EXPO_TOKEN` | Token để authenticate với EAS | Vào https://expo.dev/settings/access-tokens |

### 2. Cập nhật version trong `app.json`

```json
{
  "expo": {
    "version": "1.0.5"
  }
}
```

### 3. Commit và push tất cả thay đổi

```bash
git add .
git commit -m "chore: prepare v1.0.5 release"
git push origin main
```

---

## 🚀 Cách release phiên bản mới

### Step 1: Tạo GitHub Release

1. Vào **Actions** tab trên GitHub
2. Chọn **"Create Release v1.0.5"** workflow
3. Click **"Run workflow"**
4. Chọn branch `main`
5. Click **"Run workflow"** (nút xanh)

Workflow này sẽ:
- ✅ Tạo git tag `v1.0.5`
- ✅ Tạo GitHub Release với release notes
- ✅ Push tag lên remote

### Step 2: Build Production

Sau khi tạo release, workflow **"Build Production Release v1.0.5"** sẽ tự động chạy khi phát hiện tag `v1.0.5`.

Hoặc chạy thủ công:
1. Vào **Actions** tab
2. Chọn **"Build Production Release v1.0.5"**
3. Click **"Run workflow"**
4. Chọn platform: `all`, `android`, hoặc `ios`
5. Click **"Run workflow"**

### Step 3: Kiểm tra build trên EAS

1. Vào https://expo.dev
2. Login với tài khoản Expo
3. Chọn project **KoyaScore**
4. Xem **Builds** section
5. Download APK/AAB khi build hoàn tất

---

## 📱 Output Files

### Android
- **AAB (App Bundle)**: Upload lên Google Play Console
- Path: Download từ EAS Dashboard

### iOS
- **Archive**: Upload lên App Store Connect
- Path: Download từ EAS Dashboard

---

## 🔄 Cập nhật cho phiên bản tiếp theo

### 1. Cập nhật version number

Thay đổi `version` trong các file:

```javascript
// app.json
"version": "1.0.6"
```

### 2. Cập nhật workflow files

Thay đổi version trong hai file:

**`.github/workflows/build-production.yml`:**
```yaml
name: Build Production Release v1.0.6

on:
  push:
    tags:
      - 'v1.0.6'
```

**`.github/workflows/create-release.yml`:**
```yaml
name: Create Release v1.0.6

# Update version in release notes...
```

### 3. Cập nhật release notes

Trong `create-release.yml`, cập nhật nội dung release notes với các tính năng mới.

---

## ⚠️ Troubleshooting

### Build failed: EXPO_TOKEN not found
- Kiểm tra secret `EXPO_TOKEN` đã được thêm
- Verify token vẫn còn hiệu lực

### Tag already exists
- Đã có tag với version này
- Xóa tag cũ: `git tag -d v1.0.5 && git push origin :refs/tags/v1.0.5`

### Build queued but not starting
- EAS build queue có thể đầy
- Chờ hoặc upgrade EAS plan

---

## 📊 Release Checklist

Sử dụng checklist này trước mỗi release:

- [ ] Tất cả features đã hoàn thành và test
- [ ] Version trong `app.json` đã cập nhật
- [ ] Workflow files đã cập nhật version number
- [ ] Release notes đã cập nhật trong `create-release.yml`
- [ ] Tất cả thay đổi đã commit và push
- [ ] Chạy "Create Release" workflow
- [ ] Verify GitHub Release đã được tạo
- [ ] Chạy hoặc verify "Build Production" workflow đã bắt đầu
- [ ] Kiểm tra build status trên EAS Dashboard
- [ ] Download và test final build

---

## 🔗 Links

- [GitHub Actions](https://github.com/YOUR_USERNAME/ScoreCard/actions)
- [EAS Dashboard](https://expo.dev)
- [Expo Access Tokens](https://expo.dev/settings/access-tokens)
