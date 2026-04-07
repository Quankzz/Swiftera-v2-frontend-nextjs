# Dashboard Error Handling Audit

> Cập nhật lần cuối: audit toàn bộ `src/features/` và `src/components/dashboard/` và `src/app/dashboard/`

---

## Quy ước

| Ký hiệu                    | Nghĩa                                                                    |
| -------------------------- | ------------------------------------------------------------------------ |
| 🍞 **Toast**               | `toast.error()` / `toast.success()` từ thư viện `sonner`                 |
| 📋 **Inline**              | `setServerError(msg)` → render `<p>` / `<div>` lỗi bên trong form/dialog |
| 📋+🍞 **Inline + Toast**   | Cả hai cùng lúc                                                          |
| 📌 **Inline (form field)** | `setErrors({field: msg})` — lỗi hiển thị dưới từng trường input          |
| 🔇 **Silent**              | `catch {}` — nuốt lỗi, không thông báo                                   |
| 🚦 **Inline (banner)**     | `isError` từ react-query → render banner/section lỗi trong trang         |
| 🔄 **React Query bubble**  | Mutation throw lỗi → UI tự nhận qua `isError`/`error` trên hook          |
| ⚠️ **Toast (warning)**     | `toast.warning()` — cảnh báo validation trước khi gọi API                |

---

## 1. Dashboard Tổng quan (`/dashboard`)

| Module / File                                            | Hành động                  | Xử lý lỗi                                                   | Loại hiển thị          | Ghi chú                                                             |
| -------------------------------------------------------- | -------------------------- | ----------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| `src/app/dashboard/page.tsx`                             | Load KPI / chart data      | `isError` → banner inline                                   | 🚦 **Inline (banner)** | Hiển thị `error.message` + nút refetch trong banner màu vàng/đỏ     |
| `src/features/dashboards/components/KpiCards.tsx`        | Render KPI cards           | Props — component nhận `orderKpi`, `revenueStats` trực tiếp | —                      | Không tự fetch, không xử lý lỗi riêng — lỗi được xử lý ở `page.tsx` |
| `src/features/dashboards/components/OrderChart.tsx`      | Render area / bar chart    | Props — nhận `isLoading`                                    | —                      | Không tự fetch, không xử lý lỗi riêng                               |
| `src/features/dashboards/components/InventoryStatus.tsx` | Render donut chart tồn kho | Props — nhận `isLoading`                                    | —                      | Không tự fetch, không xử lý lỗi riêng                               |
| `src/features/dashboards/components/OverdueTable.tsx`    | Render bảng đơn quá hạn    | Props — nhận `overdueOrders`                                | —                      | Không tự fetch, không xử lý lỗi riêng                               |

---

## 2. Quản lý Hub (`/dashboard/hubs`)

| Module / File                                        | Hành động          | Xử lý lỗi                                              | Loại hiển thị          | Ghi chú                                                                    |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------- |
| `src/features/hubs/components/hub-table.tsx`         | Load danh sách hub | `isError` → `errorMessage` prop → inline table         | 🚦 **Inline (banner)** | `error.message` truyền vào DataTable component, hiển thị inline trong bảng |
| `src/features/hubs/components/hub-form-dialog.tsx`   | Tạo / Cập nhật hub | `catch(err)` → `normalizeError(err)` → `toast.error()` | 🍞 **Toast**           | `normalizeError` bóc message từ AppError                                   |
| `src/features/hubs/components/hub-delete-dialog.tsx` | Xóa hub            | `catch(err)` → `normalizeError(err)` → `toast.error()` | 🍞 **Toast**           | Cùng pattern với form dialog                                               |

---

## 3. Quản lý Voucher (`/dashboard/vouchers`)

