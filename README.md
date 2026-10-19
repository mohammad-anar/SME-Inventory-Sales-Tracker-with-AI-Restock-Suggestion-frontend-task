# StockPilot — Frontend Web Application

StockPilot is an enterprise-grade SME Inventory & Sales Tracker with AI Restock Forecasting built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui primitives, and Redux Toolkit with RTK Query.

---

## 1. Project Overview

### Purpose
StockPilot addresses the challenges faced by small and medium-sized enterprises (SMEs) managing fast-moving stock across retail and wholesale operations. Traditional inventory spreadsheets lead to stockouts, over-purchasing, and human error during sales. StockPilot unifies Point of Sale (POS) transactions, catalog taxonomy, multi-supplier purchasing, granular stock movement ledgers, administrative staff access control, and Google Gemini-powered predictive restock forecasting into a single, cohesive web platform.

### Target Users & Use Cases
- **Business Owners & Inventory Managers (Admin)**:
  - Oversee inventory valuation, reorder thresholds, and profit/sales trends.
  - Manage product catalogs, categories, and supplier networks.
  - Issue and receive multi-item Purchase Orders with automatic stock incrementing.
  - Audit inventory adjustments and system-wide stock movements (`IN`, `OUT`, `ADJUSTMENT`).
  - Create and manage Staff accounts with secure, tokenized invitation links.
  - Review AI-driven restock forecasts to optimize working capital and minimize stockouts.
- **Sales Staff & Cashiers (Staff)**:
  - Process sales quickly with real-time stock availability validation.
  - Search products dynamically by name or SKU.
  - View personal sales records and shift performance metrics on a dedicated Staff Dashboard.
  - Track personal audit activity logs without accessing administrative settings or supplier costs.

---

## 2. Features

### Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication**: Secure Bearer token authentication with local storage synchronization and automatic request header injection.
- **Role-Based Guards**: Strict route guards separating `ADMIN` and `STAFF` areas. Staff attempting to access administrative sections (such as `/dashboard`, `/suppliers`, `/categories`, `/reports`, `/ai-restock`, `/staff`, or `/purchase-orders`) are gracefully redirected to `/staff/dashboard` with warning notifications.
- **Token Blacklisting & Secure Logout**:
  - Logout triggers server-side JWT revocation via a database-backed blacklist (`POST /api/v1/auth/logout`).
  - Clears local Redux authentication slice and purges RTK Query cache (`resetApiState`).
- **Centralized 401 Interception**:
  - RTK Query `baseQueryWithReauth` intercepts HTTP `401 Unauthorized` responses on protected requests.
  - Dispatches session termination and redirects to `/login` with preservation of the intended return route.
- **Tokenized Staff Activation**:
  - Secure setup token verification flow (`/set-password?token=...`) enabling newly invited staff to establish credentials safely.

### Dashboards
- **Administrator Dashboard (`/dashboard`)**:
  - Metric summary cards: Total Products, Low Stock Alerts, Total Revenue, Out-of-Stock warnings.
  - Interactive sales trends charts (powered by Recharts).
  - Recent transaction history and top-selling product breakdowns.
- **Staff Portal Dashboard (`/staff/dashboard`)**:
  - Today's personal sales counter and revenue volume.
  - Direct POS sales shortcut, product catalog lookup, personal sales records (`/staff/sales`), and personal activity log (`/staff/activities`).

### Inventory & Operations Management
- **Products Catalog (`/products`)**:
  - Searchable, filterable product table with category/supplier filtering and low-stock alerts.
  - Stock adjustment modal for recording shrinkage, manual intake, or corrections.
- **Categories (`/categories`)**:
  - Taxonomy management for organizing catalog hierarchies.
- **Suppliers Directory (`/suppliers`)**:
  - Supplier vendor profiles, contact details, and lead-time tracking.
- **Sales & Point of Sale (`/sales`)**:
  - Dynamic line-item sales interface with instant stock deduction.
  - Real-time stock validation preventing sales exceeding available quantities.
  - Support for discounts, tax calculations, and printable invoice views.
