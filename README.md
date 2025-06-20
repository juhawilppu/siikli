# 🌾 Siikli

Siikli is a simple, modern ERP system tailored for the Finnish agriculture industry. It’s built to streamline operations, manage data efficiently, and support end-to-end workflows for agricultural businesses.

## 🚀 Features

- Order and invoicing system
- Inventory and warehouse management
- Customer and supplier management
- Reporting and analytics

## 🧰 Tech Stack

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Prisma](https://img.shields.io/badge/ORM-Prisma-lightblue)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Terraform](https://img.shields.io/badge/IaC-Terraform-purple)
![AWS](https://img.shields.io/badge/Cloud-AWS-orange)

## 🛠️ Getting Started

Follow these steps to get your local development environment up and running.

### 1. Configure Environment Variables

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

### 2. Start the app

The frontend and backend are run concurrently with `npm run dev` shorthand.

```bash
cd siikli
npm install
npm run dev
```

## 📁 Project Structure

```
siikli/
├── frontend/      # React frontend
├── src/           # Backend source code
├── prisma/        # Prisma schema and migrations
├── terraform/     # Terraform files for AWS infra and deployment
├── .env           # Environment variables
└── ...
```

## 🧱 Core architectural decisions

### Pragmatic monolith

Siikli uses a pragmatic monolith architecture. The codebase is organized by features, with shared libraries extracted only when they offer meaningful reuse or clarity.

Most logic lives directly inside route handlers to maximize simplicity and development speed. There’s no service or repository abstraction unless it provides real value.

Modules can import from each other freely — strict domain boundaries are intentionally avoided to reduce friction and keep iteration fast.

```
siikli/
└── src/
    ├── api/
    │   ├── auth.ts
    │   ├── customers.ts
    │   ├── invoices.ts
    │   └── ...
    ├── middlewares/
    │   ├── permissions.ts
    │   ├── rate-limit.ts
    │   └── ...
    └── services/
        ├── email-service.ts
        ├── invoice-service.ts
        ├── waybill-service.ts
        └── ...

```

### Prefer ORM

Prisma is the primary method for database access, providing type-safety, composability, and security by default.

Raw SQL is used only in performance-critical scenarios — and always isolated and reviewed.

Naming convention:
- Database: `snake_case`
- TypeScript: `camelCase`

### History tables

Every database table (e.g. `order`, `customer`) has a corresponding `_history` table (e.g. `order_history`, `customer_history`). All `INSERT`, `UPDATE`, and `DELETE` operations are automatically mirrored via triggers.

This provides:

- ✅ Easy debugging and traceability
- ✅ Emergency restore without full DB rollback
- ✅ Continuous change history alongside regular backups

> This design is based on experience — I once lost two weeks of customer data.
> Since then, I've been almost paranoid in building systems that can recover from human mistakes, not just hardware failures.
> Credit goes to Xuan, my former boss and current friend, who introduced me to this history table pattern in 2015 — I'm still using it.

To ensure schema consistency, run:

```bash
npx tsx ./src/dev/verify-history-tables.ts
```

This script checks that all history tables exist, verifies column types, and prints the expected trigger definition if changes are needed.

### Handling numbers

Siikli handles monetary values with strict precision — floats are not used anywhere in the stack.

- 💾 Database: Values are stored using `@db.Decimal(10, 2)` for exact precision
- 🔄 API: REST requests and responses use strings with international format, e.g. `"10.00"`
- 🧑‍💻 UI (input): Users can enter loosely formatted strings like `"10"`, `"10,0"`, `"10.0"` etc.
  - On blur, values are formatted to `"10,00"` using Finnish-style decimals
- ➕ Calculations: All math uses `decimal.js` for safety and accuracy

Additionally, since customers can negotiate prices with or without VAT, the system stores both:
- `price` (including 14 % VAT)
- `price0` (without VAT)

Note: due to rounding differences, `price / 1.14` is not guaranteed to exactly match `price0`.

> This approach avoids rounding bugs, preserves financial accuracy, and matches how real users think about money.

### Deployment: ECS + Fargate

Siikli runs in containers using Amazon ECS and Fargate, with RDS as the database layer. Infrastructure is provisioned with Terraform. Currently all resources run in eu-north-1 (Sweden).

### Secure-first

Security has been a core principle from day one.

✅ Security headers
✅ CSP
✅ SQL injection prevented by framework
✅ XSS prevented by framework
✅ Role-based access
✅ Tenant isolation via prisma middleware
✅ Rate-limiting
✅ Passwordless login
✅ Cookie flags (HttpOnly authentication cookie)
✅ IDOR prevention (my favorite topic)
✅ Challenge-response system (ALTCHA) for bot protection

Note: High availability is not currently enabled to reduce cost — the app runs on a single instance.

### Simplicity

- No unnecessary abstractions
- Readable code favored over clever tricks
- Prefer boring technology that works

## 📄 License

This is a private project.

All rights reserved.

Do not distribute, copy, or reuse any part of the code or design without explicit permission.
