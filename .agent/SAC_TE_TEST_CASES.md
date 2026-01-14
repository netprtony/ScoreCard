# Test Cases - Sắc Tê Game

## Test Suite Overview
Bộ test cases này kiểm tra toàn bộ flow của game Sắc Tê từ setup đến kết thúc match.

---

## 1. GAME SELECTION & PLAYER SELECTION

### TC-ST-001: Chọn game Sắc Tê
**Mục đích:** Verify user có thể chọn game Sắc Tê từ game selection screen

**Preconditions:**
- App đã được mở
- Có ít nhất 2 players trong database

**Steps:**
1. Navigate to "Matches" tab
2. Tap "Bắt đầu trận mới"
3. Chọn game "Sắc Tê"

**Expected Results:**
- Navigate đến PlayerSelectionScreen
- Hiển thị text "Chọn 2-5 người chơi"
- Game type được set là 'sac_te'

---

### TC-ST-002: Chọn 2 người chơi (minimum)
**Mục đích:** Verify có thể tạo match với 2 người chơi

**Steps:**
1. Từ PlayerSelectionScreen (game = Sắc Tê)
2. Chọn 2 người chơi
3. Tap nút "Next" (arrow forward)

**Expected Results:**
- Navigate đến SacTeConfigSetupScreen
- Hiển thị "2 người chơi" trong header
- Config form hiển thị đầy đủ

---

### TC-ST-003: Chọn 5 người chơi (maximum)
**Mục đích:** Verify có thể tạo match với 5 người chơi

**Steps:**
1. Từ PlayerSelectionScreen (game = Sắc Tê)
2. Chọn 5 người chơi
3. Tap nút "Next"

**Expected Results:**
- Navigate đến SacTeConfigSetupScreen
- Hiển thị "5 người chơi" trong header
- Không cho phép chọn thêm người chơi thứ 6

---

### TC-ST-004: Chọn 1 người chơi (invalid)
**Mục đích:** Verify không thể tạo match với 1 người chơi

**Steps:**
1. Từ PlayerSelectionScreen (game = Sắc Tê)
2. Chọn 1 người chơi
3. Tap nút "Next"

**Expected Results:**
- Hiển thị warning toast: "Vui lòng chọn 2-5 người chơi"
- Không navigate
- Next button disabled

---

### TC-ST-005: Chọn 6 người chơi (invalid)
**Mục đích:** Verify không thể chọn quá 5 người chơi

**Steps:**
1. Từ PlayerSelectionScreen (game = Sắc Tê)
2. Chọn 5 người chơi
3. Thử chọn người chơi thứ 6

**Expected Results:**
- Hiển thị warning toast: "Chỉ được chọn tối đa 5 người chơi"
- Người chơi thứ 6 không được chọn

---

## 2. CONFIG SETUP

### TC-ST-006: Load default config
**Mục đích:** Verify config mặc định được load đúng

**Steps:**
1. Navigate đến SacTeConfigSetupScreen với 3 players

**Expected Results:**
- Hệ số Gục: 10
- Hệ số Tồn: 5
- Hệ số Tới Trắng: 2
- Cá Nước: enabled, hệ số 5
- Cá Heo: enabled, hệ số 5

---

### TC-ST-007: Thay đổi hệ số Gục
**Mục đích:** Verify có thể thay đổi hệ số Gục

**Steps:**
1. Từ SacTeConfigSetupScreen
2. Tap vào input "Hệ số Gục"
3. Nhập "15"
4. Tap "Bắt đầu trận đấu"

**Expected Results:**
- Giá trị được update thành 15
- Match được tạo với heSoGuc = 15

---

### TC-ST-008: Hệ số Gục = 0 (invalid)
**Mục đích:** Verify không thể set hệ số Gục = 0

**Steps:**
1. Từ SacTeConfigSetupScreen
2. Set "Hệ số Gục" = 0
3. Tap "Bắt đầu trận đấu"

**Expected Results:**
- Hiển thị warning: "Hệ số phải lớn hơn 0"
- Không tạo match