- **Purchase Orders (`/purchase-orders`)**:
  - Order lifecycle tracking: `PENDING` -> `ORDERED` -> `RECEIVED` -> `CANCELLED`.
  - Automated stock intake upon marking purchase orders as received.
- **Stock Movement Ledger (`/stock-movements`)**:
  - Granular audit trail tracking all inbound (`IN`), outbound (`OUT`), and manual correction (`ADJUSTMENT`) inventory transactions with reference tracking.
- **Staff Management (`/staff`)**:
  - Admin interface for creating Staff accounts, toggling account active/inactive status, and generating invitation setup links.
- **Reports & Analytics (`/reports`)**:
  - Exportable financial breakdowns, stock valuation, and revenue summaries.

### AI Restock Forecast (`/ai-restock`)
- **Intelligent Forecasting Engine**:
  - Integrated with the backend Google Gemini AI restock service.
  - Evaluates historical 30-day sales velocity, supplier lead times, and minimum safety stock.
  - Categorizes restock urgency into `CRITICAL`, `WARNING`, and `HEALTHY` tiers with suggested replenishment units and reasoning.
  - Provides one-click pre-filling of Purchase Orders directly from AI recommendations.

### UI & UX States
- Responsive sidebar navigation with collapsible desktop state and mobile slide-out drawer with backdrop blur.
- Consistent loading spinners, skeleton placeholders, empty-state illustrations, error boundary notifications, and Sonner toast notifications.

---

## 3. Technology Stack

| Layer / Library | Package / Version | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js `16.4.2` | App Router, Server/Client components, Turbopack |
| **Core UI** | React `19.3.0` & React DOM `19.3.0` | Declarative UI rendering |
| **Language** | TypeScript `^5.0.0` | Static typing and interfaces |
| **Styling** | Tailwind CSS `^4.0.0` | Utility-first responsive design |
| **Post-processing** | `@tailwindcss/turbopack` `^4.0.0` | Turbopack styling integration |
| **UI Primitives** | Radix UI (`avatar`, `dialog`, `dropdown-menu`, `separator`, `slot`) | Accessible, unstyled UI components |
| **Design Utilities** | `clsx` `^2.1.1` & `tailwind-merge` `^3.7.0` | Dynamic class construction |
| **Icons** | `lucide-react` `^1.59.0` | Consistent iconography across dashboards |
| **State Management** | Redux Toolkit `^2.13.0` & `react-redux` `^9.3.0` | Client global state (auth, session) |
| **Server State & Cache**| RTK Query (`baseApi`) | API calls, auto-caching, optimistic updates, tag invalidation |
| **Data Visualization** | Recharts `^3.10.1` | Interactive charts for sales and revenue analytics |
| **Form Handling** | React Hook Form `^7.90.0` | Performant form controls and state |
| **Schema Validation** | Zod `^4.6.7` | Input validation and type safety |
| **Notifications** | Sonner `^2.0.8` | Toast alerts for operations and errors |

---

## 4. Prerequisites

- **Node.js**: `v18.18.0` or higher (verified on Node `v20.x` and `v22.x`).
- **Package Manager**: `npm` (default), or `pnpm` / `yarn`.
- **Backend Service**: An active StockPilot backend running (typically on `http://localhost:4001/api/v1` or `http://localhost:5000/api/v1`).

---

## 5. Installation and Local Setup

1. **Clone and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. **Run the local development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000).

---

## 6. Environment Variables

Create `.env.local` in the `frontend` root:

```env
# StockPilot Express API Base URL
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1
```

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5000/api/v1` | Points to the backend Express REST API gateway. |

> **Security Note**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never place sensitive secrets, private signing keys, or database credentials in frontend environment files.

---

## 7. Backend Connection

The frontend interacts with the backend through a centralized RTK Query configuration in `src/lib/redux/services/baseApi.ts`:

- **Base URL Resolution**: Defaults to `process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"`.
- **Token Injection**: The `prepareHeaders` utility attaches the bearer authorization header automatically:
  ```typescript
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  ```
- **Session Reauthorization & 401 Interception**:
  `baseQueryWithReauth` monitors all responses. If a `401 Unauthorized` status is received on any authenticated route (such as when a token is revoked in the database blacklist), the client immediately dispatches `logout()` and `resetApiState()`, purging stale cached data and routing the user to `/login`.
