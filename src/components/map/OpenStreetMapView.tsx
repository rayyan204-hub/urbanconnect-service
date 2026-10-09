import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint, VolunteerEvent } from '../../types';
import { Layers, Navigation, AlertTriangle, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface OpenStreetMapViewProps {
  complaints?: Complaint[];
  events?: VolunteerEvent[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectEvent?: (event: VolunteerEvent) => void;
}

export function OpenStreetMapView({
  complaints = [],
  events = [],
  centerLat = 19.2085,
  centerLng = 72.9815,
  zoom = 13,
  onSelectComplaint,
  onSelectEvent,
}: OpenStreetMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'complaints' | 'events'>('all');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return '#059669'; // Emerald
      case 'In Progress':
        return '#0d9488'; // Teal
      case 'Under Review':
        return '#2563eb'; // Blue
      default:
        return '#d97706'; // Amber
    }
  };

  const createComplaintIcon = (status: string) => {
    const color = getStatusColor(status);
    return L.divIcon({
      className: 'complaint-map-marker',
      html: `
        <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
          <div style="background-color: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createEventIcon = () => {
    return L.divIcon({
      className: 'event-map-marker',
      html: `
        <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
          <div style="background-color: #4f46e5; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4); border: 2.5px solid white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      className: 'user-loc-marker',
      html: `
        <div style="transform: translate(-50%, -50%);">
          <div style="background-color: #0284c7; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 6px rgba(2, 132, 199, 0.35);"></div>
        </div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers whenever complaints, events, or filterType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layer markers (except base tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add user marker if known
    if (
      userPos &&
      typeof userPos.lat === 'number' &&
      typeof userPos.lng === 'number' &&
      !isNaN(userPos.lat) &&
      !isNaN(userPos.lng)
    ) {
      L.marker([userPos.lat, userPos.lng], { icon: createUserIcon() })
        .bindPopup(`<strong>Your Current Location</strong>`)
        .addTo(map);
    }

    // Add complaints
    if (filterType === 'all' || filterType === 'complaints') {
      complaints.forEach((comp) => {
        const rawLat = comp.latitude ?? (comp as any).lat;
        const rawLng = comp.longitude ?? (comp as any).lng;
        const lat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : 19.2085;
        const lng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 72.9815;

        const marker = L.marker([lat, lng], {
          icon: createComplaintIcon(comp.status),
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width: 170px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; color: #64748b;">${comp.ticketId}</span>
              <span style="font-size: 10px; font-weight: 700; color: ${getStatusColor(comp.status)}; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${comp.status}</span>
            </div>
            <strong style="font-size: 12px; color: #0f172a; display: block; line-height: 1.25; margin-bottom: 4px;">${comp.title}</strong>
            <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.3;">${comp.location}</p>
            <div style="font-size: 10px; color: #0f766e; font-weight: 600;">${comp.department}</div>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectComplaint) onSelectComplaint(comp);
        });
      });
    }

    // Add events
    if (filterType === 'all' || filterType === 'events') {
      events.forEach((evt) => {
        const rawLat = evt.latitude ?? (evt as any).lat;
        const rawLng = evt.longitude ?? (evt as any).lng;
        const lat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : 19.2198;
        const lng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 72.9642;

        const marker = L.marker([lat, lng], {
          icon: createEventIcon(),
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width: 180px; font-family: sans-serif;">
            <span style="font-size: 10px; font-weight: 700; color: #4f46e5; text-transform: uppercase;">Volunteer Drive</span>
            <strong style="font-size: 12px; color: #0f172a; display: block; margin: 2px 0 4px 0;">${evt.title}</strong>
            <p style="font-size: 11px; color: #475569; margin: 0 0 4px 0;">${evt.date} • ${evt.time}</p>
            <div style="font-size: 10px; color: #64748b;">${evt.location}</div>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectEvent) onSelectEvent(evt);
        });
      });
    }
  }, [complaints, events, filterType, userPos]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords?.latitude;
        const longitude = pos.coords?.longitude;
        if (
          typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          !isNaN(latitude) &&
          !isNaN(longitude)
        ) {
          setUserPos({ lat: latitude, lng: longitude });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15, { animate: true });
          }
        }
      },
      () => {
        // Geolocation error handled silently
      }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[300px] flex flex-col bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Map Filter Controls Bar */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
            filterType === 'all'
              ? 'bg-teal-700 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({complaints.length + events.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('complaints')}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
            filterType === 'complaints'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Complaints ({complaints.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterType('events')}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
            filterType === 'events'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>Events ({events.length})</span>
        </button>
      </div>

      {/* Locate Me Floating Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        title="Find My Location"
        className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Navigation className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      </button>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] flex-1 z-0" />

      {/* Legend Footer */}
      <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Pending</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
            <span>In Progress</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>Resolved</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span>Volunteer</span>
          </span>
        </div>
        <span className="font-mono text-[9px] text-slate-400">OpenStreetMap Free Tile</span>
      </div>
    </div>
  );
}
