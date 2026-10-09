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
  ShieldCheck,
  Sparkles,
  Gift,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Bus,
  Car,
  Trees,
  Zap,
  Clock,
  ChevronRight,
  Flame,
  AlertCircle,
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
    description: 'Participated in Yeoor Hills Clean & Green Drive.',
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
    criteria: 'Use TMT / Central Railway schedules.',
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
  { action: 'Report Civic Grievance', points: '+25 pts', screen: 'complaints' as ScreenId, desc: 'Pothole, water leak, garbage overflow' },
  { action: 'Verify Resolution on Ground', points: '+50 pts', screen: 'complaints' as ScreenId, desc: 'Inspect & confirm municipal crew repair' },
  { action: 'Endorse Community Grievance', points: '+10 pts', screen: 'complaints' as ScreenId, desc: 'Upvote neighbors urgent issues' },
  { action: 'Join Volunteer Initiative', points: '+100 pts', screen: 'volunteer-events' as ScreenId, desc: 'Promenade cleanup, lake restoration' },
  { action: 'Register as Blood Donor', points: '+150 pts', screen: 'blood-donation' as ScreenId, desc: 'Pledge emergency emergency blood' },
  { action: 'Smart City Parking Booking', points: '+15 pts', screen: 'parking' as ScreenId, desc: 'Reserve green parking slot' },
];