- **Tag Invalidation**: RTK Query tag types (`Auth`, `Category`, `Supplier`, `Product`, `Sale`, `SaleItem`, `PurchaseOrder`, `StockMovement`, `Dashboard`, `Forecast`, `Report`, `User`) guarantee that mutations (e.g. creating a sale or PO) immediately refresh inventory and sales views across all dashboards.

---

## 8. Main User Flows

### A. Authentication & Sign Out
1. User opens `/login` and enters credentials.
2. Upon verification, the backend issues an access token and user payload.
3. The application redirects based on role:
   - `ADMIN` -> `/dashboard`
   - `STAFF` -> `/staff/dashboard`
4. Clicking "Sign out" triggers `useLogoutHandler()`:
   - Calls `POST /api/v1/auth/logout` with Bearer token.
   - The backend hashes the token with SHA-256 and records it in the database `BlacklistedToken` table.
   - The frontend clears Redux state and localStorage, resets RTK Query cache, and redirects to `/login`.

### B. Staff Account Lifecycle
1. Admin visits `/staff` and clicks "Add Staff Member".
2. Admin enters staff name, email, and phone.
3. System creates a pending staff user with an invitation setup token.
4. Admin copies the setup invitation URL (`/set-password?token=<token>`).
5. Staff visits the link, enters a secure password, and activates their account.
6. Admin can toggle staff status between `ACTIVE` and `INACTIVE` at any time from `/staff`.

### C. Point of Sale & Stock Deduction
1. Staff or Admin navigates to `/sales`.
2. Items are added with live stock checks.
3. On completing the sale:
   - A sale record is created.
   - Product stock quantities are decremented.
   - An outbound movement (`OUT`) is written to the stock movement ledger.
   - Low-stock badges appear automatically if the remaining balance falls below reorder thresholds.

### D. AI Restock Decision Flow
1. Admin opens `/ai-restock`.
2. Admin triggers restock analysis across active inventory.
3. Google Gemini analyzes 30-day sales rate, lead time, and safety levels.
4. Recommendations display urgency tiers, suggested quantities, and economic reasoning.
5. Admin can click to initiate a Purchase Order pre-filled with the recommended quantity.

---

## 9. Testing and Build Scripts

The following scripts are defined in `package.json`:

```bash
# Start development server with Turbopack
npm run dev

# Compile TypeScript and create production Next.js build
npm run build

# Start production server
npm run start

# Run ESLint validation
npm run lint

# Run TypeScript typecheck without emitting output
npm run typecheck
```

> **Testing Note**: Unit or browser automation test runners (such as Jest or Playwright) are not configured as npm scripts in this frontend package. Verification is performed using TypeScript static typechecking (`npm run typecheck`), lint validation (`npm run lint`), production build compilation (`npm run build`), and live integration with the backend security test suite.

---

## 10. Deployment

### Production Build
1. Set the production backend URL in your deployment environment:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
   ```
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Run the optimized server:
   ```bash
   npm run start
   ```

### Hosting Options
- **Vercel**: Seamless integration with Next.js App Router and Turbopack.
- **Docker / Container**: Deployable as a standard Node.js container with multi-stage builds.
- **Reverse Proxy**: When running behind Nginx or Cloudflare, ensure headers such as `X-Forwarded-For` and `X-Forwarded-Proto` are preserved.

---

## 11. Known Limitations

- **Offline Operation**: Real-time sales require an active network connection to the backend PostgreSQL database to prevent negative stock allocation; offline queuing is not supported.
- **Fail-Closed Security**: In the event of a database outage, the backend token revocation blacklist fails closed (`500 Server Error`), meaning authenticated protected requests will be safely blocked rather than permitting unverified access.
- **Token Expiration**: Access tokens expire after 15 minutes. Upon expiration, users must log in again as automatic refresh token rotation is not implemented in the current standalone JWT model.
