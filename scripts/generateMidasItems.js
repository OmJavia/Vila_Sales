// Generator script for all items from Midas Domestic Brochure 2025
const fs = require('fs');
const path = require('path');

const items = [];
let idCounter = 101;

function addItem(name, code, category, unit, price, stock, minStock, specs, isOut = false, isLow = false) {
  let finalStock = stock;
  let stockLevel = "OK";
  let reserved = Math.min(Math.floor(stock * 0.12), 25);
  let allocated = Math.min(Math.floor(stock * 0.08), 15);

  if (isOut) {
    finalStock = 0;
    stockLevel = "OUT";
    reserved = 0;
    allocated = 0;
  } else if (isLow) {
    finalStock = Math.floor(minStock * 0.7);
    stockLevel = "LOW";
    reserved = 4;
    allocated = 2;
  }

  const p1 = Math.round(finalStock * 0.65);
  const p2 = Math.round(finalStock * 0.35);

  items.push({
    id: `MIDAS-${String(idCounter++).padStart(3, '0')}`,
    name,
    code,
    brand: "Midas Mileage",
    category,
    unit,
    price,
    stock: finalStock,
    minStock,
    reservedStock: reserved,
    allocatedStock: allocated,
    stockLevel,
    specifications: specs || "",
    suggestedSupplier: "Midas Treads (India) Pvt. Ltd.",
    godownStock: [
      { godown: "Kottayam Central Warehouse", physical: p1, reserved: Math.floor(reserved * 0.7), available: Math.max(0, p1 - Math.floor(reserved * 0.7)) },
      { godown: "Bhiwandi Logistics Hub", physical: p2, reserved: Math.ceil(reserved * 0.3), available: Math.max(0, p2 - Math.ceil(reserved * 0.3)) },
    ],
  });
}

// 1. Bonding Gum
addItem("MIDAS BONDING GUM - FAST CURE 99°C", "MDS-BG-FC99", "Bonding Gum", "Roll", 3450, 160, 30, "Special 99°C fast cure gum to reduce chamber cure time; high tack formulation");
addItem("MIDAS BONDING GUM - REGULAR 100% NATURAL", "MDS-BG-REGULAR", "Bonding Gum", "Roll", 3100, 240, 40, "100% natural rubber formulation for maximum green tack; suitable for precured & hot retreading");
addItem("MIDAS BONDING GUM - BG 22", "MDS-BG-22", "Bonding Gum", "Roll", 3250, 185, 35, "Enhanced temperature tolerance compound with extended shelf life");
addItem("MIDAS BONDING GUM - SP", "MDS-BG-SP", "Bonding Gum", "Roll", 3350, 140, 30, "Special high-adhesion bonding strip gum for heavy duty bias & radial applications");
addItem("MIDAS BONDING GUM - EXTREME TACK (EXPERIMENTAL)", "MDS-BG-EXTREME", "Bonding Gum", "Roll", 3600, 0, 25, "High-tack experimental bonding compound for extreme load haulage", true);

// 2. Shoulder Strip Cushion Gum
addItem("MIDAS SHOULDER STRIP CUSHION GUM 30MM", "MDS-SS-30MM", "Cushion Gum", "Roll", 1450, 190, 35, "Width: 30 mm, Thickness: 1.2 mm; edge protection cushion strip");
addItem("MIDAS SHOULDER STRIP CUSHION GUM 40MM", "MDS-SS-40MM", "Cushion Gum", "Roll", 1650, 175, 30, "Width: 40 mm, Thickness: 1.2 mm; universal radial casing shoulder build-up");
addItem("MIDAS SHOULDER STRIP CUSHION GUM 50MM", "MDS-SS-50MM", "Cushion Gum", "Roll", 1850, 130, 25, "Width: 50 mm, Thickness: 1.2 mm; wide-base truck & bus shoulder reinforcement");

// 3. Black Vulcanizing Solution
addItem("MIDAS BLACK VULCANIZING SOLUTION - RTU 25L", "MDS-BVS-RTU25", "Vulcanizing Solution", "Can", 3800, 120, 25, "Ready-to-use (RTU) black cement for precured & hot process; 25 Litres sealed drum");
addItem("MIDAS BLACK VULCANIZING SOLUTION - RTU 30L", "MDS-BVS-RTU30", "Vulcanizing Solution", "Can", 4450, 150, 30, "Ready-to-use (RTU) black cement; 30 Litres heavy duty canister");
addItem("MIDAS BLACK VULCANIZING SOLUTION - ULTRA THIN 25L", "MDS-BVS-ULT25", "Vulcanizing Solution", "Can", 4100, 110, 20, "Ultra thin sprayable/brushable fast penetrating vulcanizing solution; 25 Litres");
addItem("MIDAS BLACK VULCANIZING SOLUTION - ULTRA THIN 30L", "MDS-BVS-ULT30", "Vulcanizing Solution", "Can", 4800, 95, 20, "Ultra thin fast drying adhesive solution; 30 Litres industrial drum");
addItem("MIDAS BLACK VULCANIZING SOLUTION - ULTRA QUICK DRY 15L", "MDS-BVS-QDRY15", "Vulcanizing Solution", "Can", 2950, 0, 20, "Fast-evaporating quick bond formula 15L can", true);

// 4. Cushion Repair Compound & Rope Rubber
addItem("MIDAS CUSHION REPAIR COMPOUND", "MDS-CRC-CAN", "Repair Compounds", "Can", 950, 210, 45, "Factory fresh sealed can for industrial, agricultural, and submersible pump retreading");
addItem("MIDAS ROPE RUBBER FOR EXTRUDER GUNS", "MDS-RR-COIL", "Repair Compounds", "Coil", 2200, 180, 35, "Extruder gun rope rubber for skive filling and buzz-out repair; superior process safety & tack");

// 5. Conventional Hot Rubber
addItem("MIDAS CONVENTIONAL HOT RUBBER - TRACTOR", "MDS-HOT-TRACTOR", "Conventional Rubber", "Roll", 4200, 85, 20, "High scorch safety compound designed for agricultural drive tyres");
addItem("MIDAS CONVENTIONAL HOT RUBBER - 14.00 x 25", "MDS-HOT-140025", "Conventional Rubber", "Roll", 6800, 65, 15, "OTR heat-resistant conventional retreading compound; 14.00 x 25");
addItem("MIDAS CONVENTIONAL HOT RUBBER - 18.00 x 25", "MDS-HOT-180025", "Conventional Rubber", "Roll", 8900, 50, 10, "Mining & port OTR high abrasion conventional rubber; 18.00 x 25");
addItem("MIDAS CONVENTIONAL HOT RUBBER - 23.5 x 25", "MDS-HOT-23525", "Conventional Rubber", "Roll", 11500, 35, 10, "Earthmover heavy duty cut-resistant conventional slab; 23.5 x 25");

