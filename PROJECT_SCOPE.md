# Hướng Dẫn Phạm Vi Dự Án

Tài liệu này quy định mục đích và phạm vi sử dụng cho từng project trong solution `Admin101.slnx`.
Mục tiêu: đặt code đúng chỗ, đúng hướng phụ thuộc, dễ tái sử dụng và dễ bảo trì.

## 1) Quy tắc phụ thuộc (bắt buộc)

- `Admin.Api` -> được tham chiếu `Core.Application`, `Core.Infrastructure`.
- `Core.Infrastructure` -> được tham chiếu `Core.Application`, `Core.Domain`.
- `Core.Application` -> được tham chiếu `Core.Domain`.
- `Core.Domain` -> không tham chiếu project khác.
- `Shared.Common` -> project dùng chung, không phụ thuộc vào API/business cụ thể.

Nếu cần thêm package hoặc tham chiếu mới, ưu tiên giữ đúng hướng trên.

## 2) Phạm vi từng project

### `Admin.Api`

**Mục đích**
- Web host và entry point của hệ thống admin.
- Xử lý HTTP pipeline, auth/authorize middleware, controller, DI wiring.

**Nên đặt ở đây**
- `Program.cs`, startup configuration.
- Controllers, Filters, API-only middleware.
- API model binding/validation đặc thù endpoint.

**Không đặt ở đây**
- Business logic cốt lõi (use case).
- SQL/query, truy cập DB.
- Logic reusable cho project khác.

**Ví dụ hiện tại**
- `Admin.Api/Program.cs`
- `Admin.Api/Controllers/**`
- `Admin.Api/Filters/**`

---

### `Core.Application`

**Mục đích**
- Application layer: use case, service contract, DTO contract cho backend.
- Định nghĩa abstraction để Infrastructure implement.

**Nên đặt ở đây**
- `Abstractions/Services/*`, `Abstractions/Persistence/*`.
- Application services (orchestration).
- DTO request/response, pagination/filter contract.
- App-level exceptions/validation rules.

**Không đặt ở đây**
- Code framework HTTP (controller/middleware).
- SQL concretions, driver/ORM-specific implementation.
- Secrets/IO implementation.

**Ví dụ hiện tại**
- `Core.Application/Abstractions/**`
- `Core.Application/Services/**`
- `Core.Application/Common/PaginationRequest.cs`

---

### `Core.Domain`

**Mục đích**
- Domain model thuần: entity, enum, value object, quy tắc nghiệp vụ cốt lõi.

**Nên đặt ở đây**
- Entities, domain enums/constants.
- Domain-level helper không dính transport/UI.

**Không đặt ở đây**
- DTO cho API.
- UI projection (`SelectOption`, text label theo ngôn ngữ) nếu có thể mapping ở Application.
- Infrastructure details (cache, db, email, file, http client).

**Ví dụ hiện tại**
- `Core.Domain/Entities/**`
- `Core.Domain/Security/Permission.cs`
- `Core.Domain/Security/SysModule.cs`

---

### `Core.Infrastructure`

**Mục đích**
- Implement các abstraction của Application.
- Chứa toàn bộ kết nối bên ngoài: DB, cache, file, email/sms, jobs, external API.

**Nên đặt ở đây**
- Repositories và DB connection factory.
- Cache manager/provider.
- Email/SMS sender, file storage, background jobs.

**Không đặt ở đây**
- Controller/action.
- Business decision rules đặc thù use case (nếu không liên quan hạ tầng).

**Ví dụ hiện tại**
- `Core.Infrastructure/Persistence/**`
- `Core.Infrastructure/Caching/**`
- `Core.Infrastructure/Notifications/**`
- `Core.Infrastructure/Jobs/**`

---

### `Shared.Common`

**Mục đích**
- Tập code dùng chung cấp thấp, có thể tái sử dụng cho nhiều solution.

**Nên đặt ở đây**
- Utility/extension thuần, không phụ thuộc domain cụ thể.
- Primitive helper có tính chung cao.

**Không đặt ở đây**
- Bất kỳ logic nghiệp vụ của Admin/HR.
- Bất kỳ abstraction hoặc implementation gắn với một bounded context cụ thể.

**Ví dụ để đặt**
- Generic string/date extensions.
- Lightweight guard/helper classes.

---

### `admin101.client` (frontend)

**Mục đích**
- UI application (Vite/React), không chứa backend business rule.

**Nên đặt ở đây**
- Components, pages, frontend state, frontend validation.

**Không đặt ở đây**
- Business logic backend, SQL, security policy backend.

## 3) Quyết định đặt code nhanh

Nếu bạn đang sửa... -> Đặt ở project...

- Thêm endpoint REST mới -> `Admin.Api`
- Thêm use case nghiệp vụ -> `Core.Application`
- Thêm entity/quy tắc domain -> `Core.Domain`
- Thêm truy cập DB/cache/email/file/job -> `Core.Infrastructure`
- Thêm utility thuần dùng chung nhiều project -> `Shared.Common`
- Thêm màn hình UI -> `admin101.client`

Cập nhật tài liệu này mỗi khi thêm project hoặc đổi hướng phụ thuộc.
