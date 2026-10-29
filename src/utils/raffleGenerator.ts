import { RaffleConfig, RaffleTicketData } from '../types';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export function formatTicketNumber(num: number, padding: number): string {
  return String(num).padStart(Math.max(1, padding), '0');
}

export function generateRaffleTickets(config: RaffleConfig): RaffleTicketData[] {
  const tickets: RaffleTicketData[] = [];
  const start = Math.max(0, config.startNumber);
  const total = Math.max(1, config.totalTickets);

  for (let i = 0; i < total; i++) {
    const currentNum = start + i;
    const formatted = formatTicketNumber(currentNum, config.padding);

    tickets.push({
      number: currentNum,
      numberFormatted: formatted,
    });
  }

  return tickets;
}

// Cache generated barcode and QR data URLs for snappy rendering
const barcodeCache = new Map<string, string>();
const qrCache = new Map<string, string>();

export function getTicketBarcode(code: string): string {
  if (barcodeCache.has(code)) {
    return barcodeCache.get(code)!;
  }
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, code, {
      format: 'CODE128',
      displayValue: false,
      margin: 2,
      height: 36,
      width: 1.5,
      background: '#ffffff',
      lineColor: '#000000',
    });
    const dataUrl = canvas.toDataURL('image/png');
    barcodeCache.set(code, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error('Error generating barcode:', err);
    return '';
  }
}

export async function getTicketQrCode(text: string): Promise<string> {
  if (qrCache.has(text)) {
    return qrCache.get(text)!;
  }
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      margin: 1,
      width: 120,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    qrCache.set(text, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
