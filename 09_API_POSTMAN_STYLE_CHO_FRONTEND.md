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
?page=0&size=10&sort=createdAt,desc
```

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
- **URL**: `/api/v1/users?page=0&size=10&sort=createdAt,desc&filter=email:'user@gmail.com'`

**Response**:

```json
{
    "success": true,
    "message": "Lấy danh sách người dùng thành công với bộ lọc truy vấn",
    "data": {
        "meta": {
            "currentPage": 0,
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
- **URL**: `/api/v1/roles?page=0&size=10`

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
- **URL**: `/api/v1/permissions?page=0&size=20&filter=module:'CART'`

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

## Module 6: HUBS (5 APIs)

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
- **URL**: `/api/v1/hubs?page=0&size=10&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `HubResponse`

**Ghi chú**:

- API này là public, không cần token.
- Để hiển thị cho người dùng cuối, FE nên truyền `filter=isActive:true`.
- Nếu không truyền `filter`, backend vẫn trả theo đúng query/paging (có thể gồm cả hub `isActive:false`).

---

### API-043: Cập nhật hub [AUTH]

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

**Response**: `HubResponse`

---

### API-044: Xóa hub [AUTH]

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

### API-045: Tạo danh mục [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/categories`

**Request body**:

```json
{
    "parentId": null,
    "name": "Máy ảnh",
    "sortOrder": 1
}
```

| Field                   | Bắt buộc |
| ----------------------- | -------- |
| `name`                  | ✓        |
| `parentId`, `sortOrder` | tùy chọn |

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
        "sortOrder": 1,
        "isActive": true,
        "children": [],
        "createdAt": "2026-03-24 10:00:00 AM",
        "updatedAt": "2026-03-24 10:00:00 AM"
    }
}
```

---

### API-046: Lấy danh mục theo ID [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/categories/{categoryId}`

**Response**: `CategoryResponse` (xem API-045)

---

### API-047: Lấy danh sách danh mục [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/categories?page=0&size=20&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `CategoryResponse`

**Ghi chú**:

- API này trả danh sách phẳng (flat), **không build `children` đệ quy** để tránh trùng chức năng với API cây danh mục.
- Dùng API này cho admin table/filter/pagination.

---

### API-048: Lấy cây danh mục (toàn bộ phân cấp) [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/categories/tree`

**Response**:

```json
{
    "data": [
        {
            "categoryId": "cat-uuid-001",
            "name": "Máy ảnh",
            "sortOrder": 1,
            "isActive": true,
            "children": [
                {
                    "categoryId": "cat-uuid-002",
                    "name": "Mirrorless",
                    "isActive": true,
                    "children": []
                }
            ]
        }
    ]
}
```

---

### API-049: Cập nhật danh mục [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/categories/{categoryId}`

**Request body** (tất cả tùy chọn):

```json
{
    "parentId": "parent-uuid",
    "name": "Máy ảnh & Camcorder",
    "sortOrder": 2,
    "isActive": true
}
```

**Rule `parentId` khi update**:

- Không gửi field `parentId`: giữ nguyên cha hiện tại.
- Gửi `"parentId": null` (hoặc chuỗi rỗng): chuyển thành category root.
- Gửi `parentId` khác: chuyển category sang cha mới.
- Không được tự trỏ vào chính nó hoặc trỏ vào node con của chính nó (chặn vòng lặp), lỗi `CATEGORY_CIRCULAR_REFERENCE`.

**Rule `sortOrder` khi update**:

- Nếu chỉ đổi `sortOrder` (cùng cha): backend reorder lại toàn bộ sibling cùng cha, không tạo xung đột thứ tự.
- Nếu đổi cha và không gửi `sortOrder`: category được đưa xuống cuối danh sách của cha mới.
- Nếu đổi cha và có `sortOrder`: backend chèn đúng vị trí trong cha mới và tự reindex sibling.
- `sortOrder` phải `>= 1`, nếu không lỗi `CATEGORY_SORT_ORDER_MIN_1`.

**Response**: `CategoryResponse`

---

### API-050: Xóa danh mục [AUTH]

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

## Module 8: PRODUCTS (5 APIs)

---

### API-051: Tạo sản phẩm [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/products`

**Request body**:

```json
{
    "categoryId": "cat-uuid-mirrorless",
    "brand": "Canon",
    "color": "Black",
    "name": "Canon EOS R50",
    "description": "Máy ảnh mirrorless APS-C 24.2MP dành cho người mới bắt đầu",
    "dailyPrice": 250000,
    "oldDailyPrice": 300000,
    "depositAmount": 5000000,
    "minRentalDays": 1,
    "imageUrls": [
        "https://cdn.example.com/products/canon-r50-front.jpg",
        "https://cdn.example.com/products/canon-r50-back.jpg"
    ]
}
```

| Field                                                                          | Bắt buộc |
| ------------------------------------------------------------------------------ | -------- |
| `categoryId`                                                                   | ✓        |
| `name`                                                                         | ✓        |
| `dailyPrice`                                                                   | ✓, > 0   |
| `depositAmount`                                                                | ✓, >= 0  |
| `brand`, `color`, `description`, `oldDailyPrice`, `minRentalDays`, `imageUrls` | tùy chọn |

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
        "color": "Black",
        "name": "Canon EOS R50",
        "description": "Máy ảnh mirrorless APS-C 24.2MP dành cho người mới bắt đầu",
        "dailyPrice": 250000,
        "oldDailyPrice": 300000,
        "depositAmount": 5000000,
        "minRentalDays": 1,
        "isActive": true,
        "images": [],
        "availableStock": 0,
        "averageRating": null,
        "createdAt": "2026-03-24 10:00:00 AM",
        "updatedAt": "2026-03-24 10:00:00 AM"
    }
}
```

**Lưu ý**: `images` là mảng `ProductImageResponse[]` mỗi phần tử: `{ productImageId, imageUrl, sortOrder, isPrimary }`

---

### API-052: Lấy sản phẩm theo ID [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/products/{productId}`