// 6. Half Skirt Envelopes (Regular) - Steam Bonder (Page 28)
const halfSkirtEnvelopes = [
  { code: "52 x 28", tyre: "14.00 x 25, 14.00 x 24, 14.00 R 24", price: 3400, stock: 75 },
  { code: "46 x 28", tyre: "325/95 R 24, 12.00 R 24", price: 3100, stock: 80 },
  { code: "46 x 22", tyre: "14.00 R 20", price: 2950, stock: 90 },
  { code: "44 x 25", tyre: "12 R 24.5, 11 R 24.5, 12.00 x 24, 11.00 R 24, 13 R 22.5, 11.00 R 22, 12.00 R 20, 12.00 x 20", price: 2850, stock: 120 },
  { code: "43 x 25", tyre: "385/65 R 22.5, 365/80 R 20", price: 2800, stock: 85 },
  { code: "42 x 22", tyre: "315/80 R 22.5, 12 R 22.5, 11.00 R 20, 11.00 x 20", price: 2750, stock: 160 },
  { code: "42 x 26", tyre: "295/80 R 22.5, 11 R 22.5, 295/90 R 20, 10.00 R 20, 10.00 x 20", price: 2750, stock: 195 },
  { code: "40 x 25", tyre: "275/80 R 22.5, 10 R 22.5, 9.00 R 20, 9.00 x 20", price: 2600, stock: 130 },
  { code: "38 x 25", tyre: "8.25 x 20", price: 2500, stock: 110 },
  { code: "35 x 20", tyre: "7.50 x 20, 9.00 x 16", price: 2400, stock: 95 },
  { code: "32 x 19", tyre: "8.25 x 16, 6.50 x 20", price: 2250, stock: 85 },
  { code: "31 x 18", tyre: "7.50 x 16, 7.00 x 16, F78 x 15, 235/75 R 17.5, 225/75 R 17.5", price: 2150, stock: 115 },
  { code: "29 x 19", tyre: "6.00 x 16, 7.00 x 15, 6.70 x 15, 195 R 15, 215 R 14, 185/85 R 16, 235 R 16", price: 2050, stock: 90 },
  { code: "26 x 17", tyre: "185 D 14, 195 R 14, 5.90 x 15, 165/195/205/215/235/70 R 15, 185 R 15", price: 1950, stock: 80 },
  { code: "25 x 16", tyre: "5.20 x 14, 6.70 x 14, 175/80 R 13, 6.40 x 13, 155/175/185/195/215/70 R 14, 165 D 14", price: 1850, stock: 75 },
  { code: "23 x 13", tyre: "145/80 R 13, 155/80 R 13, 165 D 13, 165/80 R 13, 175/70 R 13, 185/70 R 13, 195/70 R 13, 165/70 R 14, 155/80 R 15", price: 1750, stock: 100 },
  { code: "21 x 12", tyre: "4.50/5.65 x 12, 145 R 12, 155/80 D 12, 165/80 D 12, 145/70 R 13, 155/65 R 13, 155/70 R 13, 165/65 R 13", price: 1650, stock: 90 },
  { code: "19 x 11", tyre: "4.50 x 10", price: 1550, stock: 80 },
  { code: "17 x 08", tyre: "4.00 x 8", price: 1450, stock: 0, isOut: true },
];

halfSkirtEnvelopes.forEach(e => {
  addItem(
    `MIDAS HALF SKIRT ENVELOPE ${e.code}`,
    `MDS-HSE-${e.code.replace(/\s+/g, '')}`,
    "Curing Envelopes",
    "Pcs",
    e.price,
    e.stock,
    20,
    `Steam bonder regular half skirt envelope; Suggested tyre: ${e.tyre}`,
    Boolean(e.isOut)
  );
});

// 7. Full Skirt Envelopes (Regular) - Electric Chamber (Page 29)
const fullSkirtEnvelopes = [
  { code: "52 x 21", tyre: "14.00 x 25, 14.00 x 24, 14.00 R 24", price: 3550, stock: 65 },
  { code: "46 x 22", tyre: "325/95 R 24, 12.00 R 24, 12.00 x 24", price: 3250, stock: 75 },
  { code: "46 x 19", tyre: "14.00 R 20", price: 3100, stock: 70 },
  { code: "44 x 19", tyre: "11.00 R 24, 13 R 22.5, 12.00 R 22, 14/80 R 20, 12.00 R 20, 12.00 x 20", price: 2950, stock: 110 },
  { code: "44 x 22", tyre: "12 R 24.5, 11 R 24.5, 315/80 R 22.5, 11.00 R 22", price: 2950, stock: 125 },
  { code: "43 x 20", tyre: "385/65 R 22.5, 365/80 R 20", price: 2900, stock: 80 },
  { code: "42 x 17", tyre: "11.00 R 20, 11.00 x 20", price: 2850, stock: 95 },
  { code: "42 x 19", tyre: "295/80 R 22.5, 12 R 22.5, 11 R 22.5, 295/90 R 20, 10.00 R 20, 10.00 x 20", price: 2850, stock: 180 },
  { code: "40 x 18", tyre: "275/80 R 22.5, 10 R 22.5, 9.00 R 20, 9.00 x 20", price: 2700, stock: 120 },
  { code: "38 x 20", tyre: "8.25 x 20", price: 2600, stock: 90 },
  { code: "35 x 13", tyre: "9.00 x 16", price: 2500, stock: 85 },
  { code: "35 x 16", tyre: "7.50 x 20, 6.50 x 20, 8.25 x 16", price: 2500, stock: 105 },
  { code: "32 x 16", tyre: "7.50 x 16, 7.00 x 16, 235/75 R 17.5, 225/75 R 17.5", price: 2350, stock: 95 },
  { code: "31 x 14", tyre: "7.00 x 15", price: 2200, stock: 80 },
  { code: "28 x 16", tyre: "6.00 x 16, F78 x 15, 195 R 15, 195/215 R 14, 215 R 15, 185/85 R 16, 235 R 16", price: 2100, stock: 85 },
  { code: "26 x 16", tyre: "5.90 x 15, 165 R 15, 5.20 x 14, 6.00 x 14, 165 R 14, 165 D 14", price: 2000, stock: 75 },
  { code: "23 x 10", tyre: "145/80 R 13, 155/80 R 13, 165 D 13, 165/80 R 13, 175/70 R 13, 185/70 R 13, 195/70 R 13, 165/70 R 14, 155/80 R 15", price: 1850, stock: 90 },
  { code: "22 x 11", tyre: "155/80 D 12, 165/80 D 12, 165/65 D 13, 145 R 13, 4.50 x 12, 5.65 x 12, 145 R 12", price: 1750, stock: 85 },
  { code: "19 x 09", tyre: "4.50 x 10", price: 1600, stock: 70 },
  { code: "17 x 08", tyre: "4.00 x 8", price: 1500, stock: 75 },
];

fullSkirtEnvelopes.forEach(e => {
  addItem(
    `MIDAS FULL SKIRT ENVELOPE ${e.code}`,
    `MDS-FSE-${e.code.replace(/\s+/g, '')}`,
    "Curing Envelopes",
    "Pcs",
    e.price,
    e.stock,
    20,
    `Electric chamber regular full skirt envelope; Suggested tyre: ${e.tyre}`
  );
});

