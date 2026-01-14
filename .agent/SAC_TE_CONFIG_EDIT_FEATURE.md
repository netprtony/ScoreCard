# Chức năng Thay Đổi Cấu Hình Luật Chơi - Sắc Tê

## Tổng quan
Đã thêm chức năng cho phép người chơi thay đổi cấu hình luật chơi **trong khi đang chơi** ở màn hình nhập kết quả ván (SacTeRoundInputScreen).

## Vị trí
- **Màn hình:** `screens/SacTeRoundInputScreen.tsx`
- **Nút Settings:** Góc phải header (icon ⚙️)

## Các thông số có thể thay đổi

### 1. **Hệ số Gục** (heSoGuc)
- Điểm thưởng thêm khi người chơi bị gục
- Mặc định: 10
- Validation: Phải > 0

### 2. **Hệ số Tồn** (heSoTon)
- Điểm thưởng thêm khi người chơi có tồn
- Mặc định: 5
- Validation: Phải > 0

### 3. **Hệ số Tới Trắng** (whiteWinMultiplier)
- Hệ số nhân khi thắng tới trắng
- Mặc định: 2
- Validation: Phải > 0

### 4. **Cá Nước**
- **Bật/Tắt:** Switch toggle
- **Hệ số:** Điểm cá nước mỗi người
  - Mặc định: 5
  - Validation: Phải > 0 nếu enabled

### 5. **Cá Heo**
- **Bật/Tắt:** Switch toggle
- **Hệ số:** Điểm đóng góp mỗi ván
  - Mặc định: 5
  - Validation: Phải > 0 nếu enabled

## Cách sử dụng

### Bước 1: Mở Modal Cấu Hình
1. Trong màn hình nhập ván (SacTeRoundInputScreen)
2. Nhấn nút **⚙️ Settings** ở góc phải header
3. Modal "Cấu hình luật chơi" sẽ hiển thị

### Bước 2: Chỉnh sửa
1. **Thay đổi hệ số:** Nhập số mới vào ô input
2. **Bật/Tắt Cá Nước/Cá Heo:** Toggle switch
3. **Xem preview:** Các giá trị hiển thị real-time

### Bước 3: Lưu hoặc Hủy
- **Nút "Lưu":** Cập nhật cấu hình vào database
- **Nút "Hủy":** Đóng modal, không thay đổi
- **Nút X:** Đóng modal, không thay đổi

## Validation Rules

### Khi nhấn "Lưu", hệ thống kiểm tra:
1. ✅ Tất cả hệ số phải > 0
2. ✅ Nếu Cá Nước enabled → heSo phải > 0
3. ✅ Nếu Cá Heo enabled → heSo phải > 0

### Nếu validation fail:
- Hiển thị warning toast với thông báo lỗi cụ thể
- Không lưu thay đổi
- Modal vẫn mở để user sửa

## Luồng xử lý Backend

### 1. **Service Function:** `updateSacTeConfig()`
```typescript
// File: services/sacTeMatchService.ts
export const updateSacTeConfig = (matchId: string, newConfig: SacTeConfig): void => {
    // 1. Lấy config hiện tại từ database
    // 2. Preserve pot tracking data (_caHeoCurrentPot, _caHeoRoundsAccumulated)
    // 3. Update config_snapshot trong matches table
}
```

### 2. **Database Update**
- **Table:** `matches`
- **Column:** `config_snapshot` (JSON)
- **Preserved fields:**
  - `_caHeoCurrentPot`: Pot hiện tại của Cá Heo
  - `_caHeoRoundsAccumulated`: Số ván đã tích lũy

### 3. **Refresh Match**
- Sau khi update, gọi `refreshMatch()` để reload data
- UI tự động cập nhật với config mới

## Ảnh hưởng đến Game

### ✅ Ảnh hưởng NGAY LẬP TỨC:
- **Ván tiếp theo:** Sử dụng config mới
- **Tính điểm:** Dựa trên hệ số mới
- **UI:** Hiển thị/ẩn nút Cá Nước/Cá Heo theo config mới