export function CivicGamificationHub({
  user,
  onNavigate,
  onUserUpdate,
  onToast,
}: CivicGamificationHubProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'rewards' | 'vouchers'>('overview');
  const [rewards, setRewards] = useState<CivicReward[]>(getCivicRewards());
  const [vouchers, setVouchers] = useState<RedeemedVoucher[]>(getRedeemedVouchers(user.uid));
  const [selectedVoucher, setSelectedVoucher] = useState<RedeemedVoucher | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGES_CONFIG[0] | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync vouchers and rewards on collection updates
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

  // Points and rank calculation
  const points = user.civicPoints || 1840;
  const rank = user.rankTitle || 'Lead Community Organizer';

  // Tier progression thresholds
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
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    onToast('Voucher code copied to clipboard!');
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bus':
        return <Bus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-xs">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black tracking-tight">Civic Gamification & Rewards</h4>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 font-bold">
                  Prototype 2
                </span>
              </div>
              <p className="text-[11px] text-teal-100">Earn points through civic actions and unlock city perks</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors"
          >
            <span>Rankings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Civic Score & Rank Progress */}
        <div className="mt-4 p-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/15">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">Citizen Standing</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{points.toLocaleString()}</span>
                <span className="text-xs font-semibold text-teal-100">Civic Points</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-200">Current Rank</span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{rank}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-teal-100 mb-1">
              <span>Next Rank: <strong>{nextTier}</strong></span>
              <span>{pointsToNext > 0 ? `${pointsToNext} pts to level up` : 'Max tier achieved'}</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-2 pt-1 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 border-t-2 border-teal-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Earn Points</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
            activeTab === 'rewards'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 border-t-2 border-teal-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Rewards Store ({rewards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
            activeTab === 'badges'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 border-t-2 border-teal-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Badges ({BADGES_CONFIG.filter((b) => b.unlocked).length}/{BADGES_CONFIG.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
            activeTab === 'vouchers'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 border-t-2 border-teal-600 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Active Vouchers ({vouchers.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview & Points Matrix */}
      {activeTab === 'overview' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Civic Actions Matrix
            </h5>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              Instant credit on confirmation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {POINTS_MATRIX.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(item.screen)}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                      {item.action}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {item.points}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed">
              <strong>Municipal Trust Protocol:</strong> Points are linked to verified civic records. Validating false reports or spam submissions will trigger automated civic standing penalties.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Rewards Store */}
      {activeTab === 'rewards' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Municipal Benefit Redemptions
            </h5>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Available: <strong>{points} pts</strong>
            </span>
          </div>

          <div className="space-y-2.5">
            {rewards.map((reward) => {
              const canAfford = points >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 shrink-0 shadow-2xs">
                      {getRewardIcon(reward.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h6 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {reward.title}
                        </h6>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {reward.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {reward.description}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                        Partner: {reward.partner} • {reward.terms}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-slate-700">
                    <div className="text-right">
                      <span className="text-xs font-black text-teal-700 dark:text-teal-400">
                        {reward.pointsCost}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">pts</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer active:scale-95'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Redeem Pass' : 'Need Points'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Badges Showcase */}
      {activeTab === 'badges' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Civic Honors & Achievement Badges
            </h5>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              {BADGES_CONFIG.filter((b) => b.unlocked).length} of {BADGES_CONFIG.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {BADGES_CONFIG.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                  badge.unlocked
                    ? 'bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-800 dark:to-slate-850 border-amber-200 dark:border-amber-900/60 shadow-2xs hover:shadow-sm'
                    : 'bg-slate-100/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                {badge.unlocked && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}

                <div className="text-3xl my-1">{badge.icon}</div>
                <h6 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {badge.title}
                </h6>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {badge.rarity}
                </span>

                <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-[10px] font-bold">
                  {badge.unlocked ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-slate-400">Locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Active Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Active Digital Vouchers & Passes
            </h5>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {vouchers.length} available
            </span>
          </div>

          {vouchers.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <Gift className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active vouchers yet</p>
              <p className="text-[11px] text-slate-500">
                Redeem your earned Civic Points in the Rewards Store for bus passes, parking, and city vouchers.
              </p>
              <button
                onClick={() => setActiveTab('rewards')}
                className="px-4 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold shadow-xs hover:bg-teal-800"
              >
                Browse Rewards
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="p-3.5 bg-gradient-to-r from-teal-50/80 to-emerald-50/60 dark:from-slate-800 dark:to-teal-950/40 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300">
                      {voucher.partner}
                    </span>
                    <h6 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {voucher.rewardTitle}
                    </h6>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {voucher.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"
                        title="Copy voucher code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Redeemed {voucher.redeemedAt} • Valid until {voucher.expiresAt}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedVoucher(voucher)}
                    className="px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Show Pass</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Voucher QR Code Pass */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-left">
                <div className="p-1.5 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-xl">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">Municipal Digital Pass</h4>
                  <span className="text-[10px] text-slate-500">{selectedVoucher.partner}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h5 className="text-sm font-black text-slate-900 dark:text-slate-100">
              {selectedVoucher.rewardTitle}
            </h5>

            {/* QR Code Presentation */}
            <div className="my-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center">
                <QrCode className="w-36 h-36 text-slate-800" />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="font-mono text-sm font-black text-teal-700 dark:text-teal-300">
                  {selectedVoucher.code}
                </span>
                <button
                  onClick={() => handleCopyCode(selectedVoucher.code)}
                  className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Scan at turnstile, bus conductor scanner, or nursery gate
              </span>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-400 text-left bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
              <div>• Cost: <strong>{selectedVoucher.pointsSpent} Civic Points</strong></div>
              <div>• Issued on: <strong>{selectedVoucher.redeemedAt}</strong></div>
              <div>• Valid until: <strong>{selectedVoucher.expiresAt}</strong></div>
            </div>

            <button
              onClick={() => setSelectedVoucher(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 dark:hover:bg-teal-800 text-white text-xs font-bold rounded-xl"
            >
              Done / Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Modal: Badge Details */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="text-4xl my-2">{selectedBadge.icon}</div>
            <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
              {selectedBadge.title}
            </h4>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {selectedBadge.rarity}
            </span>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              {selectedBadge.description}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Unlock Requirement:</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedBadge.criteria}</p>
              {selectedBadge.unlockedDate && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                  ✓ Unlocked in {selectedBadge.unlockedDate}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
