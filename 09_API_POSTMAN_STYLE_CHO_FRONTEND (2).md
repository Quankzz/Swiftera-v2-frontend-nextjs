# 09. API Postman-Style for Frontend

## Common Conventions

| Ký hiệu    | Ý nghĩa                                                  |
| ---------- | -------------------------------------------------------- |
| `[PUBLIC]` | Endpoint công khai, **không** cần `Authorization` header |
| `[AUTH]`   | Cần `Authorization: Bearer <access_token>`               |

**Base URL**: `/api/v1`

**Response wrapper chuẩn** (tất cả response bọc trong):

```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "data": {},
  "meta": { "timestamp": "2026-03-24T10:00:00Z", "instance": "/api/v1/..." }
}
```

**Response lỗi**:

```json
{
  "success": false,
  "errors": [{ "code": 1001, "message": "Mô tả lỗi" }],
  "meta": { "timestamp": "...", "instance": "..." }
}
```

**Pagination request params**:

```
?page=1&size=10&sort=createdAt,desc
```

**Lưu ý**: Backend đang bật `one-indexed-parameters`, nên trang đầu tiên là `page=1`.

**Filter query (SpringFilter DSL)** - ví dụ:

```
?filter=name:'Canon' and isActive:true
```

---

## Module 1: AUTH (9 APIs)

---

### API-001: Đăng ký tài khoản [PUBLIC]

- **Method**: `POST`
- **URL**: `/api/v1/auth/register`

**Request body**:

```json
{
  "email": "user@gmail.com",
  "phoneNumber": "0912345678",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "firstName": "Nguyen",
  "lastName": "An"
}
```

| Field             | Bắt buộc | Validation                                             |
| ----------------- | -------- | ------------------------------------------------------ |
| `email`           | ✓        | email hợp lệ, chỉ @gmail.com hoặc @yopmail.com         |
| `phoneNumber`     | ✓        | số VN hợp lệ (0/+84 + đầu số hợp lệ + 7 số)            |
| `password`        | ✓        | >= 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt |
| `confirmPassword` | ✓        | phải khớp `password`                                   |
| `firstName`       | ✓        | 2–50 ký tự                                             |
| `lastName`        | ✓        | 2–50 ký tự                                             |

**Response**:

```json
{
  "success": true,
  "message": "Vui lòng kiểm tra email để xác thực tài khoản",
  "data": null
}
```

**Lỗi thường gặp**: `EMAIL_INVALID`, `PHONE_NUMBER_VN_INVALID`, `PASSWORD_INVALID_FORMAT`, `EMAIL_ALREADY_EXISTS`

---

### API-002: Xác thực email kích hoạt tài khoản [PUBLIC]

- **Method**: `POST`
- **URL**: `/api/v1/auth/verify-active-account`

**Request body**:

```json
{
  "token": "<jwt-token-trong-email>"
}
```

**Response** (set `refresh_token` HttpOnly cookie):

```json
{
  "success": true,
  "message": "Email của bạn đã được xác thực thành công",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "userSecured": {
      "userId": "d4f6e5a8-43d4-4d08-84d4-57e8f99e0b11",
      "email": "user@gmail.com",
      "firstName": "Nguyen",
      "lastName": "An",
      "nickname": null,
      "phoneNumber": "0912345678",
      "biography": null,
      "avatarUrl": null,
      "city": null,
      "nationality": null,
      "isVerified": true,
      "rolesSecured": [
        {
          "roleId": "...",
          "name": "CUSTOMER_ROLE",
          "description": "...",
          "active": true
        }
      ],
      "createdAt": "2026-03-24 10:00:00 AM",
      "updatedAt": "2026-03-24 10:00:00 AM"
    }
  }
}
```

---

### API-003: Gửi lại email xác thực [PUBLIC]

- **Method**: `POST`
- **URL**: `/api/v1/auth/resend-verify`

**Request body**:

```json
{
  "email": "user@gmail.com"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư đến",
  "data": null
}
```

---

### API-004: Đăng nhập [PUBLIC]

- **Method**: `POST`
- **URL**: `/api/v1/auth/login`

**Request body** (dùng `email` HOẶC `phoneNumber`):

```json
{
  "email": "user@gmail.com",
  "password": "Password@123"
}
```

**Response** (set `refresh_token` HttpOnly cookie):

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "userSecured": {
      "userId": "d4f6e5a8-43d4-4d08-84d4-57e8f99e0b11",
      "email": "user@gmail.com",
      "firstName": "Nguyen",
      "lastName": "An",
      "nickname": null,
      "phoneNumber": "0912345678",
      "biography": null,
      "avatarUrl": null,
      "city": null,
      "nationality": null,
      "isVerified": true,
      "rolesSecured": [
        {
          "roleId": "...",
          "name": "CUSTOMER_ROLE",
          "description": "...",
          "active": true
        }
      ],
      "createdAt": "2026-03-24 10:00:00 AM",
      "updatedAt": "2026-03-24 10:00:00 AM"
    }
  }
}
```

**Lỗi thường gặp**: `USER_NOT_FOUND`, `PASSWORD_INCORRECT`, `ACCOUNT_NOT_VERIFIED`

---

### API-005: Đăng xuất [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/auth/logout`

**Request body**: không có

**Response** (xóa `refresh_token` cookie):

```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### API-006: Lấy thông tin tài khoản hiện tại [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/auth/account`

**Response**:

```json
{
  "success": true,
  "message": "Lấy thông tin người dùng đã xác thực thành công",
  "data": {
    "userId": "d4f6e5a8-43d4-4d08-84d4-57e8f99e0b11",
    "email": "user@gmail.com",
    "firstName": "Nguyen",
    "lastName": "An",
    "nickname": "nguyenan",
    "phoneNumber": "0912345678",
    "biography": null,
    "avatarUrl": null,
    "city": null,
    "nationality": null,
    "isVerified": true,
    "rolesSecured": [
      {
        "roleId": "...",
        "name": "CUSTOMER_ROLE",
        "description": "...",
        "active": true
      }
    ],
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-007: Lấy access token mới từ refresh token [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/auth/refresh`
- **Cookie bắt buộc**: `refresh_token=<refresh-token>`

**Response** (gia hạn cookie, trả access token mới):

```json
{
  "success": true,
  "message": "Lấy thành công refresh token và access token",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "userSecured": { "...": "..." }
  }
}
```

---

### API-008: Quên mật khẩu [PUBLIC]

- **Method**: `POST`
- **URL**: `/api/v1/auth/forgot-password`

**Request body**:

```json
{
  "email": "user@gmail.com"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Vui lòng kiểm tra email để đặt lại mật khẩu",
  "data": null
}
```

---

### API-009: Đặt lại mật khẩu [PUBLIC]

- **Method**: `POST`
- **URL**: `/api/v1/auth/reset-password`

**Request body**:

```json
{
  "token": "<jwt-token-trong-email>",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại",
  "data": null
}
```

---

## Module 2: USERS (10 APIs)

---

### API-010: Cập nhật hồ sơ cá nhân [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/users/update-profile`

**Request body** (tất cả tùy chọn):

```json
{
  "firstName": "Van A",
  "lastName": "Nguyen",
  "nickname": "vana2026",
  "avatarUrl": "https://cdn.example.com/avatar.jpg",
  "biography": "Yêu công nghệ và phim ảnh",
  "city": "Ho Chi Minh",
  "nationality": "Vietnamese"
}
```

**Response**: `UserSecureResponse` (xem API-006)

---

### API-011: Đổi mật khẩu [AUTH]

- **Method**: `PUT`
- **URL**: `/api/v1/users/update-password`

**Request body**:

```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

**Response**: `UserSecureResponse` (xem API-006)

---

### API-012: Yêu cầu đổi email [AUTH]

- **Method**: `PUT`
- **URL**: `/api/v1/users/update-email`

**Request body**:

```json
{
  "newEmail": "newemail@gmail.com"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Vui lòng kiểm tra email mới để xác thực và hoàn tất cập nhật",
  "data": null
}
```

---

### API-013: Xác thực token đổi email [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/users/verify-change-email`

**Request body**:

```json
{
  "token": "<jwt-token-trong-email>"
}
```

**Response**: `UserSecureResponse` (xem API-006)

---

### API-014: Lấy thông tin user theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/users/{userId}`

**Response**:

```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "userId": "d4f6e5a8-43d4-4d08-84d4-57e8f99e0b11",
    "email": "user@gmail.com",
    "firstName": "Nguyen",
    "lastName": "An",
    "nickname": null,
    "phoneNumber": "0912345678",
    "biography": null,
    "avatarUrl": null,
    "city": null,
    "nationality": null,
    "isVerified": true,
    "rolesSecured": [
      {
        "roleId": "...",
        "name": "CUSTOMER_ROLE",
        "description": "...",
        "active": true
      }
    ],
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-015: Lấy danh sách user [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/users?page=1&size=10&sort=createdAt,desc&filter=email:'user@gmail.com'`

**Response**:

```json
{
  "success": true,
  "message": "Lấy danh sách người dùng thành công với bộ lọc truy vấn",
  "data": {
    "meta": {
      "currentPage": 1,
      "pageSize": 10,
      "totalPages": 5,
      "totalElements": 48,
      "hasNext": true,
      "hasPrevious": false
    },
    "content": [
      {
        "userId": "...",
        "email": "...",
        "firstName": "...",
        "lastName": "...",
        "nickname": null,
        "phoneNumber": "...",
        "isVerified": true,
        "rolesSecured": []
      }
    ]
  }
}
```

---

### API-016: Cập nhật user (admin) [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/users/{userId}`

**Request body** (tất cả tùy chọn):

```json
{
  "firstName": "Nguyen",
  "lastName": "B",
  "email": "newadmin@gmail.com",
  "phoneNumber": "0987654321",
  "nickname": "adminb",
  "isVerified": true,
  "roleIds": ["role-uuid-1"]
}
```

**Response**: `UserResponse` — gồm `userId`, `email`, `firstName`, `lastName`, `nickname`, `phoneNumber`, `biography`, `avatarUrl`, `city`, `nationality`, `isVerified`, `roles[]` (kèm đầy đủ permissions)

---

### API-017: Xóa tài khoản user [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/users/{userId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa tài khoản người dùng thành công",
  "data": null
}
```

---

### API-018: Xóa vai trò khỏi user [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/users/{userId}/roles`

**Request body**:

```json
{
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Loại bỏ vai trò khỏi người dùng thành công",
  "data": null
}
```

---

### API-019: Yêu cầu nâng cấp lên STAFF [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/users/staff-requests`

**Request body**: không có

**Response**: `UserSecureResponse` (roles đã có thêm STAFF_ROLE)

---

## Module 3: ROLES (6 APIs)

---

### API-020: Tạo vai trò mới [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/roles`

**Request body**:

```json
{
  "name": "MODERATOR_ROLE",
  "description": "Vai trò kiểm duyệt nội dung",
  "active": true,
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
}
```

**Response**:

```json
{
  "data": {
    "roleId": "r-uuid-001",
    "name": "MODERATOR_ROLE",
    "description": "Vai trò kiểm duyệt nội dung",
    "active": true,
    "permissions": [
      {
        "permissionId": "...",
        "name": "...",
        "apiPath": "...",
        "httpMethod": "GET",
        "module": "..."
      }
    ],
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-021: Lấy thông tin vai trò theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/roles/{roleId}`

**Response**: `RoleResponse` (xem API-020)

---

### API-022: Lấy danh sách vai trò [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/roles?page=1&size=10`

**Response**: `PaginationResponse` chứa mảng `RoleResponse`

---

### API-023: Cập nhật vai trò [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/roles/{roleId}`

**Request body** (tất cả tùy chọn):

```json
{
  "name": "MODERATOR_ROLE_V2",
  "description": "Cập nhật mô tả",
  "active": false,
  "permissionIds": ["perm-uuid-3"]
}
```

**Response**: `RoleResponse`

---

### API-024: Xóa permission khỏi vai trò [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/roles/{roleId}/permissions`

**Request body**:

```json
{
  "permissionIds": ["perm-uuid-1"]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Xóa quyền khỏi vai trò thành công",
  "data": null
}
```

---

### API-025: Xóa vai trò [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/roles/{roleId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa vai trò thành công",
  "data": null
}
```

---

## Module 4: PERMISSIONS (8 APIs)

---

### API-026: Tạo module cho nhóm permission [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/permissions/module`

**Request body**:

```json
{
  "moduleName": "ANALYTICS",
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
}
```

**Response**: mảng `PermissionResponse`

```json
{
  "data": [
    {
      "permissionId": "...",
      "name": "...",
      "apiPath": "...",
      "httpMethod": "GET",
      "module": "ANALYTICS"
    }
  ]
}
```

---

### API-027: Xóa module theo tên [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/permissions/module/{name}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa module thành công",
  "data": null
}
```

---

### API-028: Lấy danh sách tên module [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/permissions/modules`

**Response**:

```json
{
  "data": [
    "AUTH",
    "USERS",
    "ROLES",
    "PERMISSIONS",
    "FILES",
    "HUBS",
    "CATEGORIES",
    "PRODUCTS",
    "INVENTORY",
    "CART",
    "VOUCHERS",
    "RENTAL_ORDERS",
    "PAYMENTS",
    "CONTRACTS",
    "REVIEWS",
    "TICKETS",
    "DASHBOARDS",
    "POLICIES"
  ]
}
```

---

### API-029: Tạo permission mới [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/permissions`

**Request body**:

```json
{
  "name": "Xem báo cáo doanh thu",
  "apiPath": "/api/v1/reports/revenue",
  "httpMethod": "GET",
  "module": "ANALYTICS"
}
```

**Response**:

```json
{
  "data": {
    "permissionId": "p-uuid-001",
    "name": "Xem báo cáo doanh thu",
    "apiPath": "/api/v1/reports/revenue",
    "httpMethod": "GET",
    "module": "ANALYTICS",
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-030: Cập nhật permission [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/permissions/{permissionId}`

**Request body** (tất cả tùy chọn):

```json
{
  "name": "Tên mới",
  "apiPath": "/api/v1/new-path",
  "httpMethod": "POST",
  "module": "ANALYTICS"
}
```

**Response**: `PermissionResponse`

---

### API-031: Lấy permission theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/permissions/{permissionId}`

**Response**: `PermissionResponse`

---

