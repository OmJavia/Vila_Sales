"use client";

import { useState } from "react";
import { Settings, Building, MapPin, Hash, Users, Bell, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">System Settings & Master Configuration</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Configure company legal entity, GSTIN, warehouse locations, and document numbering series.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border pb-2">
            <Building className="w-4 h-4 text-brand-primary" />
            <span>Company Profile & Legal Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-text-muted mb-1 font-medium">Trade Name / Legal Entity</label>
              <input
                type="text"
                defaultValue="TradeFlow Fasteners & Hardware Pvt. Ltd."
                className="w-full border border-border rounded p-2 bg-background font-medium"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">GSTIN (State Code 27 - Maharashtra)</label>
              <input
                type="text"
                defaultValue="27AABCT9981E1Z5"
                className="w-full border border-border rounded p-2 bg-background font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Registered Office Address</label>
              <input
                type="text"
                defaultValue="Plot 14-B, Steel Market Yard, Kalamboli, Navi Mumbai, MH - 410218"
                className="w-full border border-border rounded p-2 bg-background"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Contact Email & Phone</label>
              <input
                type="text"
                defaultValue="admin@tradeflow.in · +91 22 2742 8899"
                className="w-full border border-border rounded p-2 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Godowns / Warehouses */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border pb-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <span>Godowns & Warehouse Locations</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 border border-border rounded bg-bg-canvas flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Main Warehouse (Bhiwandi)</div>
                <div className="text-text-muted text-[11px]">Shed #4, Arihant Logistics Park, Bhiwandi, Thane · Capacity: 50,000 sq.ft</div>
              </div>
              <span className="badge badge-ok">Primary Hub</span>
            </div>

            <div className="p-3 border border-border rounded bg-bg-canvas flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Secondary Store (Kalamboli)</div>
                <div className="text-text-muted text-[11px]">Plot 14-B, Steel Yard, Kalamboli · Capacity: 15,000 sq.ft</div>
              </div>
              <span className="badge badge-normal">Transit Depot</span>
            </div>
          </div>
        </div>

        {/* Voucher Numbering Prefixes */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border pb-2">
            <Hash className="w-4 h-4 text-brand-primary" />
            <span>Document Numbering Formats</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-text-muted mb-1">Sales Order Prefix</label>
              <input
                type="text"
                defaultValue="#1000"
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Tax Invoice Prefix</label>
              <input
                type="text"
                defaultValue="INV/26-27/"
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Challan Prefix</label>
              <input
                type="text"
                defaultValue="DC-"
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Purchase Order Prefix</label>
              <input
                type="text"
                defaultValue="PO-2026-"
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-600 font-medium">
              ✓ Settings successfully updated!
            </span>
          )}
          <button type="submit" className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4">
            <Save className="w-3.5 h-3.5" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