// 8. ARC / Snap Seal / Flex Seal System Outer Envelopes (Page 30)
const arcEnvelopes = [
  { code: "46 x 15", tyre: "325/95 R 24, 12.00 R 24", price: 3200, stock: 65 },
  { code: "44 x 16", tyre: "12 R 24.5, 11 R 24.5, 315/80 R 22.5, 10.00 R 22", price: 3000, stock: 85 },
  { code: "44 x 14", tyre: "11.00 R 24, 13 R 22.5, 11.00 R 22, 14/80 R 20, 11.00 R 20", price: 2950, stock: 90 },
  { code: "44 x 13", tyre: "12.00 R 22, 12.00 R 20", price: 2900, stock: 75 },
  { code: "43 x 14", tyre: "385/65 R 22.5, 365/80 R 20", price: 2850, stock: 70 },
  { code: "42 x 14", tyre: "315/75 R 22.5, 295/80 R 22.5, 295/75 R 22.5, 12 R 22.5, 295/90 R 20, 10.00 R 20", price: 2800, stock: 140 },
  { code: "42 x 15", tyre: "315/70 R 22.5, 305/75 R 22.5, 305/70 R 22.5, 275/80 R 22.5, 11 R 22.5", price: 2800, stock: 110 },
  { code: "40 x 13", tyre: "275/70 R 22.5, 265/70 R 22.5, 10 R 22.5, 9.00 R 20, 305/70 R 19.5", price: 2650, stock: 95 },
  { code: "35 x 12 RC", tyre: "7.50 R 20, 285/70 R 19.5, 265/70 R 19.5, 9.00 R 16, 8.25 R 16, 8.25 R 15", price: 2550, stock: 85 },
  { code: "35 x 12 ST", tyre: "7.00 R 20, 6.50 R 20, 245/70 R 19.5", price: 2500, stock: 80 },
  { code: "32 x 11", tyre: "245/65 R 19.5, 235/70 R 19.5, 245/70 R 17.5, 235/75 R 17.5, 9.5 R 17.5, 10 R 16.5, 265/75 R 16, 245/75 R 16, 235/85 R 16, 215/85 R 16, 7.50 R 16, 7.50 R 15, 10.00 R 15 LT", price: 2400, stock: 105 },
  { code: "32 x 13", tyre: "225/70 R 19.5, 225/75 R 17.5, 215/75 R 17.5, 205/75 R 17.5, 7.00 R 16, 7.00 R 15", price: 2400, stock: 90 },
  { code: "23 x 07", tyre: "6.50-10", price: 1850, stock: 65 },
  { code: "22 x 09", tyre: "6.00-9", price: 1750, stock: 60 },
  { code: "19 x 07", tyre: "4.50-10, 5.00-8", price: 1650, stock: 55 },
  { code: "17 x 06", tyre: "4.00-8", price: 1550, stock: 0, isOut: true },
];

arcEnvelopes.forEach(e => {
  addItem(
    `MIDAS ARC SNAP SEAL ENVELOPE ${e.code}`,
    `MDS-ARC-${e.code.replace(/\s+/g, '')}`,
    "Curing Envelopes",
    "Pcs",
    e.price,
    e.stock,
    20,
    `ARC / Snap Seal / Flex Seal System Outer Envelope (2.0 in skirt below bead); Suggested tyre: ${e.tyre}`,
    Boolean(e.isOut)
  );
});

// 9. Double Envelope System - Outer & Inner (Pages 31-32)
const doubleOuter = [
  { code: "52 x 28", tyre: "14.00 R 24", price: 3450, stock: 60 },
  { code: "46 x 22", tyre: "445/65 R 22.5, 425/65 R 22.5, 14.00 R 20", price: 3300, stock: 75 },
  { code: "44 x 22", tyre: "325/95 R 24, 12.00 R 24, 11.00 R 24, 12.00 R 22", price: 3100, stock: 110 },
  { code: "44 x 25", tyre: "12 R 24.5, 13 R 22.5, 14/80 R 20, 12.00 R 20", price: 3150, stock: 125 },
  { code: "44 x 19", tyre: "445/65 R 19.5", price: 3000, stock: 65 },
  { code: "43 x 25", tyre: "385/65 R 22.5, 365/80 R 20", price: 2950, stock: 80 },
  { code: "42 x 22", tyre: "11 R 24.5, 315/80 R 22.5, 315/75 R 22.5, 315/70 R 22.5, 12 R 22.5, 11.00 R 22, 11.00 R 20", price: 2900, stock: 165 },
  { code: "42 x 25", tyre: "295/80 R 22.5, 11 R 22.5, 10.00 R 22", price: 2900, stock: 140 },
  { code: "40 x 18", tyre: "305/75 R 22.5, 305/70 R 22.5, 295/75 R 22.5, 295/90 R 20, 10.00 R 20", price: 2800, stock: 130 },
  { code: "40 x 21", tyre: "275/80 R 22.5, 275/70 R 22.5, 10 R 22.5", price: 2800, stock: 115 },
  { code: "40 x 25", tyre: "9.00 R 20", price: 2750, stock: 95 },
  { code: "38 x 22", tyre: "10.00 R 15, TR/LB", price: 2650, stock: 70 },
  { code: "38 x 25", tyre: "265/70 R 22.5, 8.25 R 20", price: 2650, stock: 85 },
  { code: "35 x 20", tyre: "7.50 R 20, 7.00 R 20, 6.50 R 20, 265/70 R 19.5", price: 2500, stock: 90 },
  { code: "35 x 16", tyre: "285/70 R 19.5, 9.00 R 16", price: 2500, stock: 80 },
  { code: "32 x 16", tyre: "245/70 R 19.5, 9.5 R 17.5, 10 R 16.5, 265/75 R 16, 8.25 R 16", price: 2350, stock: 85 },
  { code: "32 x 19", tyre: "245/65 R 19.5, 235/70 R 19.5, 225/70 R 19.5, 245/75 R 16, 235/85 R 16, 215/85 R 16, 10.00 R 15 LT, 8.25 R 15", price: 2350, stock: 95 },
  { code: "31 x 18", tyre: "245/70 R 17.5, 235/75 R 17.5, 225/75 R 17.5, 215/75 R 17.5, 205/75 R 17.5, 7.50 R 16, 7.00 R 16, 7.50 R 15", price: 2250, stock: 90 },
  { code: "28 x 16", tyre: "225/75 R 16, 215/75 R 16, 6.50 R 16, 6.00 R 16, 7.00 R 15", price: 2150, stock: 75 },
];

doubleOuter.forEach(e => {
  addItem(
    `MIDAS DOUBLE ENVELOPE OUTER ${e.code}`,
    `MDS-DEO-${e.code.replace(/\s+/g, '')}`,
    "Curing Envelopes",
    "Pcs",
    e.price,
    e.stock,
    20,
    `Double envelope system outer sleeve; Suggested tyre: ${e.tyre}`
  );
});

// Inner Envelopes (Page 32)
const doubleInner = [
  { code: "1300 x 610", tyre: "12.00 R 24, 325/95 R 24, 13.00 R 24, 14.00 R 24, 11 R 24.5, 12 R 24.5", price: 2800, stock: 70 },
  { code: "1100 x 480", tyre: "385/65 R 22.5, 385/55 R 22.5, 315/80 R 22.5, 315/75 R 22.5, 13 R 22.5, 12 R 22.5, 11.00 R 22, 12.00 R 20, 11.00 R 20, 425/55 R 19.5", price: 2600, stock: 125 },
  { code: "1060 x 480 M", tyre: "315/70 R 22.5, 305/70 R 22.5, 295/80 R 22.5, 295/75 R 22.5, 11 R 22.5, 10.00 R 22, 295/90 R 20, 10.00 R 20", price: 2500, stock: 135 },
  { code: "1060 x 480 U", tyre: "275/80 R 22.5, 275/70 R 22.5, 10 R 22.5, 275/80 R 20, 9.00 R 20", price: 2500, stock: 110 },
  { code: "780 x 400", tyre: "9 R 17.5, 8.5 R 17.5, 8 R 17.5, 235/75 R 17.5, 225/75 R 17.5, 215/75 R 17.5, 205/75 R 17.5, 265/70 R 17.5, 245/70 R 17.5, 205/65 R 17.5, 8.25 R 16, 7.50 R 16, 7.00 R 16, 235/85 R 16, 215/85 R 16, 225/75 R 16, 215/75 R 16, 245/70 R 16, 255/75 R 15, 7.50 R 15", price: 2200, stock: 95 },
];