### API-032: Lấy danh sách permission [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/permissions?page=1&size=20&filter=module:'CART'`

**Response**: `PaginationResponse` chứa mảng `PermissionResponse`

---

### API-033: Xóa permission [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/permissions/{permissionId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa quyền thành công",
  "data": null
}
```

---

## Module 5: FILES — Azure Blob Storage (6 APIs)

---

### API-034: Upload một file [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/storage/azure-blob/upload/single`
- **Content-Type**: `multipart/form-data`

**Form data**:

```
file: <binary file>
folderName: "products"   (tùy chọn, mặc định AZURE_STORAGE_CONTAINER_NAME)
```

**Accepted MIME types**:

- `image/jpeg`, `image/png`, `image/jpg`, `audio/mpeg`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Nếu client gửi `application/octet-stream` cho PDF/DOC/DOCX, backend sẽ fallback nhận diện theo phần mở rộng filename.

**Response**:

```json
{
  "success": true,
  "message": "Tải lên tệp đơn thành công",
  "data": {
    "fileName": "canon-r50.jpg",
    "fileUrl": "https://<storage-account>.blob.core.windows.net/<container>/products/canon-r50.jpg"
  }
}
```

---

### API-035: Upload nhiều file [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/storage/azure-blob/upload/multiple`
- **Content-Type**: `multipart/form-data`

**Form data**:

```
files: <binary file 1>
files: <binary file 2>
folderName: "products"
```

**Accepted MIME types**: giống API-034.

**Response**:

```json
{
  "data": {
    "files": [
      { "fileName": "img1.jpg", "fileUrl": "https://..." },
      { "fileName": "img2.jpg", "fileUrl": "https://..." }
    ]
  }
}
```

---

### API-036: Xóa một file [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/storage/azure-blob/delete/single?filePath=products/canon-r50.jpg`

**Response**:

```json
{
  "success": true,
  "message": "Xóa tệp thành công",
  "data": null
}
```

---

### API-037: Xóa nhiều file [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/storage/azure-blob/delete/multiple`

**Request body**:

```json
{
  "filePaths": ["products/img1.jpg", "products/img2.jpg"]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Xóa nhiều tệp thành công",
  "data": null
}
```

---

### API-038: Di chuyển một file [AUTH]

- **Method**: `PUT`
- **URL**: `/api/v1/storage/azure-blob/move/single`

**Request body**:

```json
{
  "sourceKey": "temp/img1.jpg",
  "destinationFolder": "products"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Di chuyển tệp thành công",
  "data": "Tệp đã được di chuyển từ: temp/img1.jpg đến thư mục: products"
}
```

---

### API-039: Di chuyển nhiều file [AUTH]

- **Method**: `PUT`
- **URL**: `/api/v1/storage/azure-blob/move/multiple`

**Request body**:

```json
{
  "sourceKeys": ["temp/img1.jpg", "temp/img2.jpg"],
  "destinationFolder": "products"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Di chuyển nhiều tệp thành công",
  "data": "Các tệp đã được di chuyển tới thư mục: products"
}
```

---

## Module 6: HUBS (7 APIs)

---

### API-040: Tạo hub mới [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/hubs`

**Request body**:

```json
{
  "code": "HCM-01",
  "name": "Hub Hồ Chí Minh - Quận 1",
  "addressLine": "123 Lê Lợi",
  "ward": "Phường Bến Nghé",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "phone": "02812345678"
}
```

| Field                                                                       | Bắt buộc |
| --------------------------------------------------------------------------- | -------- |
| `code`                                                                      | ✓        |
| `name`                                                                      | ✓        |
| `addressLine`, `ward`, `district`, `city`, `latitude`, `longitude`, `phone` | tùy chọn |

**Validation phone**: nếu truyền `phone`, bắt buộc đúng chuẩn E.164 (ví dụ `+842812345678`), sai định dạng trả `HUB_PHONE_INVALID`.

**Response**:

```json
{
  "data": {
    "hubId": "h1a2b3c4-...",
    "code": "HCM-01",
    "name": "Hub Hồ Chí Minh - Quận 1",
    "addressLine": "123 Lê Lợi",
    "ward": "Phường Bến Nghé",
    "district": "Quận 1",
    "city": "Hồ Chí Minh",
    "latitude": 10.7769,
    "longitude": 106.7009,
    "phone": "02812345678",
    "isActive": true,
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-041: Lấy hub theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/hubs/{hubId}`

**Response**: `HubResponse` (xem API-040)

---

### API-042: Lấy danh sách hub [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/hubs?page=1&size=10&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `HubResponse`

**Ghi chú**:

- API này là public, không cần token.
- Để hiển thị cho người dùng cuối, FE nên truyền `filter=isActive:true`.
- Nếu không truyền `filter`, backend vẫn trả theo đúng query/paging (có thể gồm cả hub `isActive:false`).

---

### API-043: Lấy danh sách nhân viên theo hub [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/hubs/{hubId}/staff?activeOnly=false`

| Query param  | Bắt buộc | Ý nghĩa                                                                              |
| ------------ | -------- | ------------------------------------------------------------------------------------ |
| `activeOnly` | tùy chọn | `true`: chỉ lấy staff đã verify và role active; `false`: lấy toàn bộ staff thuộc hub |

**Response**: `HubStaffResponse[]`

Ví dụ response:

```json
{
  "data": [
    {
      "userId": "staff-uuid-001",
      "email": "staff1@swiftera2.io.vn",
      "firstName": "Nguyen",
      "lastName": "A",
      "nickname": "shipper-a",
      "phoneNumber": "+84901234567",
      "avatarUrl": null,
      "isVerified": true,
      "hubId": "h1a2b3c4-...",
      "hubCode": "HCM-01",
      "hubName": "Hub Hồ Chí Minh - Quận 1"
    }
  ]
}
```

---

### API-044: Cập nhật hub [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/hubs/{hubId}`

**Request body** (tất cả tùy chọn):

```json
{
  "name": "Hub Q1 Updated",
  "addressLine": "456 Nguyễn Huệ",
  "ward": "Phường Bến Nghé",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "latitude": 10.779,
  "longitude": 106.7,
  "phone": "02888888888",
  "isActive": false
}
```

**Validation phone**: nếu truyền `phone`, bắt buộc đúng chuẩn E.164, sai định dạng trả `HUB_PHONE_INVALID`.

**Response**: `HubResponse`

---

### API-045: Xóa hub [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/hubs/{hubId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa hub thành công",
  "data": null
}
```

---

## Module 7: CATEGORIES (6 APIs)

---

### API-046: Tạo danh mục [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/categories`

**Request body**:

```json
{
  "parentId": null,
  "name": "Máy ảnh",
  "imageUrl": "https://cdn.example.com/categories/camera.jpg",
  "sortOrder": 1
}
```

| Field                               | Bắt buộc |
| ----------------------------------- | -------- |
| `name`                              | ✓        |
| `parentId`, `imageUrl`, `sortOrder` | tùy chọn |

**Rule `sortOrder` khi tạo**:

- Nếu bỏ trống `sortOrder`: backend tự gán vào cuối danh sách sibling (cùng `parentId`).
- Nếu truyền `sortOrder`: backend chèn vào vị trí đó và tự dồn thứ tự các sibling còn lại.
- `sortOrder` phải `>= 1`, nếu không sẽ trả lỗi `CATEGORY_SORT_ORDER_MIN_1`.

**Rule `parentId` khi tạo**:

- `null` hoặc bỏ trống: tạo category root.
- Có giá trị: phải là category cha tồn tại, nếu không lỗi `CATEGORY_PARENT_NOT_FOUND`.

**Response**:

```json
{
  "data": {
    "categoryId": "cat-uuid-001",
    "parentId": null,
    "name": "Máy ảnh",
    "imageUrl": "https://cdn.example.com/categories/camera.jpg",
    "sortOrder": 1,
    "isActive": true,
    "children": [],
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-047: Lấy danh mục theo ID [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/categories/{categoryId}`

**Response**: `CategoryResponse` (xem API-046)

---

### API-048: Lấy danh sách danh mục [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/categories?page=1&size=20&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `CategoryResponse`

**Ghi chú**:

- API này trả danh sách phẳng (flat), **không build `children` đệ quy** để tránh trùng chức năng với API cây danh mục.
- Dùng API này cho admin table/filter/pagination.

---

### API-049: Lấy cây danh mục (toàn bộ phân cấp) [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/categories/tree`

**Response**:

```json
{
  "data": [
    {
      "categoryId": "cat-uuid-001",
      "name": "Máy ảnh",
      "imageUrl": "https://cdn.example.com/categories/camera.jpg",
      "sortOrder": 1,
      "isActive": true,
      "children": [
        {
          "categoryId": "cat-uuid-002",
          "name": "Mirrorless",
          "imageUrl": "https://cdn.example.com/categories/mirrorless.jpg",
          "isActive": true,
          "children": []
        }
      ]
    }
  ]
}
```

---

### API-050: Cập nhật danh mục [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/categories/{categoryId}`

**Request body** (tất cả tùy chọn):

```json
{
  "parentId": "parent-uuid",
  "name": "Máy ảnh & Camcorder",
  "imageUrl": "https://cdn.example.com/categories/camera-camcorder.jpg",
  "sortOrder": 2,
  "isActive": true
}
```

**Rule `parentId` khi update**:

- Không gửi field `parentId`: giữ nguyên cha hiện tại.
- Gửi `"parentId": null` (hoặc chuỗi rỗng): chuyển thành category root.
- Gửi `parentId` khác: chuyển category sang cha mới.
- Không được tự trỏ vào chính nó hoặc trỏ vào node con của chính nó (chặn vòng lặp), lỗi `CATEGORY_CIRCULAR_REFERENCE`.
- Không dùng sentinel `9999` (number hoặc string) để đại diện root. FE chỉ dùng `null`/chuỗi rỗng cho root; nếu gửi `9999` backend coi là parent không tồn tại và trả `CATEGORY_PARENT_NOT_FOUND`.

**Rule `sortOrder` khi update**:

- Nếu chỉ đổi `sortOrder` (cùng cha): backend reorder lại toàn bộ sibling cùng cha, không tạo xung đột thứ tự.
- Nếu đổi cha và không gửi `sortOrder`: category được đưa xuống cuối danh sách của cha mới.
- Nếu đổi cha và có `sortOrder`: backend chèn đúng vị trí trong cha mới và tự reindex sibling.
- `sortOrder` phải `>= 1`, nếu không lỗi `CATEGORY_SORT_ORDER_MIN_1`.

**Response**: `CategoryResponse`

**Lưu ý ổn định request binding (API-050)**:

- Backend đã bỏ constructor/builder positional ở `UpdateCategoryRequest`, deserialize theo setter-field để tránh map nhầm kiểu.
- `parentId` chỉ nên gửi đúng 3 dạng: bỏ field, `null`/`""`, hoặc một `categoryId` hợp lệ. Không gửi giá trị "đặc biệt" để ép root.

---

### API-051: Xóa danh mục [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/categories/{categoryId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa danh mục thành công",
  "data": null
}
```

**Business logic khi xóa**:

- Nếu category đang có sản phẩm trực tiếp: chặn xóa, lỗi `CATEGORY_HAS_PRODUCTS`.
- Nếu category có category con trực tiếp: backend tự nâng các con lên cùng cấp với category bị xóa (cha của node bị xóa), giữ thứ tự tương đối của nhóm con.
- Sau khi xóa, backend reindex `sortOrder` liên tục trong nhóm sibling đích để không bị trùng/lệch.

---

## Module 8: PRODUCTS (6 APIs)

---

### API-052: Tạo sản phẩm [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/products`

**Request body**:

```json
{
  "categoryId": "cat-uuid-mirrorless",
  "brand": "Canon",
  "voucherId": "voucher-product-discount-uuid",
  "name": "Canon EOS R50",
  "shortDescription": "Mirrorless APS-C nhỏ gọn, phù hợp đi du lịch",
  "description": "Máy ảnh mirrorless APS-C 24.2MP dành cho người mới bắt đầu",
  "dailyPrice": 250000,
  "oldDailyPrice": 300000,
  "depositAmount": 5000000,
  "minRentalDays": 1,
  "colors": [
    {
      "name": "Black",
      "code": "#111111"
    },
    {
      "name": "Silver",
      "code": "#C0C0C0"
    }
  ],
  "imageUrls": [
    "https://cdn.example.com/products/canon-r50-front.jpg",
    "https://cdn.example.com/products/canon-r50-back.jpg"
  ]
}
```

| Field                                                                                                            | Bắt buộc |
| ---------------------------------------------------------------------------------------------------------------- | -------- |
| `categoryId`                                                                                                     | ✓        |
| `name`                                                                                                           | ✓        |
| `dailyPrice`                                                                                                     | ✓, > 0   |
| `depositAmount`                                                                                                  | ✓, >= 0  |
| `brand`, `voucherId`, `shortDescription`, `description`, `oldDailyPrice`, `minRentalDays`, `colors`, `imageUrls` | tùy chọn |

**Rule giá**:

- Nếu có `oldDailyPrice` thì phải `>= dailyPrice`, nếu không backend trả lỗi `PRODUCT_OLD_DAILY_PRICE_INVALID`.

**Response**:

