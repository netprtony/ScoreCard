# Hướng dẫn Cập nhật Các Screens Còn lại

## Screens đã cập nhật ✅
1. ✅ **SplashScreen** - Đã dùng useLanguage
2. ✅ **WelcomeScreen** - Đã dùng useLanguage  
3. ✅ **TermsPrivacyScreen** - Đã dùng useLanguage
4. ✅ **RoundDetailsScreen** - Đã dùng useLanguage
5. ✅ **PlayerListScreen** - Đã dùng useLanguage (từ trước)
6. ✅ **SettingsScreen** - Đã dùng useLanguage
7. ✅ **StatisticsScreen** - Đã dùng useLanguage
8. ✅ **AppNavigator** - Đã dùng useLanguage

## Screens cần cập nhật 🔄

### 1. GameSelectionScreen.tsx
**Text cần dịch:**
- Line 89: "Chọn Trò Chơi" → `t('selectGame')`
- Line 92: "Chọn loại game bạn muốn chơi" → `t('selectGameType')`
- Line 78: "Sắp ra mắt" → `t('comingSoon')`

**Cập nhật:**
```typescript
// Import
import { useLanguage } from '../contexts/LanguageContext';

// Trong component
const { t } = useLanguage();

// Thay thế text
<Text>{t('selectGame')}</Text>
<Text>{t('selectGameType')}</Text>
<Text>{t('comingSoon')}</Text>
```

### 2. PlayerSelectionScreen.tsx
**Text cần dịch:**
- "Chọn người chơi cho trận đấu" → `t('selectPlayersForMatch')`
- "Đã chọn" → `t('selectedPlayers')`
- "Chưa có người chơi nào" → `t('noPlayersAvailable')`
- "Thêm người chơi trong tab Người chơi trước" → `t('addPlayersFirst')`

### 3. ActiveMatchScreen.tsx
**Text cần dịch:**
- "Ván" → `t('round')`
- "Thêm ván" → `t('addRound')`
- "Xem chi tiết" → `t('viewDetails')`
- "Chưa có ván nào" → `t('noRoundsYet')`
- "Nhấn + để bắt đầu ván đầu tiên" → `t('startFirstRound')`

### 4. MatchHistoryScreen.tsx
**Text cần dịch:**
- "Chưa có lịch sử trận đấu" → `t('noMatchHistory')`
- "Chơi một vài trận để xem lịch sử" → `t('playMatchesToSeeHistory')`
- "ván" → `t('rounds')`

### 5. ConfigSetupScreen.tsx
Đã sử dụng i18n.t() - chỉ cần thay bằng useLanguage

### 6. RoundInputScreen.tsx
Đã sử dụng i18n.t() - chỉ cần thay bằng useLanguage

## Mẫu cập nhật chuẩn

```typescript
// 1. Import useLanguage
import { useLanguage } from '../contexts/LanguageContext';

// 2. Xóa import i18n (nếu có)
// import i18n from '../utils/i18n'; // XÓA DÒNG NÀY

// 3. Trong component, thêm hook
const { t } = useLanguage();

// 4. Thay thế tất cả
// i18n.t('key') → t('key')
// "Text cứng" → t('translationKey')
```

## Translation Keys đã thêm

### Vietnamese (vi)
```typescript
selectGame: 'Chọn Trò Chơi',
selectGameType: 'Chọn loại game bạn muốn chơi',
comingSoon: 'Sắp ra mắt',
selectPlayersForMatch: 'Chọn người chơi cho trận đấu',
selectedPlayers: 'Đã chọn',
noPlayersAvailable: 'Chưa có người chơi nào',
addPlayersFirst: 'Thêm người chơi trong tab Người chơi trước',
addRound: 'Thêm ván',
viewDetails: 'Xem chi tiết',
noRoundsYet: 'Chưa có ván nào',
startFirstRound: 'Nhấn + để bắt đầu ván đầu tiên',
noMatchHistory: 'Chưa có lịch sử trận đấu',
playMatchesToSeeHistory: 'Chơi một vài trận để xem lịch sử',
rounds: 'ván',
```

### English (en) - CẦN THÊM
Cần thêm bản dịch tiếng Anh cho các keys trên vào section English trong file i18n.ts

## Lưu ý quan trọng

1. **Không duplicate keys**: Key `round` đã tồn tại trong RoundDetailsScreen section
2. **Thứ tự import**: useLanguage phải được import sau useTheme
3. **Destructure t**: Luôn dùng `const { t } = useLanguage()` để code ngắn gọn
4. **Xóa i18n import**: Sau khi chuyển sang useLanguage, xóa `import i18n`

## Kiểm tra sau khi cập nhật

1. Chuyển đổi ngôn ngữ trong Settings
2. Navigate qua tất cả screens
3. Kiểm tra text có đổi ngôn ngữ không
4. Kiểm tra console không có lỗi