---

### TC-ST-009: Tắt Cá Nước
**Mục đích:** Verify có thể tắt Cá Nước

**Steps:**
1. Từ SacTeConfigSetupScreen
2. Toggle "Cá Nước" switch OFF
3. Tap "Bắt đầu trận đấu"

**Expected Results:**
- Hệ số Cá Nước input bị ẩn
- Match được tạo với caNuoc.enabled = false
- Trong round input, không hiển thị nút "Cá Nước"

---

### TC-ST-010: Tắt Cá Heo
**Mục đích:** Verify có thể tắt Cá Heo

**Steps:**
1. Từ SacTeConfigSetupScreen
2. Toggle "Cá Heo" switch OFF
3. Tap "Bắt đầu trận đấu"

**Expected Results:**
- Hệ số Cá Heo input bị ẩn
- Match được tạo với caHeo.enabled = false
- Trong round input, không hiển thị nút "Cá Heo"

---

## 3. ROUND INPUT - BASIC FLOW

### TC-ST-011: Chọn người thắng
**Mục đích:** Verify có thể chọn người thắng

**Steps:**
1. Từ ActiveMatchScreen (Sắc Tê match)
2. Tap "Thêm ván mới"
3. Tap checkbox "Chiến Thắng" của Player A

**Expected Results:**
- Checkbox được check với màu success
- winnerId = Player A
- Hiển thị nút "Tới Trắng" cho Player A

---

### TC-ST-012: Chọn Tới Trắng
**Mục đích:** Verify có thể chọn Tới Trắng

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap nút "Tới Trắng"

**Expected Results:**
- isWhiteWin = true
- Checkbox label đổi thành "🌟 Tới Trắng"
- Nút "Tới Trắng" highlight với màu warning
- Tất cả status buttons (Gục/Tồn) bị ẩn cho players khác
- Cá Nước auto-set cho Player A

---

### TC-ST-013: Chọn Tới Trắng khi chưa chọn người thắng
**Mục đích:** Verify không thể chọn Tới Trắng khi chưa có winner

**Steps:**
1. Từ SacTeRoundInputScreen
2. Không chọn người thắng
3. (Không có nút Tới Trắng hiển thị)

**Expected Results:**
- Nút "Tới Trắng" không hiển thị
- Không có player nào có nút này

---

### TC-ST-014: Chọn Gục cho người thua
**Mục đích:** Verify có thể chọn Gục cho người thua

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap nút "Gục" của Player B

**Expected Results:**
- Nút "Gục" highlight với màu error
- Text đổi thành "☠️ Gục"
- playerStatuses[B].isGuc = true
- playerStatuses[B].hasTon = false

---

### TC-ST-015: Chọn Tồn cho người thua
**Mục đích:** Verify có thể chọn Tồn cho người thua

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap nút "Tồn" của Player B

**Expected Results:**
- Nút "Tồn" highlight với màu warning
- Text đổi thành "⚠️ Tồn"
- playerStatuses[B].hasTon = true
- playerStatuses[B].isGuc = false

---

### TC-ST-016: Chọn Gục khi đã có Tồn
**Mục đích:** Verify Gục và Tồn mutual exclusive

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap "Tồn" của Player B (hasTon = true)
4. Tap "Gục" của Player B

**Expected Results:**
- Nút "Gục" được highlight
- Nút "Tồn" bỏ highlight
- playerStatuses[B].isGuc = true
- playerStatuses[B].hasTon = false (cleared)

---

### TC-ST-017: Uncheck Gục
**Mục đích:** Verify có thể uncheck Gục

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap "Gục" của Player B (isGuc = true)
4. Tap "Gục" lại lần nữa

**Expected Results:**
- Nút "Gục" bỏ highlight
- Text về "Gục" (không có emoji)
- playerStatuses[B].isGuc = false
- playerStatuses[B].hasTon = false (giữ nguyên)

---

### TC-ST-018: Chọn Gục cho người thắng (invalid)
**Mục đích:** Verify không thể chọn Gục cho người thắng

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap "Gục" của Player A