| Module / File                                                | Hành động                 | Xử lý lỗi                                                              | Loại hiển thị            | Ghi chú                                                                                        |
| ------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| `src/features/vouchers/components/voucher-table.tsx`         | Load danh sách voucher    | `isError` → `errorMessage` prop hardcoded                              | 🚦 **Inline (banner)**   | `errorMessage='Không thể tải danh sách voucher...'` — thông báo cố định, không dùng message BE |
| `src/features/vouchers/components/voucher-table.tsx`         | Copy code / toggle active | `catch {}` (2 chỗ)                                                     | 🔇 **Silent**            | ⚠️ Lỗi bị nuốt hoàn toàn — không thông báo gì cho user                                         |
| `src/features/vouchers/components/voucher-form-dialog.tsx`   | Tạo voucher               | `catch(err)` → `normalizeError` → `setServerError()` + `toast.error()` | 📋+🍞 **Inline + Toast** | Hiển thị lỗi cả trong form (banner đỏ) lẫn toast                                               |
| `src/features/vouchers/components/voucher-form-dialog.tsx`   | Cập nhật voucher          | `catch(err)` → `normalizeError` → `setServerError()` + `toast.error()` | 📋+🍞 **Inline + Toast** | Cùng handler                                                                                   |
| `src/features/vouchers/components/voucher-delete-dialog.tsx` | Xóa voucher               | `catch(err)` → `normalizeError(err)` → `toast.error()`                 | 🍞 **Toast**             | Không có inline error trong dialog xóa                                                         |

---

## 4. Quản lý Danh mục (`/dashboard/categories`)

| Module / File                                                    | Hành động               | Xử lý lỗi                                                | Loại hiển thị | Ghi chú                                                                                           |
| ---------------------------------------------------------------- | ----------------------- | -------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `src/components/dashboard/categories/category-form-dialog.tsx`   | Upload ảnh              | `catch {}` → `setServerError('Tải ảnh lên thất bại...')` | 📋 **Inline** | Lỗi upload không có toast, chỉ hiện inline                                                        |
| `src/components/dashboard/categories/category-form-dialog.tsx`   | Tạo / Cập nhật danh mục | `catch(err: unknown)` → `setServerError(msg)`            | 📋 **Inline** | Không có toast — chỉ hiện banner lỗi trong dialog; validate field riêng qua `setErrors({field})`  |
| `src/components/dashboard/categories/category-delete-dialog.tsx` | Xóa danh mục            | `catch(err: unknown)` → `setServerError(msg)`            | 📋 **Inline** | Có xử lý đặc biệt: nếu BE trả `CATEGORY_HAS_PRODUCTS` → hiện message thân thiện hơn. Không toast. |

---

## 5. Quản lý Đơn thuê (`/dashboard/rental-orders`)

| Module / File                                                          | Hành động                        | Xử lý lỗi                                                                     | Loại hiển thị             | Ghi chú                                                                  |
| ---------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `src/components/dashboard/rental-orders/rental-order-table.tsx`        | Load danh sách đơn thuê          | `isError` → `errorMessage` prop hardcoded                                     | 🚦 **Inline (banner)**    | `'Không thể tải danh sách đơn thuê...'` — message cố định                |
| `src/components/dashboard/rental-orders/assign-dialog.tsx` _(legacy)_  | Gán hub + nhân viên (cũ)         | `await mutateAsync()` — không có try/catch trong `handleSubmit`               | 🔄 **React Query bubble** | ⚠️ Lỗi không được bắt — nếu mutation throw, app có thể unhandled promise |
| `src/features/rental-orders/components/assign-hub-dialog.tsx`          | Chọn hub (bước 1)                | Không có action mutation — chỉ select                                         | —                         | Không gọi API, chỉ chọn hub rồi callback `onHubSelected`                 |
| `src/features/rental-orders/components/assign-staff-dialog.tsx`        | Gán nhân viên (bước 2, luồng cũ) | `catch(err)` → `err instanceof Error ? err.message : '...'` → `toast.error()` | 🍞 **Toast**              | Không dùng `normalizeError` — dùng `instanceof Error` trực tiếp          |
| `src/features/rental-orders/components/rental-order-assign-dialog.tsx` | Gán nhân viên (dialog mới)       | `catch(err)` → `err instanceof Error ? err.message : '...'` → `toast.error()` | 🍞 **Toast**              | Cùng pattern — không dùng `normalizeError`                               |
| `src/features/rental-orders/components/assign-staff-dialog.tsx`        | Validate chọn nhân viên          | `toast.warning('Vui lòng chọn ít nhất...')`                                   | ⚠️ **Toast (warning)**    | Validation trước khi gọi API                                             |
| `src/features/rental-orders/components/rental-order-assign-dialog.tsx` | Validate chọn nhân viên          | `toast.warning('Vui lòng chọn ít nhất...')`                                   | ⚠️ **Toast (warning)**    | Cùng pattern                                                             |

