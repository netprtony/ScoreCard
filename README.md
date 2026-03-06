# Koya Score — Ứng dụng tính điểm bài

Ứng dụng tính điểm offline đa trò chơi (Tiến Lên, Sắc Tê, ...) dành cho mobile, được xây dựng bằng **Expo + React Native + TypeScript**.

---

## Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Tính năng](#tính-năng)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Cài đặt và chạy](#cài-đặt-và-chạy)
5. [Logic tính điểm Tiến Lên](#logic-tính-điểm-tiến-lên)
6. [Logic tính điểm Sắc Tê](#logic-tính-điểm-sắc-tê)
7. [Data Models](#data-models)
8. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
9. [Tính năng nổi bật](#tính-năng-nổi-bật)
10. [Build & Release](#build--release)
11. [License](#license)

---

## Giới thiệu

**Koya Score** là ứng dụng tính điểm bài hoạt động hoàn toàn offline, thiết kế cho nhóm bạn chơi bài tại nhà. Hỗ trợ nhiều loại game với cấu hình điểm số linh hoạt, giao diện Glass UI hiện đại, và đầy đủ tính năng quản lý trận đấu.

- **Tên ứng dụng:** Koya Score
- **Phiên bản:** 1.0.5
- **Bundle ID:** `com.tienlen.scorecard`
- **Nền tảng:** Android & iOS

---

## Tính năng

### ✅ Quản lý người chơi
- Thêm, sửa, xóa người chơi
- Avatar tuỳ chỉnh (chọn ảnh từ thư viện)
- Màu sắc riêng cho từng người chơi
- Lưu trữ cục bộ bằng SQLite

### ✅ Trò chơi hỗ trợ
- **Tiến Lên** — tính điểm đầy đủ theo các luật Việt Nam
- **Sắc Tê** — tính điểm theo luật Cá Nước & Cá Heo

### ✅ Hệ thống tính điểm (Tiến Lên)
- Điểm cơ bản theo hệ số 1 & 2
- Luật Tới trắng (vô hiệu tất cả luật phụ)
- Luật Giết (nhân hệ số điểm cơ bản, cộng riêng điểm phạt)
- Luật phạt: Heo đen, Heo đỏ, 3 tép, 3 đôi thông, Tứ quý
- Luật Chặt heo & Chồng heo (dây chuyền)
- Luật Đút 3 tép
- Tất cả hệ số có thể tuỳ chỉnh; bật/tắt từng luật riêng biệt

### ✅ Hệ thống tính điểm (Sắc Tê)
- Cá Nước (main pot) và Cá Heo (side pot tích lũy)
- Trạng thái người chơi: thắng, gục, tồn
- White Win (thắng trắng) với hệ số nhân
- Tích lũy Cá Heo qua nhiều ván

### ✅ Quản lý trận đấu
- Tạo trận mới, chọn game type và người chơi
- Nhập kết quả từng ván (round)
- Xem chi tiết từng ván
- Kết thúc hoặc tiếp tục trận
- Lịch sử tất cả các trận đã chơi

### ✅ Thống kê
- Tổng điểm, số trận, số thắng, số lần giết theo từng người chơi

### ✅ Đồng hồ đếm ngược (trong trận)
- Bật/tắt bất kỳ lúc nào
- Thời gian tuỳ chọn (1–30 phút)
- Tạm dừng / Tiếp tục / Đặt lại
- Âm thanh khi hết giờ

### ✅ Cài đặt & giao diện
- Chuyển đổi giao diện Sáng / Tối / Hệ thống
- Đa ngôn ngữ: Tiếng Việt & English
- Hình nền tuỳ chỉnh (thư viện wallpaper Dark & Light)
- Giữ màn hình sáng
- Glass UI với BlurView (iOS) và fallback (Android)

### ✅ Onboarding
- Màn hình Splash với logo animation
- Màn hình Welcome giới thiệu ứng dụng
- Điều khoản & Chính sách quyền riêng tư

---

## Cấu trúc dự án

```
ScoreCard/
├── App.tsx                        # Entry point, khởi tạo providers & database
├── index.ts                       # Expo entry
├── app.json                       # Cấu hình Expo (tên app, icon, bundle ID, ...)
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── babel.config.js                # Babel config
├── metro.config.js                # Metro bundler config
├── eas.json                       # EAS Build config
├── codemagic.yaml                 # Codemagic CI/CD config
│
├── assets/                        # Tài nguyên tĩnh
│   ├── fonts/                     # Font RobotoSlab (nhiều weight)
│   ├── wallpaper/
│   │   ├── Dark/                  # Hình nền dark mode
│   │   └── Light/                 # Hình nền light mode
│   ├── mainLogoApp.png            # Icon ứng dụng
│   ├── Splash.png                 # Màn hình splash
│   ├── adaptive-icon.png          # Android adaptive icon
│   ├── timer-sound.mp3            # Âm thanh đồng hồ
│   └── ...
│
├── components/                    # UI components tái sử dụng
│   ├── Card.tsx                   # Card container
│   ├── CountdownTimer.tsx         # Đồng hồ đếm ngược
│   ├── GlassContainer.tsx         # Glass effect container
│   ├── ScoreDisplay.tsx           # Hiển thị điểm số
│   ├── ScoreTable.tsx             # Bảng điểm tổng hợp
│   ├── WallpaperBackground.tsx    # Background wallpaper
│   └── rn-ui/                     # UI component primitives
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Dialog.tsx
│       ├── Input.tsx
│       ├── Separator.tsx
│       ├── Switch.tsx
│       ├── index.ts
│       └── utils.ts
│
├── constants/                     # Hằng số toàn cục
│   ├── designSystem.ts            # Design tokens (spacing, radius, ...)
│   ├── fonts.ts                   # Font family constants
│   ├── theme.ts                   # Light & Dark theme colors
│   ├── typography.ts              # Text styles
│   └── index.ts
│
├── contexts/                      # React Context providers
│   ├── ThemeContext.tsx            # Theme (light/dark/system)
│   ├── LanguageContext.tsx         # Đa ngôn ngữ
│   ├── MatchContext.tsx            # Trạng thái trận đấu hiện tại
│   ├── WallpaperContext.tsx        # Hình nền ứng dụng
│   └── NavigationContext.tsx       # Điều khiển tab bar & gesture
│
├── navigation/
│   └── AppNavigator.tsx            # Root navigator (Stack + Bottom Tabs)
│
├── screens/                       # Màn hình chính
│   ├── SplashScreen.tsx            # Splash / loading
│   ├── WelcomeScreen.tsx           # Onboarding welcome
│   ├── TermsPrivacyScreen.tsx      # Điều khoản & quyền riêng tư
│   ├── PlayerListScreen.tsx        # Danh sách người chơi
│   ├── GameSelectionScreen.tsx     # Chọn loại game
│   ├── PlayerSelectionScreen.tsx   # Chọn người chơi cho trận
│   ├── ConfigSetupScreen.tsx       # Thiết lập cấu hình điểm (Tiến Lên)
│   ├── ActiveMatchScreen.tsx       # Màn hình trận đang chơi
│   ├── RoundInputScreen.tsx        # Nhập kết quả ván (Tiến Lên)
│   ├── RoundDetailsScreen.tsx      # Chi tiết một ván đã chơi
│   ├── SacTeConfigSetupScreen.tsx  # Thiết lập cấu hình (Sắc Tê)
│   ├── SacTeRoundInputScreen.tsx   # Nhập kết quả ván (Sắc Tê)
│   ├── MatchHistoryScreen.tsx      # Lịch sử các trận
│   ├── StatisticsScreen.tsx        # Thống kê người chơi
│   └── SettingsScreen.tsx          # Cài đặt ứng dụng
│
├── services/                      # Business logic & database
│   ├── database.ts                 # Khởi tạo & kết nối SQLite
│   ├── databaseUtils.ts            # Tiện ích database
│   ├── playerService.ts            # CRUD người chơi
│   ├── matchService.ts             # CRUD trận đấu (Tiến Lên)
│   ├── roundService.ts             # CRUD ván đấu
│   ├── configService.ts            # Quản lý cấu hình điểm
│   ├── gameTypeService.ts          # Quản lý loại game
│   ├── sacTeMatchService.ts        # CRUD trận đấu (Sắc Tê)
│   ├── sacTeConfigService.ts       # Quản lý cấu hình (Sắc Tê)
│   ├── statsService.ts             # Tính thống kê người chơi
│   └── settingsService.ts          # Lưu/đọc cài đặt ứng dụng
│
├── types/                         # TypeScript interfaces & types
│   ├── models.ts                   # Tất cả data models
│   └── navigation.ts               # Navigation param types
│
└── utils/                         # Tiện ích
    ├── scoringEngine.ts            # Engine tính điểm Tiến Lên
    ├── sacTeScoringEngine.ts       # Engine tính điểm Sắc Tê
    ├── actionFormatter.ts          # Format hiển thị hành động
    ├── i18n.ts                     # Đa ngôn ngữ (vi/en)
    └── toast.ts                    # Thông báo toast
```

---

## Cài đặt và chạy

### Yêu cầu

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI | SDK 54 |
| Android Studio | (cho Android emulator) |
| Xcode | 15+ (chỉ macOS, cho iOS) |

### Cài đặt dependencies

```bash
npm install
```

### Chạy ứng dụng

```bash
# Khởi động Expo Dev Server (scan QR bằng Expo Go)
npm start

# Build & chạy trên Android emulator / thiết bị
npm run android

# Build & chạy trên iOS simulator (chỉ macOS)
npm run ios

# Chạy trên trình duyệt web
npm run web
```

---

## Logic tính điểm Tiến Lên

### 1. Điểm cơ bản

- 1st vs 4th: `±baseRatioFirst`
- 2nd vs 3rd: `±baseRatioSecond`
- `baseRatioFirst` phải lớn hơn `baseRatioSecond`

**Ví dụ** (hệ số 4:2):
```
A (1st) → +4,  D (4th) → -4
B (2nd) → +2,  C (3rd) → -2
```

### 2. Tới trắng

```
Người thắng nhận: baseRatioFirst × toiTrangMultiplier
Tất cả người còn lại: −(số điểm đó)
Tất cả luật phụ bị vô hiệu
```

### 3. Luật Giết

```
Điểm cơ bản của người bị giết × killMultiplier
+ Điểm phạt (KHÔNG nhân hệ số)
→ Người giết nhận toàn bộ
```

### 4. Luật phạt (Thối)

| Loại | Mô tả |
|---|---|
| Heo đen | `penaltyHeoDen` điểm |
| Heo đỏ | `penaltyHeoDo` điểm (> heo đen) |
| 3 tép | `penaltyBaTep` điểm |
| 3 đôi thông | `penaltyBaDoiThong` điểm |
| Tứ quý | `penaltyTuQuy` điểm |

- Mặc định: điểm phạt về người thứ 3
- Nếu bị giết: điểm phạt về người giết

### 5. Chặt heo & Chồng heo

- Hỗ trợ dây chuyền (chain): A chặt B → B chặt C → C mất tổng điểm toàn dây
- Chồng heo: số lần chồng nhân vào tổng điểm

### 6. Đút 3 tép

- Người bị phạt mất `dutBaTep` điểm
- Người thứ nhất nhận điểm đó

---

## Logic tính điểm Sắc Tê

### Cơ bản

- Người chơi: 2–5 người
- Mỗi ván: chỉ có 1 người thắng

### Cá Nước (main pot)

- Mỗi người góp `caNuoc.heSo` điểm/ván
- Người thắng nhận toàn bộ

### Cá Heo (side pot tích lũy)

- Mỗi người góp `caHeo.heSo` điểm/ván
- Nếu không ai thắng Cá Heo → tích lũy sang ván tiếp
- Người thắng Cá Heo nhận toàn bộ tích lũy

### Trạng thái người chơi

| Trạng thái | Ý nghĩa | Điểm phạt |
|---|---|---|
| Thắng | Xếp 1st | +điểm tổng |
| Gục | Thua nặng | `−heSoGuc` |
| Tồn | Thua bình thường | `−heSoTon` |

### White Win (Thắng trắng)

```
Điểm thắng × whiteWinMultiplier
```

---

## Data Models

### Player

```typescript
interface Player {
  id: string;
  name: string;
  color?: string;        // Màu avatar (hex)
  avatar?: string;       // Đường dẫn ảnh local
  createdAt: number;
}
```

### ScoringConfig (Tiến Lên)

```typescript
interface ScoringConfig {
  id: string;
  name: string;
  baseRatioFirst: number;       // Hệ số 1
  baseRatioSecond: number;      // Hệ số 2
  toiTrangMultiplier: number;   // Hệ số tới trắng
  killMultiplier: number;       // Hệ số giết
  penaltyHeoDen: number;
  penaltyHeoDo: number;
  penaltyBaTep: number;
  penaltyBaDoiThong: number;
  penaltyTuQuy: number;
  chatHeoBlack: number;
  chatHeoRed: number;
  dutBaTep: number;
  enableToiTrang: boolean;
  enableKill: boolean;
  enablePenalties: boolean;
  enableChatHeo: boolean;
  enableDutBaTep: boolean;
  isDefault: boolean;
  createdAt: number;
}
```

### Match (Tiến Lên)

```typescript
interface Match {
  id: string;
  gameType: string;                           // "tien_len"
  playerIds: string[];                        // 4 người chơi
  playerNames: string[];                      // Snapshot tên
  configSnapshot: ScoringConfig;
  rounds: Round[];
  totalScores: { [playerId: string]: number };
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  completedAt?: number;
}
```

### Round (một ván Tiến Lên)

```typescript
interface Round {
  id: string;
  matchId: string;
  roundNumber: number;
  rankings: { playerId: string; rank: 1 | 2 | 3 | 4 }[];
  toiTrangWinner?: string;
  actions: PlayerAction[];
  roundScores: { [playerId: string]: number };
  createdAt: number;
}
```

### SacTeConfig

```typescript
interface SacTeConfig {
  id: string;
  name: string;
  caNuoc: { enabled: boolean; heSo: number };
  caHeo: { enabled: boolean; heSo: number };
  heSoGuc: number;
  heSoTon: number;
  whiteWinMultiplier: number;
  minPlayers: number;
  maxPlayers: number;
  isDefault: boolean;
  createdAt: number;
}
```

### AppSettings

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  keepScreenAwake: boolean;
  backgroundImage?: string;
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
}
```

---

## Công nghệ sử dụng

| Thư viện | Mục đích |
|---|---|
| Expo SDK 54 | Framework mobile cross-platform |
| React Native 0.81 | UI framework |
| TypeScript 5.9 | Type safety |
| React Navigation 7 | Bottom Tabs + Native Stack |
| expo-sqlite 16 | Database cục bộ |
| React Context | State management |
| i18n-js 4 | Đa ngôn ngữ (vi/en) |
| expo-blur | Glass UI effect (iOS) |
| expo-linear-gradient | Gradient backgrounds |
| expo-audio | Âm thanh đồng hồ |
| expo-image-picker | Chọn avatar từ thư viện |
| expo-keep-awake | Giữ màn hình sáng |
| react-native-reanimated | Animations |
| react-native-flash-message | Toast notifications |
| @expo/vector-icons | Ionicons |
| RobotoSlab | Font chữ |

---

## Tính năng nổi bật

### 🔌 Offline-first
Toàn bộ dữ liệu lưu cục bộ (SQLite). Không cần internet. Dữ liệu người dùng được bảo mật trên thiết bị.

### 🎨 Glass UI
Tab bar và các container sử dụng BlurView (iOS) với fallback gradient cho Android. Hỗ trợ Dark / Light mode và hình nền wallpaper tuỳ chỉnh.

### 🔧 Tùy chỉnh cao
Mọi hệ số điểm đều có thể thay đổi. Bật/tắt từng luật riêng. Hỗ trợ lưu nhiều bộ cấu hình (preset).

### ⚙️ Scoring Engine thuần
Logic tính điểm được tách biệt khỏi UI dưới dạng pure functions, dễ kiểm tra và mở rộng.

### 🌍 Đa ngôn ngữ
Tiếng Việt và English, có thể mở rộng thêm ngôn ngữ khác.

---

## Build & Release

Dự án sử dụng **EAS Build** (Expo Application Services) và **Codemagic** để build production.

```bash
# Build APK / AAB cho Android (EAS)
eas build --platform android

# Build IPA cho iOS (EAS)
eas build --platform ios
```

GitHub Actions workflows được cấu hình tại `.github/workflows/`:
- `build-production.yml` — Build production tự động
- `create-release.yml` — Tạo GitHub Release

---

## License

MIT

---

## Liên hệ

Phát triển bởi: **Antigravity AI**  
Phiên bản: **1.0.5**  
Bundle ID: `com.tienlen.scorecard`
