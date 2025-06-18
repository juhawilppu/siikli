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
├── .env           # Environment variables
└── ...
```

## 🧱 Core architectural decisions

### Modular monolith

Siikli uses a modular monolith structure. It's organized by feature-based folders with domain-driven boundaries, allowing future extraction to microservices if needed.

```
src/
  modules/
    invoices/
    users/
    auth/
  libs/
    db/
    logger/
    config/
```

### Prefer ORM

Prisma is the primary method for database access, providing type-safety, composability, and security by default.

Raw SQL is used only in performance-critical scenarios — and always isolated and reviewed.

Naming convention:
- Database: `snake_case`
- TypeScript: `camelCase`

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
