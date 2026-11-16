import { TrafficSegment, TrafficIncident, CityTrafficOverview, TrafficCongestionLevel } from '../types';

export const INITIAL_TRAFFIC_SEGMENTS: TrafficSegment[] = [
  {
    id: 'seg-eeh-north',
    name: 'Eastern Express Highway (Northbound)',
    roadName: 'Eastern Express Highway',
    stretch: 'Mulund Toll Naka → Teen Hath Naka → Majiwada Flyover',
    roadType: 'expressway',
    congestion: 'heavy',
    currentSpeedKmH: 18,
    freeFlowSpeedKmH: 60,
    delayMinutes: 16,
    advisory: 'Heavy slow-moving commuter flow approaching Majiwada flyover junction.',
    lengthKm: 4.8,
    lastUpdated: 'Just now',
    coordinates: [
      [19.176, 72.956],
      [19.182, 72.959],
      [19.1885, 72.962],
      [19.195, 72.969],
      [19.201, 72.973],
      [19.2085, 72.9815],
    ],
  },
  {
    id: 'seg-eeh-south',
    name: 'Eastern Express Highway (Southbound)',
    roadName: 'Eastern Express Highway',
    stretch: 'Majiwada → Teen Hath Naka → Mulund → Vikhroli',
    roadType: 'expressway',
    congestion: 'moderate',
    currentSpeedKmH: 36,
    freeFlowSpeedKmH: 60,
    delayMinutes: 7,
    advisory: 'Steady vehicular flow with minor signal queue at Teen Hath Naka.',
    lengthKm: 8.2,
    lastUpdated: 'Just now',
    coordinates: [
      [19.2085, 72.9815],
      [19.201, 72.973],
      [19.195, 72.969],
      [19.1885, 72.962],
      [19.176, 72.956],
      [19.155, 72.945],
      [19.135, 72.932],
      [19.108, 72.923],
    ],
  },
  {
    id: 'seg-ghodbunder-1',
    name: 'Ghodbunder Road (Corridor 1)',
    roadName: 'Ghodbunder Road (SH 42)',
    stretch: 'Majiwada Junction → Kapurbawdi → Manpada → Brahmand',
    roadType: 'highway',
    congestion: 'severe',
    currentSpeedKmH: 9,
    freeFlowSpeedKmH: 50,
    delayMinutes: 28,
    advisory: 'Severe congestion due to heavy freight trucks & Metro Line 4 construction works near Kapurbawdi.',
    lengthKm: 4.5,
    lastUpdated: 'Just now',
    coordinates: [
      [19.2085, 72.9815],
      [19.213, 72.9825],
      [19.2173, 72.984],
      [19.224, 72.982],
      [19.231, 72.979],
      [19.238, 72.980],
      [19.2435, 72.9805],
    ],
  },
  {
    id: 'seg-ghodbunder-2',
    name: 'Ghodbunder Road (Corridor 2)',
    roadName: 'Ghodbunder Road (SH 42)',
    stretch: 'Brahmand → Waghbil → Kasarvadavali → Gaimukh Ghat',
    roadType: 'highway',
    congestion: 'moderate',
    currentSpeedKmH: 34,
    freeFlowSpeedKmH: 55,
    delayMinutes: 9,
    advisory: 'Moderate traffic. Slow on curves approaching Gaimukh Octroi bypass.',
    lengthKm: 6.8,
    lastUpdated: 'Just now',
    coordinates: [
      [19.2435, 72.9805],
      [19.255, 72.977],
      [19.263, 72.974],
      [19.272, 72.971],
      [19.285, 72.960],
      [19.298, 72.946],
    ],
  },
  {
    id: 'seg-mumbai-nashik',
    name: 'Mumbai - Nashik Expressway (NH 160)',
    roadName: 'Mumbai - Nashik Highway',
    stretch: 'Majiwada Flyover → Saket → Kharegaon Toll → Bhiwandi Bypass',
    roadType: 'expressway',
    congestion: 'heavy',
    currentSpeedKmH: 15,
    freeFlowSpeedKmH: 65,
    delayMinutes: 22,
    advisory: 'Bottleneck at Kharegaon Toll plaza due to multi-axle freight vehicles.',
    lengthKm: 5.9,
    lastUpdated: 'Just now',
    coordinates: [
      [19.2085, 72.9815],
      [19.214, 72.991],
      [19.218, 73.001],
      [19.215, 73.013],
      [19.212, 73.023],
      [19.219, 73.045],
    ],
  },
  {
    id: 'seg-thane-belapur',
    name: 'Thane - Belapur Industrial Road',
    roadName: 'Thane - Belapur Road',
    stretch: 'Kalwa Bridge → Vitawa → Airoli Junction → Rabale',
    roadType: 'arterial',
    congestion: 'smooth',
    currentSpeedKmH: 48,
    freeFlowSpeedKmH: 55,
    delayMinutes: 2,
    advisory: 'Free flow conditions on Kalwa bypass and Airoli IT corridor.',
    lengthKm: 6.4,
    lastUpdated: 'Just now',
    coordinates: [
      [19.196, 72.991],
      [19.186, 72.994],
      [19.168, 72.996],
      [19.152, 73.002],
      [19.135, 73.007],
    ],
  },
  {
    id: 'seg-pokhran-2',
    name: 'Pokhran Road No. 2 (Green Corridor)',
    roadName: 'Pokhran Road 2',
    stretch: 'Majiwada → Gandhi Nagar → Gladys Alwares Rd → Upvan Lake',
    roadType: 'arterial',
    congestion: 'smooth',
    currentSpeedKmH: 38,
    freeFlowSpeedKmH: 45,
    delayMinutes: 1,
    advisory: 'Smooth traffic. Preferred scenic alternate to avoid Kapurbawdi.',
    lengthKm: 3.4,
    lastUpdated: 'Just now',
    coordinates: [
      [19.2085, 72.9815],
      [19.212, 72.974],
      [19.216, 72.969],
      [19.2198, 72.9642],
    ],
  },
  {
    id: 'seg-pokhran-1',
    name: 'Pokhran Road No. 1 (Naupada - Vartak Nagar)',
    roadName: 'Pokhran Road 1',
    stretch: 'Cadbury Junction → Shivai Nagar → Upvan Lake Foot',
    roadType: 'arterial',
    congestion: 'moderate',
    currentSpeedKmH: 26,
    freeFlowSpeedKmH: 40,
    delayMinutes: 5,
    advisory: 'Local school and market transit activity. Minor queue at Vartak Nagar.',
    lengthKm: 3.1,
    lastUpdated: 'Just now',
    coordinates: [
      [19.201, 72.973],
      [19.207, 72.967],
      [19.214, 72.965],
      [19.2198, 72.9642],
    ],
  },
  {
    id: 'seg-lbs-marg',
    name: 'LBS Marg (Thane West Section)',
    roadName: 'Lal Bahadur Shastri Marg',
    stretch: 'Mulund Check Naka → Teen Hath Naka → Station Road → Jambli Naka',
    roadType: 'arterial',
    congestion: 'heavy',
    currentSpeedKmH: 14,
    freeFlowSpeedKmH: 40,
    delayMinutes: 18,
    advisory: 'Dense city market traffic & auto-rickshaw queue near Thane Station West.',
    lengthKm: 3.6,
    lastUpdated: 'Just now',
    coordinates: [
      [19.176, 72.956],
      [19.182, 72.961],
      [19.186, 72.971],
      [19.186, 72.9759],
      [19.192, 72.980],
    ],
  },
  {
    id: 'seg-bkc-connector',
    name: 'BKC Elevated Connector & G-Block',
    roadName: 'BKC Connector',
    stretch: 'EEH Chunabhatti → BKC Flyover → Jio World Centre',
    roadType: 'connector',
    congestion: 'moderate',
    currentSpeedKmH: 32,
    freeFlowSpeedKmH: 50,
    delayMinutes: 8,
    advisory: 'Commercial corporate peak entry queue at BKC financial district.',
    lengthKm: 3.2,
    lastUpdated: 'Just now',
    coordinates: [
      [19.055, 72.885],
      [19.059, 72.875],
      [19.066, 72.868],
      [19.068, 72.862],
    ],
  },
  {
    id: 'seg-weh-suburban',
    name: 'Western Express Highway (Suburban Arterial)',
    roadName: 'Western Express Highway',
    stretch: 'Bandra → Airport Junction → Andheri → Goregaon Flyover',
    roadType: 'expressway',
    congestion: 'heavy',
    currentSpeedKmH: 21,
    freeFlowSpeedKmH: 60,
    delayMinutes: 19,
    advisory: 'Peak commuter stream towards international airport terminal and Andheri hub.',
    lengthKm: 12.0,
    lastUpdated: 'Just now',
    coordinates: [
      [19.06, 72.842],
      [19.085, 72.852],
      [19.119, 72.856],
      [19.145, 72.857],
      [19.163, 72.858],
    ],
  },
];