doubleInner.forEach(e => {
  addItem(
    `MIDAS DOUBLE ENVELOPE INNER ${e.code}`,
    `MDS-DEI-${e.code.replace(/\s+/g, '')}`,
    "Curing Envelopes",
    "Pcs",
    e.price,
    e.stock,
    20,
    `Double envelope system inner tube; Suggested tyre: ${e.tyre}`
  );
});

// Wicking Pads (Page 32)
addItem("MIDAS WICKING PAD - DOUBLE ENVELOPE (1250 x 175)", "MDS-WP-1250175", "Wicking Pads", "Pcs", 420, 260, 50, "Double Envelope System continuous air evacuation wicking pad (1250 x 175 mm)");
addItem("MIDAS WICKING PAD - ARC / FLEX SEAL (520 x 175)", "MDS-WP-520175", "Wicking Pads", "Pcs", 310, 290, 50, "ARC / Snap Seal / Flex Seal & Rim and Tube System wicking pad (520 x 175 mm)");

// 10. Curing Bags (Page 33)
const curingBags = [
  { size: "16.9 x 28", price: 5200, stock: 45 },
  { size: "14.9 x 28", price: 4900, stock: 40 },
  { size: "13.6 x 28", price: 4600, stock: 50 },
  { size: "12.4 x 28", price: 4300, stock: 45 },
  { size: "14.00 x 24/25", price: 4800, stock: 55 },
  { size: "12.00 x 24", price: 4200, stock: 65 },
  { size: "12 R 22.5", price: 3400, stock: 90 },
  { size: "11 R 22.5", price: 3200, stock: 95 },
  { size: "315/80 R 22.5", price: 3500, stock: 140 },
  { size: "295/80 R 22.5", price: 3300, stock: 150 },
  { size: "12.00 x 20", price: 3200, stock: 85 },
  { size: "11.00 x 20", price: 3000, stock: 110 },
  { size: "10.00 x 20", price: 2850, stock: 180 },
  { size: "9.00 x 20", price: 2700, stock: 120 },
  { size: "8.25 x 20", price: 2500, stock: 85 },
  { size: "8.25 x 16", price: 2400, stock: 90 },
  { size: "7.50 x 16", price: 2250, stock: 105 },
  { size: "7.00 x 15", price: 2100, stock: 75 },
  { size: "6.00 x 16", price: 1950, stock: 80 },
  { size: "6.00 x 14", price: 1850, stock: 70 },
  { size: "5.90 x 15", price: 1800, stock: 65 },
  { size: "5.65/4.50 x 12", price: 1650, stock: 70 },
  { size: "4.50 x 10", price: 1500, stock: 60 },
  { size: "4.00 x 8", price: 1350, stock: 0, isOut: true },
];

curingBags.forEach(b => {
  addItem(
    `MIDAS HEAT RESISTANT CURING BAG ${b.size}`,
    `MDS-CB-${b.size.replace(/[\s\/\.]/g, '')}`,
    "Curing Bags",
    "Pcs",
    b.price,
    b.stock,
    20,
    `Heavy duty autoclave curing bag for uniform pressure transfer; Size: ${b.size}`,
    Boolean(b.isOut)
  );
});

// 11. Special Heat Resistant Flaps (Page 33)
addItem("MIDAS HEAT RESISTANT FLAP 22.5 EXTRA WIDE", "MDS-FLP-225EW", "Flaps", "Pcs", 1350, 115, 25, "Tyre size: 385/65 R 22.5, 315/80 R 22.5, 12 R 22.5; protects curing tubes and doubles bag life");
addItem("MIDAS HEAT RESISTANT FLAP 22.5 STANDARD", "MDS-FLP-225STD", "Flaps", "Pcs", 1250, 135, 30, "Tyre size: 295/80 R 22.5, 11 R 22.5");
addItem("MIDAS HEAT RESISTANT FLAP 20 EXTRA WIDE", "MDS-FLP-20EW", "Flaps", "Pcs", 1200, 125, 25, "Tyre size: 12.00 R 20, 11.00 R 20, 10.00 R 20, 12.00 x 20, 11.00 x 20");
addItem("MIDAS HEAT RESISTANT FLAP 20 SUPER", "MDS-FLP-20SUP", "Flaps", "Pcs", 1200, 160, 35, "Tyre size: 10.00 x 20, 9.00 x 20, 9.00 R 20, 8.25 x 20, 8.25 R 20");
addItem("MIDAS HEAT RESISTANT FLAP 16 LCV", "MDS-FLP-16LCV", "Flaps", "Pcs", 900, 140, 30, "Tyre size: 8.25 R 16, 7.50 R 16, 7.00 R 16, 7.50 R 15, 7.00 R 15");

// 12. OTR Tyres 'O' Sealing Rings (Page 34)
const otrRings = [
  { code: "OR 20 THIN", thick: "6.5 mm", rim: "20 in", tyre: "365/80-20, 385/80-20, 14.00-20, 16.00-20, 18-20, 20-20, 22-20", price: 800, stock: 75 },
  { code: "OR 24 THIN", thick: "6.5 mm", rim: "24 in", tyre: "13.00-24, 14.00-24, 16.00-24", price: 900, stock: 70 },
  { code: "OR 25 THIN", thick: "6.5 mm", rim: "25 in", tyre: "15.5-25, 17.5-25", price: 950, stock: 65 },
  { code: "OR 25 THICK", thick: "9.5 mm", rim: "25 in", tyre: "14.00-25, 16.00-25, 18.00-25, 20.5-25, 23.5-25, 26.5-25, 29.5-25", price: 1250, stock: 85 },
  { code: "OR 29 THICK", thick: "9.5 mm", rim: "29 in", tyre: "26.5-29, 29.5-29, 33.25-29, 775/65 R 29, 875/65 R 29", price: 1450, stock: 60 },
  { code: "OR 33 THICK", thick: "9.5 mm", rim: "33 in", tyre: "18.00-33, 21.00-33, 35/65-33, 33.25-33", price: 1650, stock: 55 },
  { code: "OR 35 THICK", thick: "9.5 mm", rim: "35 in", tyre: "21.00-35, 24.00-35, 29.5-35, 33.25-35, 37.25-35", price: 1850, stock: 50 },
  { code: "OR 45 THICK", thick: "9.5 mm", rim: "45 in", tyre: "45/65-45", price: 2200, stock: 40 },
  { code: "OR 49 THICK", thick: "9.5 mm", rim: "49 in", tyre: "27.00-49", price: 2600, stock: 35 },
  { code: "OR 51 XT", thick: "13.0 mm", rim: "51 in", tyre: "30.00-51, 33.00-51, 36.00-51, 50/65-51", price: 3200, stock: 30 },
  { code: "OR 57 XT", thick: "13.0 mm", rim: "57 in", tyre: "37.00-57, 40.00-57, 42/90 R 57, 46/90 R 57, 50/80 R 57, 55/80 R 57, 50/90 R 57, 60/80 R 57, 65/65-57", price: 3900, stock: 25 },
];

otrRings.forEach(r => {
  addItem(
    `MIDAS OTR 'O' SEALING RING ${r.code}`,
    `MDS-OR-${r.code.replace(/\s+/g, '')}`,
    "OTR Sealing Rings",
    "Pcs",
    r.price,
    r.stock,
    15,
    `Sealing ring for tubeless tyre beads on split rims; Thickness: ${r.thick}, Rim: ${r.rim}; Tyre: ${r.tyre}`
  );
});