**Response**: `ProductResponse` (xem API-051)

---

### API-053: Lấy danh sách sản phẩm [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/products?page=0&size=12&sort=createdAt,desc&filter=isActive:true and categoryId:'cat-uuid-mirrorless'`

**Response**: `PaginationResponse` chứa mảng `ProductResponse`

---

### API-054: Cập nhật sản phẩm [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/products/{productId}`

**Request body** (tất cả tùy chọn):

```json
{
    "categoryId": "cat-uuid-new",
    "brand": "Canon",
    "color": "Silver",
    "name": "Canon EOS R50 Silver",
    "description": "Phiên bản màu bạc",
    "dailyPrice": 270000,
    "oldDailyPrice": 300000,
    "depositAmount": 5500000,
    "minRentalDays": 2,
    "imageUrls": [
        "https://cdn.example.com/products/canon-r50-silver-front.jpg"
    ],
    "isActive": true
}
```

**Rule giá**:

- Khi update, backend cũng kiểm tra `oldDailyPrice >= dailyPrice` trên giá trị cuối cùng sau cập nhật.

**Response**: `ProductResponse`

---

### API-055: Xóa sản phẩm [AUTH]

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

---

## Module 9: INVENTORY ITEMS (5 APIs)

---

### API-056: Tạo mục kho (serial) [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/inventory-items`

**Request body**:

```json
{
    "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
    "hubId": "h1a2b3c4-...",
    "serialNumber": "CANON-R50-001",
    "conditionGrade": "NEW",
    "staffNote": "Mới nhập kho tháng 3/2026"
}
```

| Field            | Bắt buộc | Giá trị                       |
| ---------------- | -------- | ----------------------------- |
| `productId`      | ✓        | UUID product                  |
| `hubId`          | ✓        | UUID hub                      |
| `serialNumber`   | ✓        | chuỗi duy nhất                |
| `conditionGrade` | tùy chọn | `NEW`, `GOOD`, `FAIR`, `POOR` |
| `staffNote`      | tùy chọn | ghi chú nội bộ                |

**Response**:

```json
{
    "data": {
        "inventoryItemId": "inv-uuid-001",
        "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
        "productName": "Canon EOS R50",
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

### API-057: Lấy mục kho theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/inventory-items/{inventoryItemId}`

**Response**: `InventoryItemResponse` (xem API-056)

---

### API-058: Lấy danh sách mục kho [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/inventory-items?page=0&size=20&filter=productId:'...' and status:'AVAILABLE'`

**Response**: `PaginationResponse` chứa mảng `InventoryItemResponse`

---

### API-059: Cập nhật mục kho [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/inventory-items/{inventoryItemId}`

**Request body** (tất cả tùy chọn):

```json
{
    "hubId": "hub-uuid-new",
    "status": "MAINTENANCE",
    "conditionGrade": "FAIR",
    "staffNote": "Còn vết xước nhẹ trên thân máy"
}
```

**Response**: `InventoryItemResponse`

---

### API-060: Xóa mục kho [AUTH]

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

### API-061: Lấy giỏ hàng hiện tại [AUTH]

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
                "productName": "Canon EOS R50",
                "productImageUrl": "https://cdn.example.com/canon-r50.jpg",
                "dailyPrice": 250000,
                "rentalDurationDays": 5,
                "quantity": 2,
                "lineTotal": 2500000
            }
        ],
        "createdAt": "2026-03-24 10:00:00 AM",
        "updatedAt": "2026-03-24 10:00:00 AM"
    }
}
```

**Ghi chú**: `lineTotal = dailyPrice × quantity × rentalDurationDays`

---

### API-062: Thêm dòng vào giỏ [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/cart/lines`

**Request body**:

```json
{
    "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
    "rentalDurationDays": 7,
    "quantity": 1
}
```

| Field                | Bắt buộc | Validation                         |
| -------------------- | -------- | ---------------------------------- |
| `productId`          | ✓        | UUID product đang active           |
| `rentalDurationDays` | ✓        | >= 1 và >= `product.minRentalDays` |
| `quantity`           | tùy chọn | >= 1 (mặc định 1)                  |

**Merge logic**: Nếu đã có line cùng `productId` và `rentalDurationDays`, quantity sẽ cộng thêm.

**Response**: `CartResponse` (xem API-061)

**Lỗi thường gặp**: `PRODUCT_NOT_FOUND`, `RENTAL_DURATION_DAYS_MIN_1`, `CART_RENTAL_MIN_DAYS`, `CART_QUANTITY_MIN_1`

---

### API-063: Cập nhật dòng giỏ [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/cart/lines/{cartLineId}`

**Request body** (tất cả tùy chọn):

```json
{
    "rentalDurationDays": 10,
    "quantity": 3
}
```

**Response**: `CartResponse` (xem API-061)

---

### API-064: Xóa một dòng giỏ [AUTH]

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

### API-065: Xóa toàn bộ giỏ [AUTH]

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

### API-066: Tạo voucher [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/vouchers`

**Request body**:

```json
{
    "code": "SUMMER30",
    "discountType": "PERCENTAGE",
    "discountValue": 30,
    "maxDiscountAmount": 500000,
    "minRentalDays": 3,
    "expiresAt": "2026-12-31T16:59:59Z",
    "usageLimit": 100
}
```

