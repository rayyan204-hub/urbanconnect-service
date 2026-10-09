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
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Droplet,
  Trash2,
  Car,
  ChevronRight,
  Sparkles,
  MapPin,
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
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300';
    if (score >= 70) return 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-300';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-300';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-300';
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'Roads & Infrastructure':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'Waste Management':
        return <Trash2 className="w-4 h-4 text-emerald-500" />;
      case 'Water Supply & Quality':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'Street Lighting':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'Monsoon & Drainage':
        return <Activity className="w-4 h-4 text-teal-500" />;
      case 'Public Transit & Mobility':
        return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div id="screen-civic-analytics" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] relative pb-16">
      <TopAppBar
        currentScreen="analytics"
        title="Civic Analytics & Ward Index"
        subtitle="Public Municipal Performance & Citizen Gamification"
        showBack
        onNavigate={onNavigate}
      />

      {/* Ward Switcher Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Active Municipal Ward:
            </span>
          </div>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {wardNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* View mode navigation tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'health'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Civic Health Index</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Citizen Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SLA Metrics</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {activeTab === 'health' && (
          <div className="space-y-4">
            {/* Overall Ward Score Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-tr from-teal-900 via-teal-800 to-emerald-800 text-white shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                    Municipal Audit Index
                  </span>
                  <h2 className="text-lg font-black mt-1">{wardHealth.wardName}</h2>
                  <p className="text-xs text-teal-100/80 mt-0.5">
                    Live civic composite score refreshed daily at 00:00 IST
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-black text-white tracking-tight">
                      {wardHealth.overallScore}
                    </span>
                    <span className="text-xs text-teal-200">/100</span>
                    <p className="text-[10px] text-teal-200 font-bold">Grade {wardHealth.grade}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-2xl">
                    {wardHealth.grade}
                  </div>
                </div>
              </div>

              {/* Fast Stats Row */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20 text-center">
                <div>
                  <span className="text-xs font-bold text-white">
                    {wardHealth.avgResolutionTimeHours} hrs
                  </span>
                  <p className="text-[10px] text-teal-200/80">Avg Resolution</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-white">
                    {wardHealth.complaintResolutionRate}%
                  </span>
                  <p className="text-[10px] text-teal-200/80">Resolution SLA</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-white">
                    {wardHealth.activeComplaints}
                  </span>
                  <p className="text-[10px] text-teal-200/80">Active in Ward</p>
                </div>
              </div>
            </div>

            {/* Individual Category Score Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Service Sector Performance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: 'Roads & Infrastructure',
                    score: wardHealth.metrics.roadServices,
                    statusNote: 'Monsoon cold-mix resurfacing & pothole patch repair SLA active.',
                  },
                  {
                    name: 'Solid Waste Management',
                    score: wardHealth.metrics.wasteManagement,
                    statusNote: 'Daily door-to-door wet/dry segregation and compactor route efficiency.',
                  },
                  {
                    name: 'Public Transit & Mobility',
                    score: wardHealth.metrics.publicTransport,
                    statusNote: 'TMT/BEST feeder connectivity and suburban station access.',
                  },
                  {
                    name: 'Citizen Participation',
                    score: wardHealth.metrics.communityParticipation,
                    statusNote: 'Civic grievance verification, blood donor registry & clean-up volunteers.',
                  },
                  {
                    name: 'Water & Monsoon Drainage',
                    score: wardHealth.metrics.waterDrainage,
                    statusNote: 'Culvert desilting, booster pressure pumps, and rainwater channel audit.',
                  },
                ].map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {getMetricIcon(cat.name)}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {cat.name}
                        </span>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${getScoreColor(cat.score)}`}>
                        {cat.score}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.score >= 85
                            ? 'bg-emerald-500'
                            : cat.score >= 70
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {cat.statusNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-850 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Civic Leaderboard & Points
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Earn +25 pts per verified complaint, +50 pts for resolution verification.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500">Your Score:</span>
                <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                  {currentUser?.civicPoints || 420} pts
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    user.name.includes(currentUser?.name || 'Aarav')
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        user.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : user.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : user.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {user.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-900/60 px-1.5 py-0.2 rounded">
                          {user.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {user.ward} • {user.complaintsCount ?? Math.floor(user.points / 35)} verified contributions
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {user.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium">Total Grievances (YTD)</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">1,248</p>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
                  ↑ 94.2% Resolution rate
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium">Under 24h Closure</span>
                <p className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">87.4%</p>
                <span className="text-[10px] text-teal-600 font-bold mt-1 inline-block">
                  Target SLA: 85%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Municipal Transparency Guarantee
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All data is aggregated through UrbanConnect civic telemetry, verified with geo-spatial timestamps from municipal inspections and citizen closure confirmations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
