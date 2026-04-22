# Swiftera Frontend - Next.js Customer Portal & Dashboard

## Giới thiệu
Đây là ứng dụng web frontend cho hệ thống Swiftera, cung cấp nền tảng cho khách hàng thuê thiết bị công nghệ và cổng quản lý (Dashboard) dành cho Staff/Admin. Hệ thống mang lại trải nghiệm người dùng hiện đại, tốc độ cao, hiển thị tình trạng kho hàng thực tế (real-time availability) và quy trình checkout thuận tiện.

## Tech Stack
- **Core**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion (Animations)
- **Data Fetching / State Management**: TanStack Query (React Query) + Zustand
- **Forms & Validation**: React Hook Form + Zod
- **API Client**: Axios

## Cấu trúc thư mục chính
- `src/app/`: Định tuyến (Routing) của Next.js App Router (Chứa cả logic Server Components và Client Components).
  - `(customer)/`: Trang dành cho khách hàng.
  - `dashboard/`: Bảng điều khiển quản trị (Admin/Staff).
- `src/components/`: Các components UI dùng chung.
  - `ui/`: Các component cơ bản (thường được gen bởi shadcn/ui).
- `src/features/`: Chứa các tính năng phức tạp, cô lập logic, hooks, và view theo Domain Driven Design (e.g. `rental-orders`, `rental-checkout`).
- `src/hooks/`: Custom hooks dùng chung (như hooks gọi API).
- `src/stores/`: Zustand stores quản lý Global State (e.g. `auth-store.ts`, `cart-store.ts`).
- `src/api/`: Khai báo các API client requests (Axios setup).
- `src/types/`: TypeScript definitions dùng chung.

## Yêu cầu môi trường
- **Node.js**: v18.17.0 trở lên
- **Package Manager**: npm (v9+) hoặc pnpm/yarn

## Hướng dẫn cài đặt (Local Development)

### 1. Clone dự án
```bash
git clone <repo_url>
cd Swiftera-v2-frontend-nextjs
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường (.env)
Tạo file `.env.local` ở thư mục gốc (hoặc copy từ file `.env.example` nếu có):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```
- `NEXT_PUBLIC_API_URL`: Base URL kết nối đến Swiftera Spring Boot Backend. Đảm bảo backend đang chạy trên cổng này.

### 4. Chạy ứng dụng (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại `http://localhost:3000`.

### 5. Build & Lint (Production)
```bash
# Kiểm tra lỗi type (Rất quan trọng trước khi build)
npx tsc --noEmit

# Chạy Linter & Formatter
npm run lint
npx prettier --write "src/**/*.{ts,tsx,css}"

# Build bản Production
npm run build

# Chạy bản Production
npm start
```

## Các lưu ý quan trọng về hệ thống
- **Authentication**: Dùng JWT Token. Token được lưu trữ và quản lý qua Zustand `auth-store` và được Axios interceptors tự động đính kèm vào mỗi request.
- **Trạng thái đơn hàng (Order Actions)**: Logic ẩn hiện các nút "Hủy đơn" và "Gia hạn" được quản lý nghiêm ngặt tại `page.tsx` và `use-rental-order-management.ts` dựa trên Enum trạng thái lấy từ backend.
- **Giỏ hàng (Cart)**: Quản lý tại local bằng Zustand, không cần lưu phía database cho đến khi user checkout.
- **Formating**: Tuân thủ chuẩn `Prettier` trước khi commit. Mọi file TS/TSX nên được format để tránh conflict.

## Lỗi thường gặp
- **Network Error / CORS**: Đảm bảo Backend đã cấu hình CORS cho phép origin `http://localhost:3000`.
- **TypeError khi Build**: Next.js cực kỳ nghiêm ngặt về TypeScript. Hãy chạy `npx tsc --noEmit` và xử lý mọi TS error (đặc biệt là các interface Props bị thiếu) trước khi push code.