export const INITIAL_TRAFFIC_INCIDENTS: TrafficIncident[] = [
  {
    id: 'inc-1',
    roadName: 'Ghodbunder Road',
    title: 'Kapurbawdi Flyover Merge Restriction',
    lat: 19.2173,
    lng: 72.984,
    type: 'roadwork',
    severity: 'high',
    description: 'Metro Line 4 girder placement causing slow lane restriction in northbound carriageway.',
    impact: '+22 min delay on Ghodbunder corridor',
    delayMinutes: 22,
    reportedAgo: '12m ago',
  },
  {
    id: 'inc-2',
    roadName: 'Mumbai - Nashik Expressway',
    title: 'Kharegaon Toll Plaza Truck Queuing',
    lat: 19.212,
    lng: 73.023,
    type: 'congestion',
    severity: 'high',
    description: 'Heavy multi-axle commercial vehicle backlog at FASTag automated lanes.',
    impact: '+18 min delay towards Bhiwandi',
    delayMinutes: 18,
    reportedAgo: '25m ago',
  },
  {
    id: 'inc-3',
    roadName: 'Eastern Express Highway',
    title: 'Teen Hath Naka Signal Delay',
    lat: 19.1885,
    lng: 72.962,
    type: 'congestion',
    severity: 'moderate',
    description: 'Suburban signal cycle synchronization creating queue on north approach.',
    impact: '+10 min delay towards Majiwada',
    delayMinutes: 10,
    reportedAgo: '8m ago',
  },
  {
    id: 'inc-4',
    roadName: 'Thane Railway Station West',
    title: 'Auto-Rickshaw Stand Bottleneck',
    lat: 19.186,
    lng: 72.9759,
    type: 'stall',
    severity: 'moderate',
    description: 'High commuter interchange volume on local feeder lanes.',
    impact: '+8 min delay around station area',
    delayMinutes: 8,
    reportedAgo: '15m ago',
  },
];

