import { ScreenId, UserProfile } from '../types';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  MessageSquare,
  SearchCode,
  HeartPulse,
  HandHeart,
  Bus,
  Train,
  AlertOctagon,
  ChevronRight,
  Sparkles,
  MapPin,
  Car,
  Navigation,
  Activity,
  ShieldCheck,
} from 'lucide-react';

interface ServicesHubScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function ServicesHubScreen({ onNavigate, currentUser }: ServicesHubScreenProps) {
  const serviceCategories = [
    {
      name: 'Smart City & Spatial Telemetry',
      items: [
        {
          id: 'map' as ScreenId,
          title: 'Unified Civic Map (OpenStreetMap)',
          subtitle: 'Interactive multi-layer GIS with Grievances, Parking availability, and Transit hubs',
          icon: MapPin,
          color: 'bg-teal-100 text-teal-800',
        },
        {
          id: 'parking' as ScreenId,
          title: 'Smart Parking Desk',
          subtitle: 'Live multi-level lot vacancy, hourly rates, EV charging and instant slot booking',
          icon: Car,
          color: 'bg-blue-100 text-blue-800',
        },
        {
          id: 'analytics' as ScreenId,
          title: 'Civic Analytics & Ward Index',
          subtitle: 'Ward performance scores (Roads, Waste, Water, Drainage) and citizen leaderboard',
          icon: Activity,
          color: 'bg-purple-100 text-purple-800',
        },
      ],
    },
    {
      name: 'Public Transit & Mobility',
      items: [
        {
          id: 'journey-planner' as ScreenId,
          title: 'Multi-Modal Journey Planner',
          subtitle: 'Combined Central & Western locals, Metro 1/2A/7, and BEST/TMT bus routes with live delays',
          icon: Navigation,
          color: 'bg-indigo-100 text-indigo-800',
        },
        {
          id: 'bus-info' as ScreenId,
          title: 'TMT, BEST & NMMT Bus Transit',
          subtitle: 'Live line schedules, Ghodbunder corridor & contactless ticketing',
          icon: Bus,
          color: 'bg-cyan-100 text-cyan-800',
        },
        {
          id: 'train-info' as ScreenId,
          title: 'Mumbai Local Trains & Metro',
          subtitle: 'Central Railway suburban locals, Versova-Ghatkopar & Metro 2A/7 alerts',
          icon: Train,
          color: 'bg-indigo-100 text-indigo-800',
        },
      ],
    },
    {
      name: 'Community & Citizen Aid',
      items: [
        {
          id: 'community' as ScreenId,
          title: 'Civic & Community Announcements',
          subtitle: 'TMC & BMC notices, Yeoor Hills canopy drives & neighborhood discussions',
          icon: MessageSquare,
          color: 'bg-teal-100 text-teal-800',
        },
        {
          id: 'lost-found' as ScreenId,
          title: 'Lost & Found Registry',
          subtitle: 'Report lost belongings, pets, or claim items turned in across Thane & Mumbai transit',
          icon: SearchCode,
          color: 'bg-amber-100 text-amber-800',
        },
        {
          id: 'blood-donation' as ScreenId,
          title: 'Emergency Blood Donors Network',
          subtitle: 'Match donors with urgent Thane Civil, KEM & Jupiter Hospital requests',
          icon: HeartPulse,
          color: 'bg-rose-100 text-rose-800',
        },
        {
          id: 'volunteer-events' as ScreenId,
          title: 'Volunteer Initiatives',
          subtitle: 'Join Upvan Lake cleanup, SGNP seed sowing & DigiLocker workshops',
          icon: HandHeart,
          color: 'bg-emerald-100 text-emerald-800',
        },
      ],
    },
    {
      name: 'Municipal Governance & Admin',
      items: [
        {
          id: 'complaints' as ScreenId,
          title: 'TMC & BMC Grievance Tracking',
          subtitle: '8-stage complaint lifecycle, before/after evidence photos, and smart duplicate detection',
          icon: AlertOctagon,
          color: 'bg-orange-100 text-orange-800',
        },
        {
          id: 'admin' as ScreenId,
          title: 'Municipal Officer HQ & Dispatch',
          subtitle: 'Review incoming civic tickets, dispatch ward engineers, and manage public notices',
          icon: ShieldCheck,
          color: 'bg-slate-200 text-slate-800',
        },
      ],
    },
  ];

  return (
    <div id="screen-services-hub" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] transition-colors">
      <TopAppBar
        currentScreen="services"
        title="Urban Services Hub"
        subtitle="One-Stop Smart City Services Directory"
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      <div className="p-4 space-y-5 pb-8">
        <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-white p-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-teal-300 font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Civic Services Directory</span>
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">
            Access All Municipal Modules & Transit Feeds
          </h3>
          <p className="text-[11px] text-teal-100/90 mt-1">
            Prototype 1 UI navigation for community, transit, and civic desks.
          </p>
        </div>

        {serviceCategories.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
              {group.name}
            </h4>
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${item.color} dark:bg-slate-800 dark:text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
