# Swiftera Frontend

Frontend cho dự án Swiftera, xây dựng bằng **Next.js (App Router)** + **React** + **TailwindCSS**.

## Yêu cầu môi trường

- **Node.js**: khuyến nghị **v20+**
- **npm**: khuyến nghị **v9+** (hoặc mới hơn)


## Cài đặt

Tại thư mục dự án:

```bash
npm install
```

## Chạy dự án (Development)

```bash
npm run dev
```

Mặc định chạy ở `http://localhost:3000`.

## Build & chạy Production

Build:

```bash
npm run build
```

Chạy production server:

```bash
npm run start
```

## Scripts

- **dev**: chạy local dev server
- **build**: build production
- **start**: chạy production server từ output build
- **lint**: chạy ESLint

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```
