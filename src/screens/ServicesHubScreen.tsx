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
} from 'lucide-react';

interface ServicesHubScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function ServicesHubScreen({ onNavigate, currentUser }: ServicesHubScreenProps) {
  const serviceCategories = [
    {
      name: 'Public Transit & Mobility',
      items: [
        {
          id: 'bus-info' as ScreenId,
          title: 'Bus Transit & Timetable',
          subtitle: 'Live line schedules, stops and contactless ticketing',
          icon: Bus,
          color: 'bg-cyan-100 text-cyan-800',
        },
        {
          id: 'train-info' as ScreenId,
          title: 'Train & Metro Schedules',
          subtitle: 'Grand Central terminal platform and live boarding alerts',
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
          title: 'Community Announcements',
          subtitle: 'Civic notices, neighborhood discussions and polls',
          icon: MessageSquare,
          color: 'bg-teal-100 text-teal-800',
        },
        {
          id: 'lost-found' as ScreenId,
          title: 'Lost & Found Registry',
          subtitle: 'Report lost belongings, pets, or claim found items',
          icon: SearchCode,
          color: 'bg-amber-100 text-amber-800',
        },
        {
          id: 'blood-donation' as ScreenId,
          title: 'Emergency Blood Donors',
          subtitle: 'Match donors with urgent hospital requests',
          icon: HeartPulse,
          color: 'bg-rose-100 text-rose-800',
        },
        {
          id: 'volunteer-events' as ScreenId,
          title: 'Volunteer Initiatives',
          subtitle: 'Join environmental cleanups and senior literacy programs',
          icon: HandHeart,
          color: 'bg-emerald-100 text-emerald-800',
        },
      ],
    },
    {
      name: 'Municipal Governance',
      items: [
        {
          id: 'complaints' as ScreenId,
          title: 'Grievance & Complaint Tracking',
          subtitle: 'Report road potholes, broken lights, and water issues',
          icon: AlertOctagon,
          color: 'bg-orange-100 text-orange-800',
        },
      ],
    },
  ];

  return (
    <div id="screen-services-hub" className="flex-1 flex flex-col bg-slate-50 min-h-[780px]">
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
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
              {group.name}
            </h4>
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors flex-shrink-0" />
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
