import { ScreenId } from '../types';
import { Building2, Sparkles, ArrowRight, ShieldCheck, Compass } from 'lucide-react';

interface SplashScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export function SplashScreen({ onNavigate }: SplashScreenProps) {
  return (
    <div
      id="screen-splash"
      className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-teal-900 via-teal-950 to-slate-950 text-white min-h-[780px]"
    >
      {/* Top Status & Brand Chip */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 bg-teal-800/40 border border-teal-500/30 px-3 py-1 rounded-full text-xs text-teal-200 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Smart City Hub v1.0</span>
        </div>
        <div className="text-xs text-teal-300/70 font-mono tracking-wider">
          M3 PROTOTYPE
        </div>
      </div>

      {/* Main Logo & Identity Centerpiece */}
      <div className="flex flex-col items-center text-center my-auto py-8">
        {/* Animated Radiant App Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-teal-500/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-300 p-0.5 shadow-xl shadow-teal-500/20">
            <div className="w-full h-full bg-slate-900/90 backdrop-blur-sm rounded-[22px] flex items-center justify-center text-teal-300">
              <Building2 className="w-12 h-12 text-teal-300 stroke-[1.75]" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Urban<span className="text-teal-400">Connect</span>
        </h1>

        {/* Required Tagline */}
        <p className="text-teal-100 text-sm max-w-[280px] font-medium leading-relaxed mb-6">
          Connecting Communities, Simplifying City Services
        </p>

        {/* City Feature Highlights Pills */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xs text-xs text-teal-200/80">
          <span className="bg-teal-900/60 border border-teal-700/40 px-3 py-1 rounded-full">
            🚌 Real-Time Transit
          </span>
          <span className="bg-teal-900/60 border border-teal-700/40 px-3 py-1 rounded-full">
            📢 Civic Notice Feed
          </span>
          <span className="bg-teal-900/60 border border-teal-700/40 px-3 py-1 rounded-full">
            🩸 Blood & Aid Network
          </span>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="flex flex-col gap-3 pb-4">
        <button
          id="btn-splash-get-started"
          onClick={() => onNavigate('login')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="btn-splash-skip-dashboard"
          onClick={() => onNavigate('home')}
          className="w-full py-3 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-teal-600/30 text-teal-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Compass className="w-4 h-4 text-teal-400" />
          <span>Explore Prototype Directly (Resident Mode)</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-teal-300/60 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Municipal Citizen Portal • Secure & Verified</span>
        </div>
      </div>
    </div>
  );
}
