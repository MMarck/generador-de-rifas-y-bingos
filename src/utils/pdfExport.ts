import { jsPDF } from 'jspdf';
import {
  RaffleConfig,
  BingoConfig,
  SheetSettings,
  RaffleTicketData,
  BingoCardData,
} from '../types';
import { calculateSheetLayout } from './imposition';
import { getTicketBarcode, getTicketQrCode } from './raffleGenerator';

// Theme color palettes in RGB
const THEME_COLORS: Record<string, { primary: [number, number, number]; accent: [number, number, number]; light: [number, number, number]; text: [number, number, number] }> = {
  gold: { primary: [217, 119, 6], accent: [245, 158, 11], light: [254, 243, 199], text: [120, 53, 15] },
  blue: { primary: [37, 99, 235], accent: [59, 130, 246], light: [239, 246, 255], text: [30, 58, 138] },
  red: { primary: [220, 38, 38], accent: [239, 68, 68], light: [254, 242, 242], text: [127, 29, 29] },
  green: { primary: [5, 150, 105], accent: [16, 185, 129], light: [236, 253, 245], text: [6, 78, 59] },
  dark: { primary: [30, 41, 59], accent: [71, 85, 105], light: [241, 245, 249], text: [15, 23, 42] },
  bw: { primary: [0, 0, 0], accent: [80, 80, 80], light: [245, 245, 245], text: [0, 0, 0] },
  navy: { primary: [30, 58, 138], accent: [37, 99, 235], light: [239, 246, 255], text: [23, 37, 84] },
  casino: { primary: [180, 83, 9], accent: [217, 119, 6], light: [254, 243, 199], text: [120, 53, 15] },
  emerald: { primary: [4, 120, 87], accent: [5, 150, 105], light: [236, 253, 245], text: [6, 78, 59] },
  ruby: { primary: [185, 28, 28], accent: [220, 38, 38], light: [254, 242, 242], text: [127, 29, 29] },
};

export async function generatePdfDocument(
  projectType: 'raffle' | 'bingo',
  raffleConfig: RaffleConfig,
  bingoConfig: BingoConfig,
  sheetSettings: SheetSettings,
  tickets: RaffleTicketData[],
  bingoCards: BingoCardData[],
  onProgress?: (current: number, total: number) => void
): Promise<jsPDF> {
  const layout = calculateSheetLayout(sheetSettings, projectType);
  const itemsPerPage = sheetSettings.piecesPerSheet;
  const totalItems = projectType === 'raffle' ? tickets.length : bingoCards.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const doc = new jsPDF({
    orientation: sheetSettings.orientation === 'portrait' ? 'p' : 'l',
    unit: 'mm',
    format: [layout.paperWidthMm, layout.paperHeightMm],
    compress: true,
  });

  const themeKey = projectType === 'raffle' ? raffleConfig.theme : bingoConfig.theme;
  const palette = THEME_COLORS[themeKey] || THEME_COLORS.blue;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage([layout.paperWidthMm, layout.paperHeightMm], sheetSettings.orientation === 'portrait' ? 'p' : 'l');
    }

    if (onProgress) {
      onProgress(pageIdx + 1, totalPages);
    }

    // Optional sheet header
    if (sheetSettings.showSheetHeader) {
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      const headerText = `RifaPrint Studio • Pliego #${pageIdx + 1} de ${totalPages} • Lote: ${
        projectType === 'raffle' ? 'RIF-' + raffleConfig.startNumber : bingoConfig.serialPrefix
      } • Impreso: ${new Date().toLocaleDateString()}`;
      doc.text(headerText, layout.paperWidthMm / 2, 5, { align: 'center' });
    }

    // Optional sheet footer
    if (sheetSettings.showSheetFooter) {
      doc.setFontSize(6.5);
      doc.setTextColor(140, 140, 140);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Documento generado en alta resolución vectorial para imprenta • Cortar por las guías punteadas',
        layout.paperWidthMm / 2,
        layout.paperHeightMm - 3.5,
        { align: 'center' }
      );
    }

    // Draw Guillotine / Crop Marks
    if (sheetSettings.cropMarks !== 'none') {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);

      if (sheetSettings.cropMarks === 'dashed') {
        doc.setLineDashPattern([2, 1.5], 0);
      } else {
        doc.setLineDashPattern([], 0);
      }

      // Horizontal cuts
      for (const line of layout.horizontalCutLines) {
        doc.line(line.x1, line.y, line.x2, line.y);
      }
      // Vertical cuts
      for (const line of layout.verticalCutLines) {
        doc.line(line.x, line.y1, line.x, line.y2);
      }

      // Reset dash pattern
      doc.setLineDashPattern([], 0);
    }

    // Draw items on this page
    for (let slotIdx = 0; slotIdx < itemsPerPage; slotIdx++) {
      const itemIndex = pageIdx * itemsPerPage + slotIdx;
      if (itemIndex >= totalItems) break;

      const rect = layout.items[slotIdx];
      if (!rect) continue;

      if (projectType === 'raffle') {
        const ticket = tickets[itemIndex];
        await renderRaffleTicketToPdf(
          doc,
          ticket,
          raffleConfig,
          rect,
          palette,
          sheetSettings.showPieceBorder
        );
      } else {
        const card = bingoCards[itemIndex];
        await renderBingoCardToPdf(
          doc,
          card,
          bingoConfig,
          rect,
          palette,
          sheetSettings.showPieceBorder
        );
      }
    }
  }

  return doc;
}

