# Vila Sales - Inventory & B2B Order Management System

A full-stack enterprise B2B sales, inventory, and warehouse logistics platform built with Next.js 14, React, Tailwind CSS, TypeScript, TanStack Query, and Zustand.

## 🚀 Key Modules & Features

- **B2B Product Catalog & Store (`/shop`)**: Complete product catalog browsing with real-time stock levels, category filtering, search, and dynamic cart management.
- **Cart & GST Checkout (`/shop/cart`, `/shop/checkout`)**: Intuitive multi-step checkout with CGST, SGST, IGST calculation, customer selection, and invoice generation.
- **Inventory & Godown Tracking (`/inventory/stock`)**: Multi-warehouse stock tracking, low-stock alerts, godown allocations, and replenishment reminders.
- **Order Management & Workflow (`/orders`)**: End-to-end order workflow from Confirmation -> Stock Check -> Allocation -> Verification -> Challan -> Dispatch -> Invoicing.
- **Dispatch Command Center (`/dispatch`, `/dispatch/ready`)**: Vehicle loading schedules, LR/POD tracking, and transporter assignment.
- **GST Tax Invoices (`/invoices`)**: Compliant GST tax invoices with instant PDF view, payment gateway recording, and automated email delivery.
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