| Field               | Bắt buộc | Giá trị                               |
| ------------------- | -------- | ------------------------------------- |
| `code`              | ✓        | mã voucher duy nhất                   |
| `discountType`      | ✓        | `PERCENTAGE` hoặc `FIXED_AMOUNT`      |
| `discountValue`     | ✓        | > 0                                   |
| `maxDiscountAmount` | tùy chọn | giới hạn giảm tối đa (cho PERCENTAGE) |
| `minRentalDays`     | tùy chọn | số ngày thuê tối thiểu để áp dụng     |
| `expiresAt`         | tùy chọn | ISO 8601 UTC                          |
| `usageLimit`        | tùy chọn | giới hạn số lần dùng                  |

**Response**:

```json
{
    "data": {
        "voucherId": "v-uuid-001",
        "code": "SUMMER30",
        "discountType": "PERCENTAGE",
        "discountValue": 30,
        "maxDiscountAmount": 500000,
        "minRentalDays": 3,
        "expiresAt": "2026-12-31 11:59:59 PM",
        "usageLimit": 100,
        "usedCount": 0,
        "isActive": true,
        "createdAt": "2026-03-24 10:00:00 AM",
        "updatedAt": "2026-03-24 10:00:00 AM"
    }
}
```

---

### API-067: Lấy voucher theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers/{voucherId}`

**Response**: `VoucherResponse` (xem API-066)

---

### API-068: Lấy voucher theo mã code [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers/code/{code}`

Ví dụ: `/api/v1/vouchers/code/SUMMER30`

**Response**: `VoucherResponse` (xem API-066)

---

### API-069: Kiểm tra và tính giảm giá voucher [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers/validate?code=SUMMER30&rentalDurationDays=7&rentalSubtotalAmount=3500000`

| Query param            | Bắt buộc | Ý nghĩa                  |
| ---------------------- | -------- | ------------------------ |
| `code`                 | ✓        | mã voucher cần kiểm tra  |
| `rentalDurationDays`   | ✓        | tổng ngày thuê của đơn   |
| `rentalSubtotalAmount` | ✓        | tổng phí thuê trước giảm |

**Response**:

```json
{
    "data": {
        "code": "SUMMER30",
        "valid": true,
        "rentalSubtotalAmount": 3500000,
        "discountAmount": 500000,
        "rentalFeeAmount": 3000000,
        "rentalDurationDays": 7,
        "expiresAt": "2026-12-31T16:59:59Z"
    }
}
```

**Lỗi thường gặp**: `VOUCHER_NOT_FOUND`, `VOUCHER_INACTIVE`, `VOUCHER_EXPIRED`, `VOUCHER_USAGE_LIMIT_REACHED`, `VOUCHER_MIN_RENTAL_DAYS_NOT_MET`

---

### API-070: Lấy danh sách voucher [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/vouchers?page=0&size=10&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `VoucherResponse`

---

### API-071: Cập nhật voucher [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/vouchers/{voucherId}`

**Request body** (tất cả tùy chọn):

```json
{
    "discountType": "FIXED_AMOUNT",
    "discountValue": 200000,
    "maxDiscountAmount": null,
    "minRentalDays": 5,
    "expiresAt": "2027-06-30T16:59:59Z",
    "usageLimit": 200,
    "isActive": true
}
```

**Response**: `VoucherResponse`

---

### API-072: Xóa voucher [AUTH]

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

## Module 12: RENTAL ORDERS (12 APIs)

---

### API-073: Tạo đơn thuê [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/rental-orders`

**Request body**:

```json
{
    "deliveryRecipientName": "Nguyen Van A",
    "deliveryPhone": "0988888888",
    "deliveryAddressLine": "123 Nguyen Trai",
    "deliveryWard": "Phường 2",
    "deliveryDistrict": "Quận 5",
    "deliveryCity": "Hồ Chí Minh",
    "expectedDeliveryDate": "2026-03-26",
    "voucherCode": "SUMMER30",
    "orderLines": [
        {
            "productId": "f3152824-15dd-4c17-af69-c92089e86d22",
            "quantity": 1,
            "rentalDurationDays": 5
        },
        {
            "productId": "5a43f1f5-8fb1-4ea1-8a70-c38393f32888",
            "quantity": 2,
            "rentalDurationDays": 7
        }
    ]
}
```

| Field                                    | Bắt buộc | Validation                             |
| ---------------------------------------- | -------- | -------------------------------------- |
| `deliveryRecipientName`                  | ✓        | not blank                              |
| `deliveryPhone`                          | ✓        | not blank                              |
| `expectedDeliveryDate`                   | ✓        | định dạng `YYYY-MM-DD`, >= hôm nay     |
| `orderLines`                             | ✓        | không rỗng                             |
| `orderLines[].productId`                 | ✓        | UUID product tồn tại, đang active      |
| `orderLines[].quantity`                  | ✓        | >= 1                                   |
| `orderLines[].rentalDurationDays`        | ✓        | >= 1 và >= `minRentalDays` của product |
| `deliveryAddressLine/Ward/District/City` | tùy chọn | địa chỉ giao                           |
| `voucherCode`                            | tùy chọn | mã voucher hợp lệ                      |

**Response**:

