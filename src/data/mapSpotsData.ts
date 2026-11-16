export interface BloodDonationSpot {
  id: string;
  name: string;
  spotType: 'Blood Bank' | 'Donation Camp' | 'Hospital Centre';
  address: string;
  ward: string;
  timings: string;
  urgentGroups: string[];
  contact: string;
  description: string;
  lat: number;
  lng: number;
}

export interface GarbagePickupSpot {
  id: string;
  name: string;
  pickupType: 'SWM Pickup Point' | 'Compactor Station' | 'Recyclables & E-Waste' | 'Organic Compost Hub';
  address: string;
  ward: string;
  schedule: string;
  wasteTypes: string;
  description: string;
  lat: number;
  lng: number;
}

export interface PotholeHazardSpot {
  id: string;
  name: string;
  roadStretch: string;
  severity: 'Severe' | 'Moderate';
  advisory: string;
  alternateRoute: string;
  delayMinutes: number;
  reportedDate: string;
  ward: string;
  lat: number;
  lng: number;
}

export const BLOOD_DONATION_SPOTS: BloodDonationSpot[] = [
  {
    id: 'bld-1',
    name: 'TMC Civil Hospital Blood Bank',
    spotType: 'Blood Bank',
    address: 'Tembi Naka, Thane West, 400601',
    ward: 'Naupada & Civil Precinct',
    timings: '24×7 Emergency & Walk-in Donation (09:00 AM – 08:00 PM)',
    urgentGroups: ['O-', 'A-', 'B+'],
    contact: '+91 22 2547 1409',
    description: 'Municipal blood bank & component separation centre with walk-in donor screening and rapid cross-matching.',
    lat: 19.1934,
    lng: 72.9762,
  },
  {
    id: 'bld-2',
    name: 'Jupiter Hospital Blood Centre',
    spotType: 'Hospital Centre',
    address: 'Eastern Express Hwy, Near Viviana Mall, Thane West',
    ward: 'Majiwada–Service Rd',
    timings: 'Daily 08:30 AM – 09:00 PM (24×7 Blood Issue)',
    urgentGroups: ['O+', 'AB-', 'Platelets'],
    contact: '+91 22 2172 5555',
    description: 'NABH-accredited apheresis & whole-blood donation centre with dedicated donor parking.',
    lat: 19.2089,
    lng: 72.9719,
  },
  {
    id: 'bld-3',
    name: 'Red Cross Naupada Blood Donation Camp',
    spotType: 'Donation Camp',
    address: 'Sahayog Mandir Hall, Ram Maruti Rd, Naupada, Thane West',
    ward: 'TMC Ward 4 - Naupada',
    timings: 'Daily 09:30 AM – 05:30 PM',
    urgentGroups: ['O+', 'B+', 'A+'],
    contact: '+91 22 2540 8821',
    description: 'Community blood donation camp & mobile van base supporting local thalassemia care drives.',
    lat: 19.1886,
    lng: 72.9708,
  },
  {
    id: 'bld-4',
    name: 'Mulund Civic Blood & Plasma Hub',
    spotType: 'Blood Bank',
    address: 'LBS Marg, Near R-Galleria, Mulund West, Mumbai',
    ward: 'BMC T-Ward - Mulund',
    timings: 'Mon–Sun 09:00 AM – 07:30 PM',
    urgentGroups: ['O-', 'B-'],
    contact: '+91 22 2564 3310',
    description: 'Regional voluntary blood collection unit serving Mulund, Bhandup, and Kopri corridors.',
    lat: 19.1726,
    lng: 72.9525,
  },
  {
    id: 'bld-5',
    name: 'KEM Hospital Blood Transfusion Centre',
    spotType: 'Hospital Centre',
    address: 'Acharya Donde Marg, Parel / Dadar East, Mumbai',
    ward: 'BMC F/South - Dadar Parel',
    timings: '24×7 Donor & Emergency Issue',
    urgentGroups: ['O-', 'AB+', 'A-'],
    contact: '+91 22 2410 7000',
    description: 'Major public hospital blood bank & plateletpheresis unit accessible from Dadar CR/WR stations.',
    lat: 19.0023,
    lng: 72.8421,
  },
  {
    id: 'bld-6',
    name: 'BKC Lifeline Mobile Blood Booth',
    spotType: 'Donation Camp',
    address: 'G-Block Civic Plaza, Bandra Kurla Complex, Mumbai',
    ward: 'BMC H/East - BKC',
    timings: 'Weekdays 10:00 AM – 06:00 PM',
    urgentGroups: ['A+', 'O+', 'B+'],
    contact: '+91 22 2659 4412',
    description: 'Corporate & commuter voluntary blood donation booth near BKC Aqua Line station.',
    lat: 19.0644,
    lng: 72.8669,
  },
];

