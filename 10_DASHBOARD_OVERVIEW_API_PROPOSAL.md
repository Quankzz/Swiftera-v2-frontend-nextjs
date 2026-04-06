# 10. Đề xuất API Overview cho Dashboard

> **Mục đích**: Tài liệu này đề xuất cấu trúc response cho một endpoint tổng hợp dành riêng cho màn hình Dashboard (`/dashboard/page.tsx`). Tất cả các trường đều có căn cứ tính toán rõ ràng từ dữ liệu hiện có trong BE (rental orders, inventory items, contact tickets, vouchers, payments).

---

## Tại sao cần endpoint riêng?

Dashboard hiện tại đang dùng **mock data**. Để chuyển sang dữ liệu thực, FE cần gọi ít nhất 5–6 API riêng lẻ (rental orders, inventory items, tickets, vouchers, payments...) rồi tự tổng hợp — vừa chậm vừa tốn băng thông. Một endpoint `GET /api/v1/dashboard/overview` sẽ giải quyết điều này với **một lần gọi duy nhất**.

---

## Đề xuất: `GET /api/v1/dashboard/overview` [AUTH]

### Query params (tùy chọn)

| Param   | Mặc định | Ý nghĩa                                            |
| ------- | -------- | -------------------------------------------------- |
| `hubId` | (trống)  | Nếu truyền: lọc theo hub. Nếu không: toàn hệ thống |

> **Ghi chú scope**: Staff thường chỉ nhìn thấy data của hub mình. Admin nhìn toàn hệ thống. BE tự xử lý scope theo role của token.

---

## Cấu trúc Response JSON đề xuất

