# Tóm tắt Thay đổi - Hỗ trợ Đa ngôn ngữ cho Tất cả Screens

## Các thay đổi đã thực hiện

### 1. **Cập nhật file i18n** (`utils/i18n.ts`)
   - Thêm các key dịch mới cho:
     - **SplashScreen**: `splashTagline`, `appName`
     - **WelcomeScreen**: `welcomeTitle`, `quickScoring`, `lightAds`, `noDataCollection`, `yourPrivacy`, `privacyRespect`, `localDataOnly`, `localStorageInfo`, `wifiAdInfo`, `continue`, `getStarted`
     - **TermsPrivacyScreen**: `termsAndPrivacy`, `termsOfService`, `viewTerms`, `viewPrivacy`, `acceptTerms`, `mustAcceptTerms`, `termsContent1`, `termsPoint1-4`, `privacyContent1`, `privacyPoint1-4`
     - **RoundDetailsScreen**: `roundDetails`, `round`, `totalScoreChange`, `actions`, `noActions`, `scoreBreakdown`, `editRound`, `deleteRound`, `confirmDeleteRound`, `roundDeleted`, `roundUpdated`, `first`, `second`, `third`, `fourth`
   - Tất cả các key đều có bản dịch tiếng Việt và tiếng Anh

### 2. **Cập nhật SplashScreen** (`screens/SplashScreen.tsx`)
   - Import `i18n`
   - Thay thế text cứng bằng `i18n.t()`:
     - Tên app: `i18n.t('appName')`
     - Tagline: `i18n.t('splashTagline')`

### 3. **Cập nhật WelcomeScreen** (`screens/WelcomeScreen.tsx`)
   - Import `i18n`
   - Thay thế tất cả text tiếng Việt bằng `i18n.t()`:
     - Tiêu đề chào mừng
     - Các tính năng (Tính điểm nhanh, Có quảng cáo nhẹ, Không thu thập dữ liệu)
     - Thông tin quyền riêng tư
     - Nút "Tiếp tục" và "Bắt đầu"

### 4. **Cập nhật TermsPrivacyScreen** (`screens/TermsPrivacyScreen.tsx`)
   - Import `i18n`
   - Thay thế các phần tử UI bằng `i18n.t()`:
     - Tiêu đề trang
     - Checkbox labels
     - Thông báo cảnh báo
     - Nút "Đồng ý & Tiếp tục"
   - **Lưu ý**: Nội dung chính sách pháp lý (legal text) vẫn giữ nguyên bằng tiếng Anh

### 5. **Cập nhật RoundDetailsScreen** (`screens/RoundDetailsScreen.tsx`)
   - Import `i18n`
   - Thay thế tất cả text bằng `i18n.t()`:
     - Tiêu đề header
     - Tên các section (Hành động, Kết quả, Điểm số)
     - Labels hạng (Nhất, Nhì, Ba, Bét/Tư)
     - Alert messages (xóa, lưu, cảnh báo)
     - Nút "Lưu Thay Đổi"
     - Hint text "Nhấn để xem chi tiết"

## Các Screen đã hỗ trợ đa ngôn ngữ

✅ **SplashScreen** - Hoàn thành
✅ **WelcomeScreen** - Hoàn thành  
✅ **TermsPrivacyScreen** - Hoàn thành (UI elements)
✅ **RoundDetailsScreen** - Hoàn thành
✅ **PlayerListScreen** - Đã có sẵn từ trước
✅ **GameSelectionScreen** - Đã có sẵn từ trước
✅ **PlayerSelectionScreen** - Đã có sẵn từ trước
✅ **ConfigSetupScreen** - Đã có sẵn từ trước
✅ **ActiveMatchScreen** - Đã có sẵn từ trước
✅ **RoundInputScreen** - Đã có sẵn từ trước
✅ **MatchHistoryScreen** - Đã có sẵn từ trước
✅ **StatisticsScreen** - Đã có sẵn từ trước
✅ **SettingsScreen** - Đã có sẵn từ trước

## Cách sử dụng

### Chuyển đổi ngôn ngữ
Người dùng có thể chuyển đổi ngôn ngữ trong **SettingsScreen**. Hệ thống i18n đã được cấu hình với:
- Ngôn ngữ mặc định: Tiếng Việt (`vi`)
- Ngôn ngữ hỗ trợ: Tiếng Việt (`vi`), Tiếng Anh (`en`)
- Fallback: Bật (nếu không tìm thấy key sẽ dùng ngôn ngữ mặc định)

### Thêm ngôn ngữ mới
Để thêm ngôn ngữ mới, cập nhật file `utils/i18n.ts`:

```typescript
const translations = {
  vi: { ... },
  en: { ... },
  // Thêm ngôn ngữ mới
  ja: {
    appName: 'Koya Score',
    splashTagline: '素早く - 公平 - オフライン',
    // ... các key khác
  }
};
```

### Sử dụng trong code
```typescript
import i18n from '../utils/i18n';

// Sử dụng trong component
<Text>{i18n.t('appName')}</Text>
<Text>{i18n.t('welcomeTitle')}</Text>

// Chuyển đổi ngôn ngữ
import { setLocale, toggleLocale } from '../utils/i18n';

setLocale('en'); // Chuyển sang tiếng Anh
toggleLocale(); // Chuyển đổi giữa vi và en
```

## Lợi ích

1. **Mở rộng thị trường**: App có thể tiếp cận người dùng quốc tế
2. **Dễ bảo trì**: Tất cả text được quản lý tập trung trong file i18n
3. **Nhất quán**: Đảm bảo thuật ngữ được sử dụng nhất quán trong toàn app
4. **Dễ thêm ngôn ngữ**: Chỉ cần thêm object mới vào file translations

## Testing

Sau khi khởi động lại app:
1. Mở **SettingsScreen**
2. Chọn ngôn ngữ (Language)
3. Chuyển đổi giữa Tiếng Việt và English
4. Kiểm tra tất cả các screen để đảm bảo text hiển thị đúng

## Ghi chú

- Nội dung chính sách pháp lý trong TermsPrivacyScreen vẫn giữ nguyên bằng tiếng Anh vì đây là văn bản pháp lý chính thức
- Một số screen đã có sẵn hỗ trợ i18n từ trước nên không cần cập nhật
- Font Roboto Slab đã được áp dụng cho toàn bộ app, hỗ trợ tốt cho cả tiếng Việt và tiếng Anh