```json
{
  "data": {
    "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
    "categoryId": "cat-uuid-mirrorless",
    "categoryName": "Mirrorless",
    "brand": "Canon",
    "voucherId": "voucher-product-discount-uuid",
    "voucher": {
      "voucherId": "voucher-product-discount-uuid",
      "code": "CAMERA10",
      "type": "PRODUCT_DISCOUNT",
      "productName": "Canon EOS R50",
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "maxDiscountAmount": 200000,
      "minRentalDays": 1,
      "expiresAt": "2026-12-31 11:59:59 PM",
      "isActive": true
    },
    "colors": [
      {
        "productColorId": "pc-black-r50",
        "name": "Black",
        "code": "#111111",
        "quantity": 4,
        "availableQuantity": 3
      },
      {
        "productColorId": "pc-silver-r50",
        "name": "Silver",
        "code": "#C0C0C0",
        "quantity": 2,
        "availableQuantity": 1
      }
    ],
    "name": "Canon EOS R50",
    "shortDescription": "Mirrorless APS-C nhỏ gọn, phù hợp đi du lịch",
    "description": "Máy ảnh mirrorless APS-C 24.2MP dành cho người mới bắt đầu",
    "dailyPrice": 250000,
    "oldDailyPrice": 300000,
    "depositAmount": 5000000,
    "minRentalDays": 1,
    "isActive": true,
    "images": [],
    "availableStock": 0,
    "averageRating": 0.0,
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**Lưu ý**: `images` là mảng `ProductImageResponse[]` mỗi phần tử: `{ productImageId, imageUrl, sortOrder, isPrimary }`

**Lưu ý thêm**:

- `colors[]` là nguồn dữ liệu màu chuẩn cho FE; `ProductResponse` không còn trả field `color`.
- FE không gửi `color` ở request create/update product nữa; backend đồng bộ dữ liệu màu từ `colors[]`.
- `voucherId` là liên kết tùy chọn tới voucher loại `PRODUCT_DISCOUNT`; response trả thêm `voucher` đầy đủ thông tin để FE hiển thị trực tiếp, backend vẫn không tự tính lại `dailyPrice` hoặc `oldDailyPrice`.
- Nếu update có truyền `colors[]`, backend sẽ sync lại full danh sách màu của product theo payload mới.

---

### API-053: Lấy sản phẩm theo ID [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/products/{productId}`

**Response**: `ProductResponse` (xem API-052) + thêm `inventoryItems[]` ở API detail

Mỗi phần tử `inventoryItems` gồm:

- `inventoryItemId`, `serialNumber`, `status`, `conditionGrade`, `staffNote`, `hubId`, `hubCode`, `hubName`, `productColorId`, `colorName`, `colorCode`

---

### API-054: Lấy danh sách sản phẩm [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/products?page=1&size=12&sort=createdAt,desc&filter=isActive:true and categoryId:'cat-uuid-camera-root'&includeDescendants=true`

**Response**: `PaginationResponse` chứa mảng `ProductResponse`

**Ghi chú**:

- `includeDescendants=true` chỉ có tác dụng khi filter có điều kiện theo `categoryId` dạng SpringFilter DSL.
- Nếu không truyền `includeDescendants`, backend vẫn giữ behavior cũ: chỉ match category trực tiếp.
- Nếu cần lấy catalog theo từng hub cụ thể (public endpoint), dùng API-121: `GET /api/v1/products/hub/{hubId}`.

---

### API-055: Cập nhật sản phẩm [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/products/{productId}`

**Request body** (tất cả tùy chọn):

```json
{
  "categoryId": "cat-uuid-new",
  "brand": "Canon",
  "voucherId": "voucher-product-discount-uuid",
  "name": "Canon EOS R50 Silver",
  "shortDescription": "Bản màu bạc, phù hợp chụp vlog",
  "description": "Phiên bản màu bạc",
  "dailyPrice": 270000,
  "oldDailyPrice": 300000,
  "depositAmount": 5500000,
  "minRentalDays": 2,
  "colors": [
    {
      "productColorId": "pc-black-r50",
      "name": "Black",
      "code": "#111111"
    },
    {
      "productColorId": "pc-silver-r50",
      "name": "Silver",
      "code": "#C0C0C0"
    },
    {
      "name": "White",
      "code": "#F5F5F5"
    }
  ],
  "imageUrls": ["https://cdn.example.com/products/canon-r50-silver-front.jpg"],
  "isActive": true
}
```

**Rule giá**:

- Khi update, backend cũng kiểm tra `oldDailyPrice >= dailyPrice` trên giá trị cuối cùng sau cập nhật.
- Muốn bỏ liên kết voucher `PRODUCT_DISCOUNT` hiện tại khỏi product, FE có thể gửi `voucherId` là chuỗi rỗng.

**Response**: `ProductResponse`

**Lưu ý**: `ProductResponse` trả cả `voucherId` và object `voucher` đầy đủ thông tin khi product đang gắn voucher `PRODUCT_DISCOUNT`.

---

### API-056: Xóa sản phẩm [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/products/{productId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công",
  "data": null
}
```

**Lưu ý**: nếu product đang có voucher liên kết, backend sẽ tự gỡ liên kết voucher trước khi xóa product.

---

## Module 9: INVENTORY ITEMS (5 APIs)

---

### API-057: Tạo mục kho (serial) [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/inventory-items`

**Request body**:

```json
{
  "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
  "hubId": "h1a2b3c4-...",
  "productColorId": "pc-black-r50",
  "serialNumber": "CANON-R50-001",
  "conditionGrade": "NEW",
  "staffNote": "Mới nhập kho tháng 3/2026"
}
```

| Field            | Bắt buộc | Giá trị                                                     |
| ---------------- | -------- | ----------------------------------------------------------- |
| `productId`      | ✓        | UUID product                                                |
| `hubId`          | ✓        | UUID hub                                                    |
| `serialNumber`   | ✓        | chuỗi duy nhất                                              |
| `productColorId` | tùy chọn | UUID màu thuộc đúng product; bắt buộc nếu product có >1 màu |
| `conditionGrade` | tùy chọn | `NEW`, `GOOD`, `FAIR`, `POOR`                               |
| `staffNote`      | tùy chọn | ghi chú nội bộ                                              |

**Response**:

```json
{
  "data": {
    "inventoryItemId": "inv-uuid-001",
    "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
    "productName": "Canon EOS R50",
    "productColorId": "pc-black-r50",
    "colorName": "Black",
    "colorCode": "#111111",
    "hubId": "h1a2b3c4-...",
    "hubName": "Hub Hồ Chí Minh - Quận 1",
    "serialNumber": "CANON-R50-001",
    "status": "AVAILABLE",
    "conditionGrade": "NEW",
    "staffNote": "Mới nhập kho tháng 3/2026",
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**Ghi chú status**: `AVAILABLE`, `RESERVED`, `RENTED`, `MAINTENANCE`, `DAMAGED`, `RETIRED`

---

### API-058: Lấy mục kho theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/inventory-items/{inventoryItemId}`

**Response**: `InventoryItemResponse` (xem API-057)

---

### API-059: Lấy danh sách mục kho [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/inventory-items?page=1&size=20&filter=productId:'...' and status:'AVAILABLE'`

**Response**: `PaginationResponse` chứa mảng `InventoryItemResponse`

---

### API-060: Cập nhật mục kho [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/inventory-items/{inventoryItemId}`

**Request body** (tất cả tùy chọn):

```json
{
  "hubId": "hub-uuid-new",
  "productColorId": "pc-silver-r50",
  "status": "MAINTENANCE",
  "conditionGrade": "FAIR",
  "staffNote": "Còn vết xước nhẹ trên thân máy"
}
```

**Response**: `InventoryItemResponse`

---

### API-061: Xóa mục kho [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/inventory-items/{inventoryItemId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa phần tử kho thành công",
  "data": null
}
```

---

## Module 10: CART (5 APIs)

---

### API-062: Lấy giỏ hàng hiện tại [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/cart`

**Lưu ý**: Backend tự tạo cart nếu user chưa có.

**Response**:

```json
{
  "success": true,
  "message": "Lấy giỏ hàng thành công",
  "data": {
    "cartId": "c4ad3f0d-...",
    "userId": "d4f6e5a8-...",
    "cartLines": [
      {
        "cartLineId": "e6dcdf5e-...",
        "productId": "f3152824-...",
        "productColorId": "pc-black-r50",
        "colorName": "Black",
        "colorCode": "#111111",
        "productName": "Canon EOS R50",
        "productImageUrl": "https://cdn.example.com/canon-r50.jpg",
        "dailyPrice": 250000,
        "depositAmount": 5000000,
        "rentalDurationDays": 5,
        "quantity": 2,
        "rentalFeeAmount": 2500000,
        "depositHoldAmount": 10000000,
        "totalPayableAmount": 12500000,
        "lineTotal": 2500000,
        "availableVouchers": [
          {
            "voucherId": "v-item-001",
            "code": "CAMERA7",
            "type": "ITEM_VOUCHER",
            "productName": "Canon EOS R50",
            "discountType": "PERCENTAGE",
            "discountValue": 7,
            "maxDiscountAmount": 200000,
            "minRentalDays": 3,
            "expiresAt": "2026-12-31 11:59:59 PM",
            "isActive": true
          }
        ]
      }
    ],
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**Ghi chú**:

- `rentalFeeAmount = dailyPrice × quantity × rentalDurationDays`
- `depositAmount` là tiền cọc trên mỗi sản phẩm
- `depositHoldAmount = depositAmount × quantity`
- `totalPayableAmount = rentalFeeAmount + depositHoldAmount`
- `lineTotal` được giữ để tương thích ngược và hiện bằng `rentalFeeAmount`

---

### API-063: Thêm dòng vào giỏ [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/cart/lines`

**Request body**:

```json
{
  "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
  "productColorId": "pc-black-r50",
  "rentalDurationDays": 7,
  "quantity": 1
}
```

| Field                | Bắt buộc | Validation                         |
| -------------------- | -------- | ---------------------------------- |
| `productId`          | ✓        | UUID product đang active           |
| `productColorId`     | tùy chọn | bắt buộc nếu product có >1 màu     |
| `rentalDurationDays` | ✓        | >= 1 và >= `product.minRentalDays` |
| `quantity`           | tùy chọn | >= 1 (mặc định 1)                  |

**Merge logic**: Nếu đã có line cùng `productId`, cùng `productColorId` và cùng `rentalDurationDays`, quantity sẽ cộng thêm.

**Response**: `CartResponse` (xem API-062)

**Lỗi thường gặp**: `PRODUCT_NOT_FOUND`, `RENTAL_DURATION_DAYS_MIN_1`, `CART_RENTAL_MIN_DAYS`, `CART_QUANTITY_MIN_1`

---

### API-064: Cập nhật dòng giỏ [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/cart/lines/{cartLineId}`

**Request body** (tất cả tùy chọn):

```json
{
  "productColorId": "pc-silver-r50",
  "rentalDurationDays": 10,
  "quantity": 3
}
```

**Response**: `CartResponse` (xem API-062)

---

### API-065: Xóa một dòng giỏ [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/cart/lines/{cartLineId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "data": null
}
```

---

### API-066: Xóa toàn bộ giỏ [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/cart`

**Response**:

```json
{
  "success": true,
  "message": "Xóa giỏ hàng thành công",
  "data": null
}
```

---

## Module 11: VOUCHERS (7 APIs)

---

### API-067: Tạo voucher [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/vouchers`

**Request body**:

```json
{
  "code": "SUMMER30",
  "type": "ITEM_VOUCHER",
  "discountType": "PERCENTAGE",
  "discountValue": 30,
  "maxDiscountAmount": 500000,
  "minRentalDays": 3,
  "expiresAt": "2026-12-31T16:59:59Z"
}
```

| Field               | Bắt buộc | Giá trị                                |
| ------------------- | -------- | -------------------------------------- |
| `code`              | ✓        | mã voucher duy nhất                    |
| `type`              | ✓        | `ITEM_VOUCHER` hoặc `PRODUCT_DISCOUNT` |
| `discountType`      | ✓        | `PERCENTAGE` hoặc `FIXED`              |
| `discountValue`     | ✓        | > 0                                    |
| `maxDiscountAmount` | tùy chọn | giới hạn giảm tối đa (cho PERCENTAGE)  |
| `minRentalDays`     | tùy chọn | số ngày thuê tối thiểu để áp dụng      |
| `expiresAt`         | tùy chọn | ISO 8601 UTC                           |

**Validation quan trọng**:

- Nếu `discountType` không phải `PERCENTAGE` hoặc `FIXED`, backend trả `VOUCHER_DISCOUNT_TYPE_INVALID`.
- Nếu muốn gắn voucher `PRODUCT_DISCOUNT` vào product, FE dùng `voucherId` ở API-052/API-055 thay vì truyền `productId` ở đây.

**Response**:

```json
{
  "data": {
    "voucherId": "v-uuid-001",
    "code": "SUMMER30",
    "type": "ITEM_VOUCHER",
    "discountType": "PERCENTAGE",
    "discountValue": 30,
    "maxDiscountAmount": 500000,
    "minRentalDays": 3,
    "expiresAt": "2026-12-31 11:59:59 PM",
    "isActive": true,
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**Lưu ý**: `VoucherResponse` có thể trả thêm `productName` nếu voucher hiện đã được gắn với một product từ API product.

---

### API-068: Lấy voucher theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers/{voucherId}`

**Response**: `VoucherResponse` (xem API-067)

---

### API-069: Lấy voucher theo mã code [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers/code/{code}`

Ví dụ: `/api/v1/vouchers/code/SUMMER30`

**Response**: `VoucherResponse` (xem API-067)

---

### API-070: Kiểm tra và tính giảm giá voucher [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers/validate?code=SUMMER30&productId=f3152824-15dd-4c17-af69-c92089e86d22&rentalDurationDays=7&rentalSubtotalAmount=3500000`

| Query param            | Bắt buộc | Ý nghĩa                                     |
| ---------------------- | -------- | ------------------------------------------- |
| `code`                 | ✓        | mã voucher cần kiểm tra                     |
| `productId`            | tùy chọn | product target để check scope voucher       |
| `rentalDurationDays`   | ✓        | số ngày thuê của line/product target        |
| `rentalSubtotalAmount` | ✓        | subtotal trước giảm của line/product target |

**Response**:

```json
{
  "data": {
    "voucherId": "v-uuid-001",
    "code": "SUMMER30",
    "type": "ITEM_VOUCHER",
    "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
    "valid": true,
    "rentalSubtotalAmount": 3500000,
    "discountAmount": 500000,
    "rentalFeeAmount": 3000000,
    "rentalDurationDays": 7,
    "expiresAt": "2026-12-31T16:59:59Z"
  }
}
```

**Lỗi thường gặp**: `VOUCHER_NOT_FOUND`, `VOUCHER_INACTIVE`, `VOUCHER_EXPIRED`, `VOUCHER_MIN_RENTAL_DAYS_NOT_MET`, `VOUCHER_PRODUCT_SCOPE_INVALID`, `VOUCHER_ALREADY_USED`

---

### API-071: Lấy danh sách voucher [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers?page=1&size=10&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `VoucherResponse`

---

### API-072: Cập nhật voucher [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/vouchers/{voucherId}`

**Request body** (tất cả tùy chọn):

