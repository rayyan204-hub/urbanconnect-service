import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isDeviceFrame: boolean;
}

export function PhoneFrame({ children, isDeviceFrame }: PhoneFrameProps) {
  if (!isDeviceFrame) {
    return (
      <div className="w-full min-h-[calc(100vh-48px)] bg-slate-100/80 flex justify-center items-start sm:py-6 sm:px-4 transition-all">
        <div className="w-full sm:max-w-lg lg:max-w-xl bg-white min-h-[100vh] sm:min-h-[860px] sm:rounded-[32px] sm:shadow-2xl sm:shadow-slate-300/70 sm:border sm:border-slate-200/80 overflow-hidden flex flex-col relative transition-all">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-slate-200/80 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Sleek Modern Device Mockup Shell */}
      <div
        id="android-device-frame"
        className="w-[412px] h-[892px] max-h-[96vh] bg-slate-950 rounded-[44px] p-2.5 shadow-2xl ring-1 ring-slate-800 shadow-slate-950/40 relative flex flex-col flex-shrink-0 transition-all"
      >
        {/* Screen Bezel and Inner Glass */}
        <div className="w-full h-full bg-slate-50 rounded-[36px] overflow-hidden flex flex-col relative border border-slate-900/10">
          {/* Status Bar */}
          <div
            id="android-status-bar"
            className="w-full h-9 bg-slate-50/95 backdrop-blur-md px-6 flex items-center justify-between text-xs font-semibold text-slate-800 select-none z-40 border-b border-slate-100 flex-shrink-0"
          >
            <span className="font-bold tracking-tight">09:41</span>

            {/* Front Camera Cutout */}
            <div className="w-4 h-4 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 bg-blue-950/70 rounded-full" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative bg-slate-50">
            {children}
          </div>

          {/* Gesture Navigation Bar Pill */}
          <div
            id="android-gesture-pill-area"
            className="w-full h-3.5 bg-white/95 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
          >
            <div className="w-28 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