**Expected Results:**
- Hiển thị warning: "Người thắng không thể bị gục"
- Nút không được check
- playerStatuses[A].isGuc = false

---

### TC-ST-019: Chọn Tồn cho người thắng (invalid)
**Mục đích:** Verify không thể chọn Tồn cho người thắng

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap "Tồn" của Player A

**Expected Results:**
- Hiển thị warning: "Người thắng không thể có tồn"
- Nút không được check
- playerStatuses[A].hasTon = false

---

### TC-ST-020: Chọn Gục khi Tới Trắng (invalid)
**Mục đích:** Verify không thể chọn Gục khi Tới Trắng

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap "Tới Trắng"
4. Tap "Gục" của Player B

**Expected Results:**
- Hiển thị warning: "Tới Trắng tự động gục tất cả"
- Nút không được check
- Nút "Gục" không hiển thị (bị ẩn khi isWhiteWin)

---

## 4. ROUND INPUT - CÁ NƯỚC & CÁ HEO

### TC-ST-021: Chọn người ăn Cá Nước
**Mục đích:** Verify có thể chọn người ăn Cá Nước

**Steps:**
1. Từ SacTeRoundInputScreen (Cá Nước enabled)
2. Chọn Player A làm người thắng
3. Tap nút "Cá Nước" của Player B

**Expected Results:**
- Nút "Cá Nước" highlight với màu primary
- Text đổi thành "💰 Cá Nước"
- caNuocWinnerId = Player B

---

### TC-ST-022: Chọn người ăn Cá Heo
**Mục đích:** Verify có thể chọn người ăn Cá Heo

**Steps:**
1. Từ SacTeRoundInputScreen (Cá Heo enabled)
2. Chọn Player A làm người thắng
3. Tap nút "Cá Heo" của Player C

**Expected Results:**
- Nút "Cá Heo" highlight với màu success
- Text đổi thành "🐷 Cá Heo"
- caHeoWinnerId = Player C

---

### TC-ST-023: Không chọn người ăn Cá Heo
**Mục đích:** Verify có thể không chọn người ăn Cá Heo (pot accumulate)

**Steps:**
1. Từ SacTeRoundInputScreen (Cá Heo enabled)
2. Chọn Player A làm người thắng
3. Không tap nút "Cá Heo" của ai
4. Tap "Tính điểm và lưu"

**Expected Results:**
- caHeoWinnerId = undefined
- Pot sẽ accumulate sang ván sau

---

### TC-ST-024: Tới Trắng auto-set Cá Nước
**Mục đích:** Verify Tới Trắng tự động set Cá Nước cho winner

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap "Tới Trắng"

**Expected Results:**
- caNuocWinnerId = Player A (auto-set)
- Nút "Cá Nước" của Player A được highlight
- Không thể thay đổi Cá Nước winner

---

## 5. SCORING CALCULATION

### TC-ST-025: Tính điểm thắng thường (không Gục, không Tồn)
**Mục đích:** Verify tính điểm đúng cho thắng thường

**Config:**
- 3 players: A, B, C
- heSoGuc = 10, heSoTon = 5
- caNuoc: enabled, heSo = 5
- caHeo: disabled

**Round Input:**
- Winner: A
- isWhiteWin: false
- B: không Gục, không Tồn
- C: không Gục, không Tồn
- caNuocWinner: A

**Expected Scores:**
- A: +20 (win from B: +5, win from C: +5, caNuoc from B: +5, caNuoc from C: +5)
- B: -10 (lose to A: -5, caNuoc: -5)
- C: -10 (lose to A: -5, caNuoc: -5)
- Total: 20 - 10 - 10 = 0 ✅

---

### TC-ST-026: Tính điểm với 1 người Gục
**Mục đích:** Verify tính điểm đúng khi có người Gục

**Config:**
- 3 players: A, B, C
- heSoGuc = 10, heSoTon = 5
- caNuoc: enabled, heSo = 5