```json
{
  "type": "PRODUCT_DISCOUNT",
  "discountType": "FIXED",
  "discountValue": 200000,
  "maxDiscountAmount": null,
  "minRentalDays": 5,
  "expiresAt": "2027-06-30T16:59:59Z",
  "isActive": true
}
```

**Response**: `VoucherResponse`

**Lưu ý**: API này không còn nhận `productId`; việc gắn/bỏ voucher `PRODUCT_DISCOUNT` với product được thực hiện ở API-052/API-055 thông qua field `voucherId`.

---

### API-073: Xóa voucher [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/vouchers/{voucherId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa voucher thành công",
  "data": null
}
```

---

## Module 12: RENTAL ORDERS (13 APIs)

---

### API-074: Tạo đơn thuê [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/rental-orders`

**Request body**:

```json
{
  "userAddressId": "address-uuid-001",
  "expectedDeliveryDate": "2026-03-26",
  "orderLines": [
    {
      "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
      "productColorId": "pc-black-r50",
      "voucherCode": "CAMERA7",
      "quantity": 1,
      "rentalDurationDays": 5
    }
  ]
}
```

| Field                             | Bắt buộc | Validation                               |
| --------------------------------- | -------- | ---------------------------------------- |
| `userAddressId`                   | ✓        | địa chỉ tồn tại và thuộc user hiện tại   |
| `expectedDeliveryDate`            | ✓        | định dạng `YYYY-MM-DD`                   |
| `orderLines`                      | ✓        | không rỗng                               |
| `orderLines[].productId`          | ✓        | UUID product tồn tại, đang active        |
| `orderLines[].productColorId`     | tùy chọn | bắt buộc nếu product có >1 màu           |
| `orderLines[].voucherCode`        | tùy chọn | voucher line-level hợp lệ cho product đó |
| `orderLines[].quantity`           | ✓        | >= 1                                     |
| `orderLines[].rentalDurationDays` | ✓        | >= 1 và >= `minRentalDays` của product   |

**Tương thích ngược**:

- `voucherCode` top-level vẫn được backend chấp nhận cho đơn đúng 1 line; FE mới nên ưu tiên `orderLines[].voucherCode`.

**Response**:

```json
{
  "success": true,
  "message": "Tạo đơn thuê thành công",
  "data": {
    "rentalOrderId": "6cc84ef6-20e2-4c9d-bde0-d322d8a8bc11",
    "userId": "d4f6e5a8-...",
    "hubId": "h1a2b3c4-...",
    "hubCode": "HCM-01",
    "hubName": "Hub Hồ Chí Minh - Quận 1",
    "hubAddressLine": "123 Lê Lợi",
    "hubWard": "Phường Bến Nghé",
    "hubDistrict": "Quận 1",
    "hubCity": "Hồ Chí Minh",
    "hubLatitude": 10.7769,
    "hubLongitude": 106.7009,
    "hubPhone": "+842812345678",
    "userAddressId": "address-uuid-001",
    "userAddress": {
      "userAddressId": "address-uuid-001",
      "userId": "d4f6e5a8-...",
      "recipientName": "Nguyen Van A",
      "phoneNumber": "0988888888",
      "addressLine": "123 Nguyen Trai",
      "ward": "Phường 2",
      "district": "Quận 5",
      "city": "Hồ Chí Minh",
      "latitude": null,
      "longitude": null,
      "isDefault": true
    },
    "expectedDeliveryDate": "2026-03-26",
    "expectedRentalEndDate": "2026-04-02",
    "plannedDeliveryAt": null,
    "actualDeliveryAt": null,
    "actualRentalStartAt": null,
    "deliveredLatitude": null,
    "deliveredLongitude": null,
    "issueReportedAt": null,
    "issueReportNote": null,
    "plannedPickupAt": null,
    "actualRentalEndAt": null,
    "pickedUpAt": null,
    "pickedUpLatitude": null,
    "pickedUpLongitude": null,
    "status": "PENDING_PAYMENT",
    "rentalSubtotalAmount": 1250000,
    "voucherCodeSnapshot": "CAMERA7",
    "voucherDiscountAmount": 87500,
    "rentalFeeAmount": 1162500,
    "depositHoldAmount": 5000000,
    "totalPayableAmount": 6162500,
    "damagePenaltyAmount": null,
    "overduePenaltyAmount": null,
    "provisionalOverduePenaltyAmount": null,
    "penaltyChargeAmount": null,
    "depositRefundAmount": null,
    "totalPaidAmount": 0,
    "qrCode": null,
    "placedAt": "2026-03-24 10:00:00 AM",
    "rentalOrderLines": [
      {
        "rentalOrderLineId": "rol-uuid-001",
        "productId": "f3152824-...",
        "productColorId": "pc-black-r50",
        "colorNameSnapshot": "Black",
        "colorCodeSnapshot": "#111111",
        "productNameSnapshot": "Canon EOS R50",
        "inventoryItemId": "inv-uuid-001",
        "inventorySerialNumber": "CANON-R50-001",
        "dailyPriceSnapshot": 250000,
        "depositAmountSnapshot": 5000000,
        "rentalDurationDays": 5,
        "voucherCodeSnapshot": "CAMERA7",
        "voucherDiscountAmount": 87500,
        "checkoutConditionNote": null,
        "checkinConditionNote": null,
        "itemPenaltyAmount": 0,
        "photos": []
      }
    ],
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**Tổng hợp công thức tính tiền**:

- `rentalSubtotalAmount = sum(dailyPrice × quantity × rentalDurationDays)` cho từng line
- `rentalFeeAmount = rentalSubtotalAmount - voucherDiscountAmount`
- `depositHoldAmount = sum(depositAmount × quantity)` cho từng line
- `totalPayableAmount = rentalFeeAmount + depositHoldAmount`

**Ghi chú**:

- `voucherCodeSnapshot` ở cấp order là aggregate string các voucher line-level đã áp, có thể là 1 mã hoặc chuỗi ghép bởi dấu phẩy.
- Một logical line số lượng > 1 có thể được persist thành nhiều `rentalOrderLines[]`, mỗi dòng gắn với một serial thật.

**Trạng thái đơn thuê**:
`PENDING_PAYMENT → PAID → PREPARING → DELIVERING → DELIVERED → IN_USE → PENDING_PICKUP → PICKING_UP → PICKED_UP → COMPLETED`

hoặc hủy: `PENDING_PAYMENT → CANCELLED`

**Lỗi thường gặp**: `INVENTORY_INSUFFICIENT_STOCK`, `RENTAL_ORDER_MIN_DAYS_NOT_MET`, `VOUCHER_EXPIRED`, `VOUCHER_MIN_RENTAL_DAYS_NOT_MET`

---

### API-075: Lấy đơn thuê theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}`

**Response**: `RentalOrderResponse` đầy đủ (xem API-074)

---

### API-076: Lấy danh sách đơn thuê (admin/staff) [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders?page=1&size=10&sort=placedAt,desc&filter=status:'PENDING_PAYMENT'`

**Response**: `PaginationResponse` chứa mảng `RentalOrderResponse`

---

### API-077: Lấy danh sách đơn thuê theo hub [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders/hub/{hubId}?page=1&size=10&sort=placedAt,desc`

**Quy tắc truy cập**:

- `ADMIN`: có thể xem theo mọi hub hợp lệ.
- `STAFF`: chỉ được xem đơn của hub đang được gán; khác hub trả `UNAUTHORIZED_ACCESS`.
- `CUSTOMER`: không có quyền truy cập endpoint này.
- `hubId` không tồn tại: backend trả `HUB_NOT_FOUND`.

**Response**: `PaginationResponse` chứa mảng `RentalOrderResponse`

---

### API-078: Lấy danh sách đơn thuê của tôi [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders/my-orders?page=1&size=10`

**Response**: `PaginationResponse` chứa mảng `RentalOrderResponse` của user hiện tại

---

### API-079: Cập nhật trạng thái đơn thuê [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/status`

**Request body**:

```json
{
  "status": "PREPARING",
  "issueNote": "Tuỳ chọn, chỉ bắt buộc khi DELIVERED -> PENDING_PICKUP do sự cố"
}
```

**Phân quyền runtime**:

- `CUSTOMER`: chỉ được cập nhật **đơn của chính mình** và chỉ cho các bước `PENDING_PAYMENT/PREPARING -> CANCELLED`, `DELIVERED -> IN_USE`, `IN_USE -> PENDING_PICKUP`.
- `STAFF`: được cập nhật các bước vận hành `PAID -> PREPARING`, `PREPARING -> DELIVERING/CANCELLED`, `PENDING_PICKUP -> PICKING_UP`, `PICKED_UP -> COMPLETED` (cash refund flow). Nếu đơn đã có `deliveryStaff` hoặc `pickupStaff`, staff đang gọi API phải đúng người được gán.
- `ADMIN`: có thể gọi các bước hợp lệ theo state machine; flow `DELIVERED -> PENDING_PICKUP` do sự cố sau giao hàng chỉ ADMIN được phép gọi; riêng flow hoàn cọc qua ngân hàng thì ADMIN là người xác nhận `COMPLETED`.

**Chuyển đổi trạng thái cho phép**:

| Từ                | Sang                           |
| ----------------- | ------------------------------ |
| `PENDING_PAYMENT` | `PAID` hoặc `CANCELLED`        |
| `PAID`            | `PREPARING`                    |
| `PREPARING`       | `DELIVERING` hoặc `CANCELLED`  |
| `DELIVERING`      | `DELIVERED`                    |
| `DELIVERED`       | `IN_USE` hoặc `PENDING_PICKUP` |
| `IN_USE`          | `PENDING_PICKUP`               |
| `PENDING_PICKUP`  | `PICKING_UP`                   |
| `PICKING_UP`      | `PICKED_UP`                    |
| `PICKED_UP`       | `COMPLETED`                    |

**Guard nghiệp vụ bổ sung**:

- `PENDING_PAYMENT -> PAID`: chỉ hợp lệ khi tổng `payment_transactions.status = SUCCESS` của đơn đã đủ `totalPayableAmount`.
- `PAID -> PREPARING`: phải có `rental_contract` cho đơn.
- `PREPARING -> DELIVERING`: phải có `rental_contract` và đã gán `deliveryStaff`.
- `DELIVERING -> DELIVERED`: không nên dùng API-079 để nhảy trạng thái; backend yêu cầu dùng API-084 `record-delivery` để ghi nhận thời gian/toạ độ giao hàng.
- `DELIVERED -> IN_USE`, `DELIVERED -> PENDING_PICKUP` và `IN_USE -> PENDING_PICKUP`: chỉ hợp lệ khi đơn đã có dữ liệu giao hàng thực tế (`actualDeliveryAt`, `actualRentalStartAt`).
- Mọi flow chuyển sang `PENDING_PICKUP` đều phải gán `pickupStaff` trước.
- `DELIVERED -> PENDING_PICKUP` (trả sớm do sự cố): chỉ ADMIN được phép gọi, bắt buộc truyền `issueNote`, backend tự lưu `issueReportedAt` + `issueReportNote`.
- `PENDING_PICKUP -> PICKING_UP`: phải gán `pickupStaff` trước.
- `PICKING_UP -> PICKED_UP`: không nên dùng API-079 để nhảy trạng thái; backend yêu cầu dùng API-085 `record-pickup` để ghi nhận thời gian/toạ độ thu hồi.
- API-085 cũng sẽ từ chối nếu chưa gán `pickupStaff` cho đơn.
- `PICKED_UP -> COMPLETED`: chỉ hợp lệ khi đơn đã có dữ liệu thu hồi thực tế (`pickedUpAt`, `actualRentalEndAt`).
- `PICKED_UP -> COMPLETED` với cash refund flow: `STAFF` hoặc `ADMIN` đều có thể xác nhận hoàn tất.
- `PICKED_UP -> COMPLETED` với bank refund flow: nếu đơn đã phát sinh transaction `DEPOSIT_REFUND`, bắt buộc phải có ít nhất 1 transaction `SUCCESS` và chỉ `ADMIN` được xác nhận `COMPLETED`.
- Khi chuyển sang `CANCELLED` qua API-079, backend rollback inventory `RESERVED -> AVAILABLE`; không còn semantics rollback bộ đếm voucher toàn cục.

**Flow gợi ý khi giao hàng gặp sự cố**:

1. Admin vận hành gọi API-079 với `status=PENDING_PICKUP` và `issueNote` để ghi nhận yêu cầu trả sớm do sự cố.
2. STAFF gán `pickupStaff` (API-083) và chuyển `PENDING_PICKUP -> PICKING_UP` (API-079).
3. STAFF ghi nhận thu hồi thực tế bằng API-085 (`record-pickup`) để chuyển sang `PICKED_UP`.
4. Thực hiện đối soát/hoàn cọc rồi xác nhận `COMPLETED` theo đúng rule cash/bank ở trên.

**Response**: `RentalOrderResponse`

---

### API-080: Hủy đơn thuê [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/cancel`

**Request body**: không có

**Rule**: chỉ hủy khi status là `PENDING_PAYMENT`.

**Side effects**: inventory reserved của đơn được trả lại `AVAILABLE`; voucher one-time-per-user đã ghi trên user không được rollback về trạng thái chưa dùng.

**Response**:

```json
{
  "success": true,
  "message": "Hủy đơn thuê thành công",
  "data": null
}
```

---

### API-081: Gia hạn đơn thuê (gia hạn hợp đồng thuê) [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/extend`

**Request body**:

```json
{
  "additionalRentalDays": 3
}
```

| Field                  | Bắt buộc | Validation |
| ---------------------- | -------- | ---------- |
| `additionalRentalDays` | ✓        | >= 1       |

**Business logic**:

- Đây là API backend chính để xử lý yêu cầu gia hạn hợp đồng thuê ở runtime.
- Có thể gọi khi đơn ở một trong các trạng thái: `PENDING_PAYMENT`, `PAID`, `PREPARING`, `DELIVERING`, `DELIVERED`, `IN_USE`, `PENDING_PICKUP`
- Tăng `rentalDurationDays` cho tất cả line trong đơn
- Cập nhật `expectedRentalEndDate`
- Nếu serial hiện tại bị conflict lịch sau gia hạn → tự tìm serial khác cùng product không bị xung đột (ưu tiên AVAILABLE → conditionGrade tốt hơn → FIFO)
- Tính lại `rentalSubtotalAmount`, `rentalFeeAmount`, `totalPayableAmount`
- Nếu đơn đã có contract (tức đã bước vào vòng đời sau thanh toán), backend tự refresh lại `contractHtmlSnapshot` và `contractPdfUrl` để nội dung hợp đồng luôn khớp thời hạn thuê mới; contract không bị xoá mà được cập nhật trên cùng record hiện tại.

