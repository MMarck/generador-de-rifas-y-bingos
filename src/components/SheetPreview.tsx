import React, { useEffect, useState, useRef } from 'react';
import {
  ProjectType,
  RaffleConfig,
  BingoConfig,
  SheetSettings,
  RaffleTicketData,
  BingoCardData,
} from '../types';
import { calculateSheetLayout } from '../utils/imposition';
import { getTicketBarcode, getTicketQrCode } from '../utils/raffleGenerator';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Eye,
  Sparkles,
  Square,
  ArrowUpToLine,
} from 'lucide-react';

interface SheetPreviewProps {
  projectType: ProjectType;
  raffleConfig: RaffleConfig;
  bingoConfig: BingoConfig;
  sheetSettings: SheetSettings;
  tickets: RaffleTicketData[];
  bingoCards: BingoCardData[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onSelectItem?: (itemIndex: number) => void;
  onUpdateSheetSettings?: (settings: SheetSettings) => void;
}

export const SheetPreview: React.FC<SheetPreviewProps> = ({
  projectType,
  raffleConfig,
  bingoConfig,
  sheetSettings,
  tickets,
  bingoCards,
  currentPage,
  onPageChange,
  onSelectItem,
  onUpdateSheetSettings,
}) => {
  const [zoom, setZoom] = useState<number>(75); // percentage (75% default fits standard screens comfortably)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalItems = projectType === 'raffle' ? tickets.length : bingoCards.length;
  const itemsPerPage = sheetSettings.piecesPerSheet;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(0, currentPage), totalPages - 1);

