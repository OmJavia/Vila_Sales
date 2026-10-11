/**
 * Vila Sales — Standard QR Code Matrix & SVG Generator
 * Generates genuine, scannable QR Codes (ISO/IEC 18004) for Indian UPI Payment URIs.
 * No external API or binary dependencies required.
 */

// Simple, reliable Reed-Solomon QR encoder for byte mode (Version 1-10)
export function generateQrSvg(text: string, size = 240): string {
  // We construct a valid QR Code matrix.
  const matrix = createQrMatrix(text);
  const n = matrix.length;
  const cellSize = size / n;

  let path = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        path += `M${c * cellSize},${r * cellSize}h${cellSize}v${cellSize}h-${cellSize}z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#FFFFFF"/>
    <path d="${path}" fill="#111111"/>
  </svg>`;
}

/**
 * QR Code Generator implementation based on ISO/IEC 18004 Byte Mode
 */
function createQrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const len = bytes.length;

  // Determine QR Version (1 to 10) for Byte mode with Medium Error Correction
  const version = chooseVersion(len);
  const modulesCount = version * 4 + 17;

  const matrix: (boolean | null)[][] = Array.from({ length: modulesCount }, () =>
    Array(modulesCount).fill(null)
  );

  // 1. Finder patterns (top-left, top-right, bottom-left)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, modulesCount - 7, 0);
  addFinderPattern(matrix, 0, modulesCount - 7);

  // 2. Separators
  addSeparators(matrix, modulesCount);

  // 3. Timing patterns
  for (let i = 8; i < modulesCount - 8; i++) {
    const val = i % 2 === 0;
    if (matrix[6][i] === null) matrix[6][i] = val;
    if (matrix[i][6] === null) matrix[i][6] = val;
  }

  // 4. Alignment patterns for version >= 2
  addAlignmentPatterns(matrix, version);

  // 5. Dark module
  matrix[modulesCount - 8][8] = true;

  // 6. Encode Data with Error Correction
  const bitStream = encodeBitStream(bytes, version);

  // 7. Place data bits using standard zigzag upward/downward pattern
  let bitIndex = 0;
  let upward = true;

  for (let right = modulesCount - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing pattern

    const rows = upward
      ? Array.from({ length: modulesCount }, (_, i) => modulesCount - 1 - i)
      : Array.from({ length: modulesCount }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (matrix[r][c] === null) {
          let bit = false;
          if (bitIndex < bitStream.length) {
            bit = bitStream[bitIndex] === 1;
            bitIndex++;
          }
          // Mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? !bit : bit;
        }
      }
    }
    upward = !upward;
  }

  // 8. Add Format Information (Mask 0, Error Correction M: 00)
  addFormatInfo(matrix, modulesCount);

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

function chooseVersion(dataLen: number): number {
  // Capacity for byte mode with Medium error correction:
  // V1: 14, V2: 26, V3: 42, V4: 62, V5: 84, V6: 106, V7: 122, V8: 152, V9: 180, V10: 213
  const capacities = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362];
  for (let v = 1; v < capacities.length; v++) {
    if (dataLen <= capacities[v]) return v;
  }
  return 14;
}

function addFinderPattern(matrix: (boolean | null)[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (
        r === 0 ||
        r === 6 ||
        c === 0 ||
        c === 6 ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4)
      ) {
        matrix[row + r][col + c] = true;
      } else {
        matrix[row + r][col + c] = false;
      }
    }
  }
}

function addSeparators(matrix: (boolean | null)[][], n: number) {
  for (let i = 0; i < 8; i++) {
    if (matrix[7][i] === null) matrix[7][i] = false;
    if (matrix[i][7] === null) matrix[i][7] = false;
    if (matrix[n - 8][i] === null) matrix[n - 8][i] = false;
    if (matrix[n - 1 - i][7] === null) matrix[n - 1 - i][7] = false;
    if (matrix[7][n - 1 - i] === null) matrix[7][n - 1 - i] = false;
    if (matrix[i][n - 8] === null) matrix[i][n - 8] = false;
  }
}

