import { BingoCardData, BingoConfig } from '../types';

/**
 * Generates unique Bingo cards with customizable X rows and Y columns.
 * Supports:
 * - Arbitrary dimensions (e.g. 3x3, 4x4, 5x5, 3x9, 4x5, etc.)
 * - Optional Center Free Space (LIBRE / BINGO / ★)
 * - Parametric empty pattern mode (leaving empty cells distributed across the card)
 * - Number ranges distributed by column (e.g. 1-15, 16-30, etc.)
 * - Guaranteed batch uniqueness via cryptographic-grade signature hashing
 */

function getCardSignature(matrix: (number | null)[][]): string {
  return matrix
    .map((row) => row.map((v) => (v === null ? 'X' : v.toString())).join(','))
    .join(';');
}

function getRandomInts(min: number, max: number, count: number): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) {
    pool.push(i);
  }
  // Shuffle Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function getDefaultColumnHeaders(cols: number): string[] {
  const standardLetters = ['B', 'I', 'N', 'G', 'O', 'P', 'R', 'S', 'T'];
  if (cols <= standardLetters.length) {
    return standardLetters.slice(0, cols);
  }
  const result: string[] = [];
  for (let i = 0; i < cols; i++) {
    result.push(String.fromCharCode(65 + i)); // A, B, C, D...
  }
  return result;
}

export function generateBingoCards(config: BingoConfig): BingoCardData[] {
  const cards: BingoCardData[] = [];
  const signatures = new Set<string>();

  const rows = Math.min(8, Math.max(3, config.gridRows || 5));
  const cols = Math.min(9, Math.max(3, config.gridCols || 5));
  const hasFreeCenter = config.hasFreeCenter ?? (rows === 5 && cols === 5);

  const freeCoords: { r: number; c: number } | null = hasFreeCenter
    ? {
        r: Math.floor(rows / 2),
        c: Math.floor(cols / 2),
      }
    : null;

  const totalCells = rows * cols;
  const totalPlayable = hasFreeCenter ? totalCells - 1 : totalCells;

  // Calculate numbers to keep and blanks to place
  const requestedNumbers = config.numbersPerCard ?? totalPlayable;
  const numbersToKeep = Math.min(totalPlayable, Math.max(1, requestedNumbers));
  const blanksToPlace = Math.max(0, totalPlayable - numbersToKeep);

  const targetCount = Math.max(1, config.totalCards || 24);
  const interval = Math.max(config.numberRangePerCol || 15, rows + 4);

  let attempts = 0;
  const maxAttempts = targetCount * 50;

  for (let cardIndex = 1; cardIndex <= targetCount && attempts < maxAttempts; attempts++) {
    // Generate pool of numbers for each column
    const colNumbers: number[][] = [];
    for (let c = 0; c < cols; c++) {
      const minVal = 1 + c * interval;
      const maxVal = (c + 1) * interval;

      // Count how many numbers needed for column c
      const countNeeded = rows;
      const sortedNums = getRandomInts(minVal, maxVal, countNeeded).sort((a, b) => a - b);
      colNumbers.push(sortedNums);
    }

    // Build R x C matrix
    const matrix: (number | null)[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null));

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        matrix[r][c] = colNumbers[c][r];
      }
    }

    // Mark free center if enabled
    if (freeCoords) {
      matrix[freeCoords.r][freeCoords.c] = null;
    }

    // If incomplete pattern mode (blanksToPlace > 0), distribute empty cells
    if (blanksToPlace > 0) {
      const availableCoords: [number, number][] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (freeCoords && r === freeCoords.r && c === freeCoords.c) continue;
          availableCoords.push([r, c]);
        }
      }

      // Shuffle available coordinates
      for (let i = availableCoords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableCoords[i], availableCoords[j]] = [availableCoords[j], availableCoords[i]];
      }

      // Column fill tracking to maintain visual harmony
      const colCounts = Array(cols).fill(rows);
      if (freeCoords) {
        colCounts[freeCoords.c]--;
      }

      let removed = 0;
      for (const [r, c] of availableCoords) {
        if (removed >= blanksToPlace) break;
        // Keep at least 1 number per column if possible
        if (colCounts[c] > 1) {
          matrix[r][c] = null;
          colCounts[c]--;
          removed++;
        }
      }

      // Fill remaining blanks if still needed
      if (removed < blanksToPlace) {
        for (const [r, c] of availableCoords) {
          if (removed >= blanksToPlace) break;
          if (matrix[r][c] !== null) {
            matrix[r][c] = null;
            removed++;
          }
        }
      }
    }

    const signature = getCardSignature(matrix);
    if (!signatures.has(signature)) {
      signatures.add(signature);

      // Card serial code
      const hexCheck = Math.abs(
        Array.from(signature).reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      )
        .toString(16)
        .toUpperCase()
        .slice(0, 4)
        .padStart(4, '0');

      const cardId = cardIndex;
      const serial = `${config.serialPrefix || 'BG'}-${String(cardId).padStart(4, '0')}-${hexCheck}`;

      cards.push({
        id: cardId,
        serial,
        matrix,
        totalNumbers: numbersToKeep,
        freeCoords,
      });

      cardIndex++;
    }
  }

  return cards;
}
