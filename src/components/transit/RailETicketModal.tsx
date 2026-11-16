import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import {
  X,
  Train,
  CheckCircle2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  QrCode as QrIcon,
  Barcode as BarcodeIcon,
  Maximize2,
  Minimize2,
  Zap,
  Sparkles,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { BookedRailTicket } from '../../data/transitBookingData';
import { cancelRailTicket } from '../../services/railBookingService';

interface RailETicketModalProps {
  ticket: BookedRailTicket;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

export function RailETicketModal({ ticket, onClose, onTicketUpdated }: RailETicketModalProps) {
  const [activeCodeFormat, setActiveCodeFormat] = useState<'qr' | 'barcode'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

  // Generate 2D QR Code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(ticket.qrPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed generating rail ticket QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [ticket.qrPayload]);

  // Generate 1D Barcode
  useEffect(() => {
    if (barcodeSvgRef.current) {
      try {
        const cleanPayload = ticket.barcodePayload.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16) || ticket.pnr;
        JsBarcode(barcodeSvgRef.current, cleanPayload, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 1.8,
          height: 60,
          displayValue: true,
          font: 'monospace',
          fontSize: 12,
          fontOptions: 'bold',
          margin: 6,
          background: '#ffffff',
        });
      } catch (e) {
        console.error('Barcode render error', e);
      }
    }
  }, [ticket.barcodePayload, ticket.pnr, activeCodeFormat]);

  const handleCopyPNR = () => {
    navigator.clipboard?.writeText(ticket.pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelTicket = () => {
    const res = cancelRailTicket(ticket.id);
    if (res.success) {
      setCancelFeedback(res.message);
      if (onTicketUpdated) onTicketUpdated();
    }
  };

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setScanResult(null);

    // Audio chirp
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio optional
    }

    setTimeout(() => {
      setIsSimulatingScan(false);
      setScanResult(`VERIFIED: PNR ${ticket.pnr} • Coach ${ticket.passengers[0]?.allottedCoach || 'EMU'} • TTE Handheld Turnstile OK`);
    }, 1100);
  };

  const isUTS = ticket.bookingType === 'UTS_SUBURBAN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Masthead: IRCTC or UTS */}
        <div className={`px-5 py-4 ${isUTS ? 'bg-emerald-900 text-emerald-100' : 'bg-[#0f284e] text-white'} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 font-black">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded-sm">
                  {isUTS ? 'UTS SUBURBAN RAIL PASS' : 'INDIAN RAILWAYS E-TICKET'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ticket.status === 'CNF' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <h3 className="text-sm font-black tracking-tight mt-0.5">
                {ticket.trainName}
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* PNR Banner */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-bold">
                {isUTS ? 'UTS PASS ID' : '10-DIGIT PNR NUMBER'}
              </span>
              <div className="text-lg font-black font-mono tracking-wider text-stone-900 dark:text-stone-100 mt-0.5">
                {ticket.pnr}
              </div>
            </div>
            <button
              onClick={handleCopyPNR}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Journey Path */}
          <div className="p-4 bg-stone-50 dark:bg-stone-950/80 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-400">
                  {ticket.fromCode}
                </span>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{ticket.fromName}</div>
                <div className="text-[11px] font-mono text-stone-500 mt-0.5">{ticket.departureTime}</div>
              </div>

              <div className="flex flex-col items-center px-3">
                <span className="text-[10px] font-mono text-stone-400 font-bold">➔</span>
                <div className="w-16 h-0.5 bg-stone-300 dark:bg-stone-700 my-1" />
                <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {ticket.platform}
                </span>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-400">
                  {ticket.toCode}
                </span>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{ticket.toName}</div>
                <div className="text-[11px] font-mono text-stone-500 mt-0.5">{ticket.arrivalTime}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <strong>{ticket.journeyDate}</strong>
              </span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                Class: {ticket.classCode} • {ticket.quota}
              </span>
            </div>
          </div>

          {/* Passenger & Berth Details */}
          <div>
            <div className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              Passenger & Berth Allotment ({ticket.passengers.length})
            </div>
            <div className="space-y-1.5">
              {ticket.passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-stone-400 ml-1.5">
                      ({p.age} yrs, {p.gender})
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
                      Coach {p.allottedCoach} • Berth {p.allottedBerth} ({p.allottedBerthType})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optical Barcode & QR Code Section */}
          <div className="p-4 bg-stone-100 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Optical Inspection Pass
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-0.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs">
                <button
                  onClick={() => setActiveCodeFormat('qr')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                    activeCodeFormat === 'qr'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <QrIcon className="w-3 h-3" />
                  <span>2D QR</span>
                </button>
                <button
                  onClick={() => setActiveCodeFormat('barcode')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                    activeCodeFormat === 'barcode'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <BarcodeIcon className="w-3 h-3" />
                  <span>1D Barcode</span>
                </button>
              </div>
            </div>

            {/* Code Presentation Container */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-stone-200 shadow-xs relative">
              {activeCodeFormat === 'qr' ? (
                qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Rail Ticket QR Code"
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-stone-400">
                    Generating QR...
                  </div>
                )
              ) : (
                <div className="w-full flex items-center justify-center py-2">
                  <svg ref={barcodeSvgRef} className="max-w-full" />
                </div>
              )}

              {/* Laser scan animation overlay */}
              {isSimulatingScan && (
                <div className="absolute inset-0 bg-red-500/10 rounded-xl overflow-hidden pointer-events-none flex items-center">
                  <div className="w-full h-1 bg-red-500 shadow-[0_0_12px_#ef4444] animate-bounce" />
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-500">
              Valid for scanning at TTE hand terminals and station automated turnstiles.
            </div>

            {/* Test Scanner Simulation Button */}
            <div className="pt-1">
              <button
                onClick={handleSimulateScan}
                disabled={isSimulatingScan}
                className="w-full py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>{isSimulatingScan ? 'Reading Code Laser...' : 'Test Turnstile / TTE Scan'}</span>
              </button>
            </div>

            {scanResult && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{scanResult}</span>
              </div>
            )}
          </div>

          {/* Fare Summary */}
          <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs space-y-1">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Base Ticket Fare</span>
              <span>₹{ticket.baseFare}</span>
            </div>
            {ticket.taxAmount > 0 && (
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>GST (5%)</span>
                <span>₹{ticket.taxAmount}</span>
              </div>
            )}
            {ticket.tatkalFee > 0 && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400">
                <span>Tatkal Charges</span>
                <span>₹{ticket.tatkalFee}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between font-black text-sm text-stone-900 dark:text-stone-100">
              <span>Total Paid</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">₹{ticket.totalFare}</span>
            </div>
          </div>

          {/* Cancellation Feedback */}
          {cancelFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
              {cancelFeedback}
            </div>
          )}

          {/* Cancel Ticket Option */}
          {ticket.status !== 'CANCELLED' && !cancelFeedback && (
            <div>
              {!showCancelPrompt ? (
                <button
                  onClick={() => setShowCancelPrompt(true)}
                  className="w-full py-2 text-stone-500 hover:text-red-600 text-xs font-semibold text-center hover:underline transition-colors"
                >
                  Need to cancel this ticket? View refund rules
                </button>
              ) : (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/60 text-xs space-y-2 text-left">
                  <div className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Confirm Ticket Cancellation</span>
                  </div>
                  <p className="text-[11px] text-red-800 dark:text-red-400">
                    As per Indian Railways rules, cancellation clerkage applies. Estimated refund: <strong>₹{ticket.refundableAmount || Math.round(ticket.totalFare * 0.8)}</strong> will be credited to your account.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleCancelTicket}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                    >
                      Confirm Cancel & Refund
                    </button>
                    <button
                      onClick={() => setShowCancelPrompt(false)}
                      className="px-3 py-1.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold"
                    >
                      Keep Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-stone-500">
            Booked on {ticket.bookedAt}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
