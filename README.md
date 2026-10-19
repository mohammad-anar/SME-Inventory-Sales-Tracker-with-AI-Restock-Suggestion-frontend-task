# StockPilot Frontend

## Overview
StockPilot is an inventory and sales management web application for small and medium businesses. It provides point-of-sale (POS) billing, stock tracking, purchase orders, staff management, and AI-powered restock suggestions.

## Features
- **Authentication & Roles**: Admin and Staff accounts with protected routes.
- **Point of Sale (POS)**: Create sales with line items, stock validation, and printable receipts.
- **Product & Category Management**: Searchable product catalog, pricing, cost tracking, and categories.
- **Supplier & Purchase Orders**: Manage suppliers, issue purchase orders, and receive incoming inventory.
- **Stock Movement Ledger**: Track stock adjustments, intake, and sales depletions.
- **Staff Management**: Admins can invite staff with setup tokens and manage account status.
- **AI Restock Forecast**: Restock recommendations based on sales history and lead times.
- **Dashboards & Reports**: Sales analytics for admins, shift summaries for staff.

## Getting Started

### Prerequisites
- Node.js 18.18+ (Node 20+ recommended)
- npm, pnpm, or yarn
- StockPilot backend API running locally

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application runs at `http://localhost:3000`.

### Available Scripts
- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start the production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

## Environment Variables
Create a `.env.local` file based on `.env.example`:

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:5000/api/v1` |

## Backend Connection
The frontend communicates with the backend via REST API using RTK Query. Requests automatically attach the stored JWT token in the `Authorization: Bearer <token>` header. If the backend returns a `401 Unauthorized` response (e.g. after logout or token expiry), the frontend clears the session and redirects to `/login`.
