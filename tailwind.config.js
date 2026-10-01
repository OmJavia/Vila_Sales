/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F7F7F7",
        border: "#EAEAEA",
        "text-primary": "#111111",
        "text-secondary": "#444444",
        "text-muted": "#666666",
        "nav-bg": "#111111",
        "brand-primary": "#111111",
        "bg-canvas": "#F7F7F7",
        hover: "#F0F0F0",
        success: {
          DEFAULT: "#16A34A",
          bg: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          bg: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          bg: "#FEE2E2",
        },
        info: {
          DEFAULT: "#2563EB",
          bg: "#DBEAFE",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      fontSize: {
        label: ["11px", { lineHeight: "1.4", letterSpacing: "0.04em", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.06)",
        sm: "0 2px 8px rgba(0,0,0,0.08)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