**Response**: `RentalOrderResponse` đầy đủ

**Lỗi thường gặp**: `RENTAL_ORDER_EXTENSION_CONFLICT` (không tìm được serial hợp lệ), `RENTAL_ORDER_INVALID_STATUS_TRANSITION`

---

### API-082: Xem chi tiết nhân sự xử lý đơn thuê [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/staff-detail`

**Response ví dụ**:

```json
{
  "data": {
    "rentalOrderId": "6cc84ef6-20e2-4c9d-bde0-d322d8a8bc11",
    "status": "PREPARING",
    "hubId": "h1a2b3c4-...",
    "hubName": "Hub Hồ Chí Minh - Quận 1",
    "deliveryStaff": {
      "userId": "staff-uuid-001",
      "email": "staff1@swiftera2.io.vn",
      "firstName": "Nguyen",
      "lastName": "A",
      "nickname": "shipper-a",
      "phoneNumber": "+84901234567",
      "avatarUrl": null,
      "isVerified": true,
      "hubId": "h1a2b3c4-...",
      "hubCode": "HCM-01",
      "hubName": "Hub Hồ Chí Minh - Quận 1"
    },
    "pickupStaff": null
  }
}
```

**Response**: `RentalOrderStaffDetailResponse`

---

### API-083: Gán nhân viên cho đơn thuê [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/assign-staff`

**Request body** (tất cả tùy chọn):

```json
{
  "deliveryStaffId": "user-uuid-staff1",
  "pickupStaffId": "user-uuid-staff2"
}
```

**Validation**:

- Cần có ít nhất một trong `deliveryStaffId` hoặc `pickupStaffId`.
- User được gán phải có role `STAFF_ROLE`, nếu không trả `USER_NOT_STAFF_ROLE`.
- Nếu đơn đã có `hub` và staff cũng có `hub`, hai hub phải trùng nhau (khác hub sẽ bị từ chối với `INVALID_REQUEST_DATA`).

**Response**: `RentalOrderResponse` (đã include đầy đủ object `deliveryStaff` và `pickupStaff`)

Ví dụ response phần staff:

```json
{
  "data": {
    "rentalOrderId": "6cc84ef6-20e2-4c9d-bde0-d322d8a8bc11",
    "deliveryStaff": {
      "userId": "staff-uuid-001",
      "email": "staff1@swiftera2.io.vn",
      "firstName": "Nguyen",
      "lastName": "A",
      "nickname": "shipper-a",
      "phoneNumber": "+84901234567",
      "avatarUrl": null,
      "isVerified": true,
      "hubId": "h1a2b3c4-...",
      "hubCode": "HCM-01",
      "hubName": "Hub Hồ Chí Minh - Quận 1"
    },
    "pickupStaff": {
      "userId": "staff-uuid-002",
      "email": "staff2@swiftera2.io.vn",
      "firstName": "Tran",
      "lastName": "B",
      "nickname": "shipper-b",
      "phoneNumber": "+84908888888",
      "avatarUrl": null,
      "isVerified": true,
      "hubId": "h1a2b3c4-...",
      "hubCode": "HCM-01",
      "hubName": "Hub Hồ Chí Minh - Quận 1"
    }
  }
}
```

---

### API-084: Ghi nhận giao hàng [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/record-delivery`

**Request body** (tất cả tùy chọn):

```json
{
  "deliveredAt": "2026-03-26T09:15:00Z",
  "deliveredLatitude": 10.7769,
  "deliveredLongitude": 106.7009
}
```

**Lưu ý**: Nếu không gửi `deliveredAt`, backend dùng `Instant.now()`.

**Side effects**:

- Chỉ chấp nhận khi đơn đang ở `DELIVERING`
- Set `actualDeliveryAt` và `actualRentalStartAt`
- Cập nhật `expectedRentalEndDate = actualRentalStartAt + max(rentalDurationDays)`
- Inventory: `AVAILABLE → RENTED`
- Status đơn tự chuyển thành `DELIVERED`

**Response**: `RentalOrderResponse`

---

### API-085: Ghi nhận thu hồi [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/record-pickup`

**Request body** (tất cả tùy chọn):

```json
{
  "pickedUpAt": "2026-04-03T11:00:00Z",
  "pickedUpLatitude": 10.7765,
  "pickedUpLongitude": 106.6998
}
```

**Lưu ý**: Nếu không gửi `pickedUpAt`, backend dùng `Instant.now()`.

**Side effects**:

- Chỉ chấp nhận khi đơn đang ở `PICKING_UP`
- Set `actualRentalEndAt` và `pickedUpAt`
- Inventory: `RENTED/RESERVED → AVAILABLE`
- Status đơn tự chuyển thành `PICKED_UP`

**Response**: `RentalOrderResponse`

---

### API-086: Cập nhật phí phạt đơn thuê [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/set-penalty`

**Request body**:

```json
{
  "damagePenaltyAmount": 300000,
  "overduePenaltyAmount": 200000,
  "note": "Máy bị xước nhẹ, đền bù phụ kiện"
}
```

| Field                  | Bắt buộc     | Validation         |
| ---------------------- | ------------ | ------------------ |
| `damagePenaltyAmount`  | tùy chọn\*   | >= 0               |
| `overduePenaltyAmount` | tùy chọn\*   | >= 0               |
| `penaltyTotal`         | tùy chọn\*\* | >= 0               |
| `note`                 | tùy chọn     | ghi chú lý do phạt |

- a: Cần có ít nhất một trong hai field `damagePenaltyAmount` hoặc `overduePenaltyAmount`.
- b: Nếu chỉ gửi một field split, backend giữ nguyên field còn lại đang có; muốn clear phải gửi explicit `0`.
- c: Giữ tương thích ngược payload cũ. Nếu chỉ gửi `penaltyTotal`, backend sẽ map vào `damagePenaltyAmount` và `overduePenaltyAmount = 0`.

**Business logic**: `depositRefundAmount = max(depositHoldAmount - (damagePenaltyAmount + overduePenaltyAmount), 0)`

`overduePenaltyAmount` là phí phạt quá hạn đã chốt cuối cùng. `provisionalOverduePenaltyAmount` nằm ở response order để FE hiển thị mức tạm tính hiện tại, nhưng không được cộng vào `penaltyChargeAmount` cho tới khi staff/admin xác nhận qua `set-penalty`.

**Response**: `RentalOrderResponse`

---

### API-086A: Lấy đề xuất phí phạt quá hạn tạm tính [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/overdue-penalty-suggestion`

**Response body mẫu**:

```json
{
  "code": 1000,
  "message": "Lấy đề xuất phí phạt quá hạn tạm tính thành công",
  "data": {
    "rentalOrderId": "7d4e9b35-...",
    "status": "PICKED_UP",
    "overdue": true,
    "expectedRentalEndDate": "2026-04-08",
    "actualRentalEndAt": "2026-04-10 09:30:00 AM",
    "overdueDays": 2,
    "dailyOverdueRateAmount": 250000,
    "provisionalOverduePenaltyAmount": 500000,
    "finalOverduePenaltyAmount": 200000,
    "damagePenaltyAmount": 300000,
    "suggestedTotalPenaltyAmount": 800000,
    "suggestedDepositRefundAmount": 4200000
  }
}
```

| Field                             | Ý nghĩa                                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| `overdue`                         | order có đang/vừa bị quá hạn hay không                           |
| `overdueDays`                     | số ngày quá hạn đã tính đến hôm nay hoặc đến `actualRentalEndAt` |
| `dailyOverdueRateAmount`          | tổng daily rate snapshot của các line trong order                |
| `provisionalOverduePenaltyAmount` | mức phí phạt quá hạn tạm tính backend đề xuất                    |
| `finalOverduePenaltyAmount`       | mức phí phạt quá hạn cuối cùng đang lưu                          |
| `suggestedTotalPenaltyAmount`     | `damagePenaltyAmount + provisionalOverduePenaltyAmount`          |
| `suggestedDepositRefundAmount`    | `max(depositHoldAmount - suggestedTotalPenaltyAmount, 0)`        |

**Business logic**:

- Khi order đang `IN_USE` hoặc `PENDING_PICKUP` và đã overdue, backend auto-refresh `provisionalOverduePenaltyAmount` mỗi ngày mới.
- Khi order đã `PICKED_UP`, backend dùng `actualRentalEndAt` để khóa số ngày overdue, tránh tiếp tục cộng thêm theo ngày hiện tại.
- FE có thể lấy `provisionalOverduePenaltyAmount` để prefill `overduePenaltyAmount` ở API `set-penalty`, hoặc cho staff nhập tay mức cuối cùng khác.

**Response**: `OverduePenaltySuggestionResponse`

---

## Module 13: PAYMENTS (6 APIs)

---

### API-087: Lấy giao dịch thanh toán theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/payments/{paymentTransactionId}`

**Response**:

```json
{
  "data": {
    "paymentTransactionId": "pt-uuid-001",
    "rentalOrderId": "6cc84ef6-...",
    "transactionType": "RENTAL_FEE",
    "amount": 13750000,
    "paymentMethod": "VNPAY",
    "status": "PENDING",
    "vnpTxnRef": "6cc84ef620260324",
    "description": "Thanh toan don thue 6cc84ef6",
    "paidAt": null,
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**transactionType**: `RENTAL_FEE`, `DEPOSIT`, `DEPOSIT_REFUND`, `PENALTY`
**status**: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`

---

### API-088: Lấy danh sách giao dịch [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/payments?page=1&size=10&filter=status:'SUCCESS'`

**Response**: `PaginationResponse` chứa mảng `PaymentTransactionResponse`

---

### API-089: Lấy giao dịch theo đơn thuê [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/payments/rental-order/{rentalOrderId}?page=1&size=10`

**Response**: `PaginationResponse` chứa mảng `PaymentTransactionResponse` của đơn đó

---

### API-090: Tạo link thanh toán VNPay [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/payments/{rentalOrderId}/initiate`

**Request body**: không có

**Điều kiện bắt buộc trước khi tạo link**:

- User phải đã đồng ý **phiên bản RENTAL_TERMS active mới nhất** (`consentType=ACCEPTED`, cùng `policyVersion`).
- Nếu chưa có consent hợp lệ, backend trả lỗi `CONSENT_NOT_FOUND`.

**Logic**: `amount = totalPayableAmount - totalPaidAmount`. Backend tạo transaction `RENTAL_FEE` với trạng thái `PENDING`.

**Response**:

```json
{
  "success": true,
  "message": "Tạo liên kết thanh toán VNPay thành công",
  "data": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=137500000&vnp_Command=pay&..."
}
```

**Frontend**: Redirect browser sang URL này. Sau khi thanh toán, VNPay gọi IPN và redirect về return URL.

---

### API-091: VNPay IPN webhook (server-to-server) [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/payments/vnpay/ipn`
- **Query params**: Toàn bộ params chuẩn VNPay (vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_SecureHash, ...)

**Gọi bởi VNPay server**, không gọi từ frontend. Backend verify checksum và cập nhật trạng thái.

**Side effects khi thành công**:

- Transaction → `SUCCESS`, ghi `paidAt`
- `totalPaidAmount += amount`
- Nếu `totalPaidAmount >= totalPayableAmount` → Order → `PAID`
- Nếu order vừa chuyển `PAID` và chưa có QR, backend tự sinh QR cho order; backend vẫn giữ URL/token nội bộ để phục vụ luồng scan, nhưng mọi API response và redirect trả `qrCode` ở dạng base64 data URI PNG.
- Nếu order vừa đủ điều kiện `PAID`, backend **tự tạo rental contract** cho order (idempotent: mỗi order tối đa 1 contract)

**Side effects khi thất bại**:

- Transaction → `FAILED`
- Nếu order còn ở `PENDING_PAYMENT`, backend tự chuyển order → `CANCELLED`

**Response** (VNPay-format):

```json
{ "RspCode": "00", "Message": "Confirm Success" }
```

---

### API-092: VNPay return redirect (browser) [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/payments/vnpay/return`
- **Query params**: Toàn bộ params chuẩn VNPay

**Gọi bởi VNPay sau khi user trả về từ cổng thanh toán.**

**Response**: HTTP 302 redirect sang frontend URL (cấu hình trong `application.yaml`) kèm query params kết quả.

- Khi thành công: `success=true`, `txnRef`, `rentalOrderId`, `qrCode` (chuỗi `data:image/png;base64,...` để FE bind trực tiếp vào `img src`, không cần fetch thêm).
- Khi thất bại: `success=false`, `txnRef`, `code`, `status`, `signatureValid`.

---

## Module 14: CONTRACTS (2 APIs)

---

### API-093: Lấy hợp đồng theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contracts/{rentalContractId}`

**Response**:

```json
{
  "data": {
    "rentalContractId": "rc-uuid-001",
    "rentalOrderId": "6cc84ef6-...",
    "policyDocumentId": "pd-uuid-001",
    "contractNumber": "CONTRACT-2026-001",
    "contractVersion": "v1.0",
    "acceptMethod": "CLICK",
    "acceptedAt": "2026-03-24 10:30:00 AM",
    "contractPdfUrl": "https://<storage-account>.blob.core.windows.net/<container>/contracts/2026/001.pdf",
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**acceptMethod**: `CLICK`, `SIGNATURE`

---

### API-094: Lấy hợp đồng theo đơn thuê [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contracts/rental-order/{rentalOrderId}`

**Response**: `RentalContractResponse` (xem API-093)

---

**Ghi chú runtime**:

- Backend **không còn API tạo contract thủ công**.
- Contract được tự động provision sau khi VNPay IPN xác nhận thanh toán thành công và order đủ tiền (`PAID`).
- Luồng tự động đảm bảo one-order-one-contract (idempotent).
- Khi order được gia hạn sau thanh toán, backend refresh snapshot/PDF của contract hiện tại để phản ánh thời hạn thuê mới.
- Khi order hoàn trả hàng, pickup xong hoặc completed, contract vẫn được giữ nguyên để phục vụ đối soát/audit; backend không xóa hợp đồng sau hoàn trả.
- File PDF của contract là snapshot hợp đồng điện tử tiếng Việt bám đúng mẫu hợp đồng đã chốt; backend bind dữ liệu order/user/line vào template đó, dùng `swiftera2.contract.issuer.*` cho thông tin pháp lý bên cho thuê và dùng fallback tường minh khi line chưa có serial/phụ kiện cấu trúc riêng; FE vẫn chỉ cần bind `RentalContractResponse` như cũ.