export const GARBAGE_PICKUP_SPOTS: GarbagePickupSpot[] = [
  {
    id: 'garb-1',
    name: 'Majiwada Zero-Waste SWM Pickup Point',
    pickupType: 'SWM Pickup Point',
    address: 'Majiwada Naka Service Rd, Near Golden Dyes, Thane West',
    ward: 'TMC Ward 4 - Majiwada',
    schedule: 'Daily 06:30 AM – 10:30 AM & 05:30 PM – 08:30 PM',
    wasteTypes: 'Segregated Wet, Dry & Garden Waste',
    description: 'Primary municipal ghanta-gadi transfer & citizen segregated waste drop-off station.',
    lat: 19.2098,
    lng: 72.9801,
  },
  {
    id: 'garb-2',
    name: 'Naupada Smart Compactor & Pickup Bay',
    pickupType: 'Compactor Station',
    address: 'Gokhale Rd Cross Lane, Naupada, Thane West',
    ward: 'TMC Ward 4 - Naupada',
    schedule: 'Daily 07:00 AM – 11:30 AM & 06:00 PM – 09:00 PM',
    wasteTypes: 'Household Wet & Dry Waste (2-Bin)',
    description: 'Covered underground compactor bay with odour-control misting and morning pickup dispatch.',
    lat: 19.1904,
    lng: 72.9735,
  },
  {
    id: 'garb-3',
    name: 'Kapurbawdi Segregation & Bulk Pickup Hub',
    pickupType: 'SWM Pickup Point',
    address: 'Kapurbawdi Junction Service Lane, Thane West',
    ward: 'TMC Ward 5 - Kapurbawdi',
    schedule: 'Daily 06:45 AM – 11:00 AM',
    wasteTypes: 'Domestic, Packaging & Bulk Yard Waste',
    description: 'Assigned municipal solid waste pickup dock serving Balkum & Kapurbawdi residential clusters.',
    lat: 19.2149,
    lng: 72.9854,
  },
  {
    id: 'garb-4',
    name: 'Upvan Green Organic Composting Hub',
    pickupType: 'Organic Compost Hub',
    address: 'Upvan Lake Gate 2, Pokhran Rd 1, Thane West',
    ward: 'TMC Ward 3 - Vartak Nagar',
    schedule: 'Daily 07:30 AM – 06:00 PM',
    wasteTypes: 'Floral, Leaf Litter & Kitchen Wet Waste',
    description: 'Decentralized aerobic composting unit converting ward wet waste into municipal park manure.',
    lat: 19.2206,
    lng: 72.9661,
  },
  {
    id: 'garb-5',
    name: 'Dadar West Recyclables & E-Waste Spot',
    pickupType: 'Recyclables & E-Waste',
    address: 'Ranade Rd Municipal Kiosk, Near Shivaji Park, Dadar West',
    ward: 'BMC G/North - Dadar',
    schedule: 'Tue–Sun 09:00 AM – 07:00 PM',
    wasteTypes: 'Plastic, Paper, Batteries & Old Electronics',
    description: 'Authorized dry-waste & e-waste collection point issuing Civic Points for clean sorting.',
    lat: 19.0221,
    lng: 72.8398,
  },
  {
    id: 'garb-6',
    name: 'BKC Clean Corridor Sensor Bin Hub',
    pickupType: 'Recyclables & E-Waste',
    address: 'Bandra Kurla Complex Avenue 3, Near Metro Entry',
    ward: 'BMC H/East - BKC',
    schedule: 'Daily 06:00 AM – 10:00 PM (Auto-Dispatched)',
    wasteTypes: 'Dry Recyclables, PET Bottles & Commercial Waste',
    description: 'IoT fill-level monitored twin-bin pickup depot cleared every 4 hours during workdays.',
    lat: 19.0672,
    lng: 72.8648,
  },
];

