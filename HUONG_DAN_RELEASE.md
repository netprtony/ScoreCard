# 🚀 Hướng Dẫn Build Release v1.0.4

## 📋 Tổng Quan

Dự án đã được cấu hình GitHub Actions để tự động build production cho phiên bản 1.0.4.

## ⚙️ Chuẩn Bị

### 1. Cấu Hình GitHub Secrets

Bạn cần thêm secret sau vào GitHub repository:

1. Vào repository trên GitHub
2. Chọn **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Thêm secret:

**Tên**: `EXPO_TOKEN`  
**Giá trị**: Token từ Expo (lấy tại https://expo.dev/accounts/[account]/settings/access-tokens)

### 2. Kiểm Tra Cấu Hình

✅ File `app.json` đã có version 1.0.4  
✅ File `eas.json` đã có production profile  
✅ EAS project đã được tạo và liên kết  

## 🎯 Cách Sử Dụng

### Phương Án 1: Sử Dụng Script PowerShell (Khuyến Nghị)

```powershell
# Chạy script helper
.\release-v1.0.4.ps1
```

Script sẽ hỏi bạn muốn làm gì:
1. Tạo và push tag v1.0.4 (tự động trigger build)
2. Push tag đã có
3. Xóa tag v1.0.4
4. Xem danh sách tags
5. Thoát

### Phương Án 2: Thủ Công Qua GitHub UI

#### Bước 1: Tạo Release
1. Vào tab **Actions** trên GitHub
2. Chọn workflow **Create Release v1.0.4**
3. Click **Run workflow**
4. Click nút **Run workflow** màu xanh

#### Bước 2: Build Production
1. Vào tab **Actions** trên GitHub
2. Chọn workflow **Build Production Release v1.0.4**
3. Click **Run workflow**
4. Chọn platform:
   - `all`: Build cả Android và iOS
   - `android`: Chỉ build Android
   - `ios`: Chỉ build iOS
5. Click nút **Run workflow** màu xanh

### Phương Án 3: Sử Dụng Git Commands

```bash
# Tạo tag
git tag -a v1.0.4 -m "Release version 1.0.4"

# Push tag (sẽ tự động trigger build)
git push origin v1.0.4
```

## 📱 Theo Dõi Quá Trình Build

### 1. Trên GitHub
- Vào tab **Actions** để xem workflow đang chạy
- Click vào workflow để xem chi tiết

### 2. Trên EAS Dashboard
- Truy cập: https://expo.dev
- Vào project **KoyaScore**
- Xem tab **Builds**

## 📦 Sau Khi Build Xong

### Android (AAB)
1. Vào EAS Dashboard
2. Download file AAB
3. Upload lên Google Play Console

### iOS (Archive)
1. Vào EAS Dashboard
2. Download file Archive
3. Upload lên App Store Connect

## 🔍 Thông Tin Build

### Android
- **Format**: AAB (App Bundle)
- **Package**: com.tienlen.scorecard
- **Dùng cho**: Google Play Store

### iOS
- **Format**: Archive
- **Bundle ID**: com.tienlen.scorecard
- **Dùng cho**: App Store

## ❓ Xử Lý Lỗi

### Lỗi "Invalid Credentials"
- Kiểm tra `EXPO_TOKEN` trong GitHub Secrets
- Tạo token mới tại: https://expo.dev/accounts/[account]/settings/access-tokens
- Cập nhật lại secret

### Lỗi "Project Not Found"
- Kiểm tra đã login đúng Expo account
- Xác nhận `projectId` trong `app.json` đúng

### Build Bị Treo
- Kiểm tra logs trên EAS Dashboard
- Thời gian build thường: 10-30 phút
- Nếu quá lâu, hủy và chạy lại

## 📚 Tài Liệu Tham Khảo

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hướng dẫn chi tiết](.github/README.md)

## 🎉 Quy Trình Hoàn Chỉnh

1. **Chuẩn bị**: Đảm bảo code đã commit và push
2. **Tạo tag**: Chạy `.\release-v1.0.4.ps1` hoặc tạo tag thủ công
3. **Đợi build**: Theo dõi trên GitHub Actions và EAS
4. **Download**: Lấy file build từ EAS Dashboard
5. **Submit**: Upload lên Store tương ứng

---

**Lưu ý**: Đảm bảo đã cấu hình `EXPO_TOKEN` secret trước khi chạy!
