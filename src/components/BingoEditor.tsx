import React from 'react';
import { BingoConfig, BingoTheme } from '../types';
import { getDefaultColumnHeaders } from '../utils/bingoGenerator';
import {
  Grid,
  Sliders,
  Sparkles,
  Trophy,
  Calendar,
  Hash,
  Palette,
  QrCode,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Maximize2,
  Square,
} from 'lucide-react';
import { SheetSettings } from '../types';

interface BingoEditorProps {
  config: BingoConfig;
  onChange: (newConfig: BingoConfig) => void;
  sheetSettings?: SheetSettings;
  onSheetSettingsChange?: (newSettings: SheetSettings) => void;
}

const BINGO_THEMES: { id: BingoTheme; name: string; color: string }[] = [
  { id: 'navy', name: 'Azul Clásico', color: 'bg-blue-900' },
  { id: 'casino', name: 'Casino Dorado', color: 'bg-amber-600' },
  { id: 'emerald', name: 'Verde Trébol', color: 'bg-emerald-600' },
  { id: 'ruby', name: 'Rojo Pasión', color: 'bg-rose-600' },
  { id: 'bw', name: 'B/N Ahorro Tinta', color: 'bg-black border border-slate-400' },
];

const MATRIX_PRESETS = [
  { label: '5×5 Clásico', rows: 5, cols: 5, hasFree: true, headers: ['B', 'I', 'N', 'G', 'O'], interval: 15 },
  { label: '4×4 Express', rows: 4, cols: 4, hasFree: false, headers: ['B', 'I', 'N', 'G'], interval: 15 },
  { label: '3×3 Infantil', rows: 3, cols: 3, hasFree: true, headers: ['B', 'I', 'N'], interval: 10 },
  { label: '3×9 Housie', rows: 3, cols: 9, hasFree: false, headers: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], interval: 10 },
  { label: '4×5 Rectangular', rows: 4, cols: 5, hasFree: false, headers: ['B', 'I', 'N', 'G', 'O'], interval: 15 },
];