---

## Module 15: REVIEWS (5 APIs)

---

### API-095: Tạo đánh giá sản phẩm [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/reviews`

**Request body**:

```json
{
  "rentalOrderId": "6cc84ef6-...",
  "productId": "f3152824-...",
  "rating": 5,
  "content": "Máy ảnh rất tốt, giao hàng nhanh, đóng gói cẩn thận!"
}
```

| Field           | Bắt buộc | Validation                 |
| --------------- | -------- | -------------------------- |
| `rentalOrderId` | ✓        | UUID đơn thuê đã COMPLETED |
| `productId`     | ✓        | UUID product có trong đơn  |
| `rating`        | ✓        | 1–5                        |
| `content`       | tùy chọn | nội dung đánh giá          |

**Rule phân quyền tạo đánh giá/comment**:

- Chỉ user là chủ sở hữu đơn thuê mới được tạo đánh giá.
- User phải có lịch sử thuê đã hoàn tất (`COMPLETED`) với đúng sản phẩm đang đánh giá.
- Nếu không thỏa điều kiện trên, backend trả lỗi `REVIEW_PRODUCT_NOT_RENTED` hoặc `REVIEW_NOT_ORDER_OWNER` tùy trường hợp.

**Response**:

```json
{
  "data": {
    "productReviewId": "rv-uuid-001",
    "rentalOrderId": "6cc84ef6-...",
    "userId": "d4f6e5a8-...",
    "userNickname": "nguyenan",
    "productId": "f3152824-...",
    "productName": "Canon EOS R50",
    "rating": 5,
    "content": "Máy ảnh rất tốt, giao hàng nhanh...",
    "staffRating": null,
    "sellerReply": null,
    "helpfulCount": 0,
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-096: Lấy đánh giá theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/reviews/{reviewId}`

**Response**: `ProductReviewResponse` (xem API-095)

---

### API-097: Lấy danh sách đánh giá [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/reviews?page=1&size=10&filter=productId:'...'`

**Response**: `PaginationResponse` chứa mảng `ProductReviewResponse`

---

### API-098: Lấy đánh giá theo sản phẩm [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/reviews/product/{productId}?page=1&size=10`

**Response**: `PaginationResponse` chứa mảng `ProductReviewResponse` của sản phẩm đó

---

