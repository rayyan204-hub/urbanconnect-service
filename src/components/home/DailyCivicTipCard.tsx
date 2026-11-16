import { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import {
  DAILY_CIVIC_TIPS,
  DailyCivicTip,
  getTodayCivicTip,
  isTipRead,
  markTipAsRead,
  isTipBookmarked,
  toggleTipBookmark,
} from '../../data/dailyCivicTips';
import { updateUserCivicPoints } from '../../services/dbService';
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DailyCivicTipCardProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenAIChat?: () => void;
  className?: string;
}

export function DailyCivicTipCard({
  onNavigate,
  onOpenAIChat,
  className = '',
}: DailyCivicTipCardProps) {
  const todayTip = getTodayCivicTip();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = DAILY_CIVIC_TIPS.findIndex((t) => t.id === todayTip.id);
    return idx >= 0 ? idx : 0;
  });

  const [expanded, setExpanded] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  const currentTip: DailyCivicTip = DAILY_CIVIC_TIPS[currentIndex] || todayTip;

  useEffect(() => {
    setIsRead(isTipRead(currentTip.id));
    setIsBookmarked(isTipBookmarked(currentTip.id));
  }, [currentTip.id]);

  const handleMarkAsRead = () => {
    if (isRead) return;
    markTipAsRead(currentTip.id);
    setIsRead(true);
    const earned = currentTip.civicRewardPoints || 10;
    updateUserCivicPoints('usr-1', earned, `Read daily civic tip: ${currentTip.title}`);
    setRewardToast(`+${earned} Civic Points earned!`);
    setTimeout(() => setRewardToast(null), 3000);
  };

  const handleToggleBookmark = () => {
    const next = toggleTipBookmark(currentTip.id);
    setIsBookmarked(next);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : DAILY_CIVIC_TIPS.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < DAILY_CIVIC_TIPS.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className={`bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all relative overflow-hidden ${className}`}
    >
      {/* Toast */}
      {rewardToast && (
        <div className="absolute top-3 right-3 bg-[#34C759] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md animate-fade-in z-20">
          {rewardToast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#007AFF]">
              Daily Civic Tip
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-full transition-colors"
            title="Previous Tip"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-[#86868B] font-medium px-0.5">
            {currentIndex + 1} of {DAILY_CIVIC_TIPS.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-full transition-colors"
            title="Next Tip"
            aria-label="Next tip"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white leading-snug">
        {currentTip.title}
      </h3>

      <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1.5 leading-relaxed">
        {currentTip.summary}
      </p>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#E5E5EA] dark:border-[#2C2C2E] space-y-2.5 text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] animate-fade-in">
          <div>
            <div className="font-semibold text-[11px] uppercase tracking-wider text-[#86868B] mb-1">
              Key Guidelines
            </div>
            <ul className="space-y-1 pl-4 list-disc text-[#6E6E73] dark:text-[#86868B]">
              {currentTip.keyPoints.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 rounded-[12px] text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            <span className="font-semibold text-[#1D1D1F] dark:text-white">Municipal Reference: </span>
            {currentTip.officialReference}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#E5E5EA]/80 dark:border-[#2C2C2E]/80">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[13px] font-medium text-[#007AFF] hover:underline flex items-center gap-1"
        >
          <span>{expanded ? 'Show less' : 'Learn more'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-full transition-colors ${
              isBookmarked
                ? 'text-[#007AFF] bg-[#007AFF]/10'
                : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark tip'}
            aria-label="Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={handleMarkAsRead}
            disabled={isRead}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
              isRead
                ? 'bg-[#34C759]/10 text-[#34C759] cursor-default'
                : 'bg-[#007AFF] text-white hover:bg-[#0062CC]'
            }`}
          >
            <Check className="w-3 h-3" />
            <span>{isRead ? 'Completed' : 'Mark as read (+10 pts)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
