// Maps product categories to local product images
const CATEGORY_IMAGES: Record<string, string> = {
  "Bonding Gum": "/products/bonding_gum.jpg",
  "Cushion Gum": "/products/bonding_gum.jpg",
  "Vulcanizing Solution": "/products/vulcanizing_solution.jpg",
  "Repair Compounds": "/products/vulcanizing_solution.jpg",
  "Precured Treads": "/products/precured_treads.jpg",
  "Conventional Rubber": "/products/precured_treads.jpg",
  "Curing Bags": "/products/curing_bags.jpg",
  "Curing Envelopes": "/products/curing_bags.jpg",
  "Flaps": "/products/rubber_flaps.jpg",
  "OTR Sealing Rings": "/products/rubber_flaps.jpg",
  "Wicking Pads": "/products/bonding_gum.jpg",
  "Anchor Bolts": "/products/vulcanizing_solution.jpg",
  "Hex Bolts": "/products/vulcanizing_solution.jpg",
  "Socket Head": "/products/vulcanizing_solution.jpg",
  "Washers": "/products/rubber_flaps.jpg",
  "Self Drill": "/products/vulcanizing_solution.jpg",
};

// Color-coded category badges
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Bonding Gum": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Cushion Gum": { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  "Vulcanizing Solution": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Repair Compounds": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Precured Treads": { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
  "Conventional Rubber": { bg: "#FDF2F8", text: "#BE185D", border: "#FBCFE8" },
  "Curing Bags": { bg: "#ECFEFF", text: "#0E7490", border: "#A5F3FC" },
  "Curing Envelopes": { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Flaps": { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  "OTR Sealing Rings": { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Wicking Pads": { bg: "#FEFCE8", text: "#A16207", border: "#FEF08A" },
  "Anchor Bolts": { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1" },
  "Hex Bolts": { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1" },
  "Socket Head": { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
  "Washers": { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
  "Self Drill": { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
};

// Brand accent colors for card strips
const BRAND_COLORS: Record<string, string> = {
  "Midas Mileage": "#D97706",
  "Midas": "#B45309",
  "Ajax": "#1D4ED8",
  "Silver": "#6B7280",
  "Maxgrip": "#DC2626",
  "Powerfit": "#7C3AED",
  "Ultra": "#059669",
};

export function getCategoryImage(category: string): string {
  return CATEGORY_IMAGES[category] || "/products/bonding_gum.jpg";
}

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1" };
}

export function getBrandColor(brand: string): string {
  return BRAND_COLORS[brand] || "#111111";
}

// Generate a deterministic color from product ID for the placeholder gradient
export function getProductGradient(id: string): [string, string] {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;
  return [`hsl(${hue1}, 45%, 88%)`, `hsl(${hue2}, 50%, 78%)`];
}
