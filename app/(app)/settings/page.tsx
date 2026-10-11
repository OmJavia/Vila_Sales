"use client";

import { useState, useEffect } from "react";
import { Settings, Building, MapPin, Hash, Save, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { CANONICAL_COMPANY_CONFIG, CompanyConfig } from "@/lib/companyConfig";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const toast = useToast();
  const [config, setConfig] = useState<CompanyConfig>(CANONICAL_COMPANY_CONFIG);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch live persisted config from server
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          setConfig(data.settings);
        }
      })
      .catch((e) => console.warn("Failed to load settings from server:", e));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        toast.success("Settings Saved", "Company profile and banking rails persisted durably.");
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error("Save Failed", data.error || "Failed to update configuration");
      }
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Master Configuration & Company Profile</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage legal entity, GSTIN registration, warehouse godowns, and official banking rails.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border pb-2">
            <Building className="w-4 h-4 text-brand-primary" />
            <span>Legal Entity & GST Registration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-text-muted mb-1 font-medium">Brand / Commercial Name</label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                className="w-full border border-border rounded p-2 bg-background font-medium"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Legal Entity Name</label>
              <input
                type="text"
                value={config.legalEntityName}
                onChange={(e) => setConfig({ ...config, legalEntityName: e.target.value })}
                className="w-full border border-border rounded p-2 bg-background font-medium"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">GSTIN (Maharashtra - State 27)</label>
              <input
                type="text"
                value={config.gstin}
                onChange={(e) => setConfig({ ...config, gstin: e.target.value })}
                className="w-full border border-border rounded p-2 bg-background font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">State Code & Name</label>
              <input
                type="text"
                value={`${config.stateCode} - ${config.stateName}`}
                disabled
                className="w-full border border-border rounded p-2 bg-bg-canvas text-text-muted font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-text-muted mb-1 font-medium">Registered Office Address</label>
              <input
                type="text"
                value={`${config.registeredAddress.line1}, ${config.registeredAddress.city}, ${config.registeredAddress.state} - ${config.registeredAddress.pincode}`}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    registeredAddress: { ...config.registeredAddress, line1: e.target.value },
                  })
                }
                className="w-full border border-border rounded p-2 bg-background"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Billing Contact Email</label>
              <input
                type="email"
                value={config.contact.email}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })
                }
                className="w-full border border-border rounded p-2 bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Support Phone</label>
              <input
                type="text"
                value={config.contact.phone}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, phone: e.target.value } })
                }
                className="w-full border border-border rounded p-2 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Banking & UPI Payment Rails */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border pb-2">
            <CreditCard className="w-4 h-4 text-brand-primary" />
            <span>Official Banking & UPI Settlement Rails</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-text-muted mb-1 font-medium">Corporate Bank Name</label>
              <input
                type="text"
                value={config.banking.bankName}
                onChange={(e) =>
                  setConfig({ ...config, banking: { ...config.banking, bankName: e.target.value } })
                }
                className="w-full border border-border rounded p-2 bg-background font-medium"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Branch Location</label>
              <input
                type="text"
                value={config.banking.branch}
                onChange={(e) =>
                  setConfig({ ...config, banking: { ...config.banking, branch: e.target.value } })
                }
                className="w-full border border-border rounded p-2 bg-background"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Bank Account Number</label>
              <input
                type="text"
                value={config.banking.accountNumber}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    banking: { ...config.banking, accountNumber: e.target.value },
                  })
                }
                className="w-full border border-border rounded p-2 bg-background font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">IFSC Code</label>
              <input
                type="text"
                value={config.banking.ifscCode}
                onChange={(e) =>
                  setConfig({ ...config, banking: { ...config.banking, ifscCode: e.target.value } })
                }
                className="w-full border border-border rounded p-2 bg-background font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Official UPI VPA (ID)</label>
              <input
                type="text"
                value={config.banking.upiVpa}
                onChange={(e) =>
                  setConfig({ ...config, banking: { ...config.banking, upiVpa: e.target.value } })
                }
                className="w-full border border-border rounded p-2 bg-background font-mono font-semibold text-emerald-600"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">UPI Payee Display Name</label>
              <input
                type="text"
                value={config.banking.upiQrPayeeName}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    banking: { ...config.banking, upiQrPayeeName: e.target.value },
                  })
                }
                className="w-full border border-border rounded p-2 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Godowns / Warehouses */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border pb-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <span>Configured Godowns & Warehouses</span>
          </div>

          <div className="space-y-3 text-xs">
            {config.godowns.map((g) => (
              <div
                key={g.id}
                className="p-3 border border-border rounded bg-bg-canvas flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-text-primary flex items-center gap-2">
                    <span>{g.name}</span>
                    <span className="font-mono text-[10px] text-text-muted">({g.code})</span>
                  </div>
                  <div className="text-text-muted text-[11px] mt-0.5">{g.address}</div>
                </div>
                <span className={g.isPrimaryHub ? "badge badge-ok" : "badge badge-normal"}>
                  {g.isPrimaryHub ? "Primary Hub" : "Regional Depot"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Voucher Numbering Prefixes */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border pb-2">
            <Hash className="w-4 h-4 text-brand-primary" />
            <span>Document Numbering Prefixes (Financial Year {config.financialYear})</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-text-muted mb-1 font-medium">Tax Invoice</label>
              <input
                type="text"
                value={config.documentPrefixes.invoice}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    documentPrefixes: { ...config.documentPrefixes, invoice: e.target.value },
                  })
                }
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Sales Order</label>
              <input
                type="text"
                value={config.documentPrefixes.order}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    documentPrefixes: { ...config.documentPrefixes, order: e.target.value },
                  })
                }
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Delivery Challan</label>
              <input
                type="text"
                value={config.documentPrefixes.challan}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    documentPrefixes: { ...config.documentPrefixes, challan: e.target.value },
                  })
                }
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-medium">Goods Receipt (GRN)</label>
              <input
                type="text"
                value={config.documentPrefixes.goodsReceipt}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    documentPrefixes: { ...config.documentPrefixes, goodsReceipt: e.target.value },
                  })
                }
                className="w-full border border-border rounded p-1.5 bg-background font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings successfully saved and persisted!
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-5"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
