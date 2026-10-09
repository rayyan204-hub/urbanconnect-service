import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import {
  QrCode,
  Barcode,
  Maximize2,
  Download,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  X,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface ParkingPassScannerCodeProps {
  value: string;
  lotName?: string;
  bayNumber?: string;
  validUntil?: string;
  compact?: boolean;
}

export function ParkingPassScannerCode({
  value,
  lotName = 'Municipal Smart Parking Deck',
  bayNumber = 'Bay A-12',
  validUntil = 'Valid for 3 Hours',
  compact = false,
}: ParkingPassScannerCodeProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode' | 'both'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scanSimulated, setScanSimulated] = useState(false);
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const zoomBarcodeSvgRef = useRef<SVGSVGElement | null>(null);

  // Generate QR Code data URL
  useEffect(() => {
    let isMounted = true;
    const qrPayload = `URBANCONNECT:PARKING:${value}:LOT=${encodeURIComponent(
      lotName
    )}:BAY=${encodeURIComponent(bayNumber)}`;

    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 1.5,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, lotName, bayNumber]);

  // Generate 1D Barcode with JsBarcode
  useEffect(() => {
    // Sanitize value for Code 128 (alphanumeric and hyphens)
    const cleanValue = value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 20) || 'PRK-8492';

    if (barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, cleanValue, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 12,
          font: 'monospace',
          textMargin: 3,
          height: 44,
          margin: 6,
          lineColor: '#0f172a',
          background: '#ffffff',
        });
      } catch (err) {
        console.error('Error rendering barcode:', err);
      }
    }

    if (isZoomed && zoomBarcodeSvgRef.current) {
      try {
        JsBarcode(zoomBarcodeSvgRef.current, cleanValue, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 15,
          font: 'monospace',
          textMargin: 4,
          height: 70,
          margin: 10,
          lineColor: '#0f172a',
          background: '#ffffff',
        });
      } catch (err) {
        console.error('Error rendering zoom barcode:', err);
      }
    }
  }, [value, activeTab, isZoomed]);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `ParkingPass-${value}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSimulateScan = () => {
    setScanSimulated(true);

    // Audio chirp feedback
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext not allowed or unsupported
    }

    setTimeout(() => {
      setScanSimulated(false);
    }, 4000);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 overflow-hidden shadow-xs">
      {/* Top Header with Format Selector */}
      <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Optical Scan Code
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Zap className="w-2.5 h-2.5 text-blue-600 animate-pulse" />
            Live Boom Scannable
          </span>
        </div>

        {/* Tab Controls: QR Code / Barcode / Both */}
        <div className="flex items-center gap-0.5 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3 h-3" />
            <span>2D QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('barcode')}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
              activeTab === 'barcode'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-3 h-3" />
            <span>1D Barcode</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              activeTab === 'both'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Both
          </button>
        </div>
      </div>

      {/* Main Display Container with High Contrast White Backing for Optical Sensor Reliability */}
      <div className="mt-2 flex flex-col items-center justify-center">
        {/* QR Code Presentation */}
        {(activeTab === 'qr' || activeTab === 'both') && (
          <div className="relative group p-2.5 bg-white rounded-xl shadow-xs border border-slate-200/90 flex flex-col items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Parking QR Code ${value}`}
                className={`${compact ? 'w-28 h-28' : 'w-36 h-36'} object-contain rounded-md`}
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-slate-100 rounded-md">
                <span className="text-[10px] text-slate-400 font-mono animate-pulse">
                  Rendering QR...
                </span>
              </div>
            )}

            {/* Quick Laser Scan Overlay during simulation */}
            {scanSimulated && (
              <div className="absolute inset-x-2 top-2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />
            )}

            <div className="mt-1 text-center">
              <span className="font-mono text-[10px] font-extrabold text-slate-800 tracking-wider">
                {value}
              </span>
            </div>
          </div>
        )}

        {/* 1D Barcode Presentation */}
        {(activeTab === 'barcode' || activeTab === 'both') && (
          <div
            className={`p-2 bg-white rounded-xl shadow-xs border border-slate-200/90 flex flex-col items-center max-w-full overflow-hidden ${
              activeTab === 'both' ? 'mt-2' : ''
            }`}
          >
            <svg
              ref={barcodeSvgRef}
              className="max-w-full h-auto"
              style={{ display: 'block' }}
            />
          </div>
        )}
      </div>

      {/* Simulated Boom Barrier Scan Feedback Alert */}
      {scanSimulated && (
        <div className="mt-2 p-2 rounded-xl bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-between animate-fadeIn shadow-md">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Boom Barrier Optical Scan Succeeded! Gate Opening...</span>
          </div>
          <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
            Bay {bayNumber}
          </span>
        </div>
      )}

      {/* Scanner Prompt & Utility Actions */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] gap-2">
        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">Hold 6" from barrier lens</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Simulate Scan Button */}
          <button
            type="button"
            onClick={handleSimulateScan}
            title="Test Boom Barrier Laser Scanner"
            className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 text-[10px] font-bold flex items-center gap-1 transition-colors border border-teal-200 dark:border-slate-700"
          >
            <Volume2 className="w-3 h-3 text-teal-600" />
            <span>Test Scan</span>
          </button>

          {/* Copy Token Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Pass Code"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Download Button */}
          {qrDataUrl && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download PNG for Wallet"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen Kiosk Mode */}
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            title="Fullscreen High-Brightness Zoom"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fullscreen Kiosk Mode Modal for Drivers */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-left">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                  Municipal Boom Barrier Pass
                </span>
                <h4 className="text-sm font-black text-slate-900">{lotName}</h4>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-visibility display for optical readers */}
            <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl flex flex-col items-center space-y-3">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${value}`}
                  className="w-52 h-52 object-contain"
                />
              )}

              <svg
                ref={zoomBarcodeSvgRef}
                className="max-w-full h-auto"
                style={{ display: 'block' }}
              />

              <div className="font-mono font-black text-lg text-slate-900 tracking-wider">
                {value}
              </div>
            </div>

            <div className="w-full bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Assigned Bay:</span>
                <strong className="text-teal-700 font-bold">{bayNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Hold Period:</span>
                <strong className="text-slate-800">{validUntil}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              💡 Please increase screen brightness to 100% when presenting to the optical scanner.
            </p>

            <button
              onClick={() => setIsZoomed(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Done & Return to Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