  // Auto-scroll to top when changing sheet page
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [safePage]);

  const layout = calculateSheetLayout(sheetSettings, projectType);

  // Generate QR code data URLs for visible items if enabled
  useEffect(() => {
    let isMounted = true;
    const fetchVisibleQrs = async () => {
      const newQrs: Record<string, string> = {};
      const startIdx = safePage * itemsPerPage;
      const endIdx = Math.min(totalItems, startIdx + itemsPerPage);

      for (let i = startIdx; i < endIdx; i++) {
        if (projectType === 'raffle' && raffleConfig.showQr) {
          const num = tickets[i]?.numberFormatted || '';
          const payload = raffleConfig.qrPayload || `https://sorteo.valida/${num}`;
          try {
            const url = await getTicketQrCode(payload);
            newQrs[`raffle-${num}`] = url;
          } catch {
            // fallback
          }
        } else if (projectType === 'bingo' && bingoConfig.showQr) {
          const serial = bingoCards[i]?.serial || '';
          const payload = bingoConfig.qrPayload || `https://bingo.valida/${serial}`;
          try {
            const url = await getTicketQrCode(payload);
            newQrs[`bingo-${serial}`] = url;
          } catch {
            // fallback
          }
        }
      }
      if (isMounted) {
        setQrCodes((prev) => ({ ...prev, ...newQrs }));
      }
    };

    fetchVisibleQrs();
    return () => {
      isMounted = false;
    };
  }, [safePage, projectType, raffleConfig, bingoConfig, tickets, bingoCards, itemsPerPage, totalItems]);

  const startItemNum = safePage * itemsPerPage + 1;
  const endItemNum = Math.min(totalItems, (safePage + 1) * itemsPerPage);

  // Color theme mapper for live preview
  const getThemeStyles = () => {
    if (projectType === 'raffle') {
      switch (raffleConfig.theme) {
        case 'gold':
          return {
            primaryBg: 'bg-amber-600',
            primaryText: 'text-amber-800',
            accentBg: 'bg-amber-500',
            lightBg: 'bg-amber-50',
            border: 'border-amber-200',
            headerText: 'text-white',
          };
        case 'red':
          return {
            primaryBg: 'bg-red-600',
            primaryText: 'text-red-800',
            accentBg: 'bg-red-500',
            lightBg: 'bg-red-50',
            border: 'border-red-200',
            headerText: 'text-white',
          };
        case 'green':
          return {
            primaryBg: 'bg-emerald-600',
            primaryText: 'text-emerald-800',
            accentBg: 'bg-emerald-500',
            lightBg: 'bg-emerald-50',
            border: 'border-emerald-200',
            headerText: 'text-white',
          };
        case 'dark':
          return {
            primaryBg: 'bg-slate-800',
            primaryText: 'text-slate-900',
            accentBg: 'bg-slate-700',
            lightBg: 'bg-slate-50',
            border: 'border-slate-300',
            headerText: 'text-white',
          };
        case 'bw':
          return {
            primaryBg: 'bg-black',
            primaryText: 'text-black',
            accentBg: 'bg-neutral-800',
            lightBg: 'bg-neutral-50',
            border: 'border-neutral-300',
            headerText: 'text-white',
          };
        case 'blue':
        default:
          return {
            primaryBg: 'bg-blue-600',
            primaryText: 'text-blue-800',
            accentBg: 'bg-blue-500',
            lightBg: 'bg-blue-50',
            border: 'border-blue-200',
            headerText: 'text-white',
          };
      }
    } else {
      switch (bingoConfig.theme) {
        case 'casino':
          return {
            primaryBg: 'bg-amber-700',
            primaryText: 'text-amber-900',
            accentBg: 'bg-amber-500',
            lightBg: 'bg-amber-50',
            border: 'border-amber-300',
            headerText: 'text-white',
          };
        case 'emerald':
          return {
            primaryBg: 'bg-emerald-700',
            primaryText: 'text-emerald-900',
            accentBg: 'bg-emerald-500',
            lightBg: 'bg-emerald-50',
            border: 'border-emerald-300',
            headerText: 'text-white',
          };
        case 'ruby':
          return {
            primaryBg: 'bg-rose-700',
            primaryText: 'text-rose-900',
            accentBg: 'bg-rose-500',
            lightBg: 'bg-rose-50',
            border: 'border-rose-300',
            headerText: 'text-white',
          };
        case 'bw':
          return {
            primaryBg: 'bg-black',
            primaryText: 'text-black',
            accentBg: 'bg-neutral-800',
            lightBg: 'bg-neutral-100',
            border: 'border-neutral-300',
            headerText: 'text-white',
          };
        case 'navy':
        default:
          return {
            primaryBg: 'bg-blue-900',
            primaryText: 'text-blue-950',
            accentBg: 'bg-blue-600',
            lightBg: 'bg-blue-50',
            border: 'border-blue-200',
            headerText: 'text-white',
          };
      }
    }
  };

  const themeStyles = getThemeStyles();

  // Scale for rendering millimeter units to pixel container
  // Standard base: 1mm = 3.78px at 96 DPI
  const mmToPx = 3.5 * (zoom / 100);
  const sheetWidthPx = layout.paperWidthMm * mmToPx;
  const sheetHeightPx = layout.paperHeightMm * mmToPx;

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <span>Previsualización en Vivo (Pliego {sheetSettings.paperSize})</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {sheetSettings.piecesPerSheet} N-Up
            </span>
          </h2>
        </div>

        {/* Pagination & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Pagination */}
          <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-1 border border-slate-700/80 text-xs">
            <button
              onClick={() => onPageChange(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition"
              title="Pliego anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-200">
              Hoja {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
              disabled={safePage >= totalPages - 1}
              className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition"
              title="Siguiente pliego"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-1 border border-slate-700/80 text-xs text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(40, z - 15))}
              className="p-1 rounded hover:bg-slate-700 hover:text-white"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(160, z + 15))}
              className="p-1 rounded hover:bg-slate-700 hover:text-white"
              title="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(75)}
              className="p-1 rounded hover:bg-slate-700 hover:text-white"
              title="Ajustar a 75%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-1 rounded hover:bg-slate-700 hover:text-white"
              title="Subir al encabezado del pliego"
            >
              <ArrowUpToLine className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Marker Toggle for Outer Contour in Printable Version */}
          {onUpdateSheetSettings && (
            <button
              type="button"
              onClick={() =>
                onUpdateSheetSettings({
                  ...sheetSettings,
                  showPieceBorder: !sheetSettings.showPieceBorder,
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                sheetSettings.showPieceBorder === false
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:text-white'
              }`}
              title="Marcador para mostrar u ocultar el contorno exterior de las piezas en la versión imprimible y PDF"
            >
              <Square className={`w-3.5 h-3.5 ${sheetSettings.showPieceBorder === false ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Contorno Imprimible:</span>
              <span className="font-bold">{sheetSettings.showPieceBorder === false ? 'Oculto' : 'Visible'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 bg-slate-950/40 text-[11px] text-slate-400 border-b border-slate-800/50">
        <div>
          Mostrando{' '}
          <strong className="text-slate-200">
            {projectType === 'raffle' ? `Boletos ${startItemNum} - ${endItemNum}` : `Cartones ${startItemNum} - ${endItemNum}`}
          </strong>{' '}
          de un total de <strong className="text-slate-200">{totalItems}</strong> piezas.
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1">
            <Square className="w-3 h-3 text-indigo-400" />
            <span>Contorno exterior: </span>
            <strong className={sheetSettings.showPieceBorder === false ? 'text-amber-400' : 'text-emerald-400'}>
              {sheetSettings.showPieceBorder === false ? 'Oculto en Impresión' : 'Visible'}
            </strong>
          </div>
          <div className="flex items-center gap-1">
            <Scissors className="w-3 h-3 text-indigo-400" />
            <span>Guías: {sheetSettings.cropMarks === 'none' ? 'Desactivadas' : 'Punteadas'}</span>
          </div>
        </div>
      </div>

      {/* Interactive Sheet Canvas Area (Top-aligned scroll container to ensure header is always accessible) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-4 md:p-6 bg-slate-950/80 scroll-smooth"
      >
        <div className="min-w-full min-h-full flex flex-col items-center justify-start py-6">
          <div
            className="relative bg-white text-slate-900 rounded-sm shadow-2xl transition-all duration-150 select-none flex-shrink-0"
            style={{
              width: `${sheetWidthPx}px`,
              height: `${sheetHeightPx}px`,
              minWidth: `${sheetWidthPx}px`,
              minHeight: `${sheetHeightPx}px`,
            }}
          >
          {/* Optional Sheet Header */}
          {sheetSettings.showSheetHeader && (
            <div
              className="absolute left-0 right-0 text-center text-slate-400 font-mono"
              style={{
                top: `${2 * mmToPx}px`,
                fontSize: `${Math.max(8, 2.2 * mmToPx)}px`,
              }}
            >
              RifaPrint Studio • Pliego #{safePage + 1} de {totalPages} • Lote:{' '}
              {projectType === 'raffle' ? `RIF-${raffleConfig.startNumber}` : bingoConfig.serialPrefix}
            </div>
          )}

          {/* Guillotine Crop Lines */}
          {sheetSettings.cropMarks !== 'none' && (
            <>
              {layout.horizontalCutLines.map((line, idx) => (
                <div
                  key={`h-${idx}`}
                  className="absolute pointer-events-none border-b border-slate-300"
                  style={{
                    left: `${line.x1 * mmToPx}px`,
                    top: `${line.y * mmToPx}px`,
                    width: `${(line.x2 - line.x1) * mmToPx}px`,
                    borderBottomStyle: sheetSettings.cropMarks === 'dashed' ? 'dashed' : 'solid',
                    borderBottomWidth: '1px',
                  }}
                />
              ))}
              {layout.verticalCutLines.map((line, idx) => (
                <div
                  key={`v-${idx}`}
                  className="absolute pointer-events-none border-r border-slate-300"
                  style={{
                    left: `${line.x * mmToPx}px`,
                    top: `${line.y1 * mmToPx}px`,
                    height: `${(line.y2 - line.y1) * mmToPx}px`,
                    borderRightStyle: sheetSettings.cropMarks === 'dashed' ? 'dashed' : 'solid',
                    borderRightWidth: '1px',
                  }}
                />
              ))}
            </>
          )}

          {/* Render Each Item on this Page */}
          {layout.items.map((rect, slotIdx) => {
            const itemIndex = safePage * itemsPerPage + slotIdx;
            if (itemIndex >= totalItems) return null;

            const isRaffle = projectType === 'raffle';
            const ticket = isRaffle ? tickets[itemIndex] : null;
            const bingoCard = !isRaffle ? bingoCards[itemIndex] : null;

            const xPx = rect.xMm * mmToPx;
            const yPx = rect.yMm * mmToPx;
            const wPx = rect.widthMm * mmToPx;
            const hPx = rect.heightMm * mmToPx;

            return (
              <div
                key={`item-${itemIndex}`}
                onClick={() => onSelectItem && onSelectItem(itemIndex)}
                className={`absolute rounded overflow-hidden shadow-xs hover:ring-2 hover:ring-indigo-500 hover:shadow-md transition cursor-pointer group bg-white ${
                  sheetSettings.showPieceBorder !== false
                    ? 'border border-slate-300'
                    : 'border-0 ring-1 ring-slate-100/60'
                }`}
                style={{
                  left: `${xPx}px`,
                  top: `${yPx}px`,
                  width: `${wPx}px`,
                  height: `${hPx}px`,
                }}
                title={`Hacer clic para ver en detalle pieza #${itemIndex + 1}`}
              >
                {/* Visual Eye Badge on Hover */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition z-20 bg-indigo-600 text-white rounded p-1 shadow-sm">
                  <Eye className="w-3 h-3" />
                </div>

                {isRaffle && ticket && (
                  <div className="w-full h-full flex flex-row">
                    {/* Stub (Talón) */}
                    <div
                      className={`${themeStyles.lightBg} border-r border-dashed border-slate-400 relative flex flex-col p-1`}
                      style={{ width: `${raffleConfig.stubWidthPercent}%` }}
                    >
                      <div
                        className={`${themeStyles.primaryBg} ${themeStyles.headerText} text-[7px] font-bold text-center py-0.5 rounded-xs`}
                      >
                        TALÓN
                      </div>
                      <div className="text-center font-bold text-red-600 text-[10px] my-0.5">
                        Nº {ticket.numberFormatted}
                      </div>
                      <div className="text-[6px] text-slate-600 space-y-1 flex-1">
                        <div>
                          Nombre: <span className="border-b border-dotted border-slate-400 inline-block w-12" />
                        </div>
                        <div>
                          Tel: <span className="border-b border-dotted border-slate-400 inline-block w-16" />
                        </div>
                        <div>
                          DNI: <span className="border-b border-dotted border-slate-400 inline-block w-14" />
                        </div>
                      </div>
                      {raffleConfig.price && (
                        <div className="text-[6.5px] font-bold text-center text-slate-800">
                          {raffleConfig.price}
                        </div>
                      )}
                      <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 text-[8px] text-slate-400 select-none">
                        ✂
                      </div>
                    </div>

                    {/* Body (Cuerpo) */}
                    <div className="flex-1 flex flex-col justify-between p-1.5 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-start justify-between border-b pb-1 border-slate-200">
                        <div className="pr-1 flex-1">
                          <div
                            className={`${themeStyles.primaryText} font-black text-[9px] uppercase tracking-tight line-clamp-1`}
                          >
                            {raffleConfig.title || 'GRAN RIFA'}
                          </div>
                          <div className="text-[6.5px] text-slate-500 font-medium line-clamp-1">
                            {raffleConfig.organizer || raffleConfig.subtitle}
                          </div>
                        </div>
                        <div className="bg-red-50 border border-red-300 rounded px-1 text-center flex-shrink-0">
                          <span className="text-[5.5px] font-bold text-slate-500 block">BOLETO</span>
                          <span className="text-[10px] font-black text-red-600 leading-none">
                            {ticket.numberFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Prizes */}
                      <div className="my-1 space-y-0.5 text-[7px]">
                        {raffleConfig.firstPrize && (
                          <div className="font-bold text-slate-900 line-clamp-1 flex items-center gap-1">
                            <span className="text-amber-500">★</span> {raffleConfig.firstPrize}
                          </div>
                        )}
                        {raffleConfig.secondPrize && (
                          <div className="text-slate-600 line-clamp-1 text-[6.5px]">
                            • {raffleConfig.secondPrize}
                          </div>
                        )}
                        {raffleConfig.thirdPrize && (
                          <div className="text-slate-600 line-clamp-1 text-[6.5px]">
                            • {raffleConfig.thirdPrize}
                          </div>
                        )}
                      </div>

                      {/* Bottom Info & Barcode / QR */}
                      <div className="flex items-end justify-between pt-1 border-t border-slate-100">
                        <div className="text-[6px] text-slate-500 space-y-0.5">
                          {raffleConfig.date && <div>Fecha: {raffleConfig.date}</div>}
                          {raffleConfig.location && <div className="line-clamp-1">Lugar: {raffleConfig.location}</div>}
                          {raffleConfig.price && <div className="font-bold text-slate-800">Valor: {raffleConfig.price}</div>}
                        </div>

                        {/* Barcode / QR Thumbnail */}
                        <div>
                          {raffleConfig.showBarcode ? (
                            <img
                              src={getTicketBarcode(ticket.numberFormatted)}
                              alt="Barcode"
                              className="h-4 object-contain"
                            />
                          ) : raffleConfig.showQr && qrCodes[`raffle-${ticket.numberFormatted}`] ? (
                            <img
                              src={qrCodes[`raffle-${ticket.numberFormatted}`]}
                              alt="QR"
                              className="w-5 h-5 object-contain"
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isRaffle && bingoCard && (
                  <div className="w-full h-full flex flex-col p-1">
                    {/* Header Banner */}
                    <div
                      className={`${themeStyles.primaryBg} ${themeStyles.headerText} rounded-xs px-1.5 py-0.5 flex items-center justify-between`}
                    >
                      <div>
                        <div className="font-black text-[8px] uppercase tracking-tight line-clamp-1">
                          {bingoConfig.title || 'GRAN BINGO'}
                        </div>
                        <div className="text-[5.5px] opacity-80">{bingoConfig.subtitle || 'Cartón de Juego'}</div>
                      </div>
                      <div className="text-[6px] font-mono font-bold text-amber-200">{bingoCard.serial}</div>
                    </div>

                    {/* Dynamic X Rows by Y Cols Bingo Matrix */}
                    <div className="my-1 flex-1 flex flex-col justify-between">
                      {/* Column Letters Header */}
                      {(() => {
                        const cols = Math.min(9, Math.max(3, bingoConfig.gridCols || 5));
                        const standardLetters = ['B', 'I', 'N', 'G', 'O', 'P', 'R', 'S', 'T'];
                        const colHeaders =
                          bingoConfig.columnHeaders && bingoConfig.columnHeaders.length >= cols
                            ? bingoConfig.columnHeaders
                            : standardLetters.slice(0, cols);

                        return (
                          <div
                            className="gap-0.5 text-center mb-0.5 grid"
                            style={{
                              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                            }}
                          >
                            {colHeaders.map((letter, idx) => (
                              <div
                                key={idx}
                                className={`${themeStyles.accentBg} text-white font-black text-[7.5px] rounded-xs py-0.2 truncate`}
                              >
                                {letter}
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Number Grid */}
                      {(() => {
                        const rows = Math.min(8, Math.max(3, bingoConfig.gridRows || 5));
                        const cols = Math.min(9, Math.max(3, bingoConfig.gridCols || 5));

                        return (
                          <div
                            className="gap-0.5 flex-1 grid"
                            style={{
                              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                            }}
                          >
                            {bingoCard.matrix.map((row, rIdx) =>
                              row.map((val, cIdx) => {
                                const isFreeCenter =
                                  bingoCard.freeCoords &&
                                  bingoCard.freeCoords.r === rIdx &&
                                  bingoCard.freeCoords.c === cIdx;

                                if (isFreeCenter) {
                                  return (
                                    <div
                                      key={`${rIdx}-${cIdx}`}
                                      className={`${themeStyles.lightBg} border border-amber-300 rounded-xs flex items-center justify-center text-[5px] font-black text-amber-800 text-center leading-none p-0.5 truncate`}
                                    >
                                      {bingoConfig.freeCenterText || 'LIBRE'}
                                    </div>
                                  );
                                }
                                if (val === null) {
                                  return (
                                    <div
                                      key={`${rIdx}-${cIdx}`}
                                      className="bg-slate-100 border border-slate-200 rounded-xs flex items-center justify-center"
                                    >
                                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    </div>
                                  );
                                }
                                return (
                                  <div
                                    key={`${rIdx}-${cIdx}`}
                                    className="bg-white border border-slate-300 rounded-xs flex items-center justify-center font-bold text-slate-800 text-[7.5px] shadow-2xs"
                                  >
                                    {val}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-[5.5px] text-slate-500 border-t border-slate-200 pt-0.5">
                      <div className="line-clamp-1">{bingoConfig.prizeSummary || bingoConfig.date}</div>
                      {bingoConfig.showQr && qrCodes[`bingo-${bingoCard.serial}`] && (
                        <img
                          src={qrCodes[`bingo-${bingoCard.serial}`]}
                          alt="QR"
                          className="w-3.5 h-3.5 object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Optional Sheet Footer */}
          {sheetSettings.showSheetFooter && (
            <div
              className="absolute left-0 right-0 text-center text-slate-400 font-sans"
              style={{
                bottom: `${1.5 * mmToPx}px`,
                fontSize: `${Math.max(7, 1.8 * mmToPx)}px`,
              }}
            >
              Impresión vectorial lista para corte • RifaPrint & Bingo Studio PWA
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
