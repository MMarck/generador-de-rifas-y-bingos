import React from 'react';
import { SheetSettings, PaperSize, Orientation, CropMarksType } from '../types';
import {
  FileText,
  RotateCw,
  LayoutGrid,
  Scissors,
  Maximize,
  SlidersHorizontal,
  Square,
} from 'lucide-react';

interface ImpositionControlsProps {
  settings: SheetSettings;
  onChange: (newSettings: SheetSettings) => void;
  itemType: 'raffle' | 'bingo';
}

const PAPER_SIZES: { id: PaperSize; label: string; dims: string }[] = [
  { id: 'A4', label: 'A4 Estándar', dims: '210 × 297 mm' },
  { id: 'A5', label: 'A5 Medio Pliego', dims: '148 × 210 mm' },
  { id: 'A6', label: 'A6 Cuarto Pliego', dims: '105 × 148 mm' },
  { id: 'Letter', label: 'Carta (Letter)', dims: '216 × 279 mm' },
];

const N_UP_PRESETS = [1, 2, 3, 4, 6, 8, 10];

export const ImpositionControls: React.FC<ImpositionControlsProps> = ({
  settings,
  onChange,
  itemType,
}) => {
  const update = <K extends keyof SheetSettings>(key: K, value: SheetSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Tamaño de Hoja & Orientación */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <FileText className="w-4 h-4" />
          <span>Formato de Papel Base & Orientación</span>
        </div>

        {/* Paper Size Grid */}
        <div className="grid grid-cols-2 gap-2">
          {PAPER_SIZES.map((paper) => (
            <button
              key={paper.id}
              type="button"
              onClick={() => update('paperSize', paper.id)}
              className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                settings.paperSize === paper.id
                  ? 'border-indigo-400 bg-indigo-950/40 text-white ring-1 ring-indigo-400'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-semibold text-white">{paper.label}</div>
              <div className="text-[10px] text-slate-400">{paper.dims}</div>
            </button>
          ))}
        </div>

        {/* Orientation Toggle */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => update('orientation', 'portrait')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
              settings.orientation === 'portrait'
                ? 'border-indigo-400 bg-indigo-950/40 text-white'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-3.5 h-4.5 border border-current rounded-xs" />
            <span>Vertical (Portrait)</span>
          </button>

          <button
            type="button"
            onClick={() => update('orientation', 'landscape')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
              settings.orientation === 'landscape'
                ? 'border-indigo-400 bg-indigo-950/40 text-white'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-4.5 h-3.5 border border-current rounded-xs" />
            <span>Horizontal (Landscape)</span>
          </button>
        </div>
      </section>

      {/* Imposición N-Up: Piezas por Pliego */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-indigo-400 font-semibold text-sm">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            <span>Imposición N-Up (Piezas por Pliego)</span>
          </div>
          <span className="text-xs font-mono font-bold text-white px-2 py-0.5 bg-indigo-600 rounded">
            {settings.piecesPerSheet} por hoja
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Selecciona cuántos {itemType === 'raffle' ? 'boletos' : 'cartones'} se imprimirán en cada hoja {settings.paperSize}. El sistema calcula la cuadrícula óptima automáticamente.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {N_UP_PRESETS.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => update('piecesPerSheet', num)}
              className={`py-2 px-1 rounded-lg border text-center transition font-bold text-xs cursor-pointer ${
                settings.piecesPerSheet === num
                  ? 'border-indigo-400 bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {num} {num === 1 ? 'pieza' : 'piezas'}
            </button>
          ))}
        </div>
      </section>

      {/* Líneas de Guillotinado & Marcas de Corte */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Scissors className="w-4 h-4" />
          <span>Guías de Guillotinado y Corte</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'dashed', label: 'Punteadas (Recomendado)' },
              { id: 'solid', label: 'Continuas' },
              { id: 'none', label: 'Sin Guías' },
            ] as { id: CropMarksType; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => update('cropMarks', opt.id)}
              className={`p-2 rounded-lg border text-center text-xs font-medium transition cursor-pointer ${
                settings.cropMarks === opt.id
                  ? 'border-indigo-400 bg-indigo-950/40 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Marcador para Ocultar Contorno en Versión Imprimible */}
        <div className="pt-3 border-t border-slate-800/80">
          <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPieceBorder === false}
              onChange={(e) => update('showPieceBorder', !e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-indigo-600 rounded cursor-pointer flex-shrink-0"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-indigo-400" />
                Ocultar contorno exterior en la versión imprimible
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Marcador para que la línea del marco/borde exterior de cada {itemType === 'raffle' ? 'boleto' : 'cartón'} no sea visible en el pliego impreso ni en el PDF vectorial.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Márgenes y Separación entre Piezas */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Márgenes y Sangrado de Pliego</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300">Margen Exterior de la Hoja:</span>
            <span className="font-mono text-indigo-300 font-bold">{settings.marginMm} mm</span>
          </div>
          <input
            type="range"
            min={2}
            max={15}
            step={1}
            value={settings.marginMm}
            onChange={(e) => update('marginMm', parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300">Separación entre Piezas (Calle / Gutter):</span>
            <span className="font-mono text-indigo-300 font-bold">{settings.gutterMm} mm</span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={settings.gutterMm}
            onChange={(e) => update('gutterMm', parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showSheetHeader}
              onChange={(e) => update('showSheetHeader', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span>Imprimir encabezado de pliego (Número de hoja y código de lote)</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showSheetFooter}
              onChange={(e) => update('showSheetFooter', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span>Imprimir pie de pliego con advertencia de corte para imprenta</span>
          </label>
        </div>
      </section>
    </div>
  );
};
