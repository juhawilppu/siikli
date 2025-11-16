# Architecture

## Layered structure

Follows a **Service–Controller–Model** pattern for clarity, testability, and separation of concerns:

- **Controller** - Handles HTTP, request validation, and permissions.
- **Services** - Business logic.
- **Model** - Database access via Prisma.

## Type safety

- End-to-end type safety from frontend -> backend -> database.
- Each endpoint has explicit request/response DTOs (for example, `PutUpdateCustomerResponseDto`) to decouple different modules.

## ORM-first

- Prisma is the default for DB access.
- Raw SQL used for performance-critical special cases.
- Database: `snake_case`; TypeScript: `camelCase`.

## Tenant isolation

- Every tenant has isolated data (`company_id` in all relevant tables).
- Prisma middleware enforces tenant scoping in queries.
- RBAC is tenant-aware.
- Tenant ID in JWT payload.

## History tables

- Every table has a `_history` table updated via triggers on `INSERT`, `UPDATE`, `DELETE`.
- Enables debugging, partial restores, and full change tracking.

To ensure schema consistency, run:

```bash
npx tsx ./src/dev/verify-history-tables.ts
```

Validates that history tables are in sync with schema.

## Handling monetary values

Finnish currency uses a comma and two decimals (`2,50`), but users may type `2.5` or `2,5`.

Solution: Keep monetary values as **strings** in the UI until calculations are needed.
- **Database:** `@db.Decimal(10, 2)` for exact precision.
- **API:** Uses strings (`"10.00"`) for serialization.
- **UI:** Accepts multiple formats (`"10"`, `"10,0"`, `"10.0"`, etc.), formats to `"10,00"` on blur.
- **Mobile:** Numeric keyboard for better UX.
- **Calculations:** Uses `decimal.js` for precision.