async function renderRaffleTicketToPdf(
  doc: jsPDF,
  ticket: RaffleTicketData,
  config: RaffleConfig,
  rect: { xMm: number; yMm: number; widthMm: number; heightMm: number },
  palette: typeof THEME_COLORS.gold,
  showPieceBorder: boolean = true
) {
  const { xMm: x, yMm: y, widthMm: w, heightMm: h } = rect;

  // Outer border
  if (showPieceBorder !== false) {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  } else {
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, w, h, 'F');
  }

  const stubWidth = (w * config.stubWidthPercent) / 100;
  const bodyX = x + stubWidth;
  const bodyWidth = w - stubWidth;

  // ==================== STUB (TALÓN) ====================
  // Background tint for stub
  doc.setFillColor(palette.light[0], palette.light[1], palette.light[2]);
  doc.rect(x + 0.35, y + 0.35, stubWidth - 0.35, h - 0.7, 'F');

  // Stub Header Banner
  doc.setFillColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.rect(x + 0.35, y + 0.35, stubWidth - 0.35, Math.min(8, h * 0.16), 'F');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TALÓN DE CONTROL', x + stubWidth / 2, y + 4.5, { align: 'center' });

  // Stub Number (Highlighted)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(`Nº ${ticket.numberFormatted}`, x + stubWidth / 2, y + 11.5, { align: 'center' });

  // Stub Fillable lines
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const stubLineSpacing = Math.min(7, (h - 22) / 4);
  const startLineY = y + 16.5;

  const stubLabels = ['Nombre:', 'Teléfono:', 'Cédula/DNI:', 'Dirección:'];
  stubLabels.forEach((label, idx) => {
    const currentY = startLineY + idx * stubLineSpacing;
    if (currentY < y + h - 5) {
      doc.text(label, x + 2.5, currentY);
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([0.5, 0.5], 0);
      doc.line(x + 13, currentY, x + stubWidth - 3, currentY);
      doc.setLineDashPattern([], 0);
    }
  });

  // Stub price at bottom
  if (config.price) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(palette.primary[0], palette.primary[1], palette.primary[2]);
    doc.text(`Valor: ${config.price}`, x + stubWidth / 2, y + h - 2.5, { align: 'center' });
  }

  // Perforation line between stub and body
  doc.setDrawColor(140, 140, 140);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1.5, 1.2], 0);
  doc.line(bodyX, y, bodyX, y + h);
  doc.setLineDashPattern([], 0);

  // Scissor mark on perforation line
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text('✂', bodyX - 1.2, y + h / 2);

  // ==================== BODY (CUERPO DEL BOLETO) ====================
  // Top Header Banner
  const headerHeight = Math.min(10, h * 0.18);
  doc.setFillColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.rect(bodyX, y + 0.35, bodyWidth - 0.35, headerHeight, 'F');

  // Title in header
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const titleFit = config.title || 'GRAN RIFA PRO-FONDOS';
  doc.text(titleFit.toUpperCase(), bodyX + (bodyWidth - 25) / 2, y + headerHeight * 0.65, { align: 'center' });

  // Prominent Ticket Number Box on Top Right of body
  const numBoxWidth = Math.min(28, bodyWidth * 0.32);
  const numBoxHeight = headerHeight + 3;
  const numBoxX = x + w - numBoxWidth - 2;
  const numBoxY = y + 1.5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(numBoxX, numBoxY, numBoxWidth, numBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.text('BOLETO Nº', numBoxX + numBoxWidth / 2, numBoxY + 3.8, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 20, 20); // Bold red number
  doc.text(ticket.numberFormatted, numBoxX + numBoxWidth / 2, numBoxY + 10, { align: 'center' });

  // Organizer / Subtitle
  let curY = y + headerHeight + 4;
  if (config.organizer || config.subtitle) {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    const subText = [config.organizer, config.subtitle].filter(Boolean).join(' • ');
    doc.text(subText, bodyX + 3, curY);
    curY += 4.5;
  }

  // Prizes section
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);

  if (config.firstPrize) {
    doc.text(`★ ${config.firstPrize}`, bodyX + 3, curY);
    curY += 3.8;
  }
  if (config.secondPrize && curY < y + h - 14) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`• ${config.secondPrize}`, bodyX + 3, curY);
    curY += 3.2;
  }
  if (config.thirdPrize && curY < y + h - 14) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`• ${config.thirdPrize}`, bodyX + 3, curY);
    curY += 3.2;
  }

  // Event details badge (Fecha, Lugar, Valor)
  const detailY = y + h - 12;
  doc.setFillColor(palette.light[0], palette.light[1], palette.light[2]);
  doc.roundedRect(bodyX + 2, detailY, bodyWidth - 30, 9.5, 1, 1, 'F');

  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  const dateStr = [config.date, config.time].filter(Boolean).join(' - ');
  if (dateStr) {
    doc.text(`Sorteo: ${dateStr}`, bodyX + 4, detailY + 3.8);
  }
  const placeStr = [config.location, config.price ? `Valor: ${config.price}` : ''].filter(Boolean).join(' | ');
  if (placeStr) {
    doc.text(placeStr, bodyX + 4, detailY + 7.5);
  }

  // Barcode / QR Code on right side of body
  if (config.showBarcode) {
    try {
      const barcodeDataUrl = getTicketBarcode(ticket.numberFormatted);
      if (barcodeDataUrl) {
        doc.addImage(barcodeDataUrl, 'PNG', x + w - 26, y + h - 13, 23, 7.5);
      }
    } catch {
      // fallback
    }
  } else if (config.showQr) {
    try {
      const qrDataUrl = await getTicketQrCode(config.qrPayload || `https://sorteo.valida/${ticket.numberFormatted}`);
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', x + w - 16, y + h - 15, 13, 13);
      }
    } catch {
      // fallback
    }
  }

  // Rules snippet on footer
  if (config.rules && h > 45) {
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(130, 130, 130);
    const ruleTrimmed = config.rules.length > 80 ? config.rules.slice(0, 77) + '...' : config.rules;
    doc.text(ruleTrimmed, bodyX + 3, y + h - 1.2);
  }
}

