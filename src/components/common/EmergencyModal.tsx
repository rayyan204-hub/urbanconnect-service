import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  PhoneCall,
  X,
  Radio,
  MapPin,
  Share2,
  Check,
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
  },
  {
    name: 'BMC Disaster Management Control Room',
    number: '1916',
    category: 'Disaster Cell',
    description: 'Flooding, building collapse, tree falls in Mumbai.',
  },
  {
    name: 'TMC Disaster Control (Thane)',
    number: '1800-222-108',
    category: 'Thane Helpline',
    description: 'Thane Municipal emergency & rescue response 24x7.',
  },
  {
    name: 'Emergency Medical & Ambulance',
    number: '108',
    category: 'Medical',
    description: 'Government 108 Emergency Medical Services.',
  },
  {
    name: 'Mumbai Traffic Police Helpline',
    number: '8454999999',
    category: 'Traffic Police',
    description: 'Waterlogging breakdowns & towing assistance.',
  },
  {
    name: 'Women & Child Safety Helpline',
    number: '1090',
    category: 'Safety',
    description: 'Dedicated 24/7 Nirbhaya rapid assistance cell.',
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="emergency-mode-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#1C1C1E] rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-black/[0.06] dark:border-white/[0.08]"
        >
          {/* Header */}
          <div className="bg-[#FF3B30] p-5 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2">
                  Emergency SOS
                </h2>
                <p className="text-[12px] text-white/80">Direct First Responder & Disaster Hotlines</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Weather / Alert Banner */}
          <div className="bg-[#FF9500]/10 border-b border-[#FF9500]/20 px-5 py-3 flex items-start gap-2.5 shrink-0">
            <Radio className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#1D1D1F] dark:text-white leading-snug">
              <strong>Monsoon Advisory:</strong> High tide peak today at 13:45 IST. Marine Drive and Upvan promenade barricaded for safety.
            </div>
          </div>

          {/* SOS Broadcast Bar */}
          <div className="p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
              <MapPin className="w-4 h-4 text-[#FF3B30] shrink-0" />
              <span>
                Ward: <strong className="text-[#1D1D1F] dark:text-white">{currentUser?.ward?.split(' - ')[0] || 'Ward 4'}</strong> (19.2085° N, 72.9815° E)
              </span>
            </div>
            <button
              onClick={handleSendSOS}
              disabled={sosSent}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                sosSent
                  ? 'bg-[#34C759] text-white'
                  : 'bg-[#FF3B30] hover:bg-[#D70015] text-white'
              }`}
            >
              {sosSent ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Broadcast Sent
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" /> Broadcast SOS
                </>
              )}
            </button>
          </div>

          {/* Hotline Contacts List */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            {EMERGENCY_SERVICES.map((serv, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-[18px] bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors"
              >
                <div className="pr-3 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#FF3B30]/10 text-[#FF3B30]">
                      {serv.category}
                    </span>
                    <span className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white truncate">{serv.name}</span>
                  </div>
                  <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">{serv.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${serv.number}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#34C759] text-white text-[13px] font-semibold transition-all shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{serv.number}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(serv.number)}
                    title="Copy number"
                    className="p-2 text-[#86868B] hover:text-[#1D1D1F] rounded-full"
                  >
                    {copiedNumber === serv.number ? <Check className="w-4 h-4 text-[#34C759]" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Safety Notice */}
          <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] border-t border-black/[0.04] dark:border-white/[0.06] text-center shrink-0">
            <p className="text-[11px] text-[#86868B]">
              No cellular airtime or data balance required for 112 & 1916.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
