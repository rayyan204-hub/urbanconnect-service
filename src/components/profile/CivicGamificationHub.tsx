import { useState, useEffect } from 'react';
import { UserProfile, CivicReward, RedeemedVoucher, ScreenId } from '../../types';
import {
  getCivicRewards,
  getRedeemedVouchers,
  redeemCivicReward,
  subscribeToCollection,
  COLLECTIONS,
} from '../../services/dbService';
import {
  Trophy,
  Award,
  Sparkles,
  Gift,
  CheckCircle2,
  QrCode,
  Copy,
  Bus,
  Car,
  Trees,
  Zap,
  ChevronRight,
  Flame,
  X,
  Smartphone,
} from 'lucide-react';

interface CivicGamificationHubProps {
  user: UserProfile;
  onNavigate: (screen: ScreenId) => void;
  onUserUpdate?: (user: UserProfile) => void;
  onToast: (message: string) => void;
}

const BADGES_CONFIG = [
  {
    id: 'civic-watchdog',
    title: 'Civic Watchdog',
    icon: '🛡️',
    description: 'Verified on-ground municipal repair resolution.',
    criteria: 'Confirm at least 1 resolution photo.',
    unlocked: true,
    unlockedDate: 'Sep 2026',
    rarity: 'Silver Tier',
  },
  {
    id: 'canopy-guardian',
    title: 'Canopy Guardian',
    icon: '🌳',
    description: 'Participated in Upvan Lake Clean & Green Drive.',
    criteria: 'Register for an environmental volunteer drive.',
    unlocked: true,
    unlockedDate: 'Aug 2026',
    rarity: 'Gold Tier',
  },
  {
    id: 'life-donor',
    title: 'Life Donor',
    icon: '🩺',
    description: 'Registered on Municipal Blood Donor Roster.',
    criteria: 'Join active blood donor network.',
    unlocked: true,
    unlockedDate: 'Jul 2026',
    rarity: 'Platinum Tier',
  },
  {
    id: 'clean-commuter',
    title: 'Clean Commuter',
    icon: '⚡',
    description: 'Frequent explorer of eco-friendly public transit.',
    criteria: 'Use municipal transit schedules.',
    unlocked: true,
    unlockedDate: 'Sep 2026',
    rarity: 'Bronze Tier',
  },
  {
    id: 'smart-parker',
    title: 'Smart Parker',
    icon: '🅿️',
    description: 'Reserved contactless municipal parking.',
    criteria: 'Book a smart parking space.',
    unlocked: false,
    unlockedDate: null,
    rarity: 'Silver Tier',
  },
  {
    id: 'ward-rep',
    title: 'Ward Representative',
    icon: '🏆',
    description: 'Top 5% civic score in Ward 4 Majiwada.',
    criteria: 'Accumulate 2,500+ Civic Points.',
    unlocked: false,
    unlockedDate: null,
    rarity: 'Diamond Tier',
  },
];

const POINTS_MATRIX = [
  {
    action: 'Report an Infrastructure Issue',
    points: '+100 pts',
    desc: 'Pothole, broken streetlight, or garbage overflow',
    screen: 'complaints' as ScreenId,
  },
  {
    action: 'Confirm Resolution Photo',
    points: '+50 pts',
    desc: 'Verify that municipal field repairs were resolved',
    screen: 'complaints' as ScreenId,
  },
  {
    action: 'Join Volunteer Clean-up Drive',
    points: '+150 pts',
    desc: 'Participate in community green drives',
    screen: 'volunteer-events' as ScreenId,
  },
  {
    action: 'Register as Blood Donor',
    points: '+200 pts',
    desc: 'Enlist on active emergency municipal roster',
    screen: 'blood-donation' as ScreenId,
  },
  {
    action: 'Book Contactless Parking Slot',
    points: '+30 pts',
    desc: 'Pre-book municipal lot space',
    screen: 'parking' as ScreenId,
  },
  {
    action: 'Explore Public Transit Schedule',
    points: '+20 pts',
    desc: 'Check live timetables to reduce congestion',
    screen: 'bus-info' as ScreenId,
  },
];

