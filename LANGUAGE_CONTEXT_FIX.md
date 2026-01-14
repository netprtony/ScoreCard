# Sửa lỗi Chuyển đổi Ngôn ngữ - Language Context

## Vấn đề
Khi người dùng chuyển đổi ngôn ngữ trong Settings, một số màn hình không tự động cập nhật ngôn ngữ mới, đặc biệt là:
- Tab Navigator (Players, Matches, History, Statistics, Settings)
- Các screen khác không re-render khi ngôn ngữ thay đổi

## Nguyên nhân
- Việc chỉ thay đổi `i18n.locale` không trigger re-render của React components
- Các component sử dụng `i18n.t()` trực tiếp không biết khi nào cần cập nhật

## Giải pháp
Tạo **LanguageContext** để quản lý state ngôn ngữ toàn cục và trigger re-render khi thay đổi.

## Các thay đổi đã thực hiện

### 1. **Tạo LanguageContext** (`contexts/LanguageContext.tsx`)
```typescript
- Tạo context quản lý ngôn ngữ
- Cung cấp hook `useLanguage()` với:
  - `language`: Ngôn ngữ hiện tại
  - `setLanguage(lang)`: Hàm thay đổi ngôn ngữ
  - `t(key)`: Hàm dịch (thay thế i18n.t())
- Tự động load ngôn ngữ từ settings khi khởi động
- Force re-render tất cả components khi ngôn ngữ thay đổi
```

### 2. **Cập nhật App.tsx**
```typescript
- Import LanguageProvider
- Wrap app với LanguageProvider (sau ThemeProvider, trước MatchProvider)
- Đảm bảo tất cả components con có thể access language context
```

### 3. **Cập nhật SettingsScreen.tsx**
```typescript
- Import và sử dụng useLanguage hook
- Thay thế i18n.locale = lang bằng setLanguage(lang)
- Thay thế tất cả i18n.t() bằng t()
- Sử dụng language state từ context thay vì settings.language
```

### 4. **Cập nhật AppNavigator.tsx**
```typescript
- Import useLanguage hook
- Sử dụng t() trong MainTabNavigator
- Thay thế tất cả i18n.t() bằng t() cho tab labels
- Tab labels giờ tự động cập nhật khi ngôn ngữ thay đổi
```

## Cách hoạt động

1. **Khởi động app**:
   - LanguageProvider load ngôn ngữ từ settings
   - Set i18n.locale
   - Cung cấp language state cho toàn bộ app

2. **Khi user chuyển đổi ngôn ngữ**:
   - User chọn ngôn ngữ trong Settings
   - Gọi `setLanguage(lang)` từ useLanguage hook
   - LanguageContext:
     - Cập nhật i18n.locale
     - Cập nhật language state
     - Lưu vào settings
     - **Force re-render** tất cả components đang dùng useLanguage
   - Tất cả components tự động hiển thị ngôn ngữ mới

3. **Components sử dụng ngôn ngữ**:
   - Thay vì: `import i18n from '../utils/i18n'` và `i18n.t('key')`
   - Dùng: `const { t } = useLanguage()` và `t('key')`
   - Component tự động re-render khi ngôn ngữ thay đổi

## Lợi ích

✅ **Tự động re-render**: Tất cả components cập nhật ngay lập tức
✅ **Centralized state**: Quản lý ngôn ngữ tập trung
✅ **Type-safe**: TypeScript support đầy đủ
✅ **Dễ sử dụng**: Chỉ cần `const { t } = useLanguage()`
✅ **Persistent**: Ngôn ngữ được lưu vào settings

## Migration Guide

Để cập nhật component hiện tại sang dùng LanguageContext:

### Trước:
```typescript
import i18n from '../utils/i18n';

const MyComponent = () => {
  return <Text>{i18n.t('hello')}</Text>;
};
```

### Sau:
```typescript
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();
  return <Text>{t('hello')}</Text>;
};
```

## Testing

1. Mở app
2. Vào Settings → Language
3. Chuyển từ Tiếng Việt sang English
4. Kiểm tra:
   - ✅ Tab labels (Players, Matches, History, Statistics, Settings) đổi ngay
   - ✅ Settings screen text đổi ngay
   - ✅ Tất cả screens khác đổi khi navigate
   - ✅ Ngôn ngữ được lưu (reload app vẫn giữ nguyên)

## Lưu ý

- Tất cả screens mới nên dùng `useLanguage()` thay vì import `i18n` trực tiếp
- LanguageProvider phải được wrap bên trong ThemeProvider (vì cần access theme)
- LanguageProvider phải wrap bên ngoài các components cần dùng ngôn ngữ
