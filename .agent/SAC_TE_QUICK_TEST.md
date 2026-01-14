# Sắc Tê - Quick Test Checklist

## ✅ Checklist nhanh để test game Sắc Tê

### 1. Setup Flow (5 phút)
- [ ] Chọn game "Sắc Tê" từ game selection
- [ ] Chọn 2 players → Next thành công
- [ ] Chọn 5 players → Next thành công
- [ ] Chọn 1 player → Show error "2-5 người chơi"
- [ ] Chọn 6 players → Show error "tối đa 5 người"

### 2. Config Screen (3 phút)
- [ ] Default config load đúng (Gục: 10, Tồn: 5, Tới Trắng: 2)
- [ ] Thay đổi hệ số Gục thành 15 → Save OK
- [ ] Set hệ số = 0 → Show error
- [ ] Toggle OFF Cá Nước → Input ẩn
- [ ] Toggle OFF Cá Heo → Input ẩn
- [ ] Tap "Bắt đầu trận đấu" → Navigate to ActiveMatch

### 3. Round Input - Basic (10 phút)
- [ ] Chọn Player A làm winner → Checkbox green
- [ ] Tap "Tới Trắng" → Label đổi, nút highlight
- [ ] Chọn "Gục" cho Player B → Nút red, text "☠️ Gục"
- [ ] Chọn "Tồn" cho Player C → Nút yellow, text "⚠️ Tồn"
- [ ] Chọn "Gục" khi đã có "Tồn" → Clear Tồn, set Gục
- [ ] Uncheck "Gục" → Chỉ bỏ Gục, không ảnh hưởng Tồn
- [ ] Tap "Gục" cho winner → Show error "Người thắng không thể bị gục"
- [ ] Tap "Tồn" cho winner → Show error "Người thắng không thể có tồn"

### 4. Cá Nước & Cá Heo (5 phút)
- [ ] Tap "Cá Nước" cho Player B → Nút blue, text "💰 Cá Nước"
- [ ] Tap "Cá Heo" cho Player C → Nút green, text "🐷 Cá Heo"
- [ ] Tới Trắng → Cá Nước auto-set cho winner
- [ ] Không chọn Cá Heo → OK (pot accumulate)

### 5. Scoring & Save (5 phút)
- [ ] Tap "Tính điểm và lưu" khi chưa chọn winner → Error
- [ ] Tap "Tính điểm và lưu" → Show preview điểm
- [ ] Preview hiển thị đúng format "+XX" hoặc "-XX"
- [ ] Tap "Lưu" → Success toast, navigate về ActiveMatch
- [ ] Score table hiển thị ván vừa lưu
- [ ] Total scores update đúng

### 6. Multi-Round (5 phút)
- [ ] Tap "Thêm ván mới" → Navigate to SacTeRoundInput (không phải RoundInput)
- [ ] Cá Heo pot > 0 → Hiển thị "🐷 Cá Heo: X điểm (Y ván)"
- [ ] Cá Heo pot = 0 → Không hiển thị pot info
- [ ] Settings button ẩn cho Sắc Tê match

### 7. Edge Cases (5 phút)
- [ ] Click "Gục" 5 lần liên tục nhanh → Toggle đúng, không crash
- [ ] Chọn statuses → Refresh/context update → Selections không bị mất
- [ ] Uncheck "Gục" → hasTon giữ nguyên (không bị clear)
- [ ] Uncheck "Tồn" → isGuc giữ nguyên (không bị clear)

### 8. Scoring Verification (10 phút)

#### Test Case 1: Thắng thường (3 players)
**Setup:** A thắng, B & C không gục/tồn, A ăn cá nước
**Config:** Gục=10, Tồn=5, CáNước=5
**Expected:**
- A: +20 (B: +5, C: +5, CáNước: +10)
- B: -10 (A: -5, CáNước: -5)
- C: -10 (A: -5, CáNước: -5)
- Total: 0 ✅

#### Test Case 2: Có người Gục
**Setup:** A thắng, B gục, C normal, A ăn cá nước
**Expected:**
- A: +30 (B: +15 [gục], C: +5, CáNước: +10)
- B: -20 (A: -15 [gục], CáNước: -5)
- C: -10 (A: -5, CáNước: -5)
- Total: 0 ✅

#### Test Case 3: Tới Trắng
**Setup:** A tới trắng, B & C auto gục
**Config:** Gục=10, TớiTrắng=2, CáNước=5
**Expected:**
- A: +70 (B: +30 [gục×2], C: +30 [gục×2], CáNước: +10)
- B: -35 (A: -30 [gục×2], CáNước: -5)
- C: -35 (A: -30 [gục×2], CáNước: -5)
- Total: 0 ✅

#### Test Case 4: Cá Heo (có người ăn)
**Setup:** 3 players, B ăn cá heo, pot=0
**Config:** CáHeo=5
**Expected:**
- Contribution: 3 × 5 = 15
- A: -5 (contribute)
- B: +10 (pot 15 - contribute 5)
- C: -5 (contribute)
- Pot reset về 0 ✅

#### Test Case 5: Cá Heo accumulate
**Setup:** 3 players, không ai ăn, pot=0
**Expected:**
- A, B, C: mỗi người -5
- Pot = 15
- Rounds accumulated = 1 ✅

---

## 🎯 Critical Bugs to Watch

### Bug 1: Auto-uncheck sau vài giây
**Symptom:** Chọn Gục/Tồn, sau vài giây tự động uncheck
**Root Cause:** useEffect reset state khi activeMatch thay đổi
**Fix:** useRef để track initialization, chỉ init một lần
**Test:** Chọn Gục → Wait 5 seconds → Vẫn checked ✅

### Bug 2: Stale state khi toggle nhanh
**Symptom:** Click nhanh nhiều lần, state không đúng
**Root Cause:** Đọc state cũ từ closure
**Fix:** Functional setState với prevState
**Test:** Click Gục 10 lần nhanh → Toggle đúng ✅

### Bug 3: Uncheck clear field khác
**Symptom:** Uncheck Gục → hasTon bị clear
**Root Cause:** Logic luôn set field kia về false
**Fix:** Chỉ clear khi SET (không clear khi UNSET)
**Test:** Chọn Gục → Uncheck → hasTon không đổi ✅

### Bug 4: Cannot read property 'isGuc' of undefined
**Symptom:** Crash khi render player card
**Root Cause:** playerStatuses[playerId] chưa initialized
**Fix:** Null coalescing với default value
**Test:** Mở screen → Không crash ✅

### Bug 5: Cannot read property 'toString' of undefined
**Symptom:** Crash ở config screen
**Root Cause:** Config values undefined từ database
**Fix:** Null coalescing trước .toString()
**Test:** Mở config screen → Không crash ✅

---

## 📊 Test Execution Log

| Date | Tester | Pass | Fail | Notes |
|------|--------|------|------|-------|
| 2026-01-14 | | /46 | /46 | |
| | | | | |

---

## 🚀 Quick Smoke Test (2 phút)

**Mục đích:** Verify basic flow hoạt động

1. Chọn Sắc Tê → Chọn 3 players → Config defaults → Start
2. Ván 1: A thắng, B gục → Save
3. Check scores: A > 0, B < 0, total = 0
4. Ván 2: B thắng tới trắng → Save
5. Check scores updated
6. End match → Success

**Pass criteria:** Không crash, scores đúng, flow mượt mà