```json
{
  "success": true,
  "message": "Lấy tổng quan dashboard thành công",
  "data": {
    // ── 1. KPI ĐƠN HÀNG (7 ngày / tháng này) ────────────────────────────
    // Phục vụ: KpiCard "Hôm nay / Tuần này / Tháng này"
    // Nguồn: COUNT rental_orders GROUP BY ngày/tuần/tháng theo placedAt hoặc actualDeliveryAt
    "orderKpi": {
      "completedToday": 7, // đơn status=COMPLETED trong ngày hôm nay
      "completedYesterday": 5, // đơn status=COMPLETED ngày hôm qua (để tính trend)
      "completedThisWeek": 38, // đơn COMPLETED trong 7 ngày gần nhất
      "completedThisMonth": 155, // đơn COMPLETED trong tháng hiện tại
      // Mảng 7 ngày gần nhất cho bar chart
      "dailyCompletedLast7Days": [
        { "date": "2026-03-31", "count": 5 },
        { "date": "2026-04-01", "count": 7 },
        { "date": "2026-04-02", "count": 4 },
        { "date": "2026-04-03", "count": 9 },
        { "date": "2026-04-04", "count": 3 },
        { "date": "2026-04-05", "count": 6 },
        { "date": "2026-04-06", "count": 7 }
      ]
    },

    // ── 2. PHÂN BỔ TRẠNG THÁI ĐƠN HIỆN TẠI ─────────────────────────────
    // Phục vụ: StatusPill (4 ô) + Breakdown chart "Phân bổ đơn hàng"
    // Nguồn: COUNT rental_orders GROUP BY status (không giới hạn ngày, đang active)
    "orderStatusCounts": {
      "pendingPayment": 3, // PENDING_PAYMENT — chờ thanh toán
      "paid": 8, // PAID — đã thanh toán, chờ xác nhận/chuẩn bị
      "preparing": 5, // PREPARING — đang chuẩn bị hàng
      "delivering": 12, // DELIVERING — đang giao
      "delivered": 4, // DELIVERED — đã giao, chờ khách xác nhận nhận
      "inUse": 47, // IN_USE — đang trong thời gian thuê
      "pendingPickup": 6, // PENDING_PICKUP — hết hạn, chờ thu hồi
      "pickingUp": 2, // PICKING_UP — đang thu hồi
      "pickedUp": 1, // PICKED_UP — đã thu về, chờ hoàn tất
      "completed": 155, // COMPLETED — đã hoàn thành (tháng này)
      "cancelled": 9, // CANCELLED — đã hủy (tháng này)
      // Tổng hợp nhóm cho UI "cần xử lý ngay"
      "urgentTotal": 14 // = paid + pendingPickup + (đơn overdue)
    },

    // ── 3. ĐƠN QUÁ HẠN ──────────────────────────────────────────────────
    // Phục vụ: Badge cảnh báo đỏ + urgent action queue
    // Nguồn: rental_orders WHERE status IN ('IN_USE','PENDING_PICKUP')
    //        AND expectedRentalEndDate < NOW()
    "overdueOrders": {
      "count": 3, // tổng số đơn quá hạn
      // Danh sách tối đa 5 đơn urgent gần nhất (để render UrgentRow)
      "topItems": [
        {
          "rentalOrderId": "6cc84ef6-...",
          "orderCode": "SW-20260318-001",
          "status": "PENDING_PICKUP",
          "expectedRentalEndDate": "2026-04-03",
          "renterFullName": "Lê Thị Bảo Châu",
          "renterPhone": "0912 345 678",
          "itemCount": 2
        }
      ]
    },

    // ── 4. KHO HÀNG (INVENTORY) ──────────────────────────────────────────
    // Phục vụ: Hiển thị sức khỏe kho trên dashboard (hiện là DashboardStats)
    // Nguồn: COUNT inventory_items GROUP BY status (lọc theo hubId nếu có)
    "inventoryStats": {
      "totalItems": 120, // tổng số serial trong kho
      "available": 68, // status = AVAILABLE
      "rented": 41, // status = RENTED
      "reserved": 4, // status = RESERVED
      "maintenance": 5, // status = MAINTENANCE
      "damaged": 2, // status = DAMAGED
      "retired": 0 // status = RETIRED
    },

    // ── 5. DOANH THU / TÀI CHÍNH ─────────────────────────────────────────
    // Phục vụ: Thẻ doanh thu (hiện dùng mock), có thể thêm section tài chính
    // Nguồn: SUM payment_transactions WHERE status='SUCCESS'
    //        GROUP BY transactionType và khoảng thời gian
    "revenueStats": {
      // Phí thuê thu được (rentalFeeAmount) hôm nay
      "rentalFeeToday": 4500000,
      // Phí thuê thu được trong tháng này
      "rentalFeeThisMonth": 78500000,
      // Tổng tiền cọc đang giữ (chưa hoàn trả, các đơn đang IN_USE / DELIVERED)
      "depositHeldActive": 320000000,
      // Tổng phí phạt thu được trong tháng
      "penaltyThisMonth": 2500000
    },

    // ── 6. CONTACT TICKETS ───────────────────────────────────────────────
    // Phục vụ: Badge / thẻ cảnh báo ticket chưa xử lý trên dashboard
    // Nguồn: COUNT contact_tickets GROUP BY status
    "ticketStats": {
      "open": 5, // status = OPEN (mới, chưa ai nhận)
      "inProgress": 3, // status = IN_PROGRESS
      "replied": 7, // status = REPLIED
      "unresolved": 8 // = open + inProgress (tổng "cần xử lý")
    },

    // ── 7. VOUCHERS ──────────────────────────────────────────────────────
    // Phục vụ: Thẻ quản lý voucher (dashboard/vouchers page summary)
    // Nguồn: COUNT vouchers GROUP BY isActive và trạng thái hết hạn
    "voucherStats": {
      "totalActive": 12, // isActive = true và chưa hết hạn
      "expired": 4, // expiresAt < NOW() hoặc usedCount >= usageLimit
      "usedThisMonth": 38 // số lần voucher được áp dụng thành công trong tháng
    },

    // ── 8. NHÂN VIÊN HUB (nếu query theo hubId) ─────────────────────────
    // Phục vụ: Header "xin chào {staffName}" + thông tin hub
    // Nguồn: GET /hubs/{hubId}/staff (API-043) — gộp vào để tránh gọi thêm
    // CHÚ Ý: Chỉ trả khi có hubId, null nếu là admin toàn hệ thống
    "hubSummary": {
      "hubId": "h1a2b3c4-...",
      "hubCode": "HCM-01",
      "hubName": "Hub Hồ Chí Minh - Quận 1",
      "totalStaff": 6, // tổng nhân viên thuộc hub
      "activeStaff": 5 // isVerified = true
    }
  }
}
```

