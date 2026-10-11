"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ToastContainer } from "@/components/ui/Toast";
import { sleep } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        toast.success(
          `Welcome back, ${data.user.name}!`,
          `Authenticated as ${data.user.role}. Redirecting...`
        );
        await sleep(350);
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Network authentication error: " + err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      <ToastContainer />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="w-full max-w-[380px]"
      >
        {/* Back to Store */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/shop")}
            className="text-xs text-[#666] hover:text-[#111] font-semibold flex items-center gap-1 transition-colors"
          >
            ← Back to Customer Store
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#111111] rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/icon.svg" alt="Vila Sales Logo" className="w-6 h-6" style={{ filter: 'invert(1)' }} />
          </div>
          <div>
            <div className="text-lg font-bold text-[#111111] leading-none">Vila Sales</div>
            <div className="text-xs text-[#999999] mt-0.5">Midas Rubber Company</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-8 shadow-xs">
          <h1 className="text-xl font-bold text-[#111111] mb-1">Sign in</h1>
          <p className="text-sm text-[#666666] mb-7">Access your business dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label text-[#111111] mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.in"
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-label text-[#111111] mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#666666] transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-2 p-3 bg-[#FEE2E2] rounded-md"
              >
                <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#DC2626]">{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111111] text-white text-sm font-semibold rounded-md transition-colors duration-100 hover:bg-[#333333] disabled:opacity-60 mt-2"
              whileHover={{ scale: 0.985 }}
              whileTap={{ scale: 0.972 }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-[#999999] mt-6">
          Staff access is provisioned by your Vila Sales administrator.
        </p>
      </motion.div>
    </div>
  );
}