export const CONGESTION_CONFIG: Record<
  TrafficCongestionLevel,
  {
    label: string;
    color: string;
    darkColor: string;
    casingColor: string;
    bgBadge: string;
    textBadge: string;
    dashArray?: string;
  }
> = {
  smooth: {
    label: 'Smooth Flow',
    color: '#34C759',
    darkColor: '#30D158',
    casingColor: '#0E3B16',
    bgBadge: 'bg-[#34C759]/15',
    textBadge: 'text-[#34C759]',
  },
  moderate: {
    label: 'Moderate Traffic',
    color: '#FF9500',
    darkColor: '#FF9F0A',
    casingColor: '#4A2600',
    bgBadge: 'bg-[#FF9500]/15',
    textBadge: 'text-[#FF9500]',
  },
  heavy: {
    label: 'Heavy Congestion',
    color: '#FF3B30',
    darkColor: '#FF453A',
    casingColor: '#4A0804',
    bgBadge: 'bg-[#FF3B30]/15',
    textBadge: 'text-[#FF3B30]',
  },
  severe: {
    label: 'Severe Gridlock',
    color: '#990000',
    darkColor: '#B00020',
    casingColor: '#2B0000',
    bgBadge: 'bg-[#990000]/20',
    textBadge: 'text-[#990000] dark:text-[#FF6961]',
    dashArray: '8, 6',
  },
};

/**
 * Computes live city traffic stats from the current segments
 */
export function computeTrafficOverview(segments: TrafficSegment[]): CityTrafficOverview {
  if (segments.length === 0) {
    return {
      congestionIndex: 35,
      overallStatus: 'Moderate',
      averageSpeedKmH: 35,
      activeBottlenecks: 0,
      totalDelayedMinutes: 0,
      lastSyncTime: 'Live',
    };
  }

  const totalSpeed = segments.reduce((sum, s) => sum + s.currentSpeedKmH, 0);
  const avgSpeed = Math.round(totalSpeed / segments.length);
  const totalDelay = segments.reduce((sum, s) => sum + s.delayMinutes, 0);

  const heavyOrSevereCount = segments.filter(
    (s) => s.congestion === 'heavy' || s.congestion === 'severe'
  ).length;

  // Congestion index calculation (higher is more congested)
  const congestionScore = Math.min(
    95,
    Math.max(
      15,
      Math.round(
        (heavyOrSevereCount / segments.length) * 60 +
          (totalDelay / (segments.length * 15)) * 40
      )
    )
  );

  let overallStatus: CityTrafficOverview['overallStatus'] = 'Fluid';
  if (congestionScore >= 75) overallStatus = 'Gridlock';
  else if (congestionScore >= 55) overallStatus = 'Heavy Congestion';
  else if (congestionScore >= 35) overallStatus = 'Moderate';

  return {
    congestionIndex: congestionScore,
    overallStatus,
    averageSpeedKmH: avgSpeed,
    activeBottlenecks: heavyOrSevereCount,
    totalDelayedMinutes: totalDelay,
    lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

/**
 * Simulates real-time live sensor updates with subtle jitter
 */
export function simulateTrafficShift(segments: TrafficSegment[]): TrafficSegment[] {
  return segments.map((seg) => {
    // 25% chance of shifting speed slightly (+/- 2-5 km/h)
    const delta = Math.floor(Math.random() * 7) - 3;
    const newSpeed = Math.max(5, Math.min(seg.freeFlowSpeedKmH, seg.currentSpeedKmH + delta));
    
    // Recalculate congestion
    let newCongestion: TrafficCongestionLevel = 'smooth';
    const ratio = newSpeed / seg.freeFlowSpeedKmH;
    if (ratio < 0.25) newCongestion = 'severe';
    else if (ratio < 0.45) newCongestion = 'heavy';
    else if (ratio < 0.75) newCongestion = 'moderate';
    else newCongestion = 'smooth';

    const delayRatio = Math.max(0, 1 - ratio);
    const newDelay = Math.round(delayRatio * 32);

    return {
      ...seg,
      currentSpeedKmH: newSpeed,
      congestion: newCongestion,
      delayMinutes: newDelay,
      lastUpdated: 'Updated seconds ago',
    };
  });
}
