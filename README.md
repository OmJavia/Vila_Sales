# Vila Sales - Inventory & B2B Order Management System

A full-stack enterprise B2B sales, inventory, and warehouse logistics platform built with Next.js 14, React, Tailwind CSS, TypeScript, TanStack Query, and Zustand.

> **Production status: security remediation in progress — NOT READY FOR LIVE BUSINESS DATA OR PAYMENTS.**  
> The JSON file store is development-only and deliberately fails closed in production until a managed transactional database is implemented. Online payment collection and confirmation are intentionally disabled. Customer checkout remains unavailable until a separate buyer-authentication and customer-scoping flow is implemented. Company GSTIN, HSN and GST-rate masters must be verified and populated before creating orders or invoices. See [P0 security remediation](docs/P0-SECURITY-REMEDIATION.md).

## 🚀 Key Modules & Features

- **B2B Product Catalog prototype (`/shop`)**: Product catalog browsing with real-time stock levels, category filtering, search, and dynamic cart management.
- **Cart & Checkout (`/shop/cart`, `/shop/checkout`)**: Checkout UI prototype; customer authentication, server-authoritative order persistence and end-to-end GST verification remain release blockers.
- **Inventory & Godown Tracking (`/inventory/stock`)**: Multi-warehouse stock tracking, low-stock alerts, godown allocations, and replenishment reminders.
- **Order Management & Workflow (`/orders`)**: End-to-end order workflow from Confirmation -> Stock Check -> Allocation -> Verification -> Challan -> Dispatch -> Invoicing.
- **Dispatch Command Center (`/dispatch`, `/dispatch/ready`)**: Vehicle loading schedules, LR/POD tracking, and transporter assignment.
- **GST Tax Invoices (`/invoices`)**: Invoice workflow prototype. Production issuance requires verified seller/customer GSTINs, product HSN/GST-rate masters, durable storage and legal/compliance review. E-invoice/e-way-bill or payment-provider integration is not implied by the UI.
- **Customer CRM & Credit Control (`/customers`)**: Customer ledgers, credit limits, outstanding balances, and payment terms tracking.
- **Mobile-First Experience**: High-density responsive mobile cards for warehouse operators and field sales reps.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query

## 🏁 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
