import { PaperSize, Orientation, SheetSettings, SheetLayout, SheetItemRect } from '../types';

export const PAPER_DIMENSIONS: Record<PaperSize, { widthMm: number; heightMm: number }> = {
  A4: { widthMm: 210, heightMm: 297 },
  A5: { widthMm: 148, heightMm: 210 },
  A6: { widthMm: 105, heightMm: 148 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
};

/**
 * Calculates optimal rows and columns for N items per sheet based on orientation.
 */
export function getGridDimensions(
  piecesPerSheet: number,
  orientation: Orientation,
  itemType: 'raffle' | 'bingo'
): { rows: number; cols: number } {
  const isPortrait = orientation === 'portrait';

  // Raffles are typically wide rectangular tickets (e.g. 3:1 or 2.5:1 ratio)
  // Bingo cards are typically square or slightly vertical rectangular (e.g. 1:1.1 ratio)
  if (itemType === 'raffle') {
    switch (piecesPerSheet) {
      case 1:
        return { rows: 1, cols: 1 };
      case 2:
        return isPortrait ? { rows: 2, cols: 1 } : { rows: 1, cols: 2 };
      case 3:
        return isPortrait ? { rows: 3, cols: 1 } : { rows: 1, cols: 3 };
      case 4:
        return isPortrait ? { rows: 4, cols: 1 } : { rows: 2, cols: 2 };
      case 6:
        return isPortrait ? { rows: 6, cols: 1 } : { rows: 3, cols: 2 };
      case 8:
        return isPortrait ? { rows: 4, cols: 2 } : { rows: 4, cols: 2 };
      case 10:
        return isPortrait ? { rows: 5, cols: 2 } : { rows: 5, cols: 2 };
      default:
        return isPortrait ? { rows: piecesPerSheet, cols: 1 } : { rows: 2, cols: Math.ceil(piecesPerSheet / 2) };
    }
  } else {
    // Bingo
    switch (piecesPerSheet) {
      case 1:
        return { rows: 1, cols: 1 };
      case 2:
        return isPortrait ? { rows: 2, cols: 1 } : { rows: 1, cols: 2 };
      case 3:
        return isPortrait ? { rows: 3, cols: 1 } : { rows: 1, cols: 3 };
      case 4:
        return { rows: 2, cols: 2 };
      case 6:
        return isPortrait ? { rows: 3, cols: 2 } : { rows: 2, cols: 3 };
      case 8:
        return isPortrait ? { rows: 4, cols: 2 } : { rows: 2, cols: 4 };
      case 10:
        return isPortrait ? { rows: 5, cols: 2 } : { rows: 2, cols: 5 };
      default:
        return { rows: 2, cols: 2 };
    }
  }
}

/**
 * Computes exact layout in millimeters for printing and rendering.
 */
export function calculateSheetLayout(
  settings: SheetSettings,
  itemType: 'raffle' | 'bingo'
): SheetLayout {
  const baseDims = PAPER_DIMENSIONS[settings.paperSize];
  const paperWidthMm = settings.orientation === 'portrait' ? baseDims.widthMm : baseDims.heightMm;
  const paperHeightMm = settings.orientation === 'portrait' ? baseDims.heightMm : baseDims.widthMm;

  const { rows, cols } = getGridDimensions(settings.piecesPerSheet, settings.orientation, itemType);

  const margin = Math.max(2, settings.marginMm);
  const gutter = Math.max(0, settings.gutterMm);

  // Sheet header / footer reserves
  const topReservedMm = settings.showSheetHeader ? 8 : 0;
  const bottomReservedMm = settings.showSheetFooter ? 8 : 0;

  const availableWidth = paperWidthMm - margin * 2;
  const availableHeight = paperHeightMm - margin * 2 - topReservedMm - bottomReservedMm;

  const itemWidthMm = (availableWidth - (cols - 1) * gutter) / cols;
  const itemHeightMm = (availableHeight - (rows - 1) * gutter) / rows;

  const items: SheetItemRect[] = [];
  const horizontalCutLines: { x1: number; y: number; x2: number }[] = [];
  const verticalCutLines: { x: number; y1: number; y2: number }[] = [];

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= settings.piecesPerSheet) break;

      const x = margin + c * (itemWidthMm + gutter);
      const y = margin + topReservedMm + r * (itemHeightMm + gutter);

      items.push({
        index: idx,
        xMm: x,
        yMm: y,
        widthMm: itemWidthMm,
        heightMm: itemHeightMm,
      });

      idx++;
    }
  }

  // Calculate cut lines (middle lines between cells or corner markers)
  if (settings.cropMarks !== 'none') {
    // Horizontal cuts between rows
    for (let r = 1; r < rows; r++) {
      const y = margin + topReservedMm + r * itemHeightMm + (r - 0.5) * gutter;
      horizontalCutLines.push({
        x1: margin * 0.5,
        y,
        x2: paperWidthMm - margin * 0.5,
      });
    }

    // Vertical cuts between columns
    for (let c = 1; c < cols; c++) {
      const x = margin + c * itemWidthMm + (c - 0.5) * gutter;
      verticalCutLines.push({
        x,
        y1: margin * 0.5 + topReservedMm,
        y2: paperHeightMm - margin * 0.5 - bottomReservedMm,
      });
    }
  }

  return {
    paperWidthMm,
    paperHeightMm,
    rows,
    cols,
    items,
    horizontalCutLines,
    verticalCutLines,
  };
}
