import { useState } from 'react';
import { ScreenId, WardCivicHealth, UserProfile, CivicLeaderboardUser } from '../types';
import {
  getAllWardCivicHealth,
  getLeaderboard,
  getComplaints,
} from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Droplet,
  Trash2,
  Car,
  Building,
} from 'lucide-react';

interface CivicAnalyticsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function CivicAnalyticsScreen({ onNavigate, currentUser }: CivicAnalyticsScreenProps) {
  const allWardsData = getAllWardCivicHealth();
  const wardNames = Object.keys(allWardsData);

  const initialWard = currentUser?.ward && allWardsData[currentUser.ward]
    ? currentUser.ward
    : wardNames[0] || 'TMC Ward 4 - Majiwada & Naupada';

  const [selectedWard, setSelectedWard] = useState<string>(initialWard);
  const [activeTab, setActiveTab] = useState<'health' | 'leaderboard' | 'metrics'>('health');

  const wardHealth: WardCivicHealth =
    allWardsData[selectedWard] || allWardsData['TMC Ward 4 - Majiwada & Naupada'];
  const leaderboard: CivicLeaderboardUser[] = getLeaderboard();
  const complaints = getComplaints();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#34C759]';
    if (score >= 70) return 'text-[#007AFF]';
    if (score >= 50) return 'text-[#FF9500]';
    return 'text-[#FF3B30]';
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'Roads & Infrastructure':
        return <Car className="w-4 h-4 text-[#FF9500]" />;
      case 'Waste Management':
        return <Trash2 className="w-4 h-4 text-[#34C759]" />;
      case 'Water Supply & Quality':
        return <Droplet className="w-4 h-4 text-[#007AFF]" />;
      case 'Street Lighting':
        return <Zap className="w-4 h-4 text-[#FFCC00]" />;
      case 'Monsoon & Drainage':
        return <Activity className="w-4 h-4 text-[#5856D6]" />;
      case 'Public Transit & Mobility':
        return <TrendingUp className="w-4 h-4 text-[#007AFF]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#86868B]" />;
    }
  };

  return (
    <div id="screen-civic-analytics" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] font-sans pb-16 transition-colors">
      <TopAppBar
        currentScreen="analytics"
        title="Civic Analytics"
        subtitle="Ward performance index & citizen participation"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Ward Switcher Header */}
      <div className="px-5 sm:px-8 py-3.5 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-[#2C2C2E] space-y-3 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#007AFF]" />
            <span className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white">
              Municipal Ward:
            </span>
          </div>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="text-[13px] font-medium px-3.5 py-1.5 rounded-[12px] border border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-all"
          >
            {wardNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Segmented Control */}
        <div className="max-w-2xl mx-auto flex items-center bg-[#E5E5EA]/60 dark:bg-[#2C2C2E] p-1 rounded-full text-[12px] font-medium">
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'health'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ward Health</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SLA Metrics</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 sm:px-8 py-4 space-y-4 max-w-2xl mx-auto w-full flex-1">
        {activeTab === 'health' && (
          <div className="space-y-4">
            {/* Apple Activity Style Score Card */}
            <div className="p-6 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-0.5 rounded-full">
                    Municipal Audit Index
                  </span>
                  <h2 className="text-[20px] font-bold text-[#1D1D1F] dark:text-white mt-1.5">{wardHealth.wardName}</h2>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                    Live civic composite score refreshed daily at 00:00 IST
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[36px] font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                      {wardHealth.overallScore}
                    </span>
                    <span className="text-[14px] text-[#86868B]">/100</span>
                    <p className={`text-[12px] font-semibold ${getScoreColor(wardHealth.overallScore)}`}>
                      Grade {wardHealth.grade}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-[18px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold text-[24px]">
                    {wardHealth.grade}
                  </div>
                </div>
              </div>

              {/* Fast Stats Row */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-black/[0.04] dark:border-white/[0.06] text-center">
                <div>
                  <span className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
                    {wardHealth.avgResolutionTimeHours} hrs
                  </span>
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">Avg Resolution</p>
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-[#34C759]">
                    {wardHealth.complaintResolutionRate}%
                  </span>
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">Resolution SLA</p>
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
                    {wardHealth.activeComplaints}
                  </span>
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">Active Grievances</p>
                </div>
              </div>
            </div>

            {/* Individual Sector Performance Cards */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-semibold text-[#6E6E73] dark:text-[#86868B] px-1">
                Sector Performance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: 'Roads & Infrastructure',
                    score: wardHealth.metrics.roadServices,
                    note: 'Pothole patch repair & cold-mix resurfacing.',
                  },
                  {
                    name: 'Solid Waste Management',
                    score: wardHealth.metrics.wasteManagement,
                    note: 'Door-to-door wet/dry segregation efficiency.',
                  },
                  {
                    name: 'Public Transit & Mobility',
                    score: wardHealth.metrics.publicTransport,
                    note: 'TMT/BEST feeder connectivity & station access.',
                  },
                  {
                    name: 'Citizen Participation',
                    score: wardHealth.metrics.communityParticipation,
                    note: 'Blood donor roster & community drive participation.',
                  },
                  {
                    name: 'Water & Drainage',
                    score: wardHealth.metrics.waterDrainage,
                    note: 'Culvert desilting & booster pressure monitoring.',
                  },
                ].map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[10px] bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center">
                          {getMetricIcon(cat.name)}
                        </div>
                        <span className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white">{cat.name}</span>
                      </div>
                      <span className={`text-[13px] font-bold ${getScoreColor(cat.score)}`}>
                        {cat.score}%
                      </span>
                    </div>

                    <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007AFF] rounded-full transition-all duration-300"
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                      {cat.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-[#6E6E73] dark:text-[#86868B] px-1">
              Top Citizen Contributors
            </h3>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] shadow-xs divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden">
              {leaderboard.map((item, index) => (
                <div key={item.uid} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 text-center font-bold text-[13px] ${
                      index === 0 ? 'text-[#FF9500]' : index === 1 ? 'text-[#8E8E93]' : index === 2 ? 'text-[#A2845E]' : 'text-[#86868B]'
                    }`}>
                      #{index + 1}
                    </span>
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white truncate">{item.name}</h4>
                      <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] truncate">{item.ward}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-bold text-[#007AFF]">{item.points} pts</div>
                    <div className="text-[11px] text-[#86868B]">{item.rank}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: SLA Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-[#6E6E73] dark:text-[#86868B] px-1">
              Municipal Resolution Benchmarks
            </h3>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] p-5 shadow-xs space-y-4">
              {[
                { title: 'Pothole & Road Resurfacing', target: '24-48 Hours', actual: '32 Hours', status: 'Compliant' },
                { title: 'Streetlight Bulb Replacement', target: '24 Hours', actual: '18 Hours', status: 'Compliant' },
                { title: 'Garbage & Waste Clearance', target: '12 Hours', actual: '8 Hours', status: 'Optimal' },
                { title: 'Water Leakage Repair', target: '12-24 Hours', actual: '14 Hours', status: 'Compliant' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06] last:border-none last:pb-0">
                  <div>
                    <h4 className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">{item.title}</h4>
                    <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Target: {item.target}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-semibold text-[#34C759]">{item.actual}</span>
                    <p className="text-[11px] text-[#86868B]">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