---

## Mapping giữa UI và trường API

| Thành phần UI (dashboard/page.tsx)     | Trường API sử dụng                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| KpiCard "Hôm nay"                      | `orderKpi.completedToday`                                                     |
| KpiCard "Tuần này"                     | `orderKpi.completedThisWeek`                                                  |
| KpiCard "Tháng này"                    | `orderKpi.completedThisMonth`                                                 |
| Trend "+N vs hôm qua"                  | `completedToday - completedYesterday`                                         |
| Bar chart 7 ngày                       | `orderKpi.dailyCompletedLast7Days[]`                                          |
| StatusPill "Chờ xác nhận"              | `orderStatusCounts.paid`                                                      |
| StatusPill "Đang giao"                 | `orderStatusCounts.delivering`                                                |
| StatusPill "Đang thuê"                 | `orderStatusCounts.inUse`                                                     |
| StatusPill "Cần thu hồi"               | `orderStatusCounts.pendingPickup` + `overdueOrders.count`                     |
| Badge đỏ header "N đơn cần xử lý"      | `orderStatusCounts.urgentTotal`                                               |
| Section "Phân bổ đơn hàng" (breakdown) | `orderStatusCounts.*` (tính nhóm: đang hoạt động / cần xử lý / hoàn thành...) |
| UrgentRow list (tối đa 5 đơn)          | `overdueOrders.topItems[]`                                                    |
| (Mở rộng) Thẻ tài chính                | `revenueStats.*`                                                              |
| (Mở rộng) Badge ticket chưa xử lý      | `ticketStats.unresolved`                                                      |
| (Mở rộng) Thẻ kho                      | `inventoryStats.*`                                                            |
| (Mở rộng) Thẻ voucher                  | `voucherStats.*`                                                              |

---

## Các trường KHÔNG đề xuất (và lý do)

| Trường                        | Lý do loại                                                               |
| ----------------------------- | ------------------------------------------------------------------------ |
| `averageRating` toàn hệ thống | BE không có index sẵn, tính realtime tốn kém, không có trên dashboard FE |
| Danh sách sản phẩm hot        | Cần aggregation phức tạp (join orders → products), dashboard không cần   |
| Số users mới đăng ký          | Dashboard này là staff portal, không phải admin analytics                |
| Revenue theo từng product     | Quá chi tiết, thuộc về trang analytics riêng nếu có                      |
| `penaltyHeld` chưa thanh toán | Phí phạt được xử lý qua cọc, không track riêng ở layer này               |

---

## Ghi chú triển khai

1. **Caching**: Endpoint này nên được cache **30–60 giây** (short-lived) phía BE để tránh N+1 queries khi nhiều staff mở dashboard cùng lúc.

2. **Scope tự động**: BE dùng JWT để xác định user là STAFF hay ADMIN:
   - `STAFF_ROLE`: tự động filter theo `hubId` của staff đó.
   - `ADMIN_ROLE`: trả toàn hệ thống (hoặc theo `?hubId=` nếu truyền).

3. **`overdueOrders.topItems`**: Giới hạn 5 item, sort theo `expectedRentalEndDate ASC` (quá hạn lâu nhất lên đầu). FE render thẳng vào `UrgentRow` mà không cần gọi thêm API.

4. **`dailyCompletedLast7Days`**: Mảng luôn có đúng 7 phần tử, sort tăng dần theo `date`. Ngày không có đơn nào trả `count: 0`.

5. **`hubSummary`**: Nếu ADMIN gọi mà không truyền `hubId`, trường này trả `null`. FE kiểm tra null trước khi render.
