import { useState } from 'react';
import {
  X,
  Train,
  User,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Utensils,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { BookedRailTicket, IRCTCTrain } from '../../data/transitBookingData';
import { bookIRCTCTicket } from '../../services/railBookingService';

interface IRCTCBookingModalProps {
  train: IRCTCTrain;
  classCode: string;
  quota: string;
  journeyDate: string;
  onClose: () => void;
  onBookingSuccess: (ticket: BookedRailTicket) => void;
}

interface PassengerForm {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berthPreference: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window' | 'No Preference';
  foodPreference: 'Veg' | 'Non-Veg' | 'Jain' | 'No Food';
}

export function IRCTCBookingModal({
  train,
  classCode,
  quota,
  journeyDate,
  onClose,
  onBookingSuccess,
}: IRCTCBookingModalProps) {
  const [passengers, setPassengers] = useState<PassengerForm[]>([
    {
      name: 'Aarav Deshmukh',
      age: 29,
      gender: 'M',
      berthPreference: 'Window',
      foodPreference: 'Veg',
    },
  ]);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedClassInfo = train.classes.find((c) => c.classCode === classCode) || train.classes[0];
  const unitFare = selectedClassInfo?.fare || 450;
  const totalBase = unitFare * passengers.length;
  const isTatkal = quota.includes('Tatkal') || quota === 'TQ';
  const tatkalFee = isTatkal ? 150 * passengers.length : 0;
  const tax = Math.round(totalBase * 0.05); // 5% GST
  const insuranceFee = includeInsurance ? Math.round(passengers.length * 0.35) : 0;
  const grandTotal = totalBase + tatkalFee + tax + insuranceFee;

  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      setErrorMessage('Maximum 6 passengers allowed per booking in IRCTC general quota.');
      return;
    }
    setPassengers([
      ...passengers,
      {
        name: '',
        age: 25,
        gender: 'F',
        berthPreference: 'No Preference',
        foodPreference: 'Veg',
      },
    ]);
    setErrorMessage(null);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handleUpdatePassenger = <K extends keyof PassengerForm>(
    index: number,
    field: K,
    value: PassengerForm[K]
  ) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmitBooking = () => {
    // Validate passengers
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        setErrorMessage(`Please enter the full name for Passenger ${i + 1}`);
        return;
      }
      if (passengers[i].age < 1 || passengers[i].age > 120) {
        setErrorMessage(`Please enter a valid age for Passenger ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const ticket = bookIRCTCTicket({
          train,
          classCode,
          quota,
          journeyDate,
          passengers,
        });
        setIsSubmitting(false);
        onBookingSuccess(ticket);
      } catch (err) {
        setIsSubmitting(false);
        setErrorMessage('Failed to generate IRCTC reservation. Please try again.');
        console.error(err);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0f284e] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-sm font-bold">
                  IRCTC RAIL CONNECT
                </span>
                <span className="text-[10px] font-mono text-amber-300">
                  #{train.trainNumber}
                </span>
              </div>
              <h3 className="text-sm font-black tracking-tight mt-0.5">
                {train.trainName}
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

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Train Summary Pill */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {train.originCode} ➔ {train.destinationCode}
              </div>
              <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                {train.departureTime} • {journeyDate}
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-black font-mono">
                {classCode} ({selectedClassInfo?.className})
              </span>
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {selectedClassInfo?.statusText}
              </div>
            </div>
          </div>

          {/* Passenger Input Fields */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Passenger Details ({passengers.length}/6)</span>
              </span>
              <button
                type="button"
                onClick={handleAddPassenger}
                className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Passenger</span>
              </button>
            </div>

            <div className="space-y-3">
              {passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-stone-500">
                      Passenger #{idx + 1}
                    </span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePassenger(idx)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-md"
                        title="Remove passenger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                        Full Name (as per Govt ID)
                      </label>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdatePassenger(idx, 'name', e.target.value)}
                        placeholder="e.g. Aarav Deshmukh"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={p.age}
                        onChange={(e) => handleUpdatePassenger(idx, 'age', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                        Gender
                      </label>
                      <select
                        value={p.gender}
                        onChange={(e) => handleUpdatePassenger(idx, 'gender', e.target.value as 'M' | 'F' | 'O')}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="M">Male (M)</option>
                        <option value="F">Female (F)</option>
                        <option value="O">Other (O)</option>
                      </select>
                    </div>
                  </div>

                  {/* Berth & Food Preference */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200 dark:border-stone-800">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                        Berth Preference
                      </label>
                      <select
                        value={p.berthPreference}
                        onChange={(e) =>
                          handleUpdatePassenger(
                            idx,
                            'berthPreference',
                            e.target.value as PassengerForm['berthPreference']
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[11px] font-medium text-stone-800 dark:text-stone-200"
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="Lower">Lower Berth (LB)</option>
                        <option value="Middle">Middle Berth (MB)</option>
                        <option value="Upper">Upper Berth (UB)</option>
                        <option value="Side Lower">Side Lower (SL)</option>
                        <option value="Side Upper">Side Upper (SU)</option>
                        <option value="Window">Window Seat</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                        Food / Meal Choice
                      </label>
                      <select
                        value={p.foodPreference}
                        onChange={(e) =>
                          handleUpdatePassenger(
                            idx,
                            'foodPreference',
                            e.target.value as PassengerForm['foodPreference']
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[11px] font-medium text-stone-800 dark:text-stone-200"
                      >
                        <option value="Veg">Vegetarian (Veg)</option>
                        <option value="Non-Veg">Non-Vegetarian</option>
                        <option value="Jain">Jain Meal</option>
                        <option value="No Food">No Food / Opt-out</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Insurance Option */}
          <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  IRCTC Travel Insurance (₹0.35/person)
                </span>
                <span className="block text-[10px] text-stone-500">
                  ₹10,00,000 comprehensive cover for rail transit
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeInsurance}
              onChange={(e) => setIncludeInsurance(e.target.checked)}
              className="w-4 h-4 rounded-md accent-amber-600"
            />
          </div>

          {/* Fare Summary Breakdown */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5">
            <div className="font-bold text-stone-800 dark:text-stone-200 mb-1">
              Fare & Charges Breakdown
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Base Fare ({passengers.length} × ₹{unitFare})</span>
              <span>₹{totalBase}</span>
            </div>
            {isTatkal && (
              <div className="flex justify-between text-amber-800 dark:text-amber-300">
                <span>Tatkal Surcharge</span>
                <span>₹{tatkalFee}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            {includeInsurance && (
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Travel Insurance</span>
                <span>₹{insuranceFee}</span>
              </div>
            )}
            <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 flex justify-between font-black text-sm text-stone-900 dark:text-stone-100">
              <span>Total Payable</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 text-base">
                ₹{grandTotal}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
            onClick={handleSubmitBooking}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Generating PNR...' : `Pay ₹${grandTotal} & Issue Ticket`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