### ❌ KHÔNG ảnh hưởng:
- **Các ván đã chơi:** Điểm cũ không thay đổi
- **Pot Cá Heo:** Giữ nguyên giá trị đã tích lũy
- **Total scores:** Không tính lại

## UI/UX Features

### Modal Design
- ✅ **Responsive:** Tự động điều chỉnh theo màn hình
- ✅ **Dark mode:** Tự động theo theme
- ✅ **Scrollable:** Có thể scroll nếu nội dung dài
- ✅ **Overlay:** Nền mờ 50% opacity
- ✅ **Animation:** Slide từ dưới lên

### Form Controls
- ✅ **TextInput:** Numeric keyboard cho số
- ✅ **Switch:** Toggle cho enable/disable
- ✅ **Conditional rendering:** Ẩn/hiện hệ số khi toggle

### Feedback
- ✅ **Success toast:** "Đã cập nhật cấu hình"
- ✅ **Warning toast:** Hiển thị lỗi validation cụ thể
- ✅ **Auto-close:** Modal đóng sau khi lưu thành công

## Testing Checklist

### ✅ Functional Tests
- [ ] Mở modal → hiển thị config hiện tại
- [ ] Thay đổi hệ số → preview đúng
- [ ] Toggle Cá Nước → ẩn/hiện hệ số
- [ ] Toggle Cá Heo → ẩn/hiện hệ số
- [ ] Lưu với giá trị hợp lệ → success
- [ ] Lưu với hệ số = 0 → warning
- [ ] Hủy → không thay đổi config
- [ ] Sau khi lưu → ván tiếp theo dùng config mới

### ✅ Edge Cases
- [ ] Thay đổi nhiều lần liên tục
- [ ] Tắt Cá Heo khi đang có pot tích lũy
- [ ] Thay đổi config giữa các ván
- [ ] Refresh match sau khi update

### ✅ UI Tests
- [ ] Modal hiển thị đúng trên nhiều màn hình
- [ ] Dark mode hoạt động
- [ ] Scroll trong modal
- [ ] Keyboard không che input

## Code Changes Summary

### Files Modified:
1. ✅ `screens/SacTeRoundInputScreen.tsx`
   - Added state: `showConfigModal`, `editedConfig`
   - Added handlers: `openConfigModal()`, `saveConfigChanges()`, `updateConfigField()`
   - Added UI: Settings button, Modal with form
   - Added styles: Modal styles

2. ✅ `services/sacTeMatchService.ts`
   - Added function: `updateSacTeConfig()`

### Files NOT Modified:
- ❌ Database schema (không cần migration)
- ❌ Scoring engine (dùng config từ match)
- ❌ Other screens

## Future Enhancements

### Có thể thêm:
1. **Preset configs:** Lưu các bộ config thường dùng
2. **Config history:** Xem lịch sử thay đổi config
3. **Undo/Redo:** Hoàn tác thay đổi
4. **Import/Export:** Chia sẻ config giữa các thiết bị
5. **Validation nâng cao:** Giới hạn min/max cho hệ số

---

## Troubleshooting

### Lỗi: "Không thể cập nhật cấu hình"
- **Nguyên nhân:** Database error
- **Giải pháp:** Kiểm tra console log, restart app

### Lỗi: "Tất cả hệ số phải lớn hơn 0"
- **Nguyên nhân:** Nhập hệ số = 0 hoặc âm
- **Giải pháp:** Nhập số dương

### Config không áp dụng cho ván tiếp theo
- **Nguyên nhân:** Chưa refresh match
- **Giải pháp:** Kiểm tra `refreshMatch()` được gọi sau `updateSacTeConfig()`

---

**Tác giả:** Antigravity AI  
**Ngày tạo:** 2026-01-14  
**Version:** 1.0
