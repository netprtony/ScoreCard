# Tiến Lên Score Tracking App

Ứng dụng tính điểm offline cho game bài Tiến Lên, được xây dựng bằng Expo + React Native + TypeScript.

## Tính năng

### ✅ Đã hoàn thành

#### 1. Quản lý người chơi
- ✅ Thêm, sửa, xóa người chơi
- ✅ Lưu trữ cục bộ (SQLite)
- ✅ Giới hạn 2-10 người chơi
- ✅ Giao diện trực quan với avatar

#### 2. Hệ thống tính điểm
- ✅ Tính điểm cơ bản (hệ số 1 vs hệ số 2)
- ✅ Luật Tới trắng (người thắng nhận điểm × hệ số, tất cả người khác bị trừ)
- ✅ Luật Giết (nhân hệ số cho điểm cơ bản, cộng riêng điểm phạt)
- ✅ Các luật phạt: Heo đen, Heo đỏ, 3 tép, 3 đôi thông, Tứ quý
- ✅ Luật Chặt heo và Chồng heo
- ✅ Luật Đút 3 tép
- ✅ Tất cả hệ số có thể tùy chỉnh
- ✅ Bật/tắt từng luật riêng biệt

#### 3. Cài đặt
- ✅ Chuyển đổi giao diện (Sáng/Tối/Hệ thống)
- ✅ Đa ngôn ngữ (Tiếng Việt/English)
- ✅ Giữ màn hình sáng
- ✅ Giới thiệu ứng dụng
- ✅ Chính sách quyền riêng tư

#### 4. Đồng hồ đếm ngược
- ✅ Bật/tắt bất kỳ lúc nào
- ✅ Chọn thời gian (1, 2, 3, 5, 10, 15, 30 phút)
- ✅ Tạm dừng/Tiếp tục
- ✅ Đặt lại
- ✅ Âm thanh khi hết giờ

### 🚧 Đang phát triển

- [ ] Màn hình tạo trận đấu mới
- [ ] Chọn 4 người chơi từ danh sách
- [ ] Nhập kết quả trận đấu
- [ ] Chức năng Restart match (lưu lịch sử, tạo trận mới)
- [ ] Chức năng End match (kết thúc và lưu)
- [ ] Lịch sử trận đấu
- [ ] Thống kê người chơi
- [ ] Chọn hình nền

## Cấu trúc dự án

```
ScoreCard/
├── components/          # Các component tái sử dụng
│   ├── CountdownTimer.tsx
│   ├── PlayerCard.tsx
│   └── ScoreDisplay.tsx
├── constants/          # Hằng số và theme
│   └── theme.ts
├── contexts/           # React Context
│   └── ThemeContext.tsx
├── navigation/         # Cấu hình navigation
│   └── AppNavigator.tsx
├── screens/            # Các màn hình chính
│   ├── PlayerListScreen.tsx
│   ├── NewMatchScreen.tsx
│   ├── MatchHistoryScreen.tsx
│   ├── StatisticsScreen.tsx
│   └── SettingsScreen.tsx
├── services/           # Business logic và database
│   ├── database.ts
│   ├── playerService.ts
│   ├── matchService.ts
│   ├── configService.ts
│   ├── statsService.ts
│   └── settingsService.ts
├── types/              # TypeScript interfaces
│   └── models.ts
├── utils/              # Utilities
│   ├── scoringEngine.ts
│   └── i18n.ts
└── App.tsx             # Entry point
```

## Cài đặt và chạy

### Yêu cầu
- Node.js 18+
- npm hoặc yarn
- Android Studio (cho Android emulator) hoặc thiết bị Android

### Cài đặt dependencies

```bash
npm install
```

### Chạy ứng dụng

```bash
# Chạy trên Android
npm run android

# Chạy trên iOS (chỉ trên macOS)
npm run ios

# Chạy trên web
npm run web

# Chạy Expo Dev Server
npm start
```

## Logic tính điểm Tiến Lên

### 1. Tính điểm cơ bản

- Người thứ nhất lấy điểm từ người thứ tư (hệ số 1)
- Người thứ hai lấy điểm từ người thứ ba (hệ số 2)
- Hệ số 1 phải lớn hơn hệ số 2

**Ví dụ:** Hệ số 4:2
- A (1st) vs D (4th): A = +4, D = -4
- B (2nd) vs C (3rd): B = +2, C = -2

### 2. Tới trắng

Khi người chơi thắng bằng Tới trắng:
- Người thắng nhận: `hệ số 1 × hệ số tới trắng`
- TẤT CẢ người khác bị trừ cùng số điểm đó
- Tất cả luật phạt khác BỊ VÔ HIỆU HÓA