---

## 6. Quản lý Người dùng (`/dashboard/users`)

| Module / File                                      | Hành động           | Xử lý lỗi                                              | Loại hiển thị          | Ghi chú                                                   |
| -------------------------------------------------- | ------------------- | ------------------------------------------------------ | ---------------------- | --------------------------------------------------------- |
| `src/components/dashboard/users/users-table.tsx`   | Load danh sách user | `isError` → `errorMessage` prop hardcoded              | 🚦 **Inline (banner)** | `'Không thể tải dữ liệu người dùng...'` — message cố định |
| `src/components/dashboard/users/users-dialogs.tsx` | Cập nhật user       | `catch(err)` → `normalizeError(err)` → `toast.error()` | 🍞 **Toast**           | Dùng `normalizeError` — lấy message từ AppError           |
| `src/components/dashboard/users/users-dialogs.tsx` | Xóa user            | `catch(err)` → `normalizeError(err)` → `toast.error()` | 🍞 **Toast**           | Cùng pattern                                              |

---

## 7. Quản lý Vai trò & Quyền (`/dashboard/roles`, `/dashboard/permissions`)

| Module / File                                                                      | Hành động           | Xử lý lỗi                                  | Loại hiển thị             | Ghi chú                                                      |
| ---------------------------------------------------------------------------------- | ------------------- | ------------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| `src/components/dashboard/roles/roles-dialogs.tsx` — `RoleFormDialog`              | Tạo / Cập nhật role | `await mutateAsync()` — không có try/catch | 🔄 **React Query bubble** | ⚠️ Lỗi không được bắt trong component — nếu throw, unhandled |
| `src/components/dashboard/roles/roles-dialogs.tsx` — `RoleDeleteDialog`            | Xóa role            | `await mutateAsync()` — không có try/catch | 🔄 **React Query bubble** | ⚠️ Cùng vấn đề                                               |
| `src/components/dashboard/roles/roles-permissions-dialog.tsx` — `PermissionsInner` | Lưu phân quyền      | `await mutateAsync()` — không có try/catch | 🔄 **React Query bubble** | ⚠️ Lỗi không được bắt trong component                        |

---

## 8. Quản lý Sản phẩm (`/dashboard/products`)

| Module / File                                             | Hành động               | Xử lý lỗi                                                        | Loại hiển thị              | Ghi chú                                                              |
| --------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------- |
| `src/components/dashboard/products/products-grid.tsx`     | Load danh sách sản phẩm | `isError` → inline error card                                    | 🚦 **Inline (banner)**     | Hiện box màu đỏ "Không thể tải danh sách sản phẩm" — message cố định |
| `src/components/dashboard/products/product-form-page.tsx` | Upload ảnh sản phẩm     | `catch {}` → `toast.error('Tải ảnh lên thất bại...')`            | 🍞 **Toast**               | Message hardcoded, không từ BE                                       |
| `src/components/dashboard/products/product-form-page.tsx` | Tạo sản phẩm            | `createMutation.mutate(..., { onSuccess })` — không có `onError` | 🔄 **React Query bubble**  | ⚠️ Không bắt lỗi create — nếu API lỗi, không thông báo               |
| `src/components/dashboard/products/product-form-page.tsx` | Cập nhật sản phẩm       | `updateMutation.mutate(..., { onSuccess })` — không có `onError` | 🔄 **React Query bubble**  | ⚠️ Cùng vấn đề với create                                            |
| `src/components/dashboard/products/product-form-page.tsx` | Validate form           | `setSubmitted(true)` → `isValid` → inline validation             | 📌 **Inline (form field)** | Validation cục bộ trước submit — hiện lỗi dưới từng field            |

---

## 9. Quản lý Contact Ticket (`/dashboard/contact-tickets`)

