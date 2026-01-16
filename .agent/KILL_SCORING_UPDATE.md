# Cập Nhật Logic Tính Điểm Giết - Tiến Lên

## Ngày cập nhật: 2026-01-16

## Tóm tắt thay đổi

Đã sửa lại logic tính điểm giết trong file `utils/scoringEngine.ts` để hỗ trợ đầy đủ các trường hợp giết 1, 2, hoặc 3 người.

## Logic mới

### Công thức tính điểm cho người bị giết

Mỗi người bị giết sẽ bị **âm điểm** theo công thức:

```
Điểm âm = kill_multiplier × base_ratio_first + (tổng các penalty nếu có)
```

Các penalty bao gồm:
- `penalty_heo_den` (Heo Đen)
- `penalty_heo_do` (Heo Đỏ)
- `penalty_ba_doi_thong` (Ba Đôi Thông)
- `penalty_tu_quy` (Tứ Quý)
- `penalty_ba_tep` (Ba Tép)

### Công thức tính điểm cho người giết

Người giết sẽ nhận **tổng điểm dương** bằng:

```
Điểm dương = Tổng điểm âm của tất cả người bị giết
```

## Các trường hợp

### Case 1: Giết 1 người (1v1)
- **Người giết (hạng 1)**: Xóa điểm base, chỉ nhận điểm giết
- **Người bị giết (hạng 4)**: Xóa điểm base, chỉ bị trừ điểm giết + (tổng các penalty nếu có)
- **2 người khác (hạng 2 và 3)**: Giữ nguyên điểm base (+base cho hạng 2, -base cho hạng 3)

**Ví dụ:**
- Config: `base_ratio_first = 10`, `base_ratio_second = 5`, `kill_multiplier = 2`
- Ranking: A (hạng 1), B (hạng 2), C (hạng 3), D (hạng 4)
- Người A giết người D (có 1 Heo Đen, `penalty_heo_den = 5`)
- **Điểm base ban đầu**: A = +10, B = +5, C = -5, D = -10
- **Điểm giết**: D bị trừ `-(10 × 2 + 5) = -25`, A nhận `+25`
- **Kết quả cuối cùng**: 
  - A = 0 (xóa base +10) + 25 (giết) = **+25**
  - B = +5 (base) = **+5**
  - C = -5 (base) = **-5**
  - D = 0 (xóa base -10) - 25 (giết) = **-25**
- **Tổng**: 25 + 5 - 5 - 25 = **0** ✓

### Case 2: Giết 2 người (1v2)
- **Người giết (hạng 1)**: Xóa điểm base, chỉ nhận điểm giết
- **2 người bị giết (hạng 3 và 4)**: Xóa điểm base, chỉ bị trừ điểm giết
- **Người thứ 4 (hạng 2, neutral)**: Xóa điểm base, điểm = 0

**Ví dụ:**
- Config: `base_ratio_first = 10`, `base_ratio_second = 5`, `kill_multiplier = 2`
- Ranking: A (hạng 1), B (hạng 2), C (hạng 3), D (hạng 4)
- Người A giết người C và D
  - Người C có 1 Heo Đen (`penalty_heo_den = 5`)
  - Người D có 1 Tứ Quý (`penalty_tu_quy = 15`)
- **Điểm base ban đầu**: A = +10, B = +5, C = -5, D = -10
- **Điểm giết**: 
  - C bị trừ `-(10 × 2 + 5) = -25`
  - D bị trừ `-(10 × 2 + 15) = -35`
  - A nhận `+25 + 35 = +60`
- **Kết quả cuối cùng**: 
  - A = 0 (xóa base +10) + 60 (giết) = **+60**
  - B = 0 (xóa base +5) = **0**
  - C = 0 (xóa base -5) - 25 (giết) = **-25**
  - D = 0 (xóa base -10) - 35 (giết) = **-35**
- **Tổng**: 60 + 0 - 25 - 35 = **0** ✓

### Case 3: Giết 3 người (1v3) - **MỚI**
- **Người giết (hạng 1)**: Xóa điểm base, chỉ nhận điểm giết
- **3 người bị giết (hạng 2, 3, 4)**: Xóa điểm base, chỉ bị trừ điểm giết

**Ví dụ:**
- Config: `base_ratio_first = 10`, `base_ratio_second = 5`, `kill_multiplier = 2`
- Ranking: A (hạng 1), B (hạng 2), C (hạng 3), D (hạng 4)
- Người A giết người B, C, và D
  - Người B: không có penalty
  - Người C: có 1 Heo Đen (`penalty_heo_den = 5`)
  - Người D: có 1 Ba Đôi Thông (`penalty_ba_doi_thong = 10`)
- **Điểm base ban đầu**: A = +10, B = +5, C = -5, D = -10
- **Điểm giết**: 
  - B bị trừ `-(10 × 2 + 0) = -20`
  - C bị trừ `-(10 × 2 + 5) = -25`
  - D bị trừ `-(10 × 2 + 10) = -30`
  - A nhận `+20 + 25 + 30 = +75`
- **Kết quả cuối cùng**: 
  - A = 0 (xóa base +10) + 75 (giết) = **+75**
  - B = 0 (xóa base +5) - 20 (giết) = **-20**
  - C = 0 (xóa base -5) - 25 (giết) = **-25**
  - D = 0 (xóa base -10) - 30 (giết) = **-30**
- **Tổng**: 75 - 20 - 25 - 30 = **0** ✓

## File đã sửa

- `d:\ScoreCard\utils\scoringEngine.ts` (dòng 129-260)

## Kiểm tra

Để kiểm tra logic mới:
1. Khởi động app: `npm start`
2. Tạo một ván chơi mới
3. Thử các trường hợp giết 1, 2, và 3 người
4. Kiểm tra điểm số có đúng với công thức mới không

## Ghi chú

- Logic này đảm bảo tổng điểm của 4 người luôn = 0 (zero-sum game)
- Người giết luôn nhận tổng điểm dương bằng tổng điểm âm của tất cả người bị giết
- Các penalty (bài đặc biệt) được cộng thêm vào điểm giết cơ bản