```json
{
    "success": true,
    "message": "Tạo đơn thuê thành công",
    "data": {
        "rentalOrderId": "6cc84ef6-20e2-4c9d-bde0-d322d8a8bc11",
        "userId": "d4f6e5a8-...",
        "hubId": null,
        "hubName": null,
        "deliveryRecipientName": "Nguyen Van A",
        "deliveryPhone": "0988888888",
        "deliveryAddressLine": "123 Nguyen Trai",
        "deliveryWard": "Phường 2",
        "deliveryDistrict": "Quận 5",
        "deliveryCity": "Hồ Chí Minh",
        "deliveryLatitude": null,
        "deliveryLongitude": null,
        "expectedDeliveryDate": "2026-03-26",
        "expectedRentalEndDate": "2026-04-02",
        "plannedDeliveryAt": null,
        "actualDeliveryAt": null,
        "actualRentalStartAt": null,
        "deliveredLatitude": null,
        "deliveredLongitude": null,
        "plannedPickupAt": null,
        "actualRentalEndAt": null,
        "pickedUpAt": null,
        "pickedUpLatitude": null,
        "pickedUpLongitude": null,
        "status": "PENDING_PAYMENT",
        "rentalSubtotalAmount": 4250000,
        "voucherCodeSnapshot": "SUMMER30",
        "voucherDiscountAmount": 500000,
        "rentalFeeAmount": 3750000,
        "depositHoldAmount": 10000000,
        "totalPayableAmount": 13750000,
        "penaltyChargeAmount": null,
        "depositRefundAmount": null,
        "totalPaidAmount": 0,
        "placedAt": "2026-03-24 10:00:00 AM",
        "rentalOrderLines": [
            {
                "rentalOrderLineId": "rol-uuid-001",
                "productId": "f3152824-...",
                "productNameSnapshot": "Canon EOS R50",
                "inventoryItemId": "inv-uuid-001",
                "inventorySerialNumber": "CANON-R50-001",
                "dailyPriceSnapshot": 250000,
                "depositAmountSnapshot": 5000000,
                "rentalDurationDays": 5,
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

**Trạng thái đơn thuê**:
`PENDING_PAYMENT → PAID → CONFIRMED → DELIVERING → ACTIVE → RETURNING → COMPLETED`

hoặc hủy: `PENDING_PAYMENT → CANCELLED`

**Lỗi thường gặp**: `INVENTORY_INSUFFICIENT_STOCK`, `RENTAL_ORDER_MIN_DAYS_NOT_MET`, `VOUCHER_EXPIRED`, `VOUCHER_MIN_RENTAL_DAYS_NOT_MET`

---

### API-074: Lấy đơn thuê theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}`

**Response**: `RentalOrderResponse` đầy đủ (xem API-073)

---

### API-075: Lấy danh sách đơn thuê (admin/staff) [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders?page=0&size=10&sort=placedAt,desc&filter=status:'PENDING_PAYMENT'`

**Response**: `PaginationResponse` chứa mảng `RentalOrderResponse`

---

### API-076: Lấy danh sách đơn thuê của tôi [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/rental-orders/my-orders?page=0&size=10`

**Response**: `PaginationResponse` chứa mảng `RentalOrderResponse` của user hiện tại

---

### API-077: Cập nhật trạng thái đơn thuê [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/status`

**Request body**:

```json
{
    "status": "CONFIRMED"
}
```

**Chuyển đổi trạng thái cho phép**:

| Từ                | Sang         |
| ----------------- | ------------ |
| `PENDING_PAYMENT` | `PAID`       |
| `PAID`            | `CONFIRMED`  |
| `CONFIRMED`       | `DELIVERING` |
| `DELIVERING`      | `ACTIVE`     |
| `ACTIVE`          | `RETURNING`  |
| `RETURNING`       | `COMPLETED`  |

**Response**: `RentalOrderResponse`

---

### API-078: Hủy đơn thuê [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/cancel`

**Request body**: không có

**Rule**: chỉ hủy khi status là `PENDING_PAYMENT`.

**Side effects**: Voucher `usedCount` giảm 1 nếu đơn dùng voucher.

**Response**:

```json
{
    "success": true,
    "message": "Hủy đơn thuê thành công",
    "data": null
}
```

---

### API-079: Gia hạn đơn thuê [AUTH]

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

- Tăng `rentalDurationDays` cho tất cả line trong đơn
- Cập nhật `expectedRentalEndDate`
- Nếu serial hiện tại bị conflict lịch sau gia hạn → tự tìm serial khác cùng product không bị xung đột (ưu tiên AVAILABLE → conditionGrade tốt hơn → FIFO)
- Tính lại `rentalSubtotalAmount`, `rentalFeeAmount`, `totalPayableAmount`

**Response**: `RentalOrderResponse` đầy đủ

**Lỗi thường gặp**: `RENTAL_ORDER_EXTENSION_CONFLICT` (không tìm được serial hợp lệ), `RENTAL_ORDER_INVALID_STATUS_TRANSITION`

---

### API-080: Gán hub cho đơn thuê [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/assign-hub`

**Request body**:

```json
{
    "hubId": "h1a2b3c4-..."
}
```

**Response**: `RentalOrderResponse`

---

### API-081: Gán nhân viên cho đơn thuê [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/assign-staff`

**Request body** (tất cả tùy chọn):

```json
{
    "deliveryStaffId": "user-uuid-staff1",
    "pickupStaffId": "user-uuid-staff2"
}
```

**Response**: `RentalOrderResponse`

---

### API-082: Ghi nhận giao hàng [AUTH]

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

- Set `actualDeliveryAt` và `actualRentalStartAt`
- Cập nhật `expectedRentalEndDate = actualRentalStartAt + max(rentalDurationDays)`
- Inventory: `AVAILABLE → RENTED`

**Response**: `RentalOrderResponse`

---

### API-083: Ghi nhận thu hồi [AUTH]

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

- Set `actualRentalEndAt` và `pickedUpAt`
- Inventory: `RENTED → AVAILABLE`

**Response**: `RentalOrderResponse`

---

### API-084: Cập nhật phí phạt đơn thuê [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/rental-orders/{rentalOrderId}/set-penalty`

**Request body**:

```json
{
    "penaltyTotal": 500000,
    "note": "Máy bị xước nhẹ, đền bù phụ kiện"
}
```

| Field          | Bắt buộc | Validation         |
| -------------- | -------- | ------------------ |
| `penaltyTotal` | ✓        | >= 0               |
| `note`         | tùy chọn | ghi chú lý do phạt |

**Business logic**: `depositRefundAmount = depositHoldAmount - penaltyChargeAmount`

**Response**: `RentalOrderResponse`

---

## Module 13: PAYMENTS (6 APIs)

---

