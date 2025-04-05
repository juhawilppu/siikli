# 🌾 Siikli

Siikli is a modern ERP system tailored for the agriculture industry. It’s built to streamline operations, manage data efficiently, and support end-to-end workflows for agricultural businesses.

## 🚀 Features

- Order and invoicing system
- Inventory and warehouse management
- Customer and supplier management
- Crop/field tracking
- Reporting and analytics

## 🛠️ Getting Started

Follow these steps to get your local development environment up and running.

### 1. Configure Environment Variables

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

### 2. Start the Frontend

```bash
cd siikli/frontend
npm install
npm run dev
```

### 3. Start the Backend

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