**Ví dụ:** Hệ số 4:2, hệ số tới trắng ×2
- A thắng tới trắng: A = +8
- B, C, D đều bị trừ: B = -8, C = -8, D = -8

### 3. Luật Giết

Khi người chơi bị giết:
- Điểm cơ bản × hệ số giết (×2, ×3, ...)
- Điểm phạt (thối) được CỘNG RIÊNG, KHÔNG nhân hệ số
- Người giết nhận tất cả điểm mất của người bị giết

**Ví dụ:** Hệ số 4:2, hệ số giết ×2, phạt heo đen 5 điểm
- D bị A giết, có 1 heo đen
- Điểm cơ bản D: -4 × 2 = -8
- Phạt heo đen: -5
- Tổng D: -8 - 5 = -13
- A nhận: +4 (cơ bản) + 8 (giết) + 5 (phạt) = +17

### 4. Luật phạt (Thối)

Các loại phạt:
- Heo đen
- Heo đỏ (phải > heo đen)
- 3 tép
- 3 đôi thông
- Tứ quý

Quy tắc:
- Người bị phạt mất điểm
- Mặc định: điểm phạt về người thứ 3
- Đặc biệt: nếu bị giết, điểm phạt về người giết

### 5. Chặt heo

- Heo đen và heo đỏ có giá trị khác nhau
- Hỗ trợ chồng heo (hệ số nhân)
- Người bị chặt mất điểm, người chặt nhận điểm

### 6. Đút 3 tép

- Người bị phạt mất điểm
- Người thứ nhất nhận điểm

## Data Models

### Player
```typescript
interface Player {
  id: string;
  name: string;
  createdAt: number;
}
```

### ScoringConfig
```typescript
interface ScoringConfig {
  id: string;
  name: string;
  baseRatioFirst: number;      // Hệ số 1
  baseRatioSecond: number;     // Hệ số 2
  toiTrangMultiplier: number;  // Hệ số tới trắng
  killMultiplier: number;      // Hệ số giết
  
  // Giá trị phạt
  penaltyHeoDen: number;
  penaltyHeoDo: number;
  penaltyBaTep: number;
  penaltyBaDoiThong: number;
  penaltyTuQuy: number;
  
  // Chặt heo
  chatHeoBlack: number;
  chatHeoRed: number;
  chongHeoMultiplier: number;
  
  // Đút 3 tép
  dutBaTep: number;
  
  // Bật/tắt luật
  enableToiTrang: boolean;
  enableKill: boolean;
  enablePenalties: boolean;
  enableChatHeo: boolean;
  enableDutBaTep: boolean;
}
```

### Match
```typescript
interface Match {
  id: string;
  playerResults: MatchPlayerResult[];
  configSnapshot: ScoringConfig;
  createdAt: number;
  duration?: number;
}
```

## Công nghệ sử dụng

- **Framework:** Expo SDK 54
- **Language:** TypeScript
- **UI:** React Native
- **Navigation:** React Navigation (Bottom Tabs)
- **Database:** SQLite (expo-sqlite)
- **State Management:** React Context
- **Internationalization:** i18n-js
- **Icons:** @expo/vector-icons

## Tính năng nổi bật

### 1. Offline-first
- Tất cả dữ liệu lưu trữ cục bộ
- Không cần kết nối internet
- Bảo mật dữ liệu người dùng

### 2. Tùy chỉnh cao
- Tất cả hệ số có thể thay đổi
- Bật/tắt từng luật riêng
- Hỗ trợ nhiều cấu hình

### 3. Giao diện thân thiện
- Hỗ trợ Dark/Light mode
- Đa ngôn ngữ
- Thiết kế đơn giản, dễ sử dụng

### 4. Scoring Engine
- Pure functions, dễ test
- Logic tách biệt khỏi UI
- Hỗ trợ tất cả luật Tiến Lên

## Phát triển tiếp

### Ưu tiên cao
1. Hoàn thiện màn hình tạo trận đấu
2. Nhập kết quả và tính điểm tự động
3. Lịch sử trận đấu chi tiết
4. Thống kê người chơi

### Ưu tiên trung bình
5. Export/Import dữ liệu
6. Backup và restore
7. Chọn hình nền tùy chỉnh
8. Âm thanh và hiệu ứng

### Tính năng mở rộng
9. Chia sẻ kết quả
10. Biểu đồ thống kê
11. Xếp hạng người chơi
12. Lịch sử đối đầu

## License

MIT

## Liên hệ

Phát triển bởi: Antigravity AI
Phiên bản: 1.0.0