async function renderBingoCardToPdf(
  doc: jsPDF,
  card: BingoCardData,
  config: BingoConfig,
  rect: { xMm: number; yMm: number; widthMm: number; heightMm: number },
  palette: typeof THEME_COLORS.navy,
  showPieceBorder: boolean = true
) {
  const { xMm: x, yMm: y, widthMm: w, heightMm: h } = rect;

  // Dimensions
  const rows = Math.min(8, Math.max(3, config.gridRows || 5));
  const cols = Math.min(9, Math.max(3, config.gridCols || 5));

  // Outer border
  if (showPieceBorder !== false) {
    doc.setDrawColor(190, 190, 190);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  } else {
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, w, h, 'F');
  }

  // Bingo Header Box
  const headerHeight = Math.min(13, h * 0.16);
  doc.setFillColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.rect(x + 0.35, y + 0.35, w - 0.7, headerHeight, 'F');

  // Title & Card Serial inside Header
  doc.setFontSize(Math.min(8.5, w * 0.1));
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(config.title || 'GRAN BINGO', x + 3, y + 4.8);

  doc.setFontSize(Math.min(5.5, w * 0.07));
  doc.setFont('helvetica', 'normal');
  doc.text(config.subtitle || `Matriz ${rows}×${cols} Oficial`, x + 3, y + 8.2);

  // Serial badge on top right
  doc.setFontSize(Math.min(6.5, w * 0.08));
  doc.setFont('helvetica', 'bold');
  doc.text(card.serial, x + w - 3, y + 4.8, { align: 'right' });

  if (config.prizeSummary) {
    doc.setFontSize(4.8);
    doc.setTextColor(254, 240, 138); // Yellow accent
    const prizeSummaryShort = config.prizeSummary.length > 38 ? config.prizeSummary.slice(0, 36) + '...' : config.prizeSummary;
    doc.text(prizeSummaryShort, x + w - 3, y + 8.2, { align: 'right' });
  }

  // X Rows by Y Columns Grid Calculation
  const gridMarginX = 2.5;
  const gridWidth = w - gridMarginX * 2;
  const gridStartY = y + headerHeight + 1.8;
  const footerReserved = 8;
  const gridHeight = h - headerHeight - footerReserved - 3.5;

  const colWidth = gridWidth / cols;
  const colHeaderHeight = Math.min(6, Math.max(3.8, gridHeight * 0.14));
  const cellHeight = (gridHeight - colHeaderHeight) / rows;

  // Column letters header
  const standardHeaders = ['B', 'I', 'N', 'G', 'O', 'P', 'R', 'S', 'T'];
  const colHeaders =
    config.columnHeaders && config.columnHeaders.length >= cols
      ? config.columnHeaders
      : standardHeaders.slice(0, cols);

  for (let c = 0; c < cols; c++) {
    const colX = x + gridMarginX + c * colWidth;

    doc.setFillColor(palette.accent[0], palette.accent[1], palette.accent[2]);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.rect(colX, gridStartY, colWidth, colHeaderHeight, 'FD');

    const headerChar = colHeaders[c] || String.fromCharCode(65 + c);
    doc.setFontSize(Math.min(8.5, colHeaderHeight * 0.75, colWidth * 0.7));
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(headerChar, colX + colWidth / 2, gridStartY + colHeaderHeight * 0.75, { align: 'center' });
  }

  // Matrix Cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellX = x + gridMarginX + c * colWidth;
      const cellY = gridStartY + colHeaderHeight + r * cellHeight;

      const isFreeCenter = card.freeCoords && card.freeCoords.r === r && card.freeCoords.c === c;
      const val = card.matrix[r] ? card.matrix[r][c] : null;

      // Draw cell box
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.25);

      if (isFreeCenter) {
        // Center free cell
        doc.setFillColor(palette.light[0], palette.light[1], palette.light[2]);
        doc.rect(cellX, cellY, colWidth, cellHeight, 'FD');

        const freeFontSize = Math.min(6, cellHeight * 0.45, colWidth * 0.35);
        doc.setFontSize(freeFontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
        doc.text(config.freeCenterText || 'LIBRE', cellX + colWidth / 2, cellY + cellHeight * 0.65, { align: 'center' });
      } else if (val === null) {
        // Incomplete pattern empty cell
        doc.setFillColor(245, 245, 245);
        doc.rect(cellX, cellY, colWidth, cellHeight, 'FD');

        // Draw soft placeholder dot
        doc.setFillColor(190, 190, 190);
        doc.circle(cellX + colWidth / 2, cellY + cellHeight / 2, Math.min(1, cellHeight * 0.15), 'F');
      } else {
        // Standard number cell
        doc.setFillColor(255, 255, 255);
        doc.rect(cellX, cellY, colWidth, cellHeight, 'FD');

        const numFontSize = Math.min(10, cellHeight * 0.65, colWidth * 0.6);
        doc.setFontSize(numFontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 20, 20);
        doc.text(String(val), cellX + colWidth / 2, cellY + cellHeight * 0.72, { align: 'center' });
      }
    }
  }

  // Bingo Footer: Date, Price, and verification QR
  const footerY = y + h - 6.5;
  doc.setFontSize(4.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  const footerText = [
    config.date,
    config.price ? `Valor: ${config.price}` : '',
    `Cartón #${card.id} (${rows}×${cols})`,
  ]
    .filter(Boolean)
    .join(' • ');
  doc.text(footerText, x + 3, footerY + 3);

  if (config.showQr) {
    try {
      const qrData = await getTicketQrCode(config.qrPayload || `https://bingo.valida/${card.serial}`);
      if (qrData) {
        doc.addImage(qrData, 'PNG', x + w - 8, footerY - 0.5, 6, 6);
      }
    } catch {
      // fallback
    }
  }
}