### API-085: Lấy giao dịch thanh toán theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/payments/{paymentTransactionId}`

**Response**:

```json
{
    "data": {
        "paymentTransactionId": "pt-uuid-001",
        "rentalOrderId": "6cc84ef6-...",
        "transactionType": "PAYMENT",
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

**transactionType**: `PAYMENT`, `DEPOSIT_REFUND`, `PENALTY`
**status**: `PENDING`, `SUCCESS`, `FAILED`

---

### API-086: Lấy danh sách giao dịch [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/payments?page=0&size=10&filter=status:'SUCCESS'`

**Response**: `PaginationResponse` chứa mảng `PaymentTransactionResponse`

---

### API-087: Lấy giao dịch theo đơn thuê [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/payments/rental-order/{rentalOrderId}?page=0&size=10`

**Response**: `PaginationResponse` chứa mảng `PaymentTransactionResponse` của đơn đó

---

### API-088: Tạo link thanh toán VNPay [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/payments/{rentalOrderId}/initiate`

**Request body**: không có

**Logic**: `amount = totalPayableAmount - totalPaidAmount`. Tạo transaction PENDING.

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

### API-089: VNPay IPN webhook (server-to-server) [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/payments/vnpay/ipn`
- **Query params**: Toàn bộ params chuẩn VNPay (vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_SecureHash, ...)

**Gọi bởi VNPay server**, không gọi từ frontend. Backend verify checksum và cập nhật trạng thái.

**Side effects khi thành công**:

- Transaction → `SUCCESS`, ghi `paidAt`
- `totalPaidAmount += amount`
- Nếu `totalPaidAmount >= totalPayableAmount` → Order → `PAID`

**Response** (VNPay-format):

```json
{ "RspCode": "00", "Message": "Confirm Success" }
```

---

### API-090: VNPay return redirect (browser) [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/payments/vnpay/return`
- **Query params**: Toàn bộ params chuẩn VNPay

**Gọi bởi VNPay sau khi user trả về từ cổng thanh toán.**

**Response**: HTTP 302 redirect sang frontend URL (cấu hình trong `application.yaml`) kèm query params kết quả.

---

## Module 14: CONTRACTS (3 APIs)

---

### API-091: Lấy hợp đồng theo ID [AUTH]

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
        "acceptMethod": "DIGITAL_SIGNATURE",
        "acceptedAt": "2026-03-24 10:30:00 AM",
        "contractPdfUrl": "https://<storage-account>.blob.core.windows.net/<container>/contracts/2026/001.pdf",
        "createdAt": "2026-03-24 10:00:00 AM",
        "updatedAt": "2026-03-24 10:00:00 AM"
    }
}
```

**acceptMethod**: `DIGITAL_SIGNATURE`, `CHECKBOX`, `VERBAL`

---

### API-092: Lấy hợp đồng theo đơn thuê [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contracts/rental-order/{rentalOrderId}`

**Response**: `RentalContractResponse` (xem API-091)

---

### API-093: Tạo hợp đồng cho đơn thuê [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/contracts/rental-order/{rentalOrderId}`

**Request body**:

```json
{
    "policyDocumentId": "pd-uuid-001",
    "acceptMethod": "DIGITAL_SIGNATURE",
    "contractVersion": "v1.0",
    "acceptedIp": "192.168.1.1",
    "acceptedUserAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "contractPdfUrl": "https://<storage-account>.blob.core.windows.net/<container>/contracts/2026/001.pdf",
    "contractPdfHash": "sha256:abc123..."
}
```

| Field                                                                                     | Bắt buộc |
| ----------------------------------------------------------------------------------------- | -------- |
| `policyDocumentId`                                                                        | ✓        |
| `acceptMethod`                                                                            | ✓        |
| `contractVersion`, `acceptedIp`, `acceptedUserAgent`, `contractPdfUrl`, `contractPdfHash` | tùy chọn |

**Response**: `RentalContractResponse`

---

## Module 15: REVIEWS (5 APIs)

---

### API-094: Tạo đánh giá sản phẩm [AUTH]

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

### API-095: Lấy đánh giá theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/reviews/{reviewId}`

**Response**: `ProductReviewResponse` (xem API-094)

---

### API-096: Lấy danh sách đánh giá [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/reviews?page=0&size=10&filter=productId:'...'`

**Response**: `PaginationResponse` chứa mảng `ProductReviewResponse`

---

### API-097: Lấy đánh giá theo sản phẩm [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/reviews/product/{productId}?page=0&size=10`

**Response**: `PaginationResponse` chứa mảng `ProductReviewResponse` của sản phẩm đó

---

### API-098: Xóa đánh giá [AUTH]

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

### API-099: Tạo ticket hỗ trợ [PUBLIC]

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
        "status": "OPEN",
        "handledByUserId": null,
        "sellerReply": null,
        "repliedAt": null,
        "closedAt": null,
        "createdAt": "2026-03-24 10:00:00 AM",
        "updatedAt": "2026-03-24 10:00:00 AM"
    }
}
```

**status**: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

---

### API-100: Lấy ticket theo ID [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contact-tickets/{ticketId}`

**Response**: `ContactTicketResponse` (xem API-099)

---

### API-101: Lấy danh sách ticket (admin/staff) [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contact-tickets?page=0&size=10&filter=status:'OPEN'`

**Response**: `PaginationResponse` chứa mảng `ContactTicketResponse`

---

### API-102: Lấy danh sách ticket của tôi [AUTH]

- **Method**: `GET`
- **URL**: `/api/v1/contact-tickets/my-tickets?page=0&size=10`

**Response**: `PaginationResponse` chứa mảng `ContactTicketResponse` của user hiện tại

---

### API-103: Trả lời ticket [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/contact-tickets/{ticketId}/reply`

**Request body**:

