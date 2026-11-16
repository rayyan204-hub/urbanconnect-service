import { useState } from 'react';
import { X, Train, Info, Check, ShieldCheck } from 'lucide-react';

interface CoachBerthMapModalProps {
  coachNumber?: string;
  berthNumber?: number;
  berthType?: string;
  classCode?: string;
  onClose: () => void;
}

export function CoachBerthMapModal({
  coachNumber = 'B3',
  berthNumber = 24,
  berthType = 'Lower (LB)',
  classCode = '3A',
  onClose,
}: CoachBerthMapModalProps) {
  const [selectedBerth, setSelectedBerth] = useState<number>(berthNumber);

  // Generate 8-berth bay for Sleeper/3A/2A or 2x3 seating for Chair Car
  const isChairCar = ['CC', 'EC', '2S'].includes(classCode);

  // Rake composition
  const rakeCoaches = [
    { code: 'ENG', label: 'WAP-7 Loco', isLoco: true },
    { code: 'EOG', label: 'Generator', isLoco: false },
    { code: 'GS', label: 'General', isLoco: false },
    { code: 'S1', label: 'Sleeper', isLoco: false },
    { code: 'S2', label: 'Sleeper', isLoco: false },
    { code: 'PC', label: 'Pantry Car', isLoco: false },
    { code: 'B1', label: '3-Tier AC', isLoco: false },
    { code: 'B2', label: '3-Tier AC', isLoco: false },
    { code: coachNumber, label: `${classCode} Coach`, isTarget: true },
    { code: 'A1', label: '2-Tier AC', isLoco: false },
    { code: 'H1', label: 'First AC', isLoco: false },
    { code: 'SLR', label: 'Brake Van', isLoco: false },
  ];

  // Standard Indian Railway 8-Berth Cabin Bay (Berths 1 to 24 in 3 bays)
  const berthsSample = [
    { num: 17, type: 'Lower (LB)', position: 'left-lower' },
    { num: 18, type: 'Middle (MB)', position: 'left-mid' },
    { num: 19, type: 'Upper (UB)', position: 'left-up' },
    { num: 20, type: 'Lower (LB)', position: 'right-lower' },
    { num: 21, type: 'Middle (MB)', position: 'right-mid' },
    { num: 22, type: 'Upper (UB)', position: 'right-up' },
    { num: 23, type: 'Side Lower (SL)', position: 'side-lower' },
    { num: 24, type: 'Side Upper (SU)', position: 'side-upper' },
    { num: 25, type: 'Lower (LB)', position: 'left-lower' },
    { num: 26, type: 'Middle (MB)', position: 'left-mid' },
    { num: 27, type: 'Upper (UB)', position: 'left-up' },
    { num: 28, type: 'Lower (LB)', position: 'right-lower' },
    { num: 29, type: 'Middle (MB)', position: 'right-mid' },
    { num: 30, type: 'Upper (UB)', position: 'right-up' },
    { num: 31, type: 'Side Lower (SL)', position: 'side-lower' },
    { num: 32, type: 'Side Upper (SU)', position: 'side-upper' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Train className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Coach Position & Berth Layout</h3>
              <p className="text-[11px] text-stone-400 font-mono">
                Coach {coachNumber} • Allocated Berth {berthNumber} ({berthType})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Rake Composition Sequence */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              <span>Train Rake Formation (Engine to Guard)</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Direction ➔</span>
            </div>
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center gap-1.5 min-w-max p-1 bg-stone-100 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
                {rakeCoaches.map((c, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1.5 rounded-xl text-center text-xs border transition-all ${
                      c.isTarget
                        ? 'bg-amber-600 text-white font-extrabold border-amber-500 shadow-md scale-105 ring-2 ring-amber-400/40'
                        : c.isLoco
                        ? 'bg-red-700 text-white font-bold border-red-800'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="font-mono text-[11px] font-black">{c.code}</div>
                    <div className="text-[8px] opacity-80 whitespace-nowrap">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Berth Layout Visualizer */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Coach {coachNumber} Berth Matrix ({isChairCar ? 'Chair Car 2x3' : 'Standard 8-Berth Bays'})
              </div>
              <div className="flex items-center gap-2 text-[10px] text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> Your Seat
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-stone-200 dark:bg-stone-800 inline-block" /> Available / Booked
                </span>
              </div>
            </div>

            {/* Grid of Berths */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {berthsSample.map((b) => {
                const isUserSeat = b.num === berthNumber;
                return (
                  <button
                    key={b.num}
                    onClick={() => setSelectedBerth(b.num)}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[58px] ${
                      isUserSeat
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/40 scale-102'
                        : selectedBerth === b.num
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black">#{b.num}</span>
                      {isUserSeat && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-[9px] font-semibold tracking-tight opacity-90 truncate">
                      {b.type}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
              <span>Selected Berth: <strong className="text-stone-900 dark:text-stone-100">#{selectedBerth}</strong></span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {selectedBerth === berthNumber ? '★ YOUR CONFIRMED BERTH' : 'Berth in Coach ' + coachNumber}
              </span>
            </div>
          </div>

          {/* Berth Type Reference Guide */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>IRCTC Berth Guide</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300">
              <strong>LB:</strong> Lower Berth (Preferred by Senior Citizens) • <strong>MB:</strong> Middle Berth (Foldable 22:00 to 06:00) • <strong>UB:</strong> Upper Berth • <strong>SL:</strong> Side Lower (with window) • <strong>SU:</strong> Side Upper.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Berth Map
          </button>
        </div>
      </div>
    </div>
  );
}