export function CivicGamificationHub({
  user,
  onNavigate,
  onUserUpdate,
  onToast,
}: CivicGamificationHubProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'badges' | 'vouchers'>('overview');
  const [rewards, setRewards] = useState<CivicReward[]>(() => getCivicRewards());
  const [vouchers, setVouchers] = useState<RedeemedVoucher[]>(() => getRedeemedVouchers(user.uid));
  const [selectedVoucher, setSelectedVoucher] = useState<RedeemedVoucher | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGES_CONFIG[0] | null>(null);

  useEffect(() => {
    const unsubRewards = subscribeToCollection(COLLECTIONS.REWARDS, () => {
      setRewards(getCivicRewards());
    });
    const unsubVouchers = subscribeToCollection(COLLECTIONS.VOUCHERS, () => {
      setVouchers(getRedeemedVouchers(user.uid));
    });
    return () => {
      unsubRewards();
      unsubVouchers();
    };
  }, [user.uid]);

  const points = user.civicPoints || 1840;
  const rank = user.rankTitle || 'Lead Community Organizer';

  let nextTier = 'Senior City Guardian';
  let minPoints = 1500;
  let maxPoints = 2500;

  if (points < 300) {
    nextTier = 'Civic Champion';
    minPoints = 0;
    maxPoints = 300;
  } else if (points < 800) {
    nextTier = 'Lead Community Organizer';
    minPoints = 300;
    maxPoints = 800;
  } else if (points < 1500) {
    nextTier = 'Senior City Guardian';
    minPoints = 800;
    maxPoints = 1500;
  } else if (points < 2500) {
    nextTier = 'Civic Luminary';
    minPoints = 1500;
    maxPoints = 2500;
  } else {
    nextTier = 'Municipal Elder (Max Tier)';
    minPoints = 2500;
    maxPoints = 3500;
  }

  const progressPercent = Math.min(
    100,
    Math.max(5, Math.round(((points - minPoints) / (maxPoints - minPoints)) * 100))
  );
  const pointsToNext = Math.max(0, maxPoints - points);

  const handleRedeem = (reward: CivicReward) => {
    if (points < reward.pointsCost) {
      onToast(`Need ${reward.pointsCost - points} more Civic Points to redeem this reward!`);
      return;
    }

    const res = redeemCivicReward(user.uid, reward.id);
    if (res.success && res.voucher) {
      if (res.user && onUserUpdate) {
        onUserUpdate(res.user);
      }
      setVouchers(getRedeemedVouchers(user.uid));
      setSelectedVoucher(res.voucher);
      onToast(`Redeemed "${reward.title}"! Voucher generated.`);
    } else {
      onToast(res.message);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    onToast('Voucher code copied to clipboard!');
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bus':
        return <Bus className="w-5 h-5 text-[#34C759]" />;
      case 'Car':
        return <Car className="w-5 h-5 text-[#007AFF]" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-[#34C759]" />;
      case 'Award':
        return <Award className="w-5 h-5 text-[#FF9500]" />;
      default:
        return <Zap className="w-5 h-5 text-[#5856D6]" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] shadow-xs overflow-hidden transition-colors">
      {/* Header: Apple Activity Style */}
      <div className="p-5 sm:p-6 border-b border-black/[0.04] dark:border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#1D1D1F] dark:text-white">Civic Standing & Perks</h4>
              <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Earn points through civic actions and unlock municipal benefits</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#007AFF] hover:underline"
          >
            <span>Rankings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Card */}
        <div className="p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[18px]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Citizen Score</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[26px] font-bold text-[#1D1D1F] dark:text-white">{points.toLocaleString()}</span>
                <span className="text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B]">Civic Points</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Current Tier</span>
              <div className="flex items-center gap-1 text-[13px] font-semibold text-[#FF9500] mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{rank}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-[#6E6E73] dark:text-[#86868B] mb-1.5">
              <span>Next: {nextTier}</span>
              <span>{pointsToNext > 0 ? `${pointsToNext} pts to next rank` : 'Max tier achieved'}</span>
            </div>
            <div className="w-full h-2 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007AFF] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center bg-[#E5E5EA]/60 dark:bg-[#2C2C2E] p-1 rounded-full text-[12px] font-medium overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Earn Points</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Rewards ({rewards.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Badges</span>
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'vouchers'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Passes ({vouchers.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POINTS_MATRIX.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(item.screen)}
                className="p-3.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[16px] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h6 className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                    {item.action}
                  </h6>
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[#34C759]/10 text-[#34C759]">
                    {item.points}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#86868B]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Rewards */}
      {activeTab === 'rewards' && (
        <div className="p-5 space-y-3">
          <div className="space-y-2.5">
            {rewards.map((reward) => {
              const canAfford = points >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className="p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[18px] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-[#1C1C1E] rounded-[12px] shrink-0 shadow-xs">
                      {getRewardIcon(reward.icon)}
                    </div>
                    <div>
                      <h6 className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">
                        {reward.title}
                      </h6>
                      <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                        {reward.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-black/[0.04]">
                    <div className="text-right">
                      <span className="text-[14px] font-bold text-[#007AFF]">
                        {reward.pointsCost}
                      </span>
                      <span className="text-[11px] text-[#86868B] ml-0.5">pts</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                        canAfford
                          ? 'bg-[#007AFF] hover:bg-[#0062CC] text-white shadow-xs'
                          : 'bg-black/[0.06] dark:bg-white/[0.08] text-[#86868B] cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem' : 'Need Points'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Badges */}
      {activeTab === 'badges' && (
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BADGES_CONFIG.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-4 rounded-[18px] text-center transition-all cursor-pointer ${
                  badge.unlocked
                    ? 'bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C]'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] opacity-50'
                }`}
              >
                <div className="text-[32px] my-1">{badge.icon}</div>
                <h6 className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                  {badge.title}
                </h6>
                <span className="text-[11px] text-[#86868B] block mt-0.5">
                  {badge.rarity}
                </span>
                <div className="mt-2 text-[11px] font-semibold text-[#34C759]">
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Active Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="p-5 space-y-3">
          {vouchers.length === 0 ? (
            <div className="p-8 text-center bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[20px] space-y-2">
              <Gift className="w-8 h-8 text-[#86868B] mx-auto" />
              <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">No active vouchers yet</p>
              <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                Redeem your earned Civic Points in the Rewards Store.
              </p>
              <button
                onClick={() => setActiveTab('rewards')}
                className="mt-2 px-4 py-2 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold"
              >
                Browse Rewards
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[18px] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#007AFF] uppercase">
                      {voucher.partner}
                    </span>
                    <h6 className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                      {voucher.rewardTitle}
                    </h6>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] font-bold text-[#1D1D1F] dark:text-white bg-white dark:bg-[#1C1C1E] px-2.5 py-0.5 rounded-[8px] shadow-xs">
                        {voucher.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
                        title="Copy code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedVoucher(voucher)}
                    className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pass</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Voucher Pass */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <h4 className="text-[14px] font-bold text-[#1D1D1F] dark:text-white">{selectedVoucher.partner} Digital Pass</h4>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h5 className="text-[16px] font-bold text-[#1D1D1F] dark:text-white">
              {selectedVoucher.rewardTitle}
            </h5>

            <div className="p-5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[20px] flex flex-col items-center">
              <div className="p-3 bg-white rounded-[16px] shadow-xs">
                <QrCode className="w-32 h-32 text-[#1D1D1F]" />
              </div>
              <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-white mt-3">
                {selectedVoucher.code}
              </span>
              <span className="text-[11px] text-[#86868B] mt-0.5">Valid until {selectedVoucher.expiresAt}</span>
            </div>

            <button
              onClick={() => setSelectedVoucher(null)}
              className="w-full py-3 rounded-full bg-[#007AFF] text-white text-[14px] font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Badge detail modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] text-center space-y-3">
            <div className="text-[48px]">{selectedBadge.icon}</div>
            <h4 className="text-[18px] font-bold text-[#1D1D1F] dark:text-white">{selectedBadge.title}</h4>
            <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF]">
              {selectedBadge.rarity}
            </span>
            <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">{selectedBadge.description}</p>
            <div className="p-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[14px] text-[12px] text-[#6E6E73] dark:text-[#86868B]">
              Criteria: {selectedBadge.criteria}
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-3 rounded-full bg-[#007AFF] text-white text-[14px] font-semibold mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