export const BingoEditor: React.FC<BingoEditorProps> = ({
  config,
  onChange,
  sheetSettings,
  onSheetSettingsChange,
}) => {
  const update = <K extends keyof BingoConfig>(key: K, value: BingoConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const rows = Math.min(8, Math.max(3, config.gridRows || 5));
  const cols = Math.min(9, Math.max(3, config.gridCols || 5));
  const hasFreeCenter = config.hasFreeCenter ?? (rows === 5 && cols === 5);

  const totalCells = rows * cols;
  const maxPlayable = hasFreeCenter ? totalCells - 1 : totalCells;
  const currentNumbers = Math.min(maxPlayable, Math.max(1, config.numbersPerCard ?? maxPlayable));
  const blanksCount = maxPlayable - currentNumbers;

  // Handle changing rows or cols
  const handleDimensionsChange = (newRows: number, newCols: number, freeCenterOverride?: boolean) => {
    const safeRows = Math.min(8, Math.max(3, newRows));
    const safeCols = Math.min(9, Math.max(3, newCols));
    const isFree = freeCenterOverride !== undefined ? freeCenterOverride : hasFreeCenter;
    const newTotal = safeRows * safeCols;
    const newMaxPlayable = isFree ? newTotal - 1 : newTotal;

    // Adjust column headers if needed
    const defaultHeaders = getDefaultColumnHeaders(safeCols);
    const updatedHeaders =
      config.columnHeaders && config.columnHeaders.length >= safeCols
        ? config.columnHeaders.slice(0, safeCols)
        : defaultHeaders;

    onChange({
      ...config,
      gridRows: safeRows,
      gridCols: safeCols,
      hasFreeCenter: isFree,
      columnHeaders: updatedHeaders,
      numbersPerCard: newMaxPlayable, // Reset to full by default
    });
  };

  const handleHeaderChange = (index: number, val: string) => {
    const copy = [...(config.columnHeaders || getDefaultColumnHeaders(cols))];
    copy[index] = val.toUpperCase().slice(0, 3);
    update('columnHeaders', copy);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Lógica Paramétrica de Números (Filas X × Columnas Y) */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-indigo-400 font-semibold text-sm">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            <span>Lógica Paramétrica de Números ({rows}×{cols})</span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
            {totalCells} Casillas Totales
          </span>
        </div>

        {/* Quick Matrix Presets */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Preajustes Rápidos de Cuadrícula:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {MATRIX_PRESETS.map((p) => {
              const isSelected = rows === p.rows && cols === p.cols && hasFreeCenter === p.hasFree;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    onChange({
                      ...config,
                      gridRows: p.rows,
                      gridCols: p.cols,
                      hasFreeCenter: p.hasFree,
                      columnHeaders: p.headers,
                      numberRangePerCol: p.interval,
                      numbersPerCard: p.hasFree ? p.rows * p.cols - 1 : p.rows * p.cols,
                    });
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders for Custom Rows (X) and Columns (Y) */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span>Dimensiones Personalizadas (X Filas × Y Columnas)</span>
            <span className="text-indigo-400 font-mono text-sm">{rows} filas × {cols} columnas</span>
          </div>

          {/* Rows Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Cantidad de Filas (X):</span>
              <span className="font-mono text-white font-bold">{rows} filas</span>
            </div>
            <input
              type="range"
              min={3}
              max={8}
              step={1}
              value={rows}
              onChange={(e) => handleDimensionsChange(parseInt(e.target.value), cols)}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>3 (Compacto)</span>
              <span>4</span>
              <span>5 (Estándar)</span>
              <span>6</span>
              <span>7</span>
              <span>8 (Extendido)</span>
            </div>
          </div>

          {/* Columns Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Cantidad de Columnas (Y):</span>
              <span className="font-mono text-white font-bold">{cols} columnas</span>
            </div>
            <input
              type="range"
              min={3}
              max={9}
              step={1}
              value={cols}
              onChange={(e) => handleDimensionsChange(rows, parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>3</span>
              <span>4</span>
              <span>5 (B-I-N-G-O)</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9 (Housie)</span>
            </div>
          </div>
        </div>

        {/* Column Headers Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Letras / Títulos de Encabezado por Columna ({cols}):
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {Array.from({ length: cols }).map((_, idx) => {
              const headers = config.columnHeaders || getDefaultColumnHeaders(cols);
              return (
                <div key={idx} className="flex-1 min-w-[34px]">
                  <input
                    type="text"
                    maxLength={3}
                    value={headers[idx] || ''}
                    onChange={(e) => handleHeaderChange(idx, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-center font-bold text-xs text-amber-300 uppercase focus:border-indigo-500 focus:outline-none"
                    placeholder={`C${idx + 1}`}
                  />
                  <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                    {1 + idx * (config.numberRangePerCol || 15)}-{(idx + 1) * (config.numberRangePerCol || 15)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Casilla Central Libre Toggle & Label */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasFreeCenter}
                onChange={(e) => {
                  const newHasFree = e.target.checked;
                  handleDimensionsChange(rows, cols, newHasFree);
                }}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span>Incluir Casilla Central "LIBRE" (Espacio Comodín)</span>
            </label>
          </div>

          {hasFreeCenter && (
            <div className="flex items-center gap-2 pl-6">
              <label className="text-xs text-slate-400 whitespace-nowrap">Texto de la casilla:</label>
              <input
                type="text"
                value={config.freeCenterText}
                onChange={(e) => update('freeCenterText', e.target.value)}
                placeholder="LIBRE"
                className="w-32 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none uppercase"
              />
              <span className="text-[10px] text-slate-500">Ej: LIBRE, BINGO, ★</span>
            </div>
          )}
        </div>

        {/* Mode Slider: Numbers Per Card & Incomplete Patterns */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Números por Cartón (Modo de Juego):</span>
            <span className="font-mono text-indigo-300 font-bold px-2 py-0.5 bg-indigo-950 border border-indigo-800 rounded">
              {currentNumbers} Números {blanksCount > 0 ? `(${blanksCount} vacías)` : '(Lleno)'}
            </span>
          </div>

          <input
            type="range"
            min={Math.max(3, Math.floor(maxPlayable / 3))}
            max={maxPlayable}
            step={1}
            value={currentNumbers}
            onChange={(e) => update('numbersPerCard', parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>{Math.max(3, Math.floor(maxPlayable / 3))} (Rápido)</span>
            <span>{Math.floor(maxPlayable * 0.7)} (Incompleto)</span>
            <span>{maxPlayable} (100% Lleno)</span>
          </div>

          <div className="mt-2.5 p-2 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-[11px] text-indigo-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              {blanksCount === 0 ? (
                <span>
                  <strong>Modo Completo:</strong> {currentNumbers} casillas con números aleatorios únicos ordenados por columna + {hasFreeCenter ? '1 casilla comodín central' : 'sin comodín'}.
                </span>
              ) : (
                <span>
                  <strong>Modo Incompleto:</strong> {currentNumbers} números y <strong>{blanksCount} casillas vacías</strong> distribuidas armónicamente por el pliego.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Cards & Serial Prefix */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Cantidad de Cartones
            </label>
            <input
              type="number"
              min={1}
              max={600}
              value={config.totalCards}
              onChange={(e) => update('totalCards', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">100% únicos sin repetición</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Prefijo Serial de Auditoría
            </label>
            <input
              type="text"
              value={config.serialPrefix}
              onChange={(e) => update('serialPrefix', e.target.value)}
              placeholder="BG-2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Ej: BG-0001-A9F</span>
          </div>
        </div>
      </section>

      {/* Datos del Evento de Bingo */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Calendar className="w-4 h-4" />
          <span>Encabezado del Cartón & Premios</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Título del Bingo
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="GRAN BINGO"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-bold focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Subtítulo / Entidad
            </label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
              placeholder="Comité Social Central"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Valor del Cartón
            </label>
            <input
              type="text"
              value={config.price}
              onChange={(e) => update('price', e.target.value)}
              placeholder="$ 10.000 COP"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-amber-300 mb-1">
            Resumen de Premios Destacados
          </label>
          <input
            type="text"
            value={config.prizeSummary}
            onChange={(e) => update('prizeSummary', e.target.value)}
            placeholder="Tabla Llena: $2.000.000 • Línea: $300.000"
            className="w-full bg-slate-950 border border-amber-600/50 rounded-lg px-3 py-1.5 text-sm text-white font-medium focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Fecha / Hora del Evento
          </label>
          <input
            type="text"
            value={config.date}
            onChange={(e) => update('date', e.target.value)}
            placeholder="Domingo 8 de Noviembre de 2026 - 15:00 hrs"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Verificación QR */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <QrCode className="w-4 h-4" />
            <span>Código QR en el Pie del Cartón</span>
          </div>
          <input
            type="checkbox"
            checked={config.showQr}
            onChange={(e) => update('showQr', e.target.checked)}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
        </div>

        {config.showQr && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Enlace de Validación Oficial
            </label>
            <input
              type="text"
              value={config.qrPayload}
              onChange={(e) => update('qrPayload', e.target.value)}
              placeholder="https://bingo.comunidad.org/verificar"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}
      </section>

      {/* Tema de Color */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Palette className="w-4 h-4" />
          <span>Tema de Color para Cartones</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {BINGO_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => update('theme', theme.id)}
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition cursor-pointer ${
                config.theme === theme.id
                  ? 'border-indigo-400 bg-slate-800 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${theme.color}`} />
              <span className="truncate">{theme.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Marcador de Contorno / Borde Exterior en Versión Imprimible */}
      {sheetSettings && onSheetSettingsChange && (
        <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Square className="w-4 h-4" />
            <span>Contorno Exterior del Cartón (Impresión)</span>
          </div>

          <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer">
            <input
              type="checkbox"
              checked={sheetSettings.showPieceBorder === false}
              onChange={(e) =>
                onSheetSettingsChange({
                  ...sheetSettings,
                  showPieceBorder: !e.target.checked,
                })
              }
              className="w-4 h-4 mt-0.5 accent-indigo-600 rounded cursor-pointer flex-shrink-0"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Ocultar contorno exterior en la versión imprimible
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Marcador para que la línea de borde/marco exterior del cartón no sea visible al imprimir o exportar a PDF (quedando solo las marcas de corte punteadas).
              </p>
            </div>
          </label>
        </section>
      )}
    </div>
  );
};