// 13. Precured Treads - Super Diesel (Page 8)
addItem("MIDAS PRECURED TREAD - SUPER DIESEL SD 10.00 R 20", "MDS-SD-10R20", "Precured Treads", "Roll", 4950, 160, 30, "Length: 128 in, Base width: 220 mm, Tread depth: 12.5 mm, Base thickness: 3.5 mm, Wt: 11.7 kg. Aerodynamic fuel saving design.");
addItem("MIDAS PRECURED TREAD - SUPER DIESEL M9 315/80 R 22.5 (270MM)", "MDS-SD-M9-31580-270", "Precured Treads", "Roll", 5400, 140, 30, "Length: 129 in, Base width: 270 mm, Tread depth: 13.0 mm, Base thickness: 3.5 mm, Wt: 14.2 kg. Low rolling resistance.");
addItem("MIDAS PRECURED TREAD - SUPER DIESEL M9 315/80 R 22.5 (260MM)", "MDS-SD-M9-31580-260", "Precured Treads", "Roll", 5300, 130, 25, "Length: 129 in, Base width: 260 mm, Tread depth: 13.0 mm, Base thickness: 3.5 mm, Wt: 13.9 kg.");
addItem("MIDAS PRECURED TREAD - SUPER DIESEL M9 295/80 R 22.5", "MDS-SD-M9-29580", "Precured Treads", "Roll", 5150, 150, 30, "Length: 129 in, Base width: 250 mm, Tread depth: 13.0 mm, Base thickness: 3.5 mm, Wt: 13.2 kg.");
addItem("MIDAS PRECURED TREAD - SUPER DIESEL M9 10.00 R 20", "MDS-SD-M9-10R20", "Precured Treads", "Roll", 4850, 190, 35, "Length: 129 in, Base width: 230 mm, Tread depth: 13.0 mm, Base thickness: 3.3 mm, Wt: 11.4 kg.");

// 14. Precured Treads - Midas Arcus (Page 9)
addItem("MIDAS ARCUS TREAD - M GRIP 10.00 R 20 (230MM)", "MDS-ARC-MGRIP-230", "Precured Treads", "Roll", 5200, 135, 25, "Length: 128 in, Base width: 230 mm, Tread depth: 13.5 mm, Base thickness: 3.5 mm, Wt: 12.0 kg. Premium Arcus compound.");
addItem("MIDAS ARCUS TREAD - M GRIP 10.00 R 20 (220MM)", "MDS-ARC-MGRIP-220", "Precured Treads", "Roll", 5150, 120, 25, "Length: 128 in, Base width: 220 mm, Tread depth: 13.5 mm, Base thickness: 3.5 mm, Wt: 11.8 kg.");
addItem("MIDAS ARCUS TREAD - M 27 10.00 R 20", "MDS-ARC-M27-10R20", "Precured Treads", "Roll", 5100, 110, 25, "Length: 128 in, Base width: 220 mm, Tread depth: 13.5 mm, Base thickness: 3.0 mm, Wt: 12.0 kg.");
addItem("MIDAS ARCUS TREAD - MVN 10.00 R 20", "MDS-ARC-MVN-10R20", "Precured Treads", "Roll", 5250, 105, 20, "Length: 128 in, Base width: 230 mm, Tread depth: 13.5 mm, Base thickness: 3.8 mm, Wt: 12.1 kg.");
addItem("MIDAS ARCUS TREAD - MARG 295/80 R 22.5", "MDS-ARC-MARG-29580", "Precured Treads", "Roll", 5350, 125, 25, "Length: 130 in, Base width: 250 mm, Tread depth: 11.0 mm, Base thickness: 3.4 mm, Wt: 11.5 kg.");
addItem("MIDAS ARCUS TREAD - MARG 10.00 R 20", "MDS-ARC-MARG-10R20", "Precured Treads", "Roll", 4950, 140, 30, "Length: 130 in, Base width: 230 mm, Tread depth: 11.0 mm, Base thickness: 3.4 mm, Wt: 10.8 kg.");
addItem("MIDAS ARCUS TREAD - RM 30 295/80 R 22.5", "MDS-ARC-RM30-29580", "Precured Treads", "Roll", 5450, 115, 25, "Length: 128 in, Base width: 250 mm, Tread depth: 14.0 mm, Base thickness: 3.5 mm, Wt: 13.4 kg.");
addItem("MIDAS ARCUS TREAD - R 2 10.00 R 20", "MDS-ARC-R2-10R20", "Precured Treads", "Roll", 5200, 130, 25, "Length: 128 in, Base width: 220 mm, Tread depth: 15.0 mm, Base thickness: 4.0 mm, Wt: 13.0 kg.");

// 15. Precured Treads - PMG Radial (Page 10)
addItem("MIDAS PMG RADIAL - MTN 11.00 R 20 (250MM)", "MDS-PMG-MTN-11R20", "Precured Treads", "Roll", 5100, 120, 25, "Length: 133 in, Base width: 250 mm, Tread depth: 16.0 mm, Base thickness: 3.5 mm, Wt: 14.7 kg.");
addItem("MIDAS PMG RADIAL - MTN 295/80 R 22.5", "MDS-PMG-MTN-29580", "Precured Treads", "Roll", 4950, 110, 25, "Length: 128 in, Base width: 240 mm, Tread depth: 16.0 mm, Base thickness: 4.0 mm, Wt: 13.9 kg.");
addItem("MIDAS PMG RADIAL - MTN 10.00 R 20 SUPER", "MDS-PMG-MTN-10SUP", "Precured Treads", "Roll", 4900, 135, 30, "Length: 128 in, Base width: 230 mm, Tread depth: 18.0 mm, Base thickness: 4.0 mm, Wt: 14.6 kg.");
addItem("MIDAS PMG RADIAL - MTN 10.00 R 20", "MDS-PMG-MTN-10R20", "Precured Treads", "Roll", 4750, 160, 30, "Length: 128 in, Base width: 230 mm, Tread depth: 14.0 mm, Base thickness: 3.5 mm, Wt: 11.8 kg.");
addItem("MIDAS PMG RADIAL - MRK 295/80 R 22.5", "MDS-PMG-MRK-29580", "Precured Treads", "Roll", 4800, 115, 25, "Length: 128 in, Base width: 240 mm, Tread depth: 11.5 mm, Base thickness: 3.5 mm, Wt: 11.5 kg.");
addItem("MIDAS PMG RADIAL - MRK 10.00 R 20", "MDS-PMG-MRK-10R20", "Precured Treads", "Roll", 4650, 145, 30, "Length: 128 in, Base width: 230 mm, Tread depth: 11.5 mm, Base thickness: 3.5 mm, Wt: 11.2 kg.");
addItem("MIDAS PMG RADIAL - STRIDER 10.00 R 20", "MDS-PMG-STRIDER-10R20", "Precured Treads", "Roll", 4850, 125, 25, "Length: 128 in, Base width: 220 mm, Tread depth: 13.0 mm, Base thickness: 3.5 mm, Wt: 11.2 kg.");
addItem("MIDAS PMG RADIAL - NOVA 10.00 R 20", "MDS-PMG-NOVA-10R20", "Precured Treads", "Roll", 4700, 130, 25, "Length: 128 in, Base width: 220 mm, Tread depth: 12.5 mm, Base thickness: 3.5 mm, Wt: 11.1 kg.");
addItem("MIDAS PMG RADIAL - TERRA 10.00 R 20", "MDS-PMG-TERRA-10R20", "Precured Treads", "Roll", 4600, 120, 25, "Length: 128 in, Base width: 220 mm, Tread depth: 12.0 mm, Base thickness: 3.5 mm, Wt: 10.8 kg.");