```json
{
    "sellerReply": "Cảm ơn bạn đã phản ánh. Chúng tôi sẽ liên hệ trong vòng 24 giờ."
}
```

**Side effects**: Set `repliedAt = now()`, status → `IN_PROGRESS`

**Response**: `ContactTicketResponse`

---

### API-104: Đóng ticket [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/contact-tickets/{ticketId}/close`

**Request body**: không có

**Side effects**: Set `closedAt = now()`, status → `CLOSED`

**Response**: `ContactTicketResponse`

---

## Module 17: POLICIES (7 APIs)

---

### API-105: Tạo tài liệu chính sách [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/policies`

**Request body**:

```json
{
    "code": "RENTAL_TERMS",
    "policyVersion": 2,
    "title": "Điều khoản thuê thiết bị v2.0",
    "pdfUrl": "https://<storage-account>.blob.core.windows.net/<container>/policies/rental-terms-v2.pdf",
    "pdfHash": "sha256:def456...",
    "effectiveFrom": "2026-04-01T00:00:00Z"
}
```

| Field               | Bắt buộc |
| ------------------- | -------- |
| `code`              | ✓        |
| `policyVersion`     | ✓        |
| `title`             | ✓        |
| `effectiveFrom`     | ✓        |
| `pdfUrl`, `pdfHash` | tùy chọn |

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

### API-106: Lấy chính sách theo ID [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/policies/{policyId}`

**Response**: `PolicyDocumentResponse` (xem API-105)

---

### API-107: Lấy phiên bản chính sách mới nhất theo code [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/policies/code/{code}/latest`

Ví dụ: `/api/v1/policies/code/RENTAL_TERMS/latest`

**Response**: `PolicyDocumentResponse` có `isActive: true` và `policyVersion` cao nhất

---

### API-108: Lấy danh sách chính sách [PUBLIC]

- **Method**: `GET`
- **URL**: `/api/v1/policies?page=0&size=10&filter=isActive:true`

**Response**: `PaginationResponse` chứa mảng `PolicyDocumentResponse`

---

### API-109: Vô hiệu hóa chính sách [AUTH]

- **Method**: `PATCH`
- **URL**: `/api/v1/policies/{policyId}/deactivate`

**Request body**: không có

**Side effects**: `isActive → false`

**Response**: `PolicyDocumentResponse`

---

### API-110: Ghi nhận đồng ý chính sách [AUTH]

- **Method**: `POST`
- **URL**: `/api/v1/policies/{policyId}/consent`

**Request body**: không có (backend lấy IP và user agent từ `HttpServletRequest`)

**Response**:

```json
{
    "data": {
        "userConsentId": "uc-uuid-001",
        "userId": "d4f6e5a8-...",
        "policyDocumentId": "pd-uuid-001",
        "policyTitle": "Điều khoản thuê thiết bị v2.0",
        "consentType": "ACCEPT",
        "acceptedAt": "2026-03-24 10:30:00 AM",
        "ipAddress": "113.161.72.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "createdAt": "2026-03-24 10:30:00 AM",
        "updatedAt": "2026-03-24 10:30:00 AM"
    }
}
```

---

