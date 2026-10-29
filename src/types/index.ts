export type ProjectType = 'raffle' | 'bingo';

export type PaperSize = 'A4' | 'A5' | 'A6' | 'Letter';

export type Orientation = 'portrait' | 'landscape';

export type CropMarksType = 'dashed' | 'solid' | 'corners' | 'none';

export type BingoTheme = 'navy' | 'casino' | 'emerald' | 'ruby' | 'bw';

export type TicketTheme = 'gold' | 'blue' | 'red' | 'green' | 'dark' | 'bw';

export interface SheetSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  piecesPerSheet: number; // 1, 2, 3, 4, 6, 8, 10
  cropMarks: CropMarksType;
  marginMm: number; // e.g. 6mm
  gutterMm: number; // e.g. 3mm
  showSheetHeader: boolean;
  showSheetFooter: boolean;
  showPieceBorder: boolean; // Marcador: contorno exterior de la pieza visible u oculto en la versión imprimible
}

export interface RaffleConfig {
  title: string;
  subtitle: string;
  organizer: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  date: string;
  time: string;
  location: string;
  price: string;
  contactPhone: string;
  rules: string;
  startNumber: number;
  totalTickets: number;
  padding: number; // e.g. 4 -> "0001"
  theme: TicketTheme;
  showBarcode: boolean;
  showQr: boolean;
  qrPayload: string;
  stubWidthPercent: number; // 25% to 40%
  logoUrl: string | null;
  watermarkText: string;
}

export interface BingoConfig {
  title: string;
  subtitle: string;
  prizeSummary: string;
  organizer: string;
  date: string;
  price: string;
  totalCards: number;
  gridRows: number; // e.g. 3 to 8 (default 5)
  gridCols: number; // e.g. 3 to 9 (default 5)
  hasFreeCenter: boolean;
  freeCenterText: string; // "LIBRE", "BINGO", "★"
  columnHeaders: string[]; // Headers for each column (e.g. ['B','I','N','G','O'])
  numberRangePerCol: number; // Interval per column (default 15)
  numbersPerCard: number; // Dynamic amount of numbers to fill (rest are blanks)
  serialPrefix: string; // e.g. "BG-2026"
  theme: BingoTheme;
  showQr: boolean;
  qrPayload: string;
  logoUrl: string | null;
}

export interface BingoCardData {
  id: number;
  serial: string;
  matrix: (number | null)[][]; // rows x cols matrix
  totalNumbers: number;
  freeCoords?: { r: number; c: number } | null;
}

export interface RaffleTicketData {
  number: number;
  numberFormatted: string;
  barcodeDataUrl?: string;
  qrDataUrl?: string;
}

export interface SheetItemRect {
  index: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface SheetLayout {
  paperWidthMm: number;
  paperHeightMm: number;
  rows: number;
  cols: number;
  items: SheetItemRect[];
  horizontalCutLines: { x1: number; y: number; x2: number }[];
  verticalCutLines: { x: number; y1: number; y2: number }[];
}