| Module / File                                           | Hành động                  | Xử lý lỗi                                           | Loại hiển thị             | Ghi chú                                                                      |
| ------------------------------------------------------- | -------------------------- | --------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| `src/features/tickets/components/TicketListTable.tsx`   | Load danh sách ticket      | `isError` → inline trong `<tbody>`                  | 🚦 **Inline (banner)**    | Hiện hàng với icon `AlertCircle` + "Không thể tải dữ liệu" — message cố định |
| `src/features/tickets/components/TicketDetailModal.tsx` | Reply ticket               | `reply(body, { onSuccess })` — không có `onError`   | 🔄 **React Query bubble** | ⚠️ Không bắt lỗi reply                                                       |
| `src/features/tickets/components/TicketDetailModal.tsx` | Đóng ticket                | `close(id, { onSuccess })` — không có `onError`     | 🔄 **React Query bubble** | ⚠️ Không bắt lỗi close                                                       |
| `src/features/tickets/components/TicketDetailModal.tsx` | Cập nhật trạng thái ticket | `updateStatus({ id, status })` — không có `onError` | 🔄 **React Query bubble** | ⚠️ Không bắt lỗi update status                                               |

---

## 10. Form Gửi Phản hồi / Hỗ trợ (Frontend `FeedbackForm`)

| Module / File                                      | Hành động                             | Xử lý lỗi                                          | Loại hiển thị                 | Ghi chú                                             |
| -------------------------------------------------- | ------------------------------------- | -------------------------------------------------- | ----------------------------- | --------------------------------------------------- |
| `src/features/tickets/components/FeedbackForm.tsx` | Load đơn thuê trong OrderPickerDialog | `catch {}` (silent)                                | 🔇 **Silent**                 | ⚠️ Lỗi load order list bị nuốt hoàn toàn            |
| `src/features/tickets/components/FeedbackForm.tsx` | Validate nội dung tin nhắn rỗng       | `setMessageError('Vui lòng nhập nội dung...')`     | 📋 **Inline**                 | Lỗi validate local — hiện dưới rich editor          |
| `src/features/tickets/components/FeedbackForm.tsx` | Gửi ticket                            | `mutate(body, { onSuccess })` — không có `onError` | 🔄 **React Query bubble**     | ⚠️ Nếu gửi thất bại, không thông báo rõ cho user    |
| `src/features/tickets/components/FeedbackForm.tsx` | Gửi thành công                        | Hiện success card thay thế form                    | 📋 **Inline (success state)** | Render toàn bộ card xanh sau khi `isSuccess = true` |

---

## Tổng hợp theo pattern

### ✅ Nhất quán — Nên giữ

| Pattern                                                                     | Nơi áp dụng                                               |
| --------------------------------------------------------------------------- | --------------------------------------------------------- |
| `catch(err)` → `normalizeError(err)` → `toast.error(appErr.message)`        | hub-form, hub-delete, voucher-delete, users-dialogs       |
| `catch(err)` → `normalizeError(err)` → `setServerError()` + `toast.error()` | voucher-form-dialog                                       |
| `isError` react-query → `errorMessage` prop → DataTable inline              | hub-table, voucher-table, users-table, rental-order-table |

### ⚠️ Không nhất quán — Cần cải thiện

| Vấn đề                          | File                                                                          | Cụ thể                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Không dùng `normalizeError`     | assign-staff-dialog, rental-order-assign-dialog                               | Dùng `instanceof Error` thay vì `normalizeError` — mất message BE format |
| Không bắt lỗi mutation          | roles-dialogs, roles-permissions-dialog, product-form-page, TicketDetailModal | `mutateAsync` / `mutate` không có `onError` / try-catch → unhandled      |
| Silent catch                    | voucher-table (copy/toggle), FeedbackForm (load orders)                       | `catch {}` — user không biết gì khi lỗi                                  |
| Lỗi table load: message cố định | voucher-table, users-table, rental-order-table, products-grid                 | Không show message BE — mất thông tin debug                              |
| Upload ảnh — không nhất quán    | category-form-dialog (inline only) vs product-form-page (toast only)          | Nên thống nhất một pattern                                               |

### 📋 Gợi ý chuẩn hóa

```typescript
// Pattern chuẩn nên dùng thống nhất cho mọi mutation dialog:
try {
  await someMutation.mutateAsync(payload);
  toast.success('Thành công!');
  onClose();
} catch (err) {
  const appErr = normalizeError(err); // từ @/api/apiService
  toast.error(appErr.message); // hoặc setServerError(appErr.message) nếu cần inline
}
```