export const POTHOLE_AVOID_SPOTS: PotholeHazardSpot[] = [
  {
    id: 'ph-1',
    name: 'Ghodbunder Rd Service Lane (Patlipada)',
    roadStretch: 'Patlipada to Kasarvadavali Northbound Service Lane',
    severity: 'Severe',
    advisory: 'Avoid taking this route — deep waterlogged potholes & uneven asphalt patches slowing two-wheelers and cars.',
    alternateRoute: 'Stay on Ghodbunder Main Flyover or take Pokhran Rd 2 via Upvan to bypass service lane.',
    delayMinutes: 25,
    reportedDate: 'Active Hazard · Today',
    ward: 'TMC Ward 2 - Patlipada',
    lat: 19.2435,
    lng: 72.9765,
  },
  {
    id: 'ph-2',
    name: 'JVLR Westbound Approach (Powai–IIT Stretch)',
    roadStretch: 'Jogeshwari–Vikhroli Link Rd near Powai Lake Filterpada',
    severity: 'Severe',
    advisory: 'Advised not to take this route — heavy pothole clusters causing bumper-to-bumper lane crawl.',
    alternateRoute: 'Divert via LBS Marg → Ghatkopar–Mankhurd Link Rd or take SCLR toward BKC.',
    delayMinutes: 30,
    reportedDate: 'Active Hazard · Today',
    ward: 'BMC S-Ward - Powai',
    lat: 19.1246,
    lng: 72.9058,
  },
  {
    id: 'ph-3',
    name: 'Thane–Belapur Rd Kalwa Naka Crossing',
    roadStretch: 'Kalwa Naka toward Vitawa Bridge Outer Lane',
    severity: 'Severe',
    advisory: 'Avoid this stretch during peak hours — cratered heavy-vehicle lane with sharp axle drop.',
    alternateRoute: 'Use Airoli–Mulund Link Rd or Eastern Express Hwy toward Kopri Bridge instead.',
    delayMinutes: 20,
    reportedDate: 'Active Hazard · Yesterday',
    ward: 'TMC Kalwa Ward',
    lat: 19.1962,
    lng: 72.9974,
  },
  {
    id: 'ph-4',
    name: 'Andheri East WEH Subway Approach',
    roadStretch: 'Andheri Kurla Rd / Western Express Hwy Slip Ramp',
    severity: 'Moderate',
    advisory: 'Avoid slip ramp — broken paver blocks and sunken manhole cover slowing station traffic.',
    alternateRoute: 'Take WEH Main Flyover directly or use SV Road / Metro Line 1 via Andheri.',
    delayMinutes: 15,
    reportedDate: 'Active Hazard · Today',
    ward: 'BMC K/East - Andheri',
    lat: 19.1154,
    lng: 72.8528,
  },
  {
    id: 'ph-5',
    name: 'Balkum–Kolshet Pipe Line Rd Junction',
    roadStretch: 'Kolshet Rd near Highland Park Turn',
    severity: 'Moderate',
    advisory: 'Caution / Avoid if low-clearance vehicle — utility trench excavation & loose gravel potholes.',
    alternateRoute: 'Use Kapurbawdi Flyover → Ghodbunder Main Carriageway or Pokhran Rd 2.',
    delayMinutes: 14,
    reportedDate: 'Active Hazard · 2 days ago',
    ward: 'TMC Ward 5 - Balkum',
    lat: 19.2248,
    lng: 72.9896,
  },
];

export const VOLUNTEER_EVENT_COORDS: Record<string, { lat: number; lng: number }> = {
  'evt-1': { lat: 19.2198, lng: 72.9642 }, // Upvan Lake Promenade, Yeoor Foothills, Thane
  'evt-2': { lat: 19.1889, lng: 72.9718 }, // Sahayog Mandir Hall, Ram Maruti Road, Naupada, Thane
  'evt-3': { lat: 19.1972, lng: 72.9985 }, // Kalwa Naka Community Depot, Thane Belapur Link
  'evt-4': { lat: 19.2335, lng: 72.9522 }, // SGNP / Yeoor Entrance, Thane West
};

export function resolveVolunteerCoords(eventId: string, location: string): { lat: number; lng: number } {
  if (VOLUNTEER_EVENT_COORDS[eventId]) {
    return VOLUNTEER_EVENT_COORDS[eventId];
  }
  const lower = (location || '').toLowerCase();
  if (lower.includes('upvan') || lower.includes('yeoor')) return { lat: 19.2198, lng: 72.9642 };
  if (lower.includes('naupada') || lower.includes('ram maruti')) return { lat: 19.1889, lng: 72.9718 };
  if (lower.includes('kalwa')) return { lat: 19.1972, lng: 72.9985 };
  if (lower.includes('dadar') || lower.includes('shivaji park')) return { lat: 19.0273, lng: 72.8387 };
  if (lower.includes('bkc') || lower.includes('bandra')) return { lat: 19.066, lng: 72.868 };
  if (lower.includes('mulund')) return { lat: 19.1726, lng: 72.9525 };
  if (lower.includes('andheri')) return { lat: 19.1197, lng: 72.8464 };
  if (lower.includes('talao pali')) return { lat: 19.1925, lng: 72.9748 };
  return { lat: 19.2085, lng: 72.9815 }; // Majiwada / Thane West default
}

export interface ExtraVolunteerHub {
  id: string;
  title: string;
  organization: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  lat: number;
  lng: number;
}

export const EXTRA_VOLUNTEER_HUBS: ExtraVolunteerHub[] = [
  {
    id: 'vhub-1',
    title: 'Shivaji Park Coastal & Tree Care Volunteer Hub',
    organization: 'Dadar Citizen Green Collective',
    category: 'Environment',
    date: 'Every Sunday',
    time: '07:00 AM – 09:30 AM',
    location: 'Shivaji Park Seaface Gazebo, Dadar West, Mumbai',
    description: 'Weekly neighbourhood sapling watering, coastal litter cleanup, and citizen awareness station.',
    lat: 19.0273,
    lng: 72.8387,
  },
  {
    id: 'vhub-2',
    title: 'BKC Safe Cycling & Commuter Aid Volunteer Point',
    organization: 'Mumbai Active Mobility Volunteers',
    category: 'Community Aid',
    date: 'Saturdays & Wednesdays',
    time: '08:00 AM – 11:00 AM',
    location: 'BKC Cycle Track Plaza, Near Family Court, Mumbai',
    description: 'Volunteer marshals guiding cyclists, first-aid hydration kiosk, and commuter wayfinding helpdesk.',
    lat: 19.0631,
    lng: 72.8641,
  },
];