### API-099: Xóa đánh giá [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/reviews/{reviewId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa đánh giá thành công",
  "data": null
}
```

---

## Module 16: CONTACT TICKETS (6 APIs)

---

### API-100: Tạo ticket hỗ trợ [PUBLIC]

- **Method**: `POST`
- **URL**: `/api/v1/contact-tickets`
- **Lưu ý**: Endpoint PUBLIC — khách chưa đăng nhập cũng tạo được ticket.

**Request body**:

```json
{
  "rentalOrderId": "6cc84ef6-...",
  "fullName": "Nguyen Van A",
  "email": "user@gmail.com",
  "phone": "0988888888",
  "subject": "Thiết bị bị hỏng sau khi nhận",
  "message": "Tôi nhận máy ảnh Canon EOS R50 nhưng thấy nút chụp bị kẹt...",
  "attachmentUrl": "https://cdn.example.com/evidence.jpg"
}
```

| Field                                                          | Bắt buộc |
| -------------------------------------------------------------- | -------- |
| `subject`                                                      | ✓        |
| `message`                                                      | ✓        |
| `rentalOrderId`, `fullName`, `email`, `phone`, `attachmentUrl` | tùy chọn |

**Response**:

```json
{
  "data": {
    "contactTicketId": "ct-uuid-001",
    "userId": "d4f6e5a8-...",
    "rentalOrderId": "6cc84ef6-...",
    "fullName": "Nguyen Van A",
    "email": "user@gmail.com",
    "phone": "0988888888",
    "subject": "Thiết bị bị hỏng sau khi nhận",
    "message": "Tôi nhận máy ảnh...",
    "attachmentUrl": "https://...",
    "status": "IN_PROGRESS",
    "handledByUserId": null,
    "sellerReply": null,
    "repliedAt": null,
    "closedAt": null,
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

**status**: `IN_PROGRESS`, `RESOLVED`, `CLOSED`

**Default**: ticket mới tạo luôn bắt đầu ở `IN_PROGRESS`.

---

### API-101: Lấy ticket theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contact-tickets/{ticketId}`

**Response**: `ContactTicketResponse` (xem API-100)

---

### API-102: Lấy danh sách ticket (admin/staff) [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contact-tickets?page=1&size=10&filter=status:'IN_PROGRESS'`

**Response**: `PaginationResponse` chứa mảng `ContactTicketResponse`

---

### API-103: Lấy danh sách ticket của tôi [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contact-tickets/my-tickets?page=1&size=10`

**Response**: `PaginationResponse` chứa mảng `ContactTicketResponse` của user hiện tại

---

### API-104: Trả lời ticket [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/contact-tickets/{ticketId}/reply`

**Request body**:

```json
{
  "sellerReply": "Cảm ơn bạn đã phản ánh. Chúng tôi sẽ liên hệ trong vòng 24 giờ."
}
```

**Side effects**: Set `repliedAt = now()`, status → `RESOLVED`

**Response**: `ContactTicketResponse`

---

### API-105: Đóng ticket [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/contact-tickets/{ticketId}/close`

**Request body**: không có

**Side effects**: Set `closedAt = now()`, status → `CLOSED`

**Response**: `ContactTicketResponse`

---

## Module 17: POLICIES (8 APIs)

---

### API-106: Tạo tài liệu chính sách [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/policies`

**Request body**:

```json
{
  "code": "RENTAL_TERMS",
  "policyVersion": 2,
  "title": "Điều khoản thuê thiết bị v2.0",
  "pdfUrl": "https://<storage-account>.blob.core.windows.net/<container>/policies/rental-terms-v2.pdf",
  "effectiveFrom": "2026-04-01T00:00:00Z"
}
```

| Field           | Bắt buộc |
| --------------- | -------- |
| `code`          | ✓        |
| `policyVersion` | ✓        |
| `title`         | ✓        |
| `effectiveFrom` | ✓        |
| `pdfUrl`        | tùy chọn |

**Response**:

```json
{
  "data": {
    "policyDocumentId": "pd-uuid-001",
    "code": "RENTAL_TERMS",
    "policyVersion": 2,
    "title": "Điều khoản thuê thiết bị v2.0",
    "pdfUrl": "https://<storage-account>.blob.core.windows.net/<container>/policies/rental-terms-v2.pdf",
    "effectiveFrom": "2026-04-01 07:00:00 AM",
    "isActive": true,
    "createdAt": "2026-03-24 10:00:00 AM",
    "updatedAt": "2026-03-24 10:00:00 AM"
  }
}
```

---

### API-107: Lấy chính sách theo ID [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/policies/{policyId}`

**Response**: `PolicyDocumentResponse` (xem API-106)

---

### API-108: Lấy phiên bản chính sách mới nhất theo code [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/policies/code/{code}/latest`

Ví dụ: `/api/v1/policies/code/RENTAL_TERMS/latest`

**Response**: `PolicyDocumentResponse` có `isActive: true` và `policyVersion` cao nhất

---

### API-109: Lấy danh sách chính sách [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/policies?page=1&size=10&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `PolicyDocumentResponse`

---

### API-109A: Cập nhật tài liệu chính sách [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/policies/{policyId}`

**Request body** (tất cả tùy chọn):

```json
{
  "title": "Điều khoản thuê thiết bị v2.1",
  "pdfUrl": "https://<storage-account>.blob.core.windows.net/<container>/policies/rental-terms-v2_1.pdf",
  "effectiveFrom": "2026-04-15T00:00:00Z"
}
```

**Rule cập nhật**:

- Cần có ít nhất 1 field thay đổi trong body.
- `code` và `policyVersion` là immutable, không hỗ trợ update qua endpoint này.
- Nếu gửi `pdfUrl` là chuỗi rỗng, backend sẽ clear link PDF hiện tại.

**Response**: `PolicyDocumentResponse`

---

### API-110: Vô hiệu hóa chính sách [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/policies/{policyId}/deactivate`

**Request body**: không có

**Side effects**: `isActive → false`

**Response**: `PolicyDocumentResponse`

---

### API-111: Ghi nhận đồng ý chính sách [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/policies/{policyId}/consent`

**Request body**: tùy chọn (nếu không gửi body, backend vẫn tạo consent với giá trị mặc định)

```json
{
  "consentType": "ACCEPTED",
  "consentContext": "CHECKOUT",
  "ipAddress": "113.161.72.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

| Field            | Bắt buộc | Ghi chú                                                           |
| ---------------- | -------- | ----------------------------------------------------------------- |
| `consentType`    | tùy chọn | Mặc định `ACCEPTED`                                               |
| `consentContext` | tùy chọn | Mặc định `ACCOUNT`; enum hỗ trợ `ACCOUNT`, `CHECKOUT`, `CONTRACT` |
| `ipAddress`      | tùy chọn | Nếu bỏ trống backend lấy từ `HttpServletRequest`                  |
| `userAgent`      | tùy chọn | Nếu bỏ trống backend lấy từ `HttpServletRequest`                  |

**Idempotent rule**:

- Nếu đã tồn tại consent cùng `user + policyDocument + consentType + consentContext`, backend trả lại record hiện có, không tạo bản ghi trùng.

**Response**:

```json
{
  "data": {
    "userConsentId": "uc-uuid-001",
    "userId": "d4f6e5a8-...",
    "policyDocumentId": "pd-uuid-001",
    "policyCode": "RENTAL_TERMS",
    "policyVersion": 2,
    "policyTitle": "Điều khoản thuê thiết bị v2.0",
    "consentType": "ACCEPTED",
    "consentContext": "CHECKOUT",
    "consentedAt": "2026-03-24 10:30:00 AM",
    "ipAddress": "113.161.72.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "createdAt": "2026-03-24 10:30:00 AM",
    "updatedAt": "2026-03-24 10:30:00 AM"
  }
}
```

---

### API-112: Lấy danh sách đồng ý chính sách của tôi [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/policies/my-consents`

**Response**:

```json
{
  "data": [
    {
      "userConsentId": "uc-uuid-001",
      "userId": "d4f6e5a8-...",
      "policyDocumentId": "pd-uuid-001",
      "policyCode": "RENTAL_TERMS",
      "policyVersion": 2,
      "policyTitle": "Điều khoản thuê thiết bị v2.0",
      "consentType": "ACCEPTED",
      "consentContext": "CHECKOUT",
      "consentedAt": "2026-03-24 10:30:00 AM",
      "ipAddress": "113.161.72.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-03-24 10:30:00 AM",
      "updatedAt": "2026-03-24 10:30:00 AM"
    }
  ]
}
```

---

## Module 18: DASHBOARDS (2 APIs)

---

### API-113: Dashboard tổng quan cho ADMIN [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/dashboards/admin`
- **Query**: `hubId` (tùy chọn)

**Quy tắc scope dữ liệu**:

- Không truyền `hubId`: trả số liệu toàn hệ thống.
- Có `hubId`: trả số liệu theo hub và thêm `hubSummary`.
- `hubId` không tồn tại: lỗi `HUB_NOT_FOUND`.

**Response** (keys giữ đúng contract để FE bind trực tiếp):

```json
{
  "data": {
    "orderKpi": {
      "completedToday": 12,
      "completedYesterday": 9,
      "completedThisWeek": 58,
      "completedThisMonth": 241,
      "dailyCompletedLast7Days": [
        { "date": "2026-04-01", "count": 6 },
        { "date": "2026-04-02", "count": 8 },
        { "date": "2026-04-03", "count": 9 },
        { "date": "2026-04-04", "count": 11 },
        { "date": "2026-04-05", "count": 7 },
        { "date": "2026-04-06", "count": 12 },
        { "date": "2026-04-07", "count": 5 }
      ]
    },
    "orderStatusCounts": {
      "pendingPayment": 3,
      "paid": 15,
      "preparing": 6,
      "delivering": 4,
      "delivered": 2,
      "inUse": 11,
      "pendingPickup": 5,
      "pickingUp": 3,
      "pickedUp": 2,
      "completed": 241,
      "cancelled": 7,
      "urgentTotal": 22
    },
    "overdueOrders": {
      "count": 8,
      "topItems": [
        {
          "rentalOrderId": "ro-uuid-001",
          "orderCode": "RO-7D6A12B0",
          "status": "IN_USE",
          "expectedRentalEndDate": "2026-04-03",
          "renterFullName": "Nguyen Van A",
          "renterPhone": "0901234567",
          "itemCount": 2
        }
      ]
    },
    "inventoryStats": {
      "totalItems": 320,
      "available": 140,
      "rented": 126,
      "reserved": 21,
      "maintenance": 18,
      "damaged": 9,
      "retired": 6
    },
    "revenueStats": {
      "rentalFeeToday": 12800000,
      "rentalFeeThisMonth": 241700000,
      "depositHeldActive": 96500000,
      "penaltyThisMonth": 3900000
    },
    "ticketStats": {
      "inProgress": 9,
      "resolved": 9,
      "closed": 6,
      "activeTotal": 18
    },
    "voucherStats": {
      "totalActive": 11,
      "expired": 4,
      "usedThisMonth": 37
    },
    "hubSummary": {
      "hubId": "hub-001",
      "hubCode": "HCM-01",
      "hubName": "Hub Ho Chi Minh Quan 1",
      "totalStaff": 14,
      "activeStaff": 11
    }
  }
}
```

**Logic tính toán chính (để FE hiểu số liệu)**:

- `orderKpi.completed*`: chỉ tính order status `COMPLETED`, mốc thời gian theo `coalesce(actualRentalEndAt, updatedAt)`.
- `orderKpi.dailyCompletedLast7Days`: luôn đủ 7 điểm, ngày không có dữ liệu trả `count = 0`.
- `orderStatusCounts.urgentTotal = paid + pendingPickup + overdueOrders.count`.
- `inventoryStats.totalItems`: tổng các trạng thái inventory trong scope.
- `ticketStats.activeTotal = inProgress + resolved`.
- `voucherStats.usedThisMonth`: đếm đơn có áp voucher (`voucherId != null`, `voucherDiscountAmount > 0`) và status khác `PENDING_PAYMENT/CANCELLED` trong tháng hiện tại.

**FE UI/chart guidance**:

- Dùng 4 KPI cards cho `completedToday`, `completedYesterday`, `completedThisWeek`, `completedThisMonth`.
- Dùng line chart cho `dailyCompletedLast7Days` (trục X = `date`, trục Y = `count`).
- Dùng stacked bar hoặc donut cho `orderStatusCounts` và `inventoryStats`.
- Dùng table/top-list cho `overdueOrders.topItems` (ưu tiên sort tăng dần theo `expectedRentalEndDate`).
- Dùng money formatter thống nhất VNĐ cho `revenueStats.*`.
- Nếu gọi không truyền `hubId`, `hubSummary` có thể `null`; FE nên ẩn card Hub Summary.

---

### API-114: Dashboard tác nghiệp cho STAFF [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/dashboards/staff`
- **Query**: `hubId` (tùy chọn)

**Quy tắc xác thực hub**:

- Nếu không truyền `hubId`, backend dùng hub đang gán cho staff hiện tại.
- Nếu truyền `hubId`, phải đúng hub của staff; khác hub sẽ trả `UNAUTHORIZED_ACCESS`.
- User không có role staff sẽ trả `USER_NOT_STAFF_ROLE`.

**Response**:

```json
{
  "data": {
    "hubInfo": {
      "hubId": "hub-001",
      "hubCode": "HCM-01",
      "hubName": "Hub Ho Chi Minh Quan 1"
    },
    "todayTasks": {
      "deliveriesDueToday": 6,
      "pickupsDueToday": 4,
      "total": 10
    },
    "urgentOverdue": {
      "count": 3,
      "items": [
        {
          "rentalOrderId": "ro-uuid-001",
          "orderCode": "RO-7D6A12B0",
          "status": "IN_USE",
          "expectedRentalEndDate": "2026-04-03",
          "renterFullName": "Nguyen Van A",
          "renterPhone": "0901234567",
          "itemCount": 2,
          "daysOverdue": 4
        }
      ]
    },
    "hubInventoryStats": {
      "totalItems": 96,
      "available": 31,
      "rented": 44,
      "reserved": 8,
      "maintenance": 7,
      "damaged": 4,
      "retired": 2
    },
    "assignedTickets": {
      "inProgressAssignedToMe": 2,
      "resolvedAssignedToMe": 1,
      "totalActiveAssignedToMe": 3
    }
  }
}
```

**Logic tính toán chính**:

- `todayTasks.deliveriesDueToday`: count order status `PREPARING|DELIVERING` có `expectedDeliveryDate = hôm nay` tại hub.
- `todayTasks.pickupsDueToday`: count order status `IN_USE|PENDING_PICKUP|PICKING_UP` có `expectedRentalEndDate = hôm nay` tại hub.
- `urgentOverdue.items`: top 10 order quá hạn (`IN_USE|PENDING_PICKUP`, `expectedRentalEndDate < hôm nay`).
- `urgentOverdue.items[].daysOverdue`: số ngày trễ theo ngày hiện tại.
- `assignedTickets`: count ticket `IN_PROGRESS|RESOLVED` theo `handledByUserId = staff hiện tại` và đúng hub.

**FE UI/chart guidance**:

- Dùng task cards cho `deliveriesDueToday`, `pickupsDueToday`, `total` (ưu tiên hiển thị dạng action queue).
- Dùng bảng ưu tiên cho `urgentOverdue.items` với badge `daysOverdue` để staff triage nhanh.
- Dùng mini donut cho `hubInventoryStats` và `assignedTickets`.
- Khi nhận `UNAUTHORIZED_ACCESS` vì `hubId` sai scope, FE nên fallback gọi lại không truyền `hubId`.

---

### Data Triggers (Dashboard APIs)

- `RentalOrder.status` thay đổi sẽ tác động ngay các khối: `orderStatusCounts`, `todayTasks`, `overdueOrders/urgentOverdue`, `voucherStats.usedThisMonth`.
- `RentalOrder.expectedDeliveryDate` và `expectedRentalEndDate` thay đổi sẽ tác động `todayTasks` và overdue list/count.
- `RentalOrder.actualRentalEndAt` hoặc `updatedAt` (khi `COMPLETED`) sẽ tác động `orderKpi` và `dailyCompletedLast7Days`.
- `PaymentTransaction.status=SUCCESS` + `transactionType` sẽ tác động `revenueStats`.
- `InventoryItem.status` hoặc `hubId` thay đổi sẽ tác động `inventoryStats`/`hubInventoryStats`.
- `ContactTicket.status` hoặc `handledByUserId` thay đổi sẽ tác động `ticketStats` và `assignedTickets`.
- `Voucher.expiresAt/type/product/isActive` thay đổi sẽ tác động `voucherStats.totalActive|expired`.
- `User`/`Role` (staff, verify, active, hub) thay đổi sẽ tác động `hubSummary.totalStaff|activeStaff`.

---

## Module 19: USER ADDRESSES (5 APIs)

---

### API-115: Tạo địa chỉ người dùng [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/user-addresses`

**Request body**:

```json
{
  "recipientName": "Nguyen Van A",
  "phoneNumber": "0988888888",
  "addressLine": "123 Nguyen Trai",
  "ward": "Phường 2",
  "district": "Quận 5",
  "city": "Hồ Chí Minh",
  "latitude": 10.7626,
  "longitude": 106.6601,
  "isDefault": true
}
```

**Validation**: `recipientName`, `phoneNumber` bắt buộc.

**Response**: `UserAddressResponse`

---

### API-116: Lấy danh sách địa chỉ của tôi [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/user-addresses`

**Response**: `UserAddressResponse[]` (sắp theo `isDefault desc`, rồi `updatedAt desc`).

---

### API-117: Lấy chi tiết địa chỉ [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/user-addresses/{userAddressId}`

**Response**: `UserAddressResponse`

**Rule**: chỉ chủ sở hữu hoặc admin mới truy cập được.

---

### API-118: Cập nhật địa chỉ [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/user-addresses/{userAddressId}`

**Request body**: tất cả field đều tùy chọn.

**Response**: `UserAddressResponse`

**Rule**: nếu set `isDefault=true`, backend tự bỏ cờ default ở các địa chỉ còn lại của user.

---

### API-119: Xóa địa chỉ [AUTH]

- **Method**: `DELETE`
- **URL**: `/api/v1/user-addresses/{userAddressId}`

**Response**:

```json
{
  "success": true,
  "message": "Xóa địa chỉ thành công",
  "data": null
}
```

**Rule**: nếu địa chỉ đang được dùng trong `rental_orders`, backend trả lỗi `USER_ADDRESS_IN_USE`.

---

## Module 20: HUB STAFF ASSIGNMENT (1 API)

---

### API-120: Gán nhiều staff vào hub [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/hubs/{hubId}/assign-staff`

**Request body**:

```json
{
  "staffIds": ["staff-uuid-001", "staff-uuid-002"]
}
```

**Validation**:

- `staffIds` không được rỗng (`HUB_STAFF_IDS_NOT_EMPTY`).
- Tất cả ID phải tồn tại, và từng user phải có role `STAFF`.

**Response**: `HubStaffResponse[]` của danh sách vừa được gán hub.

---

## Module 21: PRODUCTS BY HUB (1 API)

---

### API-121: Lấy danh sách sản phẩm theo hub [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/products/hub/{hubId}?page=1&size=12&sort=createdAt,desc&filter=isActive:true&includeDescendants=false`

**Response**: `PaginationResponse` chứa `ProductResponse[]`.

**Logic lọc theo hub**:

- Chỉ trả sản phẩm `isActive=true`.
- Sản phẩm phải có inventory item thuộc hub và trạng thái khác `RETIRED`, `DAMAGED`.

---

## Phụ lục A: Tổng hợp 123 APIs

| #    | Method | URL                                                                | Auth            | Module        |
| ---- | ------ | ------------------------------------------------------------------ | --------------- | ------------- |
| 001  | POST   | `/api/v1/auth/register`                                            | PUBLIC          | AUTH          |
| 002  | POST   | `/api/v1/auth/verify-active-account`                               | PUBLIC          | AUTH          |
| 003  | POST   | `/api/v1/auth/resend-verify`                                       | PUBLIC          | AUTH          |
| 004  | POST   | `/api/v1/auth/login`                                               | PUBLIC          | AUTH          |
| 005  | POST   | `/api/v1/auth/logout`                                              | AUTH            | AUTH          |
| 006  | GET    | `/api/v1/auth/account`                                             | AUTH            | AUTH          |
| 007  | GET    | `/api/v1/auth/refresh`                                             | PUBLIC (cookie) | AUTH          |
| 008  | POST   | `/api/v1/auth/forgot-password`                                     | PUBLIC          | AUTH          |
| 009  | POST   | `/api/v1/auth/reset-password`                                      | PUBLIC          | AUTH          |
| 010  | PATCH  | `/api/v1/users/update-profile`                                     | AUTH            | USERS         |
| 011  | PUT    | `/api/v1/users/update-password`                                    | AUTH            | USERS         |
| 012  | PUT    | `/api/v1/users/update-email`                                       | AUTH            | USERS         |
| 013  | POST   | `/api/v1/users/verify-change-email`                                | AUTH            | USERS         |
| 014  | GET    | `/api/v1/users/{userId}`                                           | AUTH            | USERS         |
| 015  | GET    | `/api/v1/users`                                                    | AUTH            | USERS         |
| 016  | PATCH  | `/api/v1/users/{userId}`                                           | AUTH            | USERS         |
| 017  | DELETE | `/api/v1/users/{userId}`                                           | AUTH            | USERS         |
| 018  | DELETE | `/api/v1/users/{userId}/roles`                                     | AUTH            | USERS         |
| 019  | POST   | `/api/v1/users/staff-requests`                                     | AUTH            | USERS         |
| 020  | POST   | `/api/v1/roles`                                                    | AUTH            | ROLES         |
| 021  | GET    | `/api/v1/roles/{roleId}`                                           | AUTH            | ROLES         |
| 022  | GET    | `/api/v1/roles`                                                    | AUTH            | ROLES         |
| 023  | PATCH  | `/api/v1/roles/{roleId}`                                           | AUTH            | ROLES         |
| 024  | DELETE | `/api/v1/roles/{roleId}/permissions`                               | AUTH            | ROLES         |
| 025  | DELETE | `/api/v1/roles/{roleId}`                                           | AUTH            | ROLES         |
| 026  | POST   | `/api/v1/permissions/module`                                       | AUTH            | PERMISSIONS   |
| 027  | DELETE | `/api/v1/permissions/module/{name}`                                | AUTH            | PERMISSIONS   |
| 028  | GET    | `/api/v1/permissions/modules`                                      | AUTH            | PERMISSIONS   |
| 029  | POST   | `/api/v1/permissions`                                              | AUTH            | PERMISSIONS   |
| 030  | PATCH  | `/api/v1/permissions/{permissionId}`                               | AUTH            | PERMISSIONS   |
| 031  | GET    | `/api/v1/permissions/{permissionId}`                               | AUTH            | PERMISSIONS   |
| 032  | GET    | `/api/v1/permissions`                                              | AUTH            | PERMISSIONS   |
| 033  | DELETE | `/api/v1/permissions/{permissionId}`                               | AUTH            | PERMISSIONS   |
| 034  | POST   | `/api/v1/storage/azure-blob/upload/single`                         | AUTH            | FILES         |
| 035  | POST   | `/api/v1/storage/azure-blob/upload/multiple`                       | AUTH            | FILES         |
| 036  | DELETE | `/api/v1/storage/azure-blob/delete/single`                         | AUTH            | FILES         |
| 037  | DELETE | `/api/v1/storage/azure-blob/delete/multiple`                       | AUTH            | FILES         |
| 038  | PUT    | `/api/v1/storage/azure-blob/move/single`                           | AUTH            | FILES         |
| 039  | PUT    | `/api/v1/storage/azure-blob/move/multiple`                         | AUTH            | FILES         |
| 040  | POST   | `/api/v1/hubs`                                                     | AUTH            | HUBS          |
| 041  | GET    | `/api/v1/hubs/{hubId}`                                             | AUTH            | HUBS          |
| 042  | GET    | `/api/v1/hubs`                                                     | PUBLIC          | HUBS          |
| 043  | GET    | `/api/v1/hubs/{hubId}/staff`                                       | AUTH            | HUBS          |
| 044  | PATCH  | `/api/v1/hubs/{hubId}`                                             | AUTH            | HUBS          |
| 045  | DELETE | `/api/v1/hubs/{hubId}`                                             | AUTH            | HUBS          |
| 046  | POST   | `/api/v1/categories`                                               | AUTH            | CATEGORIES    |
| 047  | GET    | `/api/v1/categories/{categoryId}`                                  | PUBLIC          | CATEGORIES    |
| 048  | GET    | `/api/v1/categories`                                               | PUBLIC          | CATEGORIES    |
| 049  | GET    | `/api/v1/categories/tree`                                          | PUBLIC          | CATEGORIES    |
| 050  | PATCH  | `/api/v1/categories/{categoryId}`                                  | AUTH            | CATEGORIES    |
| 051  | DELETE | `/api/v1/categories/{categoryId}`                                  | AUTH            | CATEGORIES    |
| 052  | POST   | `/api/v1/products`                                                 | AUTH            | PRODUCTS      |
| 053  | GET    | `/api/v1/products/{productId}`                                     | PUBLIC          | PRODUCTS      |
| 054  | GET    | `/api/v1/products`                                                 | PUBLIC          | PRODUCTS      |
| 055  | PATCH  | `/api/v1/products/{productId}`                                     | AUTH            | PRODUCTS      |
| 056  | DELETE | `/api/v1/products/{productId}`                                     | AUTH            | PRODUCTS      |
| 057  | POST   | `/api/v1/inventory-items`                                          | AUTH            | INVENTORY     |
| 058  | GET    | `/api/v1/inventory-items/{inventoryItemId}`                        | AUTH            | INVENTORY     |
| 059  | GET    | `/api/v1/inventory-items`                                          | AUTH            | INVENTORY     |
| 060  | PATCH  | `/api/v1/inventory-items/{inventoryItemId}`                        | AUTH            | INVENTORY     |
| 061  | DELETE | `/api/v1/inventory-items/{inventoryItemId}`                        | AUTH            | INVENTORY     |
| 062  | GET    | `/api/v1/cart`                                                     | AUTH            | CART          |
| 063  | POST   | `/api/v1/cart/lines`                                               | AUTH            | CART          |
| 064  | PATCH  | `/api/v1/cart/lines/{cartLineId}`                                  | AUTH            | CART          |
| 065  | DELETE | `/api/v1/cart/lines/{cartLineId}`                                  | AUTH            | CART          |
| 066  | DELETE | `/api/v1/cart`                                                     | AUTH            | CART          |
| 067  | POST   | `/api/v1/vouchers`                                                 | AUTH            | VOUCHERS      |
| 068  | GET    | `/api/v1/vouchers/{voucherId}`                                     | AUTH            | VOUCHERS      |
| 069  | GET    | `/api/v1/vouchers/code/{code}`                                     | AUTH            | VOUCHERS      |
| 070  | GET    | `/api/v1/vouchers/validate`                                        | AUTH            | VOUCHERS      |
| 071  | GET    | `/api/v1/vouchers`                                                 | AUTH            | VOUCHERS      |
| 072  | PATCH  | `/api/v1/vouchers/{voucherId}`                                     | AUTH            | VOUCHERS      |
| 073  | DELETE | `/api/v1/vouchers/{voucherId}`                                     | AUTH            | VOUCHERS      |
| 074  | POST   | `/api/v1/rental-orders`                                            | AUTH            | RENTAL_ORDERS |
| 075  | GET    | `/api/v1/rental-orders/{rentalOrderId}`                            | AUTH            | RENTAL_ORDERS |
| 076  | GET    | `/api/v1/rental-orders`                                            | AUTH            | RENTAL_ORDERS |
| 077  | GET    | `/api/v1/rental-orders/hub/{hubId}`                                | AUTH            | RENTAL_ORDERS |
| 078  | GET    | `/api/v1/rental-orders/my-orders`                                  | AUTH            | RENTAL_ORDERS |
| 079  | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/status`                     | AUTH            | RENTAL_ORDERS |
| 080  | POST   | `/api/v1/rental-orders/{rentalOrderId}/cancel`                     | AUTH            | RENTAL_ORDERS |
| 081  | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/extend`                     | AUTH            | RENTAL_ORDERS |
| 082  | GET    | `/api/v1/rental-orders/{rentalOrderId}/staff-detail`               | AUTH            | RENTAL_ORDERS |
| 083  | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/assign-staff`               | AUTH            | RENTAL_ORDERS |
| 084  | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/record-delivery`            | AUTH            | RENTAL_ORDERS |
| 085  | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/record-pickup`              | AUTH            | RENTAL_ORDERS |
| 086  | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/set-penalty`                | AUTH            | RENTAL_ORDERS |
| 086A | GET    | `/api/v1/rental-orders/{rentalOrderId}/overdue-penalty-suggestion` | AUTH            | RENTAL_ORDERS |
| 087  | GET    | `/api/v1/payments/{paymentTransactionId}`                          | AUTH            | PAYMENTS      |
| 088  | GET    | `/api/v1/payments`                                                 | AUTH            | PAYMENTS      |
| 089  | GET    | `/api/v1/payments/rental-order/{rentalOrderId}`                    | AUTH            | PAYMENTS      |
| 090  | POST   | `/api/v1/payments/{rentalOrderId}/initiate`                        | AUTH            | PAYMENTS      |
| 091  | GET    | `/api/v1/payments/vnpay/ipn`                                       | PUBLIC          | PAYMENTS      |
| 092  | GET    | `/api/v1/payments/vnpay/return`                                    | PUBLIC          | PAYMENTS      |
| 093  | GET    | `/api/v1/contracts/{rentalContractId}`                             | AUTH            | CONTRACTS     |
| 094  | GET    | `/api/v1/contracts/rental-order/{rentalOrderId}`                   | AUTH            | CONTRACTS     |
| 095  | POST   | `/api/v1/reviews`                                                  | AUTH            | REVIEWS       |
| 096  | GET    | `/api/v1/reviews/{reviewId}`                                       | AUTH            | REVIEWS       |
| 097  | GET    | `/api/v1/reviews`                                                  | AUTH            | REVIEWS       |
| 098  | GET    | `/api/v1/reviews/product/{productId}`                              | AUTH            | REVIEWS       |
| 099  | DELETE | `/api/v1/reviews/{reviewId}`                                       | AUTH            | REVIEWS       |
| 100  | POST   | `/api/v1/contact-tickets`                                          | PUBLIC          | TICKETS       |
| 101  | GET    | `/api/v1/contact-tickets/{ticketId}`                               | AUTH            | TICKETS       |
| 102  | GET    | `/api/v1/contact-tickets`                                          | AUTH            | TICKETS       |
| 103  | GET    | `/api/v1/contact-tickets/my-tickets`                               | AUTH            | TICKETS       |
| 104  | PATCH  | `/api/v1/contact-tickets/{ticketId}/reply`                         | AUTH            | TICKETS       |
| 105  | PATCH  | `/api/v1/contact-tickets/{ticketId}/close`                         | AUTH            | TICKETS       |
| 106  | POST   | `/api/v1/policies`                                                 | AUTH            | POLICIES      |
| 107  | GET    | `/api/v1/policies/{policyId}`                                      | PUBLIC          | POLICIES      |
| 108  | GET    | `/api/v1/policies/code/{code}/latest`                              | PUBLIC          | POLICIES      |
| 109  | GET    | `/api/v1/policies`                                                 | PUBLIC          | POLICIES      |
| 109A | PATCH  | `/api/v1/policies/{policyId}`                                      | AUTH            | POLICIES      |
| 110  | PATCH  | `/api/v1/policies/{policyId}/deactivate`                           | AUTH            | POLICIES      |
| 111  | POST   | `/api/v1/policies/{policyId}/consent`                              | AUTH            | POLICIES      |
| 112  | GET    | `/api/v1/policies/my-consents`                                     | AUTH            | POLICIES      |
| 113  | GET    | `/api/v1/dashboards/admin`                                         | AUTH            | DASHBOARDS    |
| 114  | GET    | `/api/v1/dashboards/staff`                                         | AUTH            | DASHBOARDS    |
| 115  | POST   | `/api/v1/user-addresses`                                           | AUTH            | USERS         |
| 116  | GET    | `/api/v1/user-addresses`                                           | AUTH            | USERS         |
| 117  | GET    | `/api/v1/user-addresses/{userAddressId}`                           | AUTH            | USERS         |
| 118  | PATCH  | `/api/v1/user-addresses/{userAddressId}`                           | AUTH            | USERS         |
| 119  | DELETE | `/api/v1/user-addresses/{userAddressId}`                           | AUTH            | USERS         |
| 120  | PATCH  | `/api/v1/hubs/{hubId}/assign-staff`                                | AUTH            | HUBS          |
| 121  | GET    | `/api/v1/products/hub/{hubId}`                                     | PUBLIC          | PRODUCTS      |

---

## Phụ lục B: Common Error Codes

| ErrorCode key                            | Code | Message (rút gọn)                           |
| ---------------------------------------- | ---- | ------------------------------------------- |
| `UNAUTHENTICATED`                        | 1002 | Thông tin đăng nhập không hợp lệ            |
| `UNAUTHORIZED`                           | 1003 | Không có quyền truy cập tính năng           |
| `TOKEN_EXPIRED`                          | 1005 | Token truy cập đã hết hạn                   |
| `INVALID_TOKEN`                          | 1006 | Token truy cập không hợp lệ                 |
| `TOKEN_REVOKED`                          | 1007 | Token đã bị thu hồi                         |
| `MISSING_TOKEN`                          | 1010 | Thiếu token truy cập                        |
| `INVALID_REQUEST_DATA`                   | 1016 | Dữ liệu yêu cầu không hợp lệ                |
| `EMAIL_EXISTED`                          | 1112 | Email đã tồn tại                            |
| `NOT_VERIFIED_ACCOUNT`                   | 1116 | Tài khoản chưa xác thực email               |
| `PHONE_NUMBER_EXISTED`                   | 1117 | Số điện thoại đã tồn tại                    |
| `USER_NOT_FOUND`                         | 1201 | Không tìm thấy người dùng                   |
| `USER_NOT_STAFF_ROLE`                    | 1213 | Người dùng được gán không có vai trò STAFF  |
| `USER_ADDRESS_NOT_FOUND`                 | 1214 | Không tìm thấy địa chỉ người dùng           |
| `USER_ADDRESS_NOT_OWNED`                 | 1215 | Địa chỉ không thuộc user hiện tại           |
| `USER_ADDRESS_IN_USE`                    | 1218 | Địa chỉ đang được dùng bởi đơn thuê         |
| `HUB_STAFF_IDS_NOT_EMPTY`                | 1606 | Danh sách staffIds không được để trống      |
| `PRODUCT_NOT_FOUND`                      | 1801 | Không tìm thấy sản phẩm                     |
| `INVENTORY_INSUFFICIENT_STOCK`           | 1906 | Không đủ tồn kho                            |
| `CART_RENTAL_MIN_DAYS`                   | 2005 | Chưa đạt số ngày thuê tối thiểu             |
| `CART_QUANTITY_MIN_1`                    | 2006 | Số lượng phải >= 1                          |
| `RENTAL_DURATION_DAYS_MIN_1`             | 2008 | Thời lượng thuê phải >= 1                   |
| `VOUCHER_NOT_FOUND`                      | 2101 | Không tìm thấy voucher                      |
| `VOUCHER_EXPIRED`                        | 2104 | Voucher đã hết hạn                          |
| `VOUCHER_INACTIVE`                       | 2106 | Voucher không còn hoạt động                 |
| `VOUCHER_MIN_RENTAL_DAYS_NOT_MET`        | 2107 | Chưa đạt số ngày thuê tối thiểu của voucher |
| `VOUCHER_DISCOUNT_TYPE_INVALID`          | 2108 | Loại giảm giá không hợp lệ                  |
| `VOUCHER_TYPE_INVALID`                   | 2109 | Loại voucher không hợp lệ                   |
| `VOUCHER_ALREADY_USED`                   | 2110 | User đã dùng voucher này trước đó           |
| `VOUCHER_PRODUCT_REQUIRED`               | 2111 | Voucher PRODUCT_DISCOUNT phải có product    |
| `VOUCHER_PRODUCT_SCOPE_INVALID`          | 2112 | Voucher không áp dụng cho product này       |
| `RENTAL_ORDER_NOT_FOUND`                 | 2201 | Không tìm thấy đơn thuê                     |
| `RENTAL_ORDER_INVALID_STATUS_TRANSITION` | 2202 | Chuyển trạng thái đơn thuê không hợp lệ     |
| `RENTAL_ORDER_CANNOT_CANCEL`             | 2203 | Không thể hủy đơn ở trạng thái hiện tại     |
| `RENTAL_ORDER_EXTENSION_CONFLICT`        | 2213 | Gia hạn thất bại do xung đột lịch           |
| `RENTAL_ORDER_USER_ADDRESS_REQUIRED`     | 2214 | Cần chọn địa chỉ giao hàng hợp lệ           |
| `PAYMENT_NOT_FOUND`                      | 2301 | Không tìm thấy giao dịch thanh toán         |
| `PAYMENT_AMOUNT_MIN`                     | 2304 | Số tiền thanh toán phải > 0                 |
| `CONTRACT_NOT_FOUND`                     | 2401 | Không tìm thấy hợp đồng                     |
| `CONTRACT_ALREADY_EXISTS_FOR_ORDER`      | 2403 | Đơn thuê đã có hợp đồng                     |
| `REVIEW_ALREADY_EXISTS`                  | 2502 | Đã đánh giá sản phẩm này cho đơn thuê       |
| `REVIEW_ORDER_NOT_COMPLETED`             | 2505 | Chỉ đánh giá khi đơn thuê đã hoàn thành     |
| `REVIEW_NOT_ORDER_OWNER`                 | 2506 | Không phải chủ sở hữu đơn thuê để đánh giá  |
| `REVIEW_PRODUCT_NOT_RENTED`              | 2507 | Chưa có lịch sử thuê COMPLETED với sản phẩm |
| `TICKET_NOT_FOUND`                       | 2601 | Không tìm thấy ticket hỗ trợ                |
| `TICKET_ALREADY_CLOSED`                  | 2604 | Ticket đã đóng                              |
| `POLICY_NOT_FOUND`                       | 2701 | Không tìm thấy tài liệu chính sách          |
| `CONSENT_NOT_FOUND`                      | 2801 | Không tìm thấy bản đồng ý                   |

Nguồn chuẩn: `src/main/java/com/devloopsx/swiftera2/exception/ErrorCode.java`.

---

## Phụ lục C: Enum Values (Code-First)

- `RoleType`: `CUSTOMER_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`
- `RentalOrderStatus`: `PENDING_PAYMENT`, `PAID`, `PREPARING`, `DELIVERING`, `DELIVERED`, `IN_USE`, `PENDING_PICKUP`, `PICKING_UP`, `PICKED_UP`, `COMPLETED`, `CANCELLED`
- `InventoryItemStatus`: `AVAILABLE`, `RESERVED`, `RENTED`, `MAINTENANCE`, `DAMAGED`, `RETIRED`
- `ConditionGrade`: `NEW`, `GOOD`, `FAIR`, `POOR`
- `DiscountType`: `PERCENTAGE`, `FIXED`
- `PaymentTransactionType`: `RENTAL_FEE`, `DEPOSIT`, `DEPOSIT_REFUND`, `PENALTY`
- `PaymentTransactionStatus`: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`
- `PaymentMethod`: `VNPAY`, `BANK_TRANSFER`, `CASH`
- `ContactTicketStatus`: `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- `ConsentType`: `ACCEPTED`, `DECLINED`
- `AcceptMethod`: `CLICK`, `SIGNATURE`
- `PhotoPhase`: `CHECKOUT`, `CHECKIN`
- `HttpMethodType`: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`

---
