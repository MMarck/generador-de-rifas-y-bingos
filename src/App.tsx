import React, { useState, useMemo, useEffect } from 'react';
import {
  ProjectType,
  RaffleConfig,
  BingoConfig,
  SheetSettings,
} from './types';
import { PRESET_TEMPLATES, PresetTemplate } from './utils/presets';
import { generateRaffleTickets } from './utils/raffleGenerator';
import { generateBingoCards } from './utils/bingoGenerator';
import { generatePdfDocument } from './utils/pdfExport';
import { Navbar } from './components/Navbar';
import { SheetPreview } from './components/SheetPreview';
import { RaffleEditor } from './components/RaffleEditor';
import { BingoEditor } from './components/BingoEditor';
import { ImpositionControls } from './components/ImpositionControls';
import { SingleItemModal } from './components/SingleItemModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Sliders,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const STORAGE_KEY = 'rifaprint_bingo_studio_state_v1';

export default function App() {
  const [projectType, setProjectType] = useState<ProjectType>('raffle');

  const [raffleConfig, setRaffleConfig] = useState<RaffleConfig>(
    () => PRESET_TEMPLATES[0].raffleConfig!
  );

  const [bingoConfig, setBingoConfig] = useState<BingoConfig>(
    () => PRESET_TEMPLATES[3].bingoConfig!
  );

  const [sheetSettings, setSheetSettings] = useState<SheetSettings>(
    () => PRESET_TEMPLATES[0].sheetSettings
  );

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'content' | 'imposition'>('content');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectType) setProjectType(parsed.projectType);
        if (parsed.raffleConfig) setRaffleConfig(parsed.raffleConfig);
        if (parsed.bingoConfig) setBingoConfig(parsed.bingoConfig);
        if (parsed.sheetSettings) setSheetSettings(parsed.sheetSettings);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save state to LocalStorage
  const handleSaveToStorage = () => {
    try {
      const data = {
        projectType,
        raffleConfig,
        bingoConfig,
        sheetSettings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      showToast('¡Diseño y parámetros guardados en el almacenamiento local!');
    } catch {
      showToast('Error al guardar datos en el navegador', 'error');
    }
  };

  // Generate items with memoization
  const tickets = useMemo(() => {
    return generateRaffleTickets(raffleConfig);
  }, [raffleConfig]);

  const bingoCards = useMemo(() => {
    return generateBingoCards(bingoConfig);
  }, [bingoConfig]);

  // Adjust current page if out of bounds
  const totalItems = projectType === 'raffle' ? tickets.length : bingoCards.length;
  const itemsPerPage = sheetSettings.piecesPerSheet;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Switch project type
  const handleProjectTypeChange = (type: ProjectType) => {
    setProjectType(type);
    setCurrentPage(0);
    // Adjust default pieces per sheet for optimal presentation if switching
    if (type === 'bingo' && sheetSettings.piecesPerSheet > 6) {
      setSheetSettings((prev) => ({ ...prev, piecesPerSheet: 4 }));
    }
  };

  // Apply a preset template
  const handleApplyPreset = (preset: PresetTemplate) => {
    setProjectType(preset.category);
    if (preset.category === 'raffle' && preset.raffleConfig) {
      setRaffleConfig(preset.raffleConfig);
    } else if (preset.category === 'bingo' && preset.bingoConfig) {
      setBingoConfig(preset.bingoConfig);
    }
    setSheetSettings(preset.sheetSettings);
    setCurrentPage(0);
    showToast(`Plantilla "${preset.name}" cargada correctamente`);
  };

  // Reset to default
  const handleReset = () => {
    if (projectType === 'raffle') {
      setRaffleConfig(PRESET_TEMPLATES[0].raffleConfig!);
      setSheetSettings(PRESET_TEMPLATES[0].sheetSettings);
    } else {
      setBingoConfig(PRESET_TEMPLATES[3].bingoConfig!);
      setSheetSettings(PRESET_TEMPLATES[3].sheetSettings);
    }
    setCurrentPage(0);
    showToast('Valores restaurados por defecto');
  };

  // Direct PDF Download (Client-Side Vector 300 DPI)
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Procesando pliegos y generando PDF vectorial...', 'info');

      // Slight timeout to allow UI update
      await new Promise((resolve) => setTimeout(resolve, 50));

      const doc = await generatePdfDocument(
        projectType,
        raffleConfig,
        bingoConfig,
        sheetSettings,
        tickets,
        bingoCards
      );

      const fileName =
        projectType === 'raffle'
          ? `Boletos_Rifa_${raffleConfig.startNumber}_al_${raffleConfig.startNumber + tickets.length - 1}.pdf`
          : `Cartones_Bingo_${bingoConfig.serialPrefix}_${bingoCards.length}_piezas.pdf`;

      doc.save(fileName);
      showToast('¡Archivo PDF descargado exitosamente!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al generar el PDF', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct Browser Print
  const handlePrintDirect = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Preparando documento para impresión...', 'info');

      const doc = await generatePdfDocument(
        projectType,
        raffleConfig,
        bingoConfig,
        sheetSettings,
        tickets,
        bingoCards
      );

      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      // Create hidden iframe to trigger print dialog directly
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
          }, 1000);
        }, 300);
      };
      showToast('Diálogo de impresión activado', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al enviar a impresión', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-top-4">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Offline PWA Indicator */}
      <OfflineIndicator />

      {/* Navigation Header */}
      <Navbar
        projectType={projectType}
        onProjectTypeChange={handleProjectTypeChange}
        onApplyPreset={handleApplyPreset}
        onPrintDirect={handlePrintDirect}
        onDownloadPdf={handleDownloadPdf}
        isGeneratingPdf={isGeneratingPdf}
        onSaveToStorage={handleSaveToStorage}
        onReset={handleReset}
      />

      {/* Main Workspace (Split Screen: Controls on Left, Live Sheet Preview on Right) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Editor & Imposition Controls Panel */}
        <section className="w-full lg:w-[480px] xl:w-[520px] lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 flex flex-col h-auto lg:h-[calc(100vh-61px)]">
          {/* Subtabs: Contenido vs. Imposición N-Up */}
          <div className="flex items-center px-4 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/80 gap-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>
                {projectType === 'raffle' ? 'Diseño del Boleto' : 'Parámetros del Bingo'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('imposition')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'imposition'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Imposición N-Up ({sheetSettings.piecesPerSheet}/hoja)</span>
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {activeTab === 'content' ? (
              projectType === 'raffle' ? (
                <RaffleEditor
                  config={raffleConfig}
                  onChange={setRaffleConfig}
                  sheetSettings={sheetSettings}
                  onSheetSettingsChange={setSheetSettings}
                />
              ) : (
                <BingoEditor
                  config={bingoConfig}
                  onChange={setBingoConfig}
                  sheetSettings={sheetSettings}
                  onSheetSettingsChange={setSheetSettings}
                />
              )
            ) : (
              <ImpositionControls
                settings={sheetSettings}
                onChange={setSheetSettings}
                itemType={projectType}
              />
            )}
          </div>
        </section>

        {/* Right Side: Live Interactive Sheet Preview */}
        <section className="flex-1 flex flex-col p-3 sm:p-5 overflow-hidden bg-slate-950/90 h-[650px] lg:h-[calc(100vh-61px)]">
          <SheetPreview
            projectType={projectType}
            raffleConfig={raffleConfig}
            bingoConfig={bingoConfig}
            sheetSettings={sheetSettings}
            tickets={tickets}
            bingoCards={bingoCards}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSelectItem={(idx) => setSelectedItemIndex(idx)}
            onUpdateSheetSettings={setSheetSettings}
          />
        </section>
      </main>

      {/* Single Item High-Detail Modal (Ticket / Bingo Card) */}
      {selectedItemIndex !== null && (
        <SingleItemModal
          isOpen={selectedItemIndex !== null}
          onClose={() => setSelectedItemIndex(null)}
          projectType={projectType}
          itemIndex={selectedItemIndex}
          tickets={tickets}
          bingoCards={bingoCards}
          raffleConfig={raffleConfig}
          bingoConfig={bingoConfig}
        />
      )}
    </div>
  );
}
