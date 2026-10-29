import React, { useState } from 'react';
import { ProjectType } from '../types';
import { PRESET_TEMPLATES, PresetTemplate } from '../utils/presets';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Ticket,
  Grid,
  Printer,
  Download,
  BookOpen,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  projectType: ProjectType;
  onProjectTypeChange: (type: ProjectType) => void;
  onApplyPreset: (preset: PresetTemplate) => void;
  onPrintDirect: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  onSaveToStorage: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectType,
  onProjectTypeChange,
  onApplyPreset,
  onPrintDirect,
  onDownloadPdf,
  isGeneratingPdf,
  onSaveToStorage,
  onReset,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-400 p-0.5 shadow-md shadow-indigo-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Ticket className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>RifaPrint & Bingo Studio</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PWA V1
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Maquetación, Imposición N-Up y Exportación Vectorial
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onProjectTypeChange('raffle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                projectType === 'raffle'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Boletos de Rifa</span>
            </button>
            <button
              onClick={() => onProjectTypeChange('bingo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                projectType === 'bingo'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cartones de Bingo</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Plantillas</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPresetsMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowPresetsMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-40 text-xs text-slate-200">
                  <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    Plantillas Predefinidas
                  </div>
                  {PRESET_TEMPLATES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onApplyPreset(preset);
                        setShowPresetsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 transition flex flex-col gap-0.5 border-b border-slate-800/40 last:border-0 cursor-pointer"
                    >
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span>{preset.name}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-indigo-300">
                          {preset.category === 'raffle' ? 'Rifa' : 'Bingo'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Save to LocalStorage */}
          <button
            type="button"
            onClick={onSaveToStorage}
            title="Guardar diseño actual en tu navegador"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/80 text-slate-300 text-xs font-medium hover:text-white transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Guardar</span>
          </button>

          {/* Direct Print Button */}
          <button
            type="button"
            onClick={onPrintDirect}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Enviar pliego al diálogo de impresión nativo del sistema"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