// 16. Precured Treads - Radial Designs (Pages 11-17)
const radialDesigns = [
  { name: "ALIA", size: "10.00 R 20", code: "ALIA-10R20", price: 4650, stock: 155, depth: "14.0 mm", wt: "12.1 kg" },
  { name: "ALIA", size: "9.00 R 20", code: "ALIA-9R20", price: 4400, stock: 115, depth: "14.5 mm", wt: "10.3 kg" },
  { name: "ALIA", size: "8.25 R 20", code: "ALIA-825R20", price: 4200, stock: 100, depth: "14.5 mm", wt: "9.6 kg" },
  { name: "ATHENA", size: "10.00 R 20", code: "ATHENA-10R20", price: 4750, stock: 125, depth: "14.0 mm", wt: "12.0 kg" },
  { name: "BCRDL", size: "10.00 R 20", code: "BCRDL-10R20", price: 4850, stock: 130, depth: "15.0 mm", wt: "14.0 kg" },
  { name: "BCRDL", size: "9.00 R 20", code: "BCRDL-9R20", price: 4450, stock: 95, depth: "11.0 mm", wt: "8.7 kg" },
  { name: "D 167 E", size: "10.00 R 20", code: "D167E-10R20", price: 4500, stock: 105, depth: "15.0 mm", wt: "11.3 kg" },
  { name: "EH", size: "10.00 R 20", code: "EH-10R20", price: 4650, stock: 95, depth: "16.0 mm", wt: "12.0 kg" },
  { name: "H 27", size: "10.00 R 20", code: "H27-10R20", price: 4450, stock: 130, depth: "13.5 mm", wt: "10.8 kg" },
  { name: "H 27", size: "9.00 R 20", code: "H27-9R20", price: 4300, stock: 110, depth: "13.5 mm", wt: "10.2 kg" },
  { name: "H 85", size: "10.00 R 20", code: "H85-10R20", price: 4350, stock: 85, depth: "12.5 mm", wt: "10.1 kg" },
  { name: "M 5", size: "315/80 R 22.5", code: "M5-31580", price: 5300, stock: 140, depth: "14.5 mm", wt: "19.2 kg" },
  { name: "M 5", size: "295/80 R 22.5", code: "M5-29580", price: 5050, stock: 135, depth: "14.5 mm", wt: "13.0 kg" },
  { name: "M 5", size: "10.00 R 20", code: "M5-10R20", price: 4750, stock: 165, depth: "14.5 mm", wt: "11.6 kg" },
  { name: "M 6", size: "10.00 R 20", code: "M6-10R20", price: 4600, stock: 120, depth: "15.0 mm", wt: "13.0 kg" },
  { name: "M 8", size: "12.00 R 24", code: "M8-12R24", price: 5500, stock: 90, depth: "19.0 mm", wt: "18.2 kg" },
  { name: "M 8", size: "9.00 R 20", code: "M8-9R20", price: 4500, stock: 100, depth: "15.0 mm", wt: "9.0 kg" },
  { name: "M 10 DIRECTIONAL", size: "12.00 R 20", code: "M10-12R20", price: 5600, stock: 125, depth: "21.0 mm", wt: "21.0 kg" },
  { name: "M 10 DIRECTIONAL", size: "315/80 R 22.5", code: "M10-31580", price: 5550, stock: 145, depth: "20.0 mm", wt: "20.4 kg" },
  { name: "M 10 DIRECTIONAL", size: "295/80 R 22.5", code: "M10-29580", price: 5350, stock: 135, depth: "20.0 mm", wt: "18.1 kg" },
  { name: "M 10 DIRECTIONAL", size: "10.00 R 20", code: "M10-10R20", price: 5100, stock: 170, depth: "20.0 mm", wt: "16.3 kg" },
  { name: "M 14", size: "10.00 R 20", code: "M14-10R20", price: 4400, stock: 125, depth: "13.0 mm", wt: "9.9 kg" },
  { name: "M 16 DIRECTIONAL", size: "315/80 R 22.5", code: "M16-31580", price: 5500, stock: 130, depth: "18.0 mm", wt: "17.9 kg" },
  { name: "M 16 DIRECTIONAL", size: "295/80 R 22.5", code: "M16-29580", price: 5300, stock: 140, depth: "18.0 mm", wt: "16.2 kg" },
  { name: "M 16 DIRECTIONAL", size: "10.00 R 20", code: "M16-10R20", price: 5050, stock: 155, depth: "20.0 mm", wt: "16.3 kg" },
  { name: "M 22", size: "10.00 R 20", code: "M22-10R20", price: 4700, stock: 110, depth: "16.5 mm", wt: "12.7 kg" },
  { name: "M 24", size: "10.00 R 20", code: "M24-10R20", price: 4550, stock: 135, depth: "13.0 mm", wt: "11.7 kg" },
  { name: "M 26", size: "12.00 R 24", code: "M26-12R24", price: 5700, stock: 85, depth: "18.0 mm", wt: "20.5 kg" },
  { name: "M 26", size: "315/80 R 22.5", code: "M26-31580", price: 5450, stock: 115, depth: "18.0 mm", wt: "17.0 kg" },
  { name: "M 26", size: "295/80 R 22.5", code: "M26-29580", price: 5250, stock: 125, depth: "18.0 mm", wt: "15.8 kg" },
  { name: "M 26", size: "10.00 R 20", code: "M26-10R20", price: 4950, stock: 140, depth: "18.0 mm", wt: "14.9 kg" },
  { name: "M 27", size: "295/80 R 22.5", code: "M27-29580", price: 4900, stock: 130, depth: "12.5 mm", wt: "12.6 kg" },
  { name: "M 27", size: "10.00 R 20", code: "M27-10R20", price: 4750, stock: 150, depth: "12.5 mm", wt: "11.6 kg" },
  { name: "M 28", size: "10.00 R 20", code: "M28-10R20", price: 4800, stock: 0, depth: "13.0 mm", wt: "11.8 kg", isOut: true },
  { name: "M 30", size: "295/80 R 22.5", code: "M30-29580", price: 5100, stock: 140, depth: "14.0 mm", wt: "14.1 kg" },
  { name: "M 30", size: "10.00 R 20", code: "M30-10R20", price: 4850, stock: 160, depth: "14.0 mm", wt: "12.7 kg" },
  { name: "M 31", size: "295/80 R 22.5", code: "M31-29580", price: 5050, stock: 120, depth: "13.0 mm", wt: "13.3 kg" },
  { name: "M 31", size: "10.00 R 20", code: "M31-10R20", price: 4800, stock: 130, depth: "13.0 mm", wt: "11.9 kg" },
  { name: "M 32", size: "315/80 R 22.5", code: "M32-31580", price: 5450, stock: 110, depth: "18.0 mm", wt: "18.0 kg" },
  { name: "M 32", size: "295/80 R 22.5", code: "M32-29580", price: 5250, stock: 120, depth: "18.0 mm", wt: "17.0 kg" },
  { name: "M 34", size: "295/80 R 22.5", code: "M34-29580", price: 5050, stock: 115, depth: "14.0 mm", wt: "13.3 kg" },
  { name: "M 34", size: "10.00 R 20", code: "M34-10R20", price: 4800, stock: 135, depth: "13.5 mm", wt: "12.0 kg" },
  { name: "MAXIMUS", size: "315/80 R 22.5", code: "MAXIMUS-31580", price: 5400, stock: 150, depth: "16.0 mm", wt: "16.3 kg" },
  { name: "MAXIMUS", size: "295/80 R 22.5", code: "MAXIMUS-29580", price: 5200, stock: 140, depth: "16.0 mm", wt: "14.7 kg" },
  { name: "MAXIMUS", size: "10.00 R 20", code: "MAXIMUS-10R20", price: 4950, stock: 180, depth: "16.0 mm", wt: "13.6 kg" },
  { name: "MCH", size: "295/80 R 22.5", code: "MCH-29580", price: 5250, stock: 105, depth: "15.0 mm", wt: "16.0 kg" },
  { name: "MCH", size: "10.00 R 20", code: "MCH-10R20", price: 5000, stock: 125, depth: "15.0 mm", wt: "14.7 kg" },
  { name: "MML DIRECTIONAL", size: "315/80 R 22.5", code: "MML-31580", price: 5500, stock: 120, depth: "18.0 mm", wt: "18.2 kg" },
  { name: "MML DIRECTIONAL", size: "295/80 R 22.5", code: "MML-29580", price: 5300, stock: 130, depth: "18.0 mm", wt: "17.0 kg" },
  { name: "MML DIRECTIONAL", size: "10.00 R 20", code: "MML-10R20", price: 5050, stock: 145, depth: "18.0 mm", wt: "14.8 kg" },
  { name: "MVI", size: "295/80 R 22.5", code: "MVI-29580", price: 5200, stock: 110, depth: "18.0 mm", wt: "15.5 kg" },
  { name: "MVI", size: "10.00 R 20", code: "MVI-10R20", price: 4800, stock: 125, depth: "13.5 mm", wt: "10.4 kg" },
  { name: "MREC", size: "315/80 R 22.5", code: "MREC-31580", price: 5150, stock: 115, depth: "14.0 mm", wt: "14.8 kg" },
  { name: "MREC", size: "10.00 R 20", code: "MREC-10R20", price: 4750, stock: 140, depth: "14.5 mm", wt: "12.8 kg" },
  { name: "RM 16", size: "295/80 R 22.5", code: "RM16-29580", price: 5350, stock: 115, depth: "17.0 mm", wt: "16.0 kg" },
  { name: "RM 16", size: "11.00 R 20", code: "RM16-11R20", price: 5200, stock: 110, depth: "16.5 mm", wt: "15.0 kg" },
  { name: "RM 31", size: "12.00 R 20", code: "RM31-12R20", price: 5750, stock: 95, depth: "20.0 mm", wt: "20.3 kg" },
  { name: "RM 31", size: "315/80 R 22.5", code: "RM31-31580", price: 5650, stock: 120, depth: "20.0 mm", wt: "19.5 kg" },
  { name: "RM 31", size: "295/80 R 22.5", code: "RM31-29580", price: 5450, stock: 130, depth: "20.0 mm", wt: "18.3 kg" },
  { name: "Z LUG", size: "295/80 R 22.5", code: "ZLUG-29580", price: 4950, stock: 135, depth: "14.5 mm", wt: "13.5 kg" },
  { name: "Z LUG", size: "10.00 R 20", code: "ZLUG-10R20", price: 4750, stock: 165, depth: "14.0 mm", wt: "11.9 kg" },
];

