import { ScreenId } from '../types';
import { Building2, ArrowRight, ShieldCheck, Compass, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export function SplashScreen({ onNavigate }: SplashScreenProps) {
  return (
    <div
      id="screen-splash"
      className="flex-1 flex flex-col justify-between p-6 sm:p-8 bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-white min-h-[780px] transition-colors"
    >
      {/* Top Status & Brand Chip */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] px-3.5 py-1.5 rounded-full text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
          <span>Municipal Civic Portal</span>
        </div>
        <div className="text-[12px] text-[#86868B] font-medium">
          v2.4
        </div>
      </div>

      {/* Main Logo & Identity Centerpiece */}
      <div className="flex flex-col items-center text-center my-auto py-8 max-w-sm mx-auto">
        {/* Apple Style App Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-[26px] bg-gradient-to-b from-[#007AFF] to-[#0051D5] p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
            <Building2 className="w-12 h-12 stroke-[1.75]" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-[#34C759] text-white p-1.5 rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* App Title & Slogan */}
        <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-2 leading-tight">
          UrbanConnect
        </h1>

        <p className="text-[16px] text-[#6E6E73] dark:text-[#86868B] font-normal leading-relaxed mb-6">
          Your city, connected. Access civic services, check transit, and report issues in one calm place.
        </p>

        {/* Civic Feature Highlights Pills */}
        <div className="flex flex-wrap justify-center gap-2 text-[13px] text-[#6E6E73] dark:text-[#86868B]">
          <span className="bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] px-3 py-1 rounded-full shadow-xs">
            🚌 Real-Time Transit
          </span>
          <span className="bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] px-3 py-1 rounded-full shadow-xs">
            📢 Grievance Desk
          </span>
          <span className="bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] px-3 py-1 rounded-full shadow-xs">
            🩸 Life Support Network
          </span>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="flex flex-col gap-3 pb-4 max-w-sm mx-auto w-full">
        <button
          id="btn-splash-get-started"
          onClick={() => onNavigate('login')}
          className="w-full py-3.5 px-6 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="btn-splash-skip-dashboard"
          onClick={() => onNavigate('home')}
          className="w-full py-3 px-6 rounded-full bg-white dark:bg-[#1C1C1E] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Compass className="w-4 h-4 text-[#007AFF]" />
          <span>Explore Directly (Guest Mode)</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[12px] text-[#86868B] pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Official Municipal Services Platform</span>
        </div>
      </div>
    </div>
  );
}
