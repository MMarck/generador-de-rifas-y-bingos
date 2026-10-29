import React, { useState, useEffect } from 'react';
import { ProjectType, RaffleConfig, BingoConfig, RaffleTicketData, BingoCardData } from '../types';
import { getTicketBarcode, getTicketQrCode } from '../utils/raffleGenerator';
import { X, Printer, Scissors, Sparkles, CheckCircle2 } from 'lucide-react';

interface SingleItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectType: ProjectType;
  itemIndex: number;
  tickets: RaffleTicketData[];
  bingoCards: BingoCardData[];
  raffleConfig: RaffleConfig;
  bingoConfig: BingoConfig;
}

export const SingleItemModal: React.FC<SingleItemModalProps> = ({
  isOpen,
  onClose,
  projectType,
  itemIndex,
  tickets,
  bingoCards,
  raffleConfig,
  bingoConfig,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [stubDetached, setStubDetached] = useState<boolean>(false);

  const ticket = projectType === 'raffle' ? tickets[itemIndex] : null;
  const bingoCard = projectType === 'bingo' ? bingoCards[itemIndex] : null;

  useEffect(() => {
    let active = true;
    const loadQr = async () => {
      if (projectType === 'raffle' && raffleConfig.showQr && ticket) {
        const payload = raffleConfig.qrPayload || `https://sorteo.valida/${ticket.numberFormatted}`;
        const url = await getTicketQrCode(payload);
        if (active) setQrUrl(url);
      } else if (projectType === 'bingo' && bingoConfig.showQr && bingoCard) {
        const payload = bingoConfig.qrPayload || `https://bingo.valida/${bingoCard.serial}`;
        const url = await getTicketQrCode(payload);
        if (active) setQrUrl(url);
      }
    };
    loadQr();
    return () => {
      active = false;
    };
  }, [projectType, itemIndex, ticket, bingoCard, raffleConfig, bingoConfig]);

  if (!isOpen || (!ticket && !bingoCard)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                Detalle de Pieza: {projectType === 'raffle' ? `Boleto #${ticket?.numberFormatted}` : `Cartón #${bingoCard?.id}`}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {projectType === 'raffle'
                ? 'Previsualización del talón de control desprendible y cuerpo principal'
                : `Cartón 5×5 único con serial oficial ${bingoCard?.serial}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-slate-950/40">
          {projectType === 'raffle' && ticket && (
            <div className="w-full max-w-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Simulador de Desprendimiento de Talón:</span>
                <button
                  type="button"
                  onClick={() => setStubDetached(!stubDetached)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{stubDetached ? 'Unir Talón' : 'Rasgar / Desprender Talón'}</span>
                </button>
              </div>

              {/* Ticket Preview Box */}
              <div
                className={`flex w-full bg-white rounded-lg border-2 border-slate-300 shadow-xl overflow-hidden text-slate-900 transition-all duration-300 ${
                  stubDetached ? 'gap-6' : ''
                }`}
              >
                {/* Stub */}
                <div
                  className={`bg-amber-50 border-r border-dashed border-amber-300 p-4 flex flex-col justify-between transition-all duration-300 ${
                    stubDetached ? 'rounded-lg border-2 border-amber-400 shadow-md rotate-[-2deg]' : ''
                  }`}
                  style={{ width: `${raffleConfig.stubWidthPercent}%` }}
                >
                  <div>
                    <div className="bg-amber-600 text-white text-xs font-bold text-center py-1 rounded">
                      TALÓN DE CONTROL
                    </div>
                    <div className="text-center font-black text-red-600 text-base my-2">
                      Nº {ticket.numberFormatted}
                    </div>
                    <div className="space-y-2 text-xs text-slate-700 mt-2">
                      <div>
                        Nombre: <div className="border-b border-dotted border-slate-400 mt-1" />
                      </div>
                      <div>
                        Teléfono: <div className="border-b border-dotted border-slate-400 mt-1" />
                      </div>
                      <div>
                        Cédula: <div className="border-b border-dotted border-slate-400 mt-1" />
                      </div>
                      <div>
                        Dirección: <div className="border-b border-dotted border-slate-400 mt-1" />
                      </div>
                    </div>
                  </div>
                  {raffleConfig.price && (
                    <div className="text-center text-xs font-bold text-amber-900 border-t border-amber-200 pt-2 mt-2">
                      Valor: {raffleConfig.price}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div
                  className={`flex-1 p-5 flex flex-col justify-between transition-all duration-300 ${
                    stubDetached ? 'rounded-lg border-2 border-slate-300 shadow-md' : ''
                  }`}
                >
                  {/* Body Header */}
                  <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                    <div>
                      <h4 className="text-base font-black text-amber-700 uppercase tracking-tight">
                        {raffleConfig.title || 'GRAN RIFA PRO-FONDOS'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {raffleConfig.organizer || raffleConfig.subtitle}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-1.5 text-center">
                      <span className="text-[10px] font-bold text-slate-500 block">BOLETO OFICIAL</span>
                      <span className="text-lg font-black text-red-600 leading-none">
                        Nº {ticket.numberFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Prizes */}
                  <div className="my-3 space-y-1.5 text-xs">
                    {raffleConfig.firstPrize && (
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <span className="text-amber-500 text-base">★</span> {raffleConfig.firstPrize}
                      </div>
                    )}
                    {raffleConfig.secondPrize && (
                      <div className="text-slate-700 pl-4">• {raffleConfig.secondPrize}</div>
                    )}
                    {raffleConfig.thirdPrize && (
                      <div className="text-slate-700 pl-4">• {raffleConfig.thirdPrize}</div>
                    )}
                  </div>

                  {/* Bottom Details */}
                  <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-600 space-y-1">
                      {raffleConfig.date && <div><strong>Sorteo:</strong> {raffleConfig.date} {raffleConfig.time}</div>}
                      {raffleConfig.location && <div><strong>Lugar:</strong> {raffleConfig.location}</div>}
                      {raffleConfig.price && <div className="text-amber-800 font-bold"><strong>Valor:</strong> {raffleConfig.price}</div>}
                    </div>

                    <div>
                      {raffleConfig.showBarcode ? (
                        <img
                          src={getTicketBarcode(ticket.numberFormatted)}
                          alt="Barcode"
                          className="h-8 object-contain"
                        />
                      ) : raffleConfig.showQr && qrUrl ? (
                        <img src={qrUrl} alt="QR" className="w-12 h-12 object-contain" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {projectType === 'bingo' && bingoCard && (
            <div className="w-full max-w-md bg-white rounded-xl border-2 border-slate-300 shadow-2xl p-5 text-slate-900">
              {/* Header */}
              <div className="bg-blue-900 text-white rounded-lg p-3 flex items-center justify-between mb-3 shadow">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    {bingoConfig.title || 'GRAN BINGO'}
                  </h4>
                  <p className="text-xs opacity-80">{bingoConfig.subtitle || 'Cartón de Juego Oficial'}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-300">{bingoCard.serial}</div>
                  <div className="text-[10px] text-blue-200">Cartón #{bingoCard.id}</div>
                </div>
              </div>

              {/* Dynamic X Rows by Y Columns Grid */}
              {(() => {
                const rows = Math.min(8, Math.max(3, bingoConfig.gridRows || 5));
                const cols = Math.min(9, Math.max(3, bingoConfig.gridCols || 5));
                const standardLetters = ['B', 'I', 'N', 'G', 'O', 'P', 'R', 'S', 'T'];
                const colHeaders =
                  bingoConfig.columnHeaders && bingoConfig.columnHeaders.length >= cols
                    ? bingoConfig.columnHeaders
                    : standardLetters.slice(0, cols);

                return (
                  <div className="space-y-1.5">
                    {/* Headers */}
                    <div
                      className="gap-1 text-center grid"
                      style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                      }}
                    >
                      {colHeaders.map((letter, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-700 text-white font-black text-xs py-1 rounded truncate shadow-xs"
                        >
                          {letter}
                        </div>
                      ))}
                    </div>

                    {/* Matrix Cells */}
                    <div
                      className="gap-1 grid"
                      style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                      }}
                    >
                      {bingoCard.matrix.map((row, r) =>
                        row.map((val, c) => {
                          const isFreeCenter =
                            bingoCard.freeCoords &&
                            bingoCard.freeCoords.r === r &&
                            bingoCard.freeCoords.c === c;

                          if (isFreeCenter) {
                            return (
                              <div
                                key={`${r}-${c}`}
                                className="aspect-square bg-amber-100 border-2 border-amber-400 rounded flex items-center justify-center font-black text-amber-800 text-[11px] text-center p-0.5 leading-none"
                              >
                                {bingoConfig.freeCenterText || 'LIBRE'}
                              </div>
                            );
                          }
                          if (val === null) {
                            return (
                              <div
                                key={`${r}-${c}`}
                                className="aspect-square bg-slate-100 border border-slate-200 rounded flex items-center justify-center"
                              >
                                <span className="w-2 h-2 rounded-full bg-slate-300" />
                              </div>
                            );
                          }
                          return (
                            <div
                              key={`${r}-${c}`}
                              className="aspect-square bg-white border border-slate-300 rounded flex items-center justify-center font-bold text-slate-900 text-sm shadow-xs"
                            >
                              {val}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <div className="font-semibold text-slate-800">{bingoConfig.prizeSummary}</div>
                  <div className="text-[11px] text-slate-500">{bingoConfig.date} • {bingoConfig.price}</div>
                </div>
                {bingoConfig.showQr && qrUrl && (
                  <img src={qrUrl} alt="QR" className="w-8 h-8 object-contain" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};