**Round Input:**
- Winner: A
- B: Gục
- C: không Gục, không Tồn
- caNuocWinner: A

**Expected Scores:**
- A: +30 (win from B: +15 [gục], win from C: +5, caNuoc from B: +5, caNuoc from C: +5)
- B: -20 (lose to A: -15 [gục], caNuoc: -5)
- C: -10 (lose to A: -5, caNuoc: -5)
- Total: 30 - 20 - 10 = 0 ✅

---

### TC-ST-027: Tính điểm với 1 người Tồn
**Mục đích:** Verify tính điểm đúng khi có người Tồn

**Config:**
- 3 players: A, B, C
- heSoGuc = 10, heSoTon = 5
- caNuoc: enabled, heSo = 5

**Round Input:**
- Winner: A
- B: Tồn (hasTon = true)
- C: không Gục, không Tồn
- caNuocWinner: A

**Expected Scores:**
- A: +25 (win from B: +10 [tồn], win from C: +5, caNuoc from B: +5, caNuoc from C: +5)
- B: -15 (lose to A: -10 [tồn], caNuoc: -5)
- C: -10 (lose to A: -5, caNuoc: -5)
- Total: 25 - 15 - 10 = 0 ✅

---

### TC-ST-028: Tính điểm Tới Trắng
**Mục đích:** Verify tính điểm đúng cho Tới Trắng

**Config:**
- 3 players: A, B, C
- heSoGuc = 10, whiteWinMultiplier = 2
- caNuoc: enabled, heSo = 5

**Round Input:**
- Winner: A
- isWhiteWin: true
- B: auto Gục
- C: auto Gục
- caNuocWinner: A

**Expected Scores:**
- A: +70 (win from B: +30 [gục x2], win from C: +30 [gục x2], caNuoc from B: +5, caNuoc from C: +5)
- B: -35 (lose to A: -30 [gục x2], caNuoc: -5)
- C: -35 (lose to A: -30 [gục x2], caNuoc: -5)
- Total: 70 - 35 - 35 = 0 ✅

---

### TC-ST-029: Tính điểm với Cá Heo (có người ăn)
**Mục đích:** Verify tính điểm Cá Heo khi có người ăn

**Config:**
- 3 players: A, B, C
- caHeo: enabled, heSo = 5
- caHeoCurrentPot = 0 (ván đầu)

**Round Input:**
- Winner: A
- caHeoWinner: B

**Expected Scores:**
- Contribution: 3 players × 5 = 15 điểm
- A: -5 (contribute)
- B: +10 (win pot 15, contribute -5)
- C: -5 (contribute)
- Total contribution: -5 + 10 - 5 = 0 ✅
- caHeoCurrentPot reset về 0

---

### TC-ST-030: Tính điểm với Cá Heo (không có người ăn - accumulate)
**Mục đích:** Verify pot accumulate khi không có người ăn

**Config:**
- 3 players: A, B, C
- caHeo: enabled, heSo = 5
- caHeoCurrentPot = 0

**Round Input:**
- Winner: A
- caHeoWinner: null

**Expected Scores:**
- Contribution: 3 players × 5 = 15 điểm
- A: -5 (contribute)
- B: -5 (contribute)
- C: -5 (contribute)
- caHeoCurrentPot = 15 (accumulated)
- caHeoRoundsAccumulated = 1

---

### TC-ST-031: Tính điểm Cá Heo accumulated (ván thứ 3)
**Mục đích:** Verify tính điểm đúng khi pot đã accumulate 2 vans

**Config:**
- 3 players: A, B, C
- caHeo: enabled, heSo = 5
- caHeoCurrentPot = 30 (2 vans × 15)
- caHeoRoundsAccumulated = 2

**Round Input:**
- Winner: A
- caHeoWinner: C

**Expected Scores:**
- Current contribution: 3 × 5 = 15
- Total pot: 30 + 15 = 45
- A: -5 (contribute)
- B: -5 (contribute)
- C: +35 (win pot 45, contribute -5, lose to A: -5)
- caHeoCurrentPot reset về 0
- caHeoRoundsAccumulated reset về 0