radialDesigns.forEach(d => {
  addItem(
    `MIDAS RADIAL PRECURED TREAD - ${d.name} (${d.size})`,
    `MDS-RAD-${d.code}`,
    "Precured Treads",
    "Roll",
    d.price,
    d.stock,
    25,
    `Radial design tread for all-wheel and drive axle applications; Depth: ${d.depth}, Weight: ${d.wt}`,
    Boolean(d.isOut)
  );
});

// 17. Precured Treads - Rib Designs (Pages 18-20)
const ribDesigns = [
  { name: "AJAX", size: "10.00 x 20", code: "AJAX-1020", price: 4250, stock: 185, depth: "13.5 mm", wt: "11.8 kg" },
  { name: "AJAX", size: "9.00 x 20", code: "AJAX-920", price: 4050, stock: 140, depth: "14.5 mm", wt: "10.8 kg" },
  { name: "AJAX", size: "8.25 x 20", code: "AJAX-82520", price: 3850, stock: 110, depth: "13.5 mm", wt: "9.3 kg" },
  { name: "AJAX", size: "7.50 x 16", code: "AJAX-7516", price: 3200, stock: 120, depth: "13.0 mm", wt: "6.4 kg" },
  { name: "ARIUS", size: "10.00 x 20", code: "ARIUS-1020", price: 4300, stock: 135, depth: "14.5 mm", wt: "13.0 kg" },
  { name: "BUS MILER", size: "9.00 x 20", code: "BUSMILER-920", price: 4400, stock: 155, depth: "18.0 mm", wt: "13.7 kg" },
  { name: "FLEET TRACK", size: "10.00 x 20", code: "FLTTRK-1020", price: 4200, stock: 145, depth: "13.0 mm", wt: "11.4 kg" },
  { name: "LONG HAUL", size: "9.00 x 20 Super", code: "LNGHAUL-920", price: 4500, stock: 105, depth: "18.0 mm", wt: "13.0 kg" },
  { name: "M 11", size: "10.00 x 20", code: "M11-1020", price: 4100, stock: 115, depth: "12.5 mm", wt: "10.0 kg" },
  { name: "NH", size: "10.00 x 20", code: "NH-1020", price: 4350, stock: 100, depth: "14.0 mm", wt: "11.7 kg" },
  { name: "MERCURY", size: "10.00 x 20", code: "MERCURY-1020", price: 4250, stock: 125, depth: "13.0 mm", wt: "11.3 kg" },
  { name: "M RIB", size: "10.00 x 20", code: "MRIB-1020", price: 4250, stock: 130, depth: "13.0 mm", wt: "11.3 kg" },
  { name: "PORT MILER", size: "12.00 x 20", code: "PORTMILER-1220", price: 5100, stock: 95, depth: "14.5 mm", wt: "16.1 kg" },
  { name: "TRANSPORT", size: "7.50 x 16 Super", code: "TRNSPT-7516", price: 3200, stock: 110, depth: "13.0 mm", wt: "6.3 kg" },
  { name: "STARK", size: "8.25 x 20", code: "STARK-82520", price: 3750, stock: 95, depth: "13.0 mm", wt: "8.2 kg" },
  { name: "VIKING", size: "10.00 x 20 Super", code: "VIKING-1020", price: 4350, stock: 160, depth: "15.0 mm", wt: "12.6 kg" },
  { name: "VIKING", size: "9.00 x 20", code: "VIKING-920", price: 4100, stock: 120, depth: "14.5 mm", wt: "12.0 kg" },
];

ribDesigns.forEach(d => {
  addItem(
    `MIDAS RIB PRECURED TREAD - ${d.name} (${d.size})`,
    `MDS-RIB-${d.code}`,
    "Precured Treads",
    "Roll",
    d.price,
    d.stock,
    25,
    `Rib design for highway, coach & steer axle; Tread depth: ${d.depth}, Weight: ${d.wt}`
  );
});

