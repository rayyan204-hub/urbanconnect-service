import { useState, useEffect } from 'react';
import { ScreenId, UserProfile, Complaint } from '../types';
import { GlobalSearchBar } from '../components/home/GlobalSearchBar';
import { DailyCivicTipCard } from '../components/home/DailyCivicTipCard';
import { NotificationsModal } from '../components/common/NotificationsModal';
import { useLanguage } from '../context/LanguageContext';
import {
  getNotifications,
  getComplaints,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
import {
  AlertCircle,
  Train,
  Car,
  MapPin,
  Trash2,
  HeartPulse,
  Sun,
  Wind,
  Droplets,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Layers,
  Activity,
  FileText,
  Users,
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
  onOpenAIChat?: () => void;
}

export function HomeDashboard({ onNavigate, currentUser, onOpenAIChat }: HomeDashboardProps) {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return getNotifications().filter((n) => !n.read).length;
  });

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.COMPLAINTS, () => {
      setComplaints(getComplaints());
    });
    const unsubNotif = subscribeToCollection(COLLECTIONS.NOTIFICATIONS, () => {
      setUnreadCount(getNotifications().filter((n) => !n.read).length);
    });
    return () => {
      unsub();
      unsubNotif();
    };
  }, []);

  // Compute complaint statistics for user/city
  const userComplaints = complaints.filter(
    (c) => !currentUser || c.userId === currentUser.uid || c.userId === 'user-1'
  );
  const submittedCount = userComplaints.filter((c) => c.status === 'Submitted').length;
  const inProgressCount = userComplaints.filter(
    (c) => ['Assigned', 'In Progress', 'Inspection Scheduled', 'Work Underway', 'Pending Review'].includes(c.status)
  ).length;
  const resolvedCount = userComplaints.filter(
    (c) => ['Resolved', 'Closed'].includes(c.status)
  ).length;

  const recentComplaints = userComplaints.slice(0, 2);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div id="screen-home-dashboard" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[820px] transition-colors font-sans pb-12">
      {/* 1. Welcoming Hero Header */}
      <section className="px-5 sm:px-8 pt-7 pb-5 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-[13px] font-medium text-[#6E6E73] dark:text-[#86868B] block">
              {getGreeting()}{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}
            </span>
            <h1 className="text-[26px] sm:text-[32px] font-bold text-[#1D1D1F] dark:text-white tracking-tight leading-tight mt-0.5">
              Your city, connected.
            </h1>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1D1D1F] text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Admin HQ
            </button>
          )}
        </div>

        <p className="text-[15px] text-[#6E6E73] dark:text-[#86868B] max-w-xl leading-relaxed">
          Access municipal services, check public transit, and stay informed with real-time updates across Mumbai & Thane.
        </p>

        {/* Primary and Secondary Call to Action Buttons */}
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          <button
            onClick={() => onNavigate('complaints')}
            className="px-5 py-2.5 rounded-[14px] bg-[#007AFF] hover:bg-[#0062CC] text-white text-[14px] font-semibold transition-all shadow-xs flex items-center gap-2 active:scale-[0.98]"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Report an Issue</span>
          </button>

          <button
            onClick={() => onNavigate('services')}
            className="px-5 py-2.5 rounded-[14px] bg-white dark:bg-[#1C1C1E] hover:bg-[#E5E5EA]/60 dark:hover:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white text-[14px] font-semibold transition-all border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-xs active:scale-[0.98]"
          >
            <span>Explore City Services</span>
          </button>
        </div>

        {/* Clean Search Bar */}
        <div className="mt-5">
          <GlobalSearchBar onNavigate={onNavigate} />
        </div>
      </section>

      {/* Main Page Container */}
      <div className="px-5 sm:px-8 max-w-4xl mx-auto w-full space-y-7">
        {/* 2. Quick Actions Grid */}
        <section aria-labelledby="quick-actions-heading">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 id="quick-actions-heading" className="text-[17px] sm:text-[19px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
              Quick Actions
            </h2>
            <button
              onClick={() => onNavigate('services')}
              className="text-[13px] font-medium text-[#007AFF] hover:underline"
            >
              View all services
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Card 1: Report a Pothole */}
            <button
              onClick={() => onNavigate('complaints')}
              className="p-4 bg-white dark:bg-[#1C1C1E] hover:bg-[#F9F9FB] dark:hover:bg-[#252528] rounded-[18px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left transition-all group flex flex-col justify-between h-[126px]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center transition-transform group-hover:scale-105">
                <AlertCircle className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                  Report Pothole
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                  Road grievance
                </div>
              </div>
            </button>

            {/* Card 2: Find Public Transport */}
            <button
              onClick={() => onNavigate('train-info')}
              className="p-4 bg-white dark:bg-[#1C1C1E] hover:bg-[#F9F9FB] dark:hover:bg-[#252528] rounded-[18px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left transition-all group flex flex-col justify-between h-[126px]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center transition-transform group-hover:scale-105">
                <Train className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                  Train & Rail
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                  IRCTC & locals
                </div>
              </div>
            </button>

            {/* Card 3: Find Parking */}
            <button
              onClick={() => onNavigate('parking')}
              className="p-4 bg-white dark:bg-[#1C1C1E] hover:bg-[#F9F9FB] dark:hover:bg-[#252528] rounded-[18px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left transition-all group flex flex-col justify-between h-[126px]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center transition-transform group-hover:scale-105">
                <Car className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                  Find Parking
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                  Live bay vacancy
                </div>
              </div>
            </button>

            {/* Card 4: Locate Public Toilets / Civic Map */}
            <button
              onClick={() => onNavigate('map')}
              className="p-4 bg-white dark:bg-[#1C1C1E] hover:bg-[#F9F9FB] dark:hover:bg-[#252528] rounded-[18px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left transition-all group flex flex-col justify-between h-[126px]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center transition-transform group-hover:scale-105">
                <MapPin className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                  Civic Map
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                  Toilets & hubs
                </div>
              </div>
            </button>

            {/* Card 5: Garbage Collection */}
            <button
              onClick={() => onNavigate('complaints')}
              className="p-4 bg-white dark:bg-[#1C1C1E] hover:bg-[#F9F9FB] dark:hover:bg-[#252528] rounded-[18px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left transition-all group flex flex-col justify-between h-[126px]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center transition-transform group-hover:scale-105">
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                  Waste Pickup
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                  Collection status
                </div>
              </div>
            </button>

            {/* Card 6: Find Blood Donors */}
            <button
              onClick={() => onNavigate('blood-donation')}
              className="p-4 bg-white dark:bg-[#1C1C1E] hover:bg-[#F9F9FB] dark:hover:bg-[#252528] rounded-[18px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left transition-all group flex flex-col justify-between h-[126px]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#FF2D55]/10 text-[#FF2D55] flex items-center justify-center transition-transform group-hover:scale-105">
                <HeartPulse className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                  Blood Donors
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                  Emergency aid
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* 3. City Overview (Compact, Clear Summary Cards) */}
        <section aria-labelledby="city-overview-heading">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 id="city-overview-heading" className="text-[17px] sm:text-[19px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
              City Overview
            </h2>
            <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
              Mumbai · Thane
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Weather & AQI Summary Card */}
            <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#86868B] text-[12px] font-medium">
                <span>Weather & Air</span>
                <Sun className="w-4 h-4 text-[#FF9500]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                  28°C
                </span>
                <span className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                  Sunny
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#E5E5EA]/60 dark:border-[#2C2C2E]/60 flex items-center justify-between text-[12px]">
                <span className="text-[#6E6E73] dark:text-[#86868B]">Air Quality</span>
                <span className="font-semibold text-[#34C759]">AQI 54 · Good</span>
              </div>
            </div>

            {/* Public Transport Live Status */}
            <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#86868B] text-[12px] font-medium">
                <span>Suburban Rail</span>
                <Train className="w-4 h-4 text-[#007AFF]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                  Normal
                </span>
                <span className="text-[13px] text-[#34C759] font-medium">
                  On Time
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#E5E5EA]/60 dark:border-[#2C2C2E]/60 flex items-center justify-between text-[12px]">
                <span className="text-[#6E6E73] dark:text-[#86868B]">Central & Western</span>
                <button
                  onClick={() => onNavigate('train-info')}
                  className="font-medium text-[#007AFF] hover:underline"
                >
                  Timetable →
                </button>
              </div>
            </div>

            {/* Municipal SLA & Cleanliness */}
            <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#86868B] text-[12px] font-medium">
                <span>Civic Health</span>
                <Activity className="w-4 h-4 text-[#5856D6]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                  88%
                </span>
                <span className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                  Resolution Rate
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#E5E5EA]/60 dark:border-[#2C2C2E]/60 flex items-center justify-between text-[12px]">
                <span className="text-[#6E6E73] dark:text-[#86868B]">Ward 04 Majiwada</span>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="font-medium text-[#007AFF] hover:underline"
                >
                  Ward Score →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Civic Announcements (Clean card, no scrolling terminal) */}
        <section aria-labelledby="announcements-heading">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 id="announcements-heading" className="text-[17px] sm:text-[19px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
              Civic Announcements
            </h2>
            <button
              onClick={() => onNavigate('community')}
              className="text-[13px] font-medium text-[#007AFF] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[12px] font-semibold text-[#007AFF] uppercase tracking-wider">
                  Transport · Central Railway
                </div>
                <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white leading-snug">
                  Sunday Mega Block on Thane–Kalyan Slow Lines
                </h3>
                <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed pt-0.5">
                  Scheduled track maintenance from 11:00 AM to 4:00 PM. Slow trains diverted to fast tracks between Mulund and Kalyan.
                </p>
                <div className="text-[12px] text-[#86868B] pt-1">
                  Published Today, 8:00 AM · TMC & Railway Board
                </div>
              </div>

              <button
                onClick={() => onNavigate('train-info')}
                className="px-3.5 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white text-[13px] font-medium transition-colors shrink-0"
              >
                View details
              </button>
            </div>
          </div>
        </section>

        {/* 5. Daily Civic Tip Card */}
        <section aria-labelledby="daily-tip-heading">
          <DailyCivicTipCard onNavigate={onNavigate} onOpenAIChat={onOpenAIChat} />
        </section>

        {/* 6. Complaint Tracking Summary */}
        <section aria-labelledby="complaints-summary-heading">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 id="complaints-summary-heading" className="text-[17px] sm:text-[19px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
              My Civic Reports
            </h2>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-[13px] font-medium text-[#007AFF] hover:underline"
            >
              View all complaints
            </button>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            {/* 3 Metric Counts */}
            <div className="grid grid-cols-3 divide-x divide-[#E5E5EA] dark:divide-[#2C2C2E] text-center py-1">
              <div>
                <div className="text-[22px] font-bold text-[#1D1D1F] dark:text-white">
                  {submittedCount}
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] font-medium mt-0.5">
                  Submitted
                </div>
              </div>
              <div>
                <div className="text-[22px] font-bold text-[#FF9500]">
                  {inProgressCount}
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] font-medium mt-0.5">
                  In Progress
                </div>
              </div>
              <div>
                <div className="text-[22px] font-bold text-[#34C759]">
                  {resolvedCount}
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] font-medium mt-0.5">
                  Resolved
                </div>
              </div>
            </div>

            {/* Recent complaints list */}
            {recentComplaints.length > 0 ? (
              <div className="pt-2 border-t border-[#E5E5EA]/80 dark:border-[#2C2C2E]/80 divide-y divide-[#E5E5EA]/60 dark:divide-[#2C2C2E]/60">
                {recentComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onNavigate('complaints')}
                    className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F5F5F7]/60 dark:hover:bg-[#2C2C2E]/40 px-2 rounded-xl transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium text-[#1D1D1F] dark:text-white truncate">
                        {c.title}
                      </div>
                      <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 flex items-center gap-2">
                        <span>{c.category}</span>
                        <span>·</span>
                        <span>{c.ward || 'Ward 04'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] font-semibold text-[#007AFF]">
                        {c.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-[13px] text-[#86868B]">
                No recent issues reported. Everything looks clear!
              </div>
            )}
          </div>
        </section>

        {/* 7. Community Activity / Citizen Initiatives */}
        <section aria-labelledby="community-activity-heading">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 id="community-activity-heading" className="text-[17px] sm:text-[19px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
              Community Initiatives
            </h2>
            <button
              onClick={() => onNavigate('community')}
              className="text-[13px] font-medium text-[#007AFF] hover:underline"
            >
              View community activities
            </button>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-5 border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[12px] font-semibold text-[#34C759] uppercase tracking-wider">
                Volunteering Drive
              </span>
              <h3 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
                Upvan Lake Clean-up & Mangrove Care
              </h3>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                Join 45 fellow citizens this Saturday morning at 7:30 AM. Gloves & kits provided.
              </p>
            </div>
            <button
              onClick={() => onNavigate('volunteer-events')}
              className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold hover:bg-[#0062CC] transition-colors shrink-0"
            >
              Participate
            </button>
          </div>
        </section>

        {/* 8. Citizen Support Helpdesk */}
        <div className="bg-[#E5E5EA]/40 dark:bg-[#1C1C1E]/50 rounded-[20px] p-4 flex items-center justify-between gap-3 text-[13px] text-[#6E6E73] dark:text-[#86868B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#007AFF] shrink-0" />
            <span>24/7 Municipal Helpline: <strong>1916</strong> (Disaster & Civic Emergencies)</span>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-[12px] font-medium text-[#007AFF] hover:underline shrink-0"
          >
            Emergency Directory →
          </button>
        </div>
      </div>
    </div>
  );
}