---

## 6. VALIDATION & ERROR HANDLING

### TC-ST-032: Lưu ván khi chưa chọn người thắng
**Mục đích:** Verify không thể lưu khi chưa chọn winner

**Steps:**
1. Từ SacTeRoundInputScreen
2. Không chọn người thắng
3. Tap "Tính điểm và lưu"

**Expected Results:**
- Hiển thị warning: "Vui lòng chọn người thắng"
- Không lưu ván
- Vẫn ở SacTeRoundInputScreen

---

### TC-ST-033: Tới Trắng chưa chọn Cá Nước winner
**Mục đích:** Verify Tới Trắng phải có Cá Nước winner

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm người thắng
3. Tap "Tới Trắng"
4. Somehow clear caNuocWinnerId (edge case)
5. Tap "Tính điểm và lưu"

**Expected Results:**
- Hiển thị warning: "Tới Trắng phải chọn người ăn cá nước"
- Không lưu ván

---

### TC-ST-034: Xem preview điểm trước khi lưu
**Mục đích:** Verify hiển thị confirmation với preview điểm

**Steps:**
1. Từ SacTeRoundInputScreen
2. Setup: A thắng, B gục, C tồn
3. Tap "Tính điểm và lưu"

**Expected Results:**
- Hiển thị Alert với title "Xác nhận lưu ván"
- Hiển thị preview điểm cho từng player
- Format: "PlayerName: +XX" hoặc "PlayerName: -XX"
- Có nút "Hủy" và "Lưu"

---

### TC-ST-047: Validation - Missing Gục/Tồn (NEW)
**Mục đích:** Verify không thể lưu khi chưa chọn Gục/Tồn cho người thua
**Priority:** P0

**Steps:**
1. Từ SacTeRoundInputScreen (3 players: A, B, C)
2. Chọn Player A làm người thắng
3. Chọn Gục cho Player B
4. KHÔNG chọn Gục/Tồn cho Player C
5. Chọn Cá Nước winner
6. Tap "Tính điểm và lưu"

**Expected Results:**
- Hiển thị warning toast: "Thiếu thông tin"
- Message: "Vui lòng chọn Gục hoặc Tồn cho: C"
- Không lưu ván
- Vẫn ở SacTeRoundInputScreen

**Additional Test:**
7. Chọn Tồn cho Player C
8. Tap "Tính điểm và lưu" lại
9. **Expected:** Success, round saved

---

### TC-ST-048: Validation - Missing Cá Nước winner (NEW)
**Mục đích:** Verify không thể lưu khi chưa chọn người ăn Cá Nước
**Priority:** P0

**Steps:**
1. Từ SacTeRoundInputScreen (Cá Nước enabled)
2. Chọn Player A làm người thắng
3. Chọn Gục cho Player B
4. Chọn Tồn cho Player C
5. KHÔNG chọn người ăn Cá Nước
6. Tap "Tính điểm và lưu"

**Expected Results:**
- Hiển thị warning toast: "Lỗi"
- Message: "Vui lòng chọn người ăn Cá Nước (bắt buộc)"
- Không lưu ván
- Vẫn ở SacTeRoundInputScreen

**Additional Test:**
7. Chọn Player A cho Cá Nước
8. Tap "Tính điểm và lưu" lại
9. **Expected:** Success, round saved

---

### TC-ST-049: Score Table - Heo column display (NEW)
**Mục đích:** Verify hiển thị cột Heo trong bảng điểm khi Cá Heo enabled
**Priority:** P1

**Preconditions:**
- Match với Cá Heo enabled (heSo = 5)
- 3 players: A, B, C

**Steps:**
1. Tạo match Sắc Tê với Cá Heo enabled
2. Chơi Ván 1: A thắng, KHÔNG chọn người ăn Cá Heo
3. Chơi Ván 2: B thắng, KHÔNG chọn người ăn Cá Heo
4. Chơi Ván 3: C thắng, D ăn Cá Heo
5. Xem ActiveMatchScreen score table