### API-111: Lấy danh sách đồng ý chính sách của tôi [AUTH]

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
            "policyTitle": "Điều khoản thuê thiết bị v2.0",
            "consentType": "ACCEPT",
            "acceptedAt": "2026-03-24 10:30:00 AM",
            "ipAddress": "113.161.72.100",
            "userAgent": "Mozilla/5.0...",
            "createdAt": "2026-03-24 10:30:00 AM",
            "updatedAt": "2026-03-24 10:30:00 AM"
        }
    ]
}
```

---

## Phụ lục A: Tổng hợp 114 APIs

| #   | Method | URL                                                     | Auth            | Module        |
| --- | ------ | ------------------------------------------------------- | --------------- | ------------- |
| 001 | POST   | `/api/v1/auth/register`                                 | PUBLIC          | AUTH          |
| 002 | POST   | `/api/v1/auth/verify-active-account`                    | PUBLIC          | AUTH          |
| 003 | POST   | `/api/v1/auth/resend-verify`                            | PUBLIC          | AUTH          |
| 004 | POST   | `/api/v1/auth/login`                                    | PUBLIC          | AUTH          |
| 005 | POST   | `/api/v1/auth/logout`                                   | AUTH            | AUTH          |
| 006 | GET    | `/api/v1/auth/account`                                  | AUTH            | AUTH          |
| 007 | GET    | `/api/v1/auth/refresh`                                  | PUBLIC (cookie) | AUTH          |
| 008 | POST   | `/api/v1/auth/forgot-password`                          | PUBLIC          | AUTH          |
| 009 | POST   | `/api/v1/auth/reset-password`                           | PUBLIC          | AUTH          |
| 010 | PATCH  | `/api/v1/users/update-profile`                          | AUTH            | USERS         |
| 011 | PUT    | `/api/v1/users/update-password`                         | AUTH            | USERS         |
| 012 | PUT    | `/api/v1/users/update-email`                            | AUTH            | USERS         |
| 013 | POST   | `/api/v1/users/verify-change-email`                     | AUTH            | USERS         |
| 014 | GET    | `/api/v1/users/{userId}`                                | AUTH            | USERS         |
| 015 | GET    | `/api/v1/users`                                         | AUTH            | USERS         |
| 016 | PATCH  | `/api/v1/users/{userId}`                                | AUTH            | USERS         |
| 017 | DELETE | `/api/v1/users/{userId}`                                | AUTH            | USERS         |
| 018 | DELETE | `/api/v1/users/{userId}/roles`                          | AUTH            | USERS         |
| 019 | POST   | `/api/v1/users/staff-requests`                          | AUTH            | USERS         |
| 020 | POST   | `/api/v1/roles`                                         | AUTH            | ROLES         |
| 021 | GET    | `/api/v1/roles/{roleId}`                                | AUTH            | ROLES         |
| 022 | GET    | `/api/v1/roles`                                         | AUTH            | ROLES         |
| 023 | PATCH  | `/api/v1/roles/{roleId}`                                | AUTH            | ROLES         |
| 024 | DELETE | `/api/v1/roles/{roleId}/permissions`                    | AUTH            | ROLES         |
| 025 | DELETE | `/api/v1/roles/{roleId}`                                | AUTH            | ROLES         |
| 026 | POST   | `/api/v1/permissions/module`                            | AUTH            | PERMISSIONS   |
| 027 | DELETE | `/api/v1/permissions/module/{name}`                     | AUTH            | PERMISSIONS   |
| 028 | GET    | `/api/v1/permissions/modules`                           | AUTH            | PERMISSIONS   |
| 029 | POST   | `/api/v1/permissions`                                   | AUTH            | PERMISSIONS   |
| 030 | PATCH  | `/api/v1/permissions/{permissionId}`                    | AUTH            | PERMISSIONS   |
| 031 | GET    | `/api/v1/permissions/{permissionId}`                    | AUTH            | PERMISSIONS   |
| 032 | GET    | `/api/v1/permissions`                                   | AUTH            | PERMISSIONS   |
| 033 | DELETE | `/api/v1/permissions/{permissionId}`                    | AUTH            | PERMISSIONS   |
| 034 | POST   | `/api/v1/storage/azure-blob/upload/single`              | AUTH            | FILES         |
| 035 | POST   | `/api/v1/storage/azure-blob/upload/multiple`            | AUTH            | FILES         |
| 036 | DELETE | `/api/v1/storage/azure-blob/delete/single`              | AUTH            | FILES         |
| 037 | DELETE | `/api/v1/storage/azure-blob/delete/multiple`            | AUTH            | FILES         |
| 038 | PUT    | `/api/v1/storage/azure-blob/move/single`                | AUTH            | FILES         |
| 039 | PUT    | `/api/v1/storage/azure-blob/move/multiple`              | AUTH            | FILES         |
| 040 | POST   | `/api/v1/hubs`                                          | AUTH            | HUBS          |
| 041 | GET    | `/api/v1/hubs/{hubId}`                                  | AUTH            | HUBS          |
| 042 | GET    | `/api/v1/hubs`                                          | PUBLIC          | HUBS          |
| 043 | PATCH  | `/api/v1/hubs/{hubId}`                                  | AUTH            | HUBS          |
| 044 | DELETE | `/api/v1/hubs/{hubId}`                                  | AUTH            | HUBS          |
| 045 | POST   | `/api/v1/categories`                                    | AUTH            | CATEGORIES    |
| 046 | GET    | `/api/v1/categories/{categoryId}`                       | PUBLIC          | CATEGORIES    |
| 047 | GET    | `/api/v1/categories`                                    | PUBLIC          | CATEGORIES    |
| 048 | GET    | `/api/v1/categories/tree`                               | PUBLIC          | CATEGORIES    |
| 049 | PATCH  | `/api/v1/categories/{categoryId}`                       | AUTH            | CATEGORIES    |
| 050 | DELETE | `/api/v1/categories/{categoryId}`                       | AUTH            | CATEGORIES    |
| 051 | POST   | `/api/v1/products`                                      | AUTH            | PRODUCTS      |
| 052 | GET    | `/api/v1/products/{productId}`                          | PUBLIC          | PRODUCTS      |
| 053 | GET    | `/api/v1/products`                                      | PUBLIC          | PRODUCTS      |
| 054 | PATCH  | `/api/v1/products/{productId}`                          | AUTH            | PRODUCTS      |
| 055 | DELETE | `/api/v1/products/{productId}`                          | AUTH            | PRODUCTS      |
| 056 | POST   | `/api/v1/inventory-items`                               | AUTH            | INVENTORY     |
| 057 | GET    | `/api/v1/inventory-items/{inventoryItemId}`             | AUTH            | INVENTORY     |
| 058 | GET    | `/api/v1/inventory-items`                               | AUTH            | INVENTORY     |
| 059 | PATCH  | `/api/v1/inventory-items/{inventoryItemId}`             | AUTH            | INVENTORY     |
| 060 | DELETE | `/api/v1/inventory-items/{inventoryItemId}`             | AUTH            | INVENTORY     |
| 061 | GET    | `/api/v1/cart`                                          | AUTH            | CART          |
| 062 | POST   | `/api/v1/cart/lines`                                    | AUTH            | CART          |
| 063 | PATCH  | `/api/v1/cart/lines/{cartLineId}`                       | AUTH            | CART          |
| 064 | DELETE | `/api/v1/cart/lines/{cartLineId}`                       | AUTH            | CART          |
| 065 | DELETE | `/api/v1/cart`                                          | AUTH            | CART          |
| 066 | POST   | `/api/v1/vouchers`                                      | AUTH            | VOUCHERS      |
| 067 | GET    | `/api/v1/vouchers/{voucherId}`                          | AUTH            | VOUCHERS      |
| 068 | GET    | `/api/v1/vouchers/code/{code}`                          | AUTH            | VOUCHERS      |
| 069 | GET    | `/api/v1/vouchers/validate`                             | AUTH            | VOUCHERS      |
| 070 | GET    | `/api/v1/vouchers`                                      | AUTH            | VOUCHERS      |
| 071 | PATCH  | `/api/v1/vouchers/{voucherId}`                          | AUTH            | VOUCHERS      |
| 072 | DELETE | `/api/v1/vouchers/{voucherId}`                          | AUTH            | VOUCHERS      |
| 073 | POST   | `/api/v1/rental-orders`                                 | AUTH            | RENTAL_ORDERS |
| 074 | GET    | `/api/v1/rental-orders/{rentalOrderId}`                 | AUTH            | RENTAL_ORDERS |
| 075 | GET    | `/api/v1/rental-orders`                                 | AUTH            | RENTAL_ORDERS |
| 076 | GET    | `/api/v1/rental-orders/my-orders`                       | AUTH            | RENTAL_ORDERS |
| 077 | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/status`          | AUTH            | RENTAL_ORDERS |
| 078 | POST   | `/api/v1/rental-orders/{rentalOrderId}/cancel`          | AUTH            | RENTAL_ORDERS |
| 079 | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/extend`          | AUTH            | RENTAL_ORDERS |
| 080 | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/assign-hub`      | AUTH            | RENTAL_ORDERS |
| 081 | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/assign-staff`    | AUTH            | RENTAL_ORDERS |
| 082 | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/record-delivery` | AUTH            | RENTAL_ORDERS |
| 083 | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/record-pickup`   | AUTH            | RENTAL_ORDERS |
| 084 | PATCH  | `/api/v1/rental-orders/{rentalOrderId}/set-penalty`     | AUTH            | RENTAL_ORDERS |
| 085 | GET    | `/api/v1/payments/{paymentTransactionId}`               | AUTH            | PAYMENTS      |
| 086 | GET    | `/api/v1/payments`                                      | AUTH            | PAYMENTS      |
| 087 | GET    | `/api/v1/payments/rental-order/{rentalOrderId}`         | AUTH            | PAYMENTS      |
| 088 | POST   | `/api/v1/payments/{rentalOrderId}/initiate`             | AUTH            | PAYMENTS      |
| 089 | GET    | `/api/v1/payments/vnpay/ipn`                            | PUBLIC          | PAYMENTS      |
| 090 | GET    | `/api/v1/payments/vnpay/return`                         | PUBLIC          | PAYMENTS      |
| 091 | GET    | `/api/v1/contracts/{rentalContractId}`                  | AUTH            | CONTRACTS     |
| 092 | GET    | `/api/v1/contracts/rental-order/{rentalOrderId}`        | AUTH            | CONTRACTS     |
| 093 | POST   | `/api/v1/contracts/rental-order/{rentalOrderId}`        | AUTH            | CONTRACTS     |
| 094 | POST   | `/api/v1/reviews`                                       | AUTH            | REVIEWS       |
| 095 | GET    | `/api/v1/reviews/{reviewId}`                            | AUTH            | REVIEWS       |
| 096 | GET    | `/api/v1/reviews`                                       | AUTH            | REVIEWS       |
| 097 | GET    | `/api/v1/reviews/product/{productId}`                   | AUTH            | REVIEWS       |
| 098 | DELETE | `/api/v1/reviews/{reviewId}`                            | AUTH            | REVIEWS       |
| 099 | POST   | `/api/v1/contact-tickets`                               | PUBLIC          | TICKETS       |
| 100 | GET    | `/api/v1/contact-tickets/{ticketId}`                    | AUTH            | TICKETS       |
| 101 | GET    | `/api/v1/contact-tickets`                               | AUTH            | TICKETS       |
| 102 | GET    | `/api/v1/contact-tickets/my-tickets`                    | AUTH            | TICKETS       |
| 103 | PATCH  | `/api/v1/contact-tickets/{ticketId}/reply`              | AUTH            | TICKETS       |
| 104 | PATCH  | `/api/v1/contact-tickets/{ticketId}/close`              | AUTH            | TICKETS       |
| 105 | POST   | `/api/v1/policies`                                      | AUTH            | POLICIES      |
| 106 | GET    | `/api/v1/policies/{policyId}`                           | PUBLIC          | POLICIES      |
| 107 | GET    | `/api/v1/policies/code/{code}/latest`                   | PUBLIC          | POLICIES      |
| 108 | GET    | `/api/v1/policies`                                      | PUBLIC          | POLICIES      |
| 109 | PATCH  | `/api/v1/policies/{policyId}/deactivate`                | AUTH            | POLICIES      |
| 110 | POST   | `/api/v1/policies/{policyId}/consent`                   | AUTH            | POLICIES      |
| 111 | GET    | `/api/v1/policies/my-consents`                          | AUTH            | POLICIES      |

---

## Phụ lục B: Common Error Codes

```json
{ "code": 1001, "message": "Token không hợp lệ hoặc đã hết hạn" }
{ "code": 1002, "message": "Tài khoản không tồn tại" }
{ "code": 1003, "message": "Mật khẩu không chính xác" }
{ "code": 1004, "message": "Tài khoản chưa được xác thực email" }
{ "code": 1005, "message": "Email đã tồn tại" }
{ "code": 2001, "message": "Sản phẩm không tồn tại hoặc không còn hoạt động" }
{ "code": 2002, "message": "Không đủ tồn kho phù hợp lịch booking" }
{ "code": 2003, "message": "Số ngày thuê phải >= 1" }
{ "code": 2004, "message": "Số ngày thuê chưa đạt mức tối thiểu của sản phẩm" }
{ "code": 2005, "message": "Voucher không tồn tại" }
{ "code": 2006, "message": "Voucher đã hết hạn" }
{ "code": 2007, "message": "Voucher đã dùng hết quota" }
{ "code": 2008, "message": "Số ngày thuê chưa đủ điều kiện dùng voucher" }
{ "code": 2009, "message": "Đơn thuê không ở trạng thái cho phép thao tác" }
{ "code": 2010, "message": "Không thể gia hạn vì xung đột lịch đặt thiết bị" }
{ "code": 2011, "message": "Chỉ hủy được đơn ở trạng thái PENDING_PAYMENT" }
{ "code": 2012, "message": "Số tiền thanh toán phải > 0" }
{ "code": 4001, "message": "Không có quyền truy cập" }
{ "code": 4002, "message": "Thiếu permission cho endpoint này" }
```

---