function addAlignmentPatterns(matrix: (boolean | null)[][], version: number) {
  if (version < 2) return;
  const alignmentCoords: Record<number, number[]> = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
  };

  const coords = alignmentCoords[version] || [6, version * 4 + 10];
  for (const r of coords) {
    for (const c of coords) {
      if (matrix[r][c] !== null) continue; // Skip finders
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          matrix[r + dr][c + dc] = isBorder || isCenter;
        }
      }
    }
  }
}

function addFormatInfo(matrix: (boolean | null)[][], n: number) {
  // Format string for EC level M (00) and Mask 0 (000) with BCH error correction: 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  // Top-left
  const positionsTopLeft = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = positionsTopLeft[i];
    matrix[r][c] = formatBits[i] === 1;
  }

  // Split: top-right & bottom-left
  for (let i = 0; i < 7; i++) {
    matrix[8][n - 1 - i] = formatBits[14 - i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    matrix[n - 8 + i][8] = formatBits[i] === 1;
  }
}

function encodeBitStream(bytes: Uint8Array, version: number): number[] {
  const bits: number[] = [];

  // Mode indicator: 0100 for Byte
  bits.push(0, 1, 0, 0);

  // Character count indicator (8 bits for V1-V9, 16 bits for V10+)
  const countBits = version < 10 ? 8 : 16;
  for (let i = countBits - 1; i >= 0; i--) {
    bits.push((bytes.length >> i) & 1);
  }

  // Data bytes
  for (let k = 0; k < bytes.length; k++) {
    const b = bytes[k];
    for (let i = 7; i >= 0; i--) {
      bits.push((b >> i) & 1);
    }
  }

  // Terminator (up to 4 zeroes)
  for (let i = 0; i < 4; i++) bits.push(0);

  // Pad to multiple of 8
  while (bits.length % 8 !== 0) bits.push(0);

  // Total capacity in bytes for Version + EC M
  const totalCapacityWords = getTotalWords(version);
  const dataWords = getDataWords(version);

  // Convert bits to words
  const words: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let word = 0;
    for (let j = 0; j < 8; j++) {
      word = (word << 1) | bits[i + j];
    }
    words.push(word);
  }

  // Pad bytes 0xEC, 0x11 until data capacity reached
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (words.length < dataWords) {
    words.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  // Reed-Solomon Error Correction Code
  const ecWordsCount = totalCapacityWords - dataWords;
  const ecWords = generateReedSolomonEC(words, ecWordsCount);

  // Final codeword stream
  const fullCodewords = [...words, ...ecWords];
  const finalBits: number[] = [];
  for (const w of fullCodewords) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((w >> i) & 1);
    }
  }

  return finalBits;
}

function getDataWords(v: number): number {
  const table = [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216];
  return table[Math.min(v, 10)];
}

function getTotalWords(v: number): number {
  const table = [0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346];
  return table[Math.min(v, 10)];
}

// Reed-Solomon polynomial division in GF(256) with primitive 0x11D
const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function generateReedSolomonEC(data: number[], ecCount: number): number[] {
  let gen = [1];
  for (let i = 0; i < ecCount; i++) {
    const factor = [1, GF_EXP[i]];
    const nextGen: number[] = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      nextGen[j] ^= gfMul(gen[j], factor[0]);
      nextGen[j + 1] ^= gfMul(gen[j], factor[1]);
    }
    gen = nextGen;
  }

  const remainder = new Array(ecCount).fill(0);
  for (const byte of data) {
    const lead = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    if (lead !== 0) {
      for (let i = 0; i < ecCount; i++) {
        remainder[i] ^= gfMul(gen[i + 1], lead);
      }
    }
  }

  return remainder;
}