**Expected Results:**
- Header row có cột "🐷 Heo" sau cột "Sum"
- Cột Heo có background màu success + '20'
- Ván 1 row: Heo = 15 (3 players × 5)
- Ván 2 row: Heo = 30 (accumulated)
- Ván 3 row: Heo = 0 (pot claimed)
- Text màu success, fontWeight: '600'

**Additional Test:**
6. Tạo match mới với Cá Heo disabled
7. **Expected:** Không có cột "Heo" trong score table

---

## 7. MULTI-ROUND FLOW

### TC-ST-035: Lưu ván và quay về ActiveMatch
**Mục đích:** Verify flow sau khi lưu ván

**Steps:**
1. Từ SacTeRoundInputScreen
2. Setup round đầy đủ
3. Tap "Tính điểm và lưu"
4. Tap "Lưu" trong confirmation

**Expected Results:**
- Hiển thị success toast: "Đã lưu ván đấu"
- Navigate về ActiveMatchScreen
- Score table hiển thị ván vừa lưu
- Total scores được update

---

### TC-ST-036: Cá Heo pot hiển thị trong header
**Mục đích:** Verify hiển thị Cá Heo pot khi có accumulation

**Preconditions:**
- Match với Cá Heo enabled
- Đã chơi 2 vans không có người ăn Cá Heo
- caHeoCurrentPot = 30

**Steps:**
1. Từ ActiveMatchScreen
2. Tap "Thêm ván mới"

**Expected Results:**
- Header hiển thị: "🐷 Cá Heo: 30 điểm (2 ván)"
- Text màu warning
- Hiển thị ngay dưới "Ván 3"

---

### TC-ST-037: Cá Heo pot không hiển thị khi = 0
**Mục đích:** Verify không hiển thị pot khi chưa accumulate

**Preconditions:**
- Match với Cá Heo enabled
- caHeoCurrentPot = 0

**Steps:**
1. Từ ActiveMatchScreen
2. Tap "Thêm ván mới"

**Expected Results:**
- Không hiển thị text "🐷 Cá Heo"
- Chỉ hiển thị "Ván X"

---

### TC-ST-038: Cá Heo pot không hiển thị khi disabled
**Mục đích:** Verify không hiển thị pot khi Cá Heo disabled

**Preconditions:**
- Match với Cá Heo disabled

**Steps:**
1. Từ ActiveMatchScreen
2. Tap "Thêm ván mới"

**Expected Results:**
- Không hiển thị nút "Cá Heo" cho bất kỳ player nào
- Không hiển thị pot info trong header

---

## 8. ACTIVE MATCH SCREEN

### TC-ST-039: Settings button ẩn cho Sắc Tê
**Mục đích:** Verify không hiển thị settings button cho Sắc Tê

**Steps:**
1. Tạo match Sắc Tê
2. Xem ActiveMatchScreen

**Expected Results:**
- Không hiển thị nút settings (⚙️) trong header
- Chỉ hiển thị nút pause (⏸️)
- Config không thể edit trong match

---

### TC-ST-040: Navigate đúng screen khi thêm ván
**Mục đích:** Verify navigate đến SacTeRoundInput cho Sắc Tê

**Steps:**
1. Từ ActiveMatchScreen (Sắc Tê match)
2. Tap "Thêm ván mới"

**Expected Results:**
- Navigate đến SacTeRoundInputScreen (không phải RoundInputScreen)
- Screen hiển thị đúng UI cho Sắc Tê
- Có các nút Gục, Tồn, Cá Nước, Cá Heo (nếu enabled)

---

## 9. EDGE CASES

### TC-ST-041: State persistence khi toggle nhanh
**Mục đích:** Verify state không bị mất khi user click nhanh

**Steps:**
1. Từ SacTeRoundInputScreen
2. Tap "Gục" của Player B 5 lần liên tục rất nhanh

**Expected Results:**
- State toggle đúng: false → true → false → true → false
- Không bị crash
- Không bị stale state
- UI update đúng

