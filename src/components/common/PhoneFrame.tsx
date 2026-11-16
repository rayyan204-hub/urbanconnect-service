import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isDeviceFrame: boolean;
}

export function PhoneFrame({ children, isDeviceFrame }: PhoneFrameProps) {
  if (!isDeviceFrame) {
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] transition-colors">
        <div className="w-full flex-1 min-h-0 flex flex-col bg-white dark:bg-[#1C1C1E] relative transition-colors">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100dvh-52px)] bg-[#E5E5EA] dark:bg-[#000000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto transition-colors">
      {/* Clean Apple iPhone shell */}
      <div
        id="apple-device-frame"
        className="w-[412px] h-[892px] max-h-[96vh] bg-[#1D1D1F] rounded-[48px] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.3)] ring-1 ring-black/20 dark:ring-white/10 relative flex flex-col flex-shrink-0 transition-all"
      >
        {/* Screen Bezel and Inner Glass */}
        <div className="w-full h-full bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[38px] overflow-hidden flex flex-col relative border border-black/10 dark:border-white/10 transition-colors">
          {/* iOS Dynamic Island & Status Bar */}
          <div
            id="ios-status-bar"
            className="w-full h-11 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md px-6 flex items-center justify-between text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] select-none z-40 border-b border-[#E5E5EA]/60 dark:border-[#2C2C2E] flex-shrink-0 transition-colors"
          >
            <span className="font-semibold tracking-tight text-[13px]">9:41</span>

            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 bg-[#1C1C1E] rounded-full border border-neutral-800" />
            </div>

            <div className="flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col relative bg-[#F5F5F7] dark:bg-[#1C1C1E] transition-colors">
            {children}
          </div>

          {/* iOS Home Indicator Pill */}
          <div
            id="ios-home-indicator-area"
            className="w-full h-4 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-sm flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <div className="w-32 h-1 bg-[#1D1D1F]/30 dark:bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
