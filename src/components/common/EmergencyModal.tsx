import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  PhoneCall,
  X,
  Radio,
  MapPin,
  Shield,
  LifeBuoy,
  Share2,
  Check,
  Building,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
}

const EMERGENCY_SERVICES = [
  {
    name: 'National Emergency Response (Police / Fire / Med)',
    number: '112',
    category: 'Universal',
    description: 'Direct response dispatch across Maharashtra.',
    badgeColor: 'bg-red-500 text-white',
  },
  {
    name: 'BMC Disaster Management Control Room',
    number: '1916',
    category: 'Disaster Cell',
    description: 'Flooding, building collapse, tree falls in Mumbai.',
    badgeColor: 'bg-blue-600 text-white',
  },
  {
    name: 'TMC Disaster Control (Thane)',
    number: '1800-222-108',
    category: 'Thane Helpline',
    description: 'Thane Municipal emergency & rescue response 24x7.',
    badgeColor: 'bg-teal-700 text-white',
  },
  {
    name: 'Emergency Medical & Ambulance',
    number: '108',
    category: 'Medical',
    description: 'Government 108 Emergency Medical Services.',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    name: 'Mumbai Traffic Police Helpline & WhatsApp',
    number: '8454999999',
    category: 'Traffic Police',
    description: 'Waterlogging breakdowns & vehicle towing assistance.',
    badgeColor: 'bg-amber-600 text-white',
  },
  {
    name: 'Women & Child Safety Helpline',
    number: '1090',
    category: 'Safety',
    description: 'Dedicated 24/7 Nirbhaya rapid assistance cell.',
    badgeColor: 'bg-purple-600 text-white',
  },
];

export function EmergencyModal({ isOpen, onClose, currentUser }: EmergencyModalProps) {
  const [sosSent, setSosSent] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleSendSOS = () => {
    setSosSent(true);
    setTimeout(() => {
      setSosSent(false);
    }, 4000);
  };

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="emergency-mode-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 border-2 border-red-500/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                  Emergency Mode <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-200 animate-ping" />
                </h2>
                <p className="text-xs text-red-100">Direct Municipal & First Responder Hotlines</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Weather / Tide Alert Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-5 py-3 flex items-start gap-3 shrink-0">
            <Radio className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-200">Monsoon / High Tide Alert:</span>{' '}
              <span className="text-amber-800 dark:text-amber-300">
                4.62m tide peak today at 13:45 IST. Marine Drive, Dadar Chowpatty, and Thane Upvan promenade barricaded.
              </span>
            </div>
          </div>

          {/* SOS Broadcast Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                Verified Ward:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {currentUser?.ward?.split(' - ')[0] || 'TMC Ward 4'} (19.2085° N, 72.9815° E)
                </strong>
              </span>
            </div>
            <button
              onClick={handleSendSOS}
              disabled={sosSent}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                sosSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              }`}
            >
              {sosSent ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Sent to Ward Desk!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" /> Broadcast My SOS
                </>
              )}
            </button>
          </div>

          {/* Hotline Contacts List */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            {EMERGENCY_SERVICES.map((serv, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-red-300 transition-colors"
              >
                <div className="pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${serv.badgeColor}`}>
                      {serv.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{serv.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{serv.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${serv.number}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-bold transition-all shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{serv.number}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(serv.number)}
                    title="Copy number"
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  >
                    {copiedNumber === serv.number ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Safety Notice */}
          <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              UrbanConnect emergency telemetry runs on civic mesh. No cellular balance required for 112 & 1916.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
