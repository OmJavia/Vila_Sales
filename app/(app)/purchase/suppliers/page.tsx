"use client";

import { useState } from "react";
import { Search, Building, Phone, Mail, MapPin, Star, Plus } from "lucide-react";
import { SUPPLIERS, Supplier } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function SuppliersPage() {
  const [suppliers] = useState<Supplier[]>(SUPPLIERS);
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Suppliers & Mills</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Vendor master, procurement contracts, outstanding payables, and reliability ratings.
          </p>
        </div>
      </div>

      <div className="card p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search supplier, contact, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="text-xs text-text-muted">
          Total Suppliers: <strong>{suppliers.length}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sup) => (
          <div key={sup.id} className="card p-5 space-y-4 hover:border-text-secondary/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">{sup.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{sup.city}, {sup.state}</span>
                  <span className="text-border">|</span>
                  <span className="font-mono text-[11px]">{sup.gstin}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{sup.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-bg-canvas p-3 rounded border border-border">
              <div>
                <span className="text-text-muted block text-[11px]">Primary Contact</span>
                <span className="font-medium text-text-primary">{sup.contactPerson}</span>
                <span className="text-[11px] text-text-muted block font-mono mt-0.5">{sup.phone}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Payment Terms</span>
                <span className="font-medium text-text-primary">{sup.paymentTerms} Days</span>
                <span className="text-[11px] text-text-muted block mt-0.5">
                  Open POs: <strong>{sup.openOrdersCount}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <span className="text-xs text-text-muted">Balance Payable:</span>
                <div className="text-sm font-bold font-mono text-text-primary">
                  {formatCurrency(sup.balancePayable)}
                </div>
              </div>

              <button
                onClick={() => alert(`Creating Purchase Order for ${sup.name}...`)}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Create PO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
