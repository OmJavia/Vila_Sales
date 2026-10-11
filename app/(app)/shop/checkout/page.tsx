"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ShopCheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
          Checkout temporarily unavailable
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#111] sm:text-3xl">
          Order placement is not enabled yet
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#555]">
          The customer-account flow, persistent shared order database, and verified
          GST product master are not configured. No sales order or tax invoice can be
          created from this preview. We have disabled submission rather than calculate
          statutory tax using incomplete business data.
        </p>
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#555]" aria-hidden="true" />
          <p className="text-xs leading-5 text-[#555]">
            Do not use this preview to make an order, pay an advance, or rely on
            displayed availability or tax calculations. Existing catalogue values are
            illustrative until verified against the business master.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/shop/cart"
            className="inline-flex items-center gap-2 rounded-lg border border-[#DADADA] px-4 py-2.5 text-sm font-semibold text-[#222] transition-colors hover:bg-[#F7F7F7]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return to cart
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-lg bg-[#111] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
          >
            Browse catalogue
          </Link>
        </div>
      </section>
    </main>
  );
}
