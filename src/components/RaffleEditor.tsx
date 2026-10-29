import React, { useRef } from 'react';
import { RaffleConfig, TicketTheme } from '../types';
import {
  Ticket,
  Trophy,
  Calendar,
  DollarSign,
  QrCode,
  Barcode,
  Image as ImageIcon,
  Palette,
  Layers,
  Sparkles,
  Info,
  Square,
} from 'lucide-react';
import { SheetSettings } from '../types';

interface RaffleEditorProps {
  config: RaffleConfig;
  onChange: (newConfig: RaffleConfig) => void;
  sheetSettings?: SheetSettings;
  onSheetSettingsChange?: (newSettings: SheetSettings) => void;
}

const THEMES: { id: TicketTheme; name: string; color: string }[] = [
  { id: 'gold', name: 'Dorado / Oro', color: 'bg-amber-500' },
  { id: 'blue', name: 'Azul Real', color: 'bg-blue-600' },
  { id: 'red', name: 'Rojo Rubí', color: 'bg-red-600' },
  { id: 'green', name: 'Verde Esmeralda', color: 'bg-emerald-600' },
  { id: 'dark', name: 'Gris Grafito', color: 'bg-slate-700' },
  { id: 'bw', name: 'B/N Ahorro Tinta', color: 'bg-neutral-900 border border-neutral-400' },
];

export const RaffleEditor: React.FC<RaffleEditorProps> = ({
  config,
  onChange,
  sheetSettings,
  onSheetSettingsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof RaffleConfig>(key: K, value: RaffleConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        update('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Numeración Secuencial Masiva & Talón */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Ticket className="w-4 h-4" />
          <span>Numeración & Sincronización Stub-Body</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Número Inicial
            </label>
            <input
              type="number"
              min={0}
              max={999999}
              value={config.startNumber}
              onChange={(e) => update('startNumber', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Total de Boletos
            </label>
            <input
              type="number"
              min={1}
              max={2000}
              value={config.totalTickets}
              onChange={(e) => update('totalTickets', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">Formato de Ceros a la Izquierda (Padding):</span>
            <span className="font-mono text-indigo-300 font-bold">
              {String(config.startNumber).padStart(config.padding, '0')} ({config.padding} dígitos)
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={config.padding}
            onChange={(e) => update('padding', parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>01</span>
            <span>001</span>
            <span>0001</span>
            <span>00001</span>
            <span>000001</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">Ancho del Talón Desprendible:</span>
            <span className="font-mono text-indigo-300 font-bold">{config.stubWidthPercent}%</span>
          </div>
          <input
            type="range"
            min={22}
            max={38}
            step={1}
            value={config.stubWidthPercent}
            onChange={(e) => update('stubWidthPercent', parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            El número se sincroniza automáticamente e idénticamente tanto en el talón de control como en el cuerpo del boleto.
          </p>
        </div>
      </section>

      {/* Datos del Evento y Organización */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Calendar className="w-4 h-4" />
          <span>Datos del Evento & Sorteo</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Título Principal del Boleto
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="GRAN RIFA PRO-FONDOS"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Entidad Organizadora
            </label>
            <input
              type="text"
              value={config.organizer}
              onChange={(e) => update('organizer', e.target.value)}
              placeholder="Asociación / Comité"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Subtítulo / Motivo
            </label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
              placeholder="Campaña Solidaria 2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Fecha del Sorteo
            </label>
            <input
              type="text"
              value={config.date}
              onChange={(e) => update('date', e.target.value)}
              placeholder="20 de Diciembre de 2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hora
            </label>
            <input
              type="text"
              value={config.time}
              onChange={(e) => update('time', e.target.value)}
              placeholder="18:00 hrs"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lugar / Modalidad
            </label>
            <input
              type="text"
              value={config.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Salón Parroquial / Con Lotería"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Precio / Valor
            </label>
            <input
              type="text"
              value={config.price}
              onChange={(e) => update('price', e.target.value)}
              placeholder="$ 10.000 COP"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-semibold focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Premios a Sortear */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <Trophy className="w-4 h-4" />
          <span>Plan de Premios</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-amber-300 mb-1">
            Primer Premio (Mayor)
          </label>
          <input
            type="text"
            value={config.firstPrize}
            onChange={(e) => update('firstPrize', e.target.value)}
            placeholder="1er Premio: Motocicleta 0km"
            className="w-full bg-slate-950 border border-amber-600/50 rounded-lg px-3 py-1.5 text-sm text-white font-medium focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Segundo Premio
          </label>
          <input
            type="text"
            value={config.secondPrize}
            onChange={(e) => update('secondPrize', e.target.value)}
            placeholder="2do Premio: Smart TV 55 Pulgadas"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Tercer Premio
          </label>
          <input
            type="text"
            value={config.thirdPrize}
            onChange={(e) => update('thirdPrize', e.target.value)}
            placeholder="3er Premio: Canasta Navideña"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Reglamento / Condiciones
          </label>
          <textarea
            rows={2}
            value={config.rules}
            onChange={(e) => update('rules', e.target.value)}
            placeholder="Juega con la Lotería de Bogotá. Caduca en 30 días."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>
      </section>

      {/* Códigos Dinámicos Barcode / QR */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <QrCode className="w-4 h-4" />
          <span>Códigos de Verificación</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              update('showBarcode', true);
              update('showQr', false);
            }}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              config.showBarcode
                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Código de Barras (128)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              update('showBarcode', false);
              update('showQr', true);
            }}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              config.showQr
                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Código QR</span>
          </button>
        </div>

        {config.showQr && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              URL o Enlace del QR de Verificación
            </label>
            <input
              type="text"
              value={config.qrPayload}
              onChange={(e) => update('qrPayload', e.target.value)}
              placeholder="https://misorteo.com/verificar"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}
      </section>

      {/* Tema de Color & Estilo Visual */}
      <section className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Palette className="w-4 h-4" />
          <span>Tema de Color para Impresión</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((theme) => (
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
            <span>Contorno Exterior del Boleto (Impresión)</span>
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
                Marcador para que la línea del marco exterior del boleto no sea visible al imprimir ni en el PDF vectorial.
              </p>
            </div>
          </label>
        </section>
      )}
    </div>
  );
};
