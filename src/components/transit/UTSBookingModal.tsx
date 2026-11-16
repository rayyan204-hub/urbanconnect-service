import { useState } from 'react';
import {
  X,
  Train,
  ArrowRight,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BookedRailTicket, SUBURBAN_STATIONS_LIST } from '../../data/transitBookingData';
import { bookUTSSuburbanTicket } from '../../services/railBookingService';

interface UTSBookingModalProps {
  initialFrom?: string;
  initialTo?: string;
  onClose: () => void;
  onBookingSuccess: (ticket: BookedRailTicket) => void;
}

export function UTSBookingModal({
  initialFrom = 'Thane',
  initialTo = 'CSMT',
  onClose,
  onBookingSuccess,
}: UTSBookingModalProps) {
  const [fromStation, setFromStation] = useState(initialFrom);
  const [toStation, setToStation] = useState(initialTo);
  const [ticketType, setTicketType] = useState<
    'Single Journey' | 'Return Journey' | 'Monthly Season Pass' | 'AC Local Pass'
  >('Single Journey');
  const [coachType, setCoachType] = useState<'Second Class (II)' | 'First Class (I)' | 'AC EMU Local'>(
    'Second Class (II)'
  );
  const [passengerName, setPassengerName] = useState('Aarav Deshmukh');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic suburban fare calculator
  const calculateFare = () => {
    let base = 10;
    if (coachType === 'First Class (I)') base = 50;
    if (coachType === 'AC EMU Local') base = 65;

    if (ticketType === 'Return Journey') return base * 2;
    if (ticketType === 'Monthly Season Pass') return base * 24;
    if (ticketType === 'AC Local Pass') return 980;
    return base;
  };

  const fare = calculateFare();

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleBook = () => {
    if (fromStation === toStation) {
      alert('Origin and destination cannot be the same station.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticket = bookUTSSuburbanTicket({
        fromStation,
        toStation,
        ticketType,
        passengerName,
        coachType,
        fare,
      });
      setIsSubmitting(false);
      onBookingSuccess(ticket);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center font-bold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-sm font-bold">
                UTS SUBURBAN RAIL PASS
              </span>
              <h3 className="text-sm font-black tracking-tight mt-0.5">
                Instant Unreserved Suburban Ticket
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Station Selection */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-500">
                Route Stations
              </span>
              <button
                type="button"
                onClick={handleSwapStations}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
              >
                ⇄ Swap
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1">
                  From (Origin)
                </label>
                <select
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100"
                >
                  {SUBURBAN_STATIONS_LIST.map((st) => (
                    <option key={`from-${st}`} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1">
                  To (Destination)
                </label>
                <select
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100"
                >
                  {SUBURBAN_STATIONS_LIST.map((st) => (
                    <option key={`to-${st}`} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Type */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5">
              Journey Pass Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  'Single Journey',
                  'Return Journey',
                  'Monthly Season Pass',
                  'AC Local Pass',
                ] as const
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTicketType(type)}
                  className={`p-2.5 rounded-xl text-left border font-bold transition-all text-xs ${
                    ticketType === type
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Class of Travel */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5">
              Class of Travel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  'Second Class (II)',
                  'First Class (I)',
                  'AC EMU Local',
                ] as const
              ).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setCoachType(cls)}
                  className={`p-2 rounded-xl text-center border font-bold text-[11px] transition-all ${
                    coachType === cls
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Commuter Name */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
              Commuter Name
            </label>
            <input
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Fare Summary */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                Total UTS Suburban Fare
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Valid for 3 hours from moment of issue
              </span>
            </div>
            <div className="font-mono text-lg font-black text-emerald-800 dark:text-emerald-300">
              ₹{fare}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleBook}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Issuing Pass...' : `Issue UTS Pass (₹${fare})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