// 18. Precured Treads - Lug & Semilug Designs (Pages 21-23)
const lugDesigns = [
  { name: "ARYA", size: "10.00 x 20", code: "ARYA-1020", price: 4450, stock: 140, depth: "15.5 mm", wt: "12.6 kg" },
  { name: "L 01", size: "10.00 x 20", code: "L01-1020", price: 4350, stock: 125, depth: "14.0 mm", wt: "11.8 kg" },
  { name: "CROSS COUNTRY", size: "10.00 x 20", code: "CRSCNT-1020", price: 4400, stock: 130, depth: "15.0 mm", wt: "12.0 kg" },
  { name: "LOG LUGGER", size: "12.00 x 24", code: "LOGLUG-1224", price: 5800, stock: 80, depth: "21.0 mm", wt: "19.7 kg" },
  { name: "LOG LUGGER", size: "10.00 x 20", code: "LOGLUG-1020", price: 4600, stock: 105, depth: "17.0 mm", wt: "13.3 kg" },
  { name: "LUG MASTER", size: "10.00 x 20", code: "LUGMSTR-1020", price: 4650, stock: 155, depth: "17.0 mm", wt: "14.5 kg" },
  { name: "GRIP MASTER", size: "10.00 x 20", code: "GRPMSTR-1020", price: 4350, stock: 110, depth: "14.0 mm", wt: "11.0 kg" },
  { name: "ID MINES", size: "10.00 x 20", code: "IDMINES-1020", price: 4850, stock: 115, depth: "19.0 mm", wt: "15.5 kg" },
  { name: "MINES SPECIAL", size: "12.00 x 24", code: "MNSSPL-1224", price: 5500, stock: 90, depth: "15.0 mm", wt: "16.5 kg" },
  { name: "MINES SPECIAL", size: "10.00 x 20", code: "MNSSPL-1020", price: 4550, stock: 120, depth: "15.0 mm", wt: "13.6 kg" },
  { name: "M TITAN", size: "12.00 x 24 Super", code: "MTITAN-1224", price: 5900, stock: 85, depth: "21.0 mm", wt: "20.7 kg" },
  { name: "M TITAN", size: "10.00 x 20", code: "MTITAN-1020", price: 4500, stock: 145, depth: "14.5 mm", wt: "12.6 kg" },
  { name: "ROADSTER", size: "10.00 x 20", code: "RDSTR-1020", price: 4450, stock: 135, depth: "16.0 mm", wt: "12.5 kg" },
  { name: "SEMI LUG", size: "11.00 x 20 Super", code: "SEMILUG-1120", price: 4650, stock: 140, depth: "16.0 mm", wt: "13.6 kg" },
  { name: "SEMI LUG", size: "10.00 x 20", code: "SEMILUG-1020", price: 4400, stock: 175, depth: "14.0 mm", wt: "12.3 kg" },
  { name: "SEMI LUG", size: "9.00 x 20", code: "SEMILUG-920", price: 4150, stock: 125, depth: "14.0 mm", wt: "10.7 kg" },
];

lugDesigns.forEach(d => {
  addItem(
    `MIDAS LUG PRECURED TREAD - ${d.name} (${d.size})`,
    `MDS-LUG-${d.code}`,
    "Precured Treads",
    "Roll",
    d.price,
    d.stock,
    25,
    `Lug & semilug traction compound for drive axle and off-road; Depth: ${d.depth}, Weight: ${d.wt}`
  );
});

// 19. Precured Treads - LCV & Car Designs (Pages 24-26)
const lcvDesigns = [
  { name: "APOLLO", size: "7.00 x 15", code: "APOLLO-7015", price: 2700, stock: 155, depth: "11.0 mm", wt: "4.7 kg" },
  { name: "APOLLO", size: "DOST", code: "APOLLO-DOST", price: 2600, stock: 165, depth: "11.0 mm", wt: "4.3 kg" },
  { name: "STORM", size: "10.00 x 20", code: "STORM-1020", price: 4500, stock: 120, depth: "17.0 mm", wt: "13.5 kg" },
  { name: "TRACK MASTER", size: "10.00 x 20", code: "TRKMSTR-1020", price: 4650, stock: 140, depth: "18.0 mm", wt: "15.9 kg" },
  { name: "ASTRO", size: "CAR / F 78 x 15", code: "ASTRO-CAR", price: 2500, stock: 110, depth: "12.0 mm", wt: "5.8 kg" },
  { name: "AUTO", size: "4.00 x 10", code: "AUTO-4010", price: 1850, stock: 175, depth: "8.0 mm", wt: "1.4 kg" },
  { name: "EAGLE", size: "6.00 x 16", code: "EAGLE-6016", price: 2350, stock: 120, depth: "9.0 mm", wt: "3.9 kg" },
  { name: "CAR M", size: "AMBASSADOR / MARUTI ACE", code: "CARM-ACE", price: 2200, stock: 150, depth: "11.0 mm", wt: "3.5 kg" },
  { name: "MHW", size: "7.50 x 16", code: "MHW-7516", price: 2950, stock: 115, depth: "11.5 mm", wt: "5.5 kg" },
  { name: "NEW TRACTOR FRONT", size: "7.50 x 16", code: "TRACFRNT-7516", price: 3100, stock: 125, depth: "14.0 mm", wt: "5.5 kg" },
  { name: "OPTIMA", size: "6.00 x 16", code: "OPTIMA-6016", price: 2400, stock: 115, depth: "8.0 mm", wt: "3.0 kg" },
  { name: "PICKUP", size: "7.00 x 15", code: "PICKUP-7015", price: 2800, stock: 135, depth: "11.0 mm", wt: "4.5 kg" },
  { name: "TRAVELLER", size: "215/75 R 15", code: "TRAVELLER-21575", price: 2850, stock: 145, depth: "10.0 mm", wt: "4.6 kg" },
];

lcvDesigns.forEach(d => {
  addItem(
    `MIDAS LCV PRECURED TREAD - ${d.name} (${d.size})`,
    `MDS-LCV-${d.code}`,
    "Precured Treads",
    "Roll",
    d.price,
    d.stock,
    25,
    `Light commercial vehicle & car retreading tread; Depth: ${d.depth}, Weight: ${d.wt}`
  );
});

// 20. Precured Treads - Special Applications (Page 27)
const specialApps = [
  { name: "JCB", size: "17.5 - 25", code: "JCB-17525", price: 10500, stock: 75, depth: "28.0 mm", wt: "46.0 kg" },
  { name: "JCB", size: "14.00 - 25", code: "JCB-140025", price: 9200, stock: 70, depth: "27.0 mm", wt: "39.0 kg" },
  { name: "GPZH", size: "12.00 x 24", code: "GPZH-1224", price: 8700, stock: 65, depth: "32.0 mm", wt: "31.0 kg" },
  { name: "BSGL", size: "145 x 415", code: "BSGL-145415", price: 8900, stock: 60, depth: "24.0 mm", wt: "34.7 kg" },
  { name: "BS-16", size: "145 x 415", code: "BS16-145415", price: 8800, stock: 55, depth: "24.0 mm", wt: "34.5 kg" },
  { name: "M PORT-1", size: "18.00 x 25", code: "MPORT1-1825", price: 16500, stock: 45, depth: "52.0 mm", wt: "102.0 kg" },
];

specialApps.forEach(d => {
  addItem(
    `MIDAS SPECIAL APPLICATION TREAD - ${d.name} (${d.size})`,
    `MDS-SPL-${d.code}`,
    "Precured Treads",
    "Roll",
    d.price,
    d.stock,
    15,
    `Heavy duty earthmover, port & industrial retreading; Depth: ${d.depth}, Weight: ${d.wt}`
  );
});

const fileContent = `// Auto-generated Midas Brochure 2025 Inventory Catalog
// Source: https://midas.ind.in/public/uploads/brochures/2025/Domestic-Brochure-2025.pdf
import type { Item } from "./data";

export const MIDAS_ITEMS: Item[] = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../lib/midasData.ts'), fileContent);
console.log(`Generated ${items.length} Midas inventory items in lib/midasData.ts`);
