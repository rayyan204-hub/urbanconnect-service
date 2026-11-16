import { ScreenId, UserProfile } from '../types';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  MapPin,
  Car,
  Activity,
  Navigation,
  Bus,
  Train,
  AlertCircle,
  HeartPulse,
  Users,
  Search,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ServicesHubScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function ServicesHubScreen({ onNavigate, currentUser }: ServicesHubScreenProps) {
  const serviceGroups = [
    {
      title: 'Civic Infrastructure & Reporting',
      items: [
        {
          id: 'complaints' as ScreenId,
          title: 'Report an Issue (Grievances)',
          description: 'Potholes, broken streetlights, water supply leaks & garbage dumps',
          icon: AlertCircle,
          iconColor: 'text-[#FF3B30]',
          iconBg: 'bg-[#FF3B30]/10',
        },
        {
          id: 'map' as ScreenId,
          title: 'City GIS Map',
          description: 'Interactive map of municipal amenities, parking, and live issues',
          icon: MapPin,
          iconColor: 'text-[#34C759]',
          iconBg: 'bg-[#34C759]/10',
        },
        {
          id: 'parking' as ScreenId,
          title: 'Smart Parking',
          description: 'Real-time multi-level parking vacancy and slot reservations',
          icon: Car,
          iconColor: 'text-[#5856D6]',
          iconBg: 'bg-[#5856D6]/10',
        },
        {
          id: 'analytics' as ScreenId,
          title: 'Civic Analytics & Ward Scores',
          description: 'Ward performance indices, resolution speeds & civic rankings',
          icon: Activity,
          iconColor: 'text-[#FF9500]',
          iconBg: 'bg-[#FF9500]/10',
        },
      ],
    },
    {
      title: 'Public Transit & Mobility',
      items: [
        {
          id: 'train-info' as ScreenId,
          title: 'Train & Rail Connect (IRCTC & Suburban)',
          description: 'Express reservations, live local platform indicator & UTS passes',
          icon: Train,
          iconColor: 'text-[#007AFF]',
          iconBg: 'bg-[#007AFF]/10',
        },
        {
          id: 'journey-planner' as ScreenId,
          title: 'Multi-Modal Trip Planner',
          description: 'Find optimal routes combining suburban local trains, metro & buses',
          icon: Navigation,
          iconColor: 'text-[#0A84FF]',
          iconBg: 'bg-[#0A84FF]/10',
        },
        {
          id: 'bus-info' as ScreenId,
          title: 'Bus Transit Timetables',
          description: 'Live BEST, TMT & NMMT routes, frequency and digital passes',
          icon: Bus,
          iconColor: 'text-[#30B0C7]',
          iconBg: 'bg-[#30B0C7]/10',
        },
      ],
    },
    {
      title: 'Community & Emergency Support',
      items: [
        {
          id: 'blood-donation' as ScreenId,
          title: 'Blood Donor Network',
          description: 'Connect with verified life-saving blood donors across Mumbai & Thane',
          icon: HeartPulse,
          iconColor: 'text-[#FF2D55]',
          iconBg: 'bg-[#FF2D55]/10',
        },
        {
          id: 'community' as ScreenId,
          title: 'Community Bulletin & News',
          description: 'Neighborhood discussions, ward updates & civic announcements',
          icon: Users,
          iconColor: 'text-[#007AFF]',
          iconBg: 'bg-[#007AFF]/10',
        },
        {
          id: 'volunteer-events' as ScreenId,
          title: 'Volunteer Initiatives',
          description: 'Community cleanup drives, tree planting & civic workshops',
          icon: Sparkles,
          iconColor: 'text-[#FF9500]',
          iconBg: 'bg-[#FF9500]/10',
        },
        {
          id: 'lost-found' as ScreenId,
          title: 'Lost & Found Directory',
          description: 'Report or recover lost citizen belongings in transit & public parks',
          icon: Search,
          iconColor: 'text-[#6E6E73]',
          iconBg: 'bg-[#E5E5EA]',
        },
      ],
    },
  ];

  return (
    <div id="screen-services-hub" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] transition-colors font-sans pb-12">
      <TopAppBar
        currentScreen="services"
        title="City Services"
        subtitle="Directory of municipal tools and resources"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      <div className="px-5 sm:px-8 py-6 max-w-4xl mx-auto w-full space-y-8">
        {serviceGroups.map((group) => (
          <section key={group.title} className="space-y-3">
            <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] px-1">
              {group.title}
            </h2>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] divide-y divide-[#E5E5EA]/70 dark:divide-[#2C2C2E]/70 overflow-hidden">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#F9F9FB] dark:hover:bg-[#252528] transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-[12px] ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white shrink-0 ml-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {currentUser?.role === 'admin' && (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-5 border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#1D1D1F] text-white dark:bg-white dark:text-black flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
                  Municipal Administrator HQ
                </div>
                <div className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                  Manage grievances, transit schedules & field officer assignments
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 rounded-full bg-[#1D1D1F] text-white dark:bg-white dark:text-black text-[13px] font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              Open Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