---

### TC-ST-042: State không reset khi context update
**Mục đích:** Verify selections không bị mất khi activeMatch update

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm winner
3. Chọn Gục cho Player B
4. Chọn Tồn cho Player C
5. Context update activeMatch (simulate refresh)

**Expected Results:**
- winnerId vẫn = Player A
- playerStatuses[B].isGuc vẫn = true
- playerStatuses[C].hasTon vẫn = true
- Không bị reset về defaults

---

### TC-ST-043: Uncheck không clear field khác
**Mục đích:** Verify uncheck chỉ ảnh hưởng field đó

**Steps:**
1. Từ SacTeRoundInputScreen
2. Chọn Player A làm winner
3. Chọn Gục cho Player B
4. Uncheck Gục của Player B

**Expected Results:**
- playerStatuses[B].isGuc = false
- playerStatuses[B].hasTon vẫn = false (không thay đổi)
- Không có side effects

---

### TC-ST-044: 5 players với mix statuses
**Mục đích:** Verify tính điểm đúng với 5 players và nhiều statuses

**Config:**
- 5 players: A, B, C, D, E
- heSoGuc = 10, heSoTon = 5
- caNuoc: enabled, heSo = 5

**Round Input:**
- Winner: A
- B: Gục
- C: Tồn
- D: không
- E: Gục
- caNuocWinner: A

**Expected Scores:**
- A: +65 (B: +15, C: +10, D: +5, E: +15, caNuoc: +20)
- B: -20 (gục + caNuoc)
- C: -15 (tồn + caNuoc)
- D: -10 (normal + caNuoc)
- E: -20 (gục + caNuoc)
- Total: 65 - 20 - 15 - 10 - 20 = 0 ✅

---

## 10. INTEGRATION TESTS

### TC-ST-045: Complete match flow (2 players)
**Mục đích:** End-to-end test với 2 players

**Steps:**
1. Chọn game Sắc Tê
2. Chọn 2 players: A, B
3. Config: defaults
4. Ván 1: A thắng, B gục
5. Ván 2: B thắng, A tồn
6. Ván 3: A thắng tới trắng
7. End match

**Expected Results:**
- Match được tạo thành công
- 3 vans được lưu
- Total scores tính đúng
- Match status = completed

---

### TC-ST-046: Complete match flow (5 players)
**Mục đích:** End-to-end test với 5 players

**Steps:**
1. Chọn game Sắc Tê
2. Chọn 5 players: A, B, C, D, E
3. Config: Cá Heo enabled
4. Ván 1: A thắng, không ai ăn Cá Heo
5. Ván 2: B thắng, không ai ăn Cá Heo
6. Ván 3: C thắng, D ăn Cá Heo (pot = 75)
7. End match

**Expected Results:**
- Pot accumulate đúng: 25 → 50 → 0
- D nhận đúng pot trong ván 3
- Total scores balance = 0

---

## Test Execution Summary

**Total Test Cases:** 49 (Updated)

**Categories:**
- Game Selection & Player Selection: 5 tests
- Config Setup: 5 tests
- Round Input - Basic Flow: 10 tests
- Round Input - Cá Nước & Cá Heo: 4 tests
- Scoring Calculation: 7 tests
- Validation & Error Handling: 6 tests (Added 3 new)
- Multi-Round Flow: 4 tests
- Active Match Screen: 2 tests
- Edge Cases: 4 tests
- Integration Tests: 2 tests

**Priority:**
- P0 (Critical): TC-001 to TC-020, TC-025 to TC-031, TC-047, TC-048
- P1 (High): TC-021 to TC-024, TC-032 to TC-040, TC-049
- P2 (Medium): TC-041 to TC-046

**New Test Cases (2026-01-14):**
- TC-ST-047: Validation - Missing Gục/Tồn (P0)
- TC-ST-048: Validation - Missing Cá Nước winner (P0)
- TC-ST-049: Score Table - Heo column display (P1)

**Estimated Execution Time:** ~3-4 hours for full suite
