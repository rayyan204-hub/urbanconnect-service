export interface StationInfo {
  code: string;
  name: string;
  city: string;
  zone: 'CR' | 'WR' | 'Metro' | 'Harbour' | 'TransHarbour' | 'NR' | 'WCR';
  platforms: number;
}

export interface RouteStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  distanceKm: number;
  dayNumber: number;
  platform: string;
  passed?: boolean;
}

export type RailClassCode = '1A' | '2A' | '3A' | '3E' | 'CC' | 'EC' | 'SL' | '2S' | 'EV';
export type RailQuotaCode = 'GN' | 'TQ' | 'PT' | 'LD' | 'SS' | 'HP';

export interface ClassAvailability {
  classCode: RailClassCode;
  className: string;
  fare: number;
  status: 'AVAILABLE' | 'RAC' | 'WL' | 'REGRET';
  count: number;
  statusText: string;
  updatedJustNow?: boolean;
}

export interface IRCTCTrain {
  trainNumber: string;
  trainName: string;
  trainType: 'Vande Bharat' | 'Rajdhani' | 'Superfast Express' | 'Duronto' | 'Mail/Express' | 'Intercity' | 'Tejas Express';
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runsOn: string[]; // ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  classes: ClassAvailability[];
  pantry: boolean;
  rating: number;
  routeStops: RouteStop[];
  liveStatus: {
    currentStation: string;
    statusText: string;
    delayMinutes: number;
    lastUpdated: string;
  };
}

export interface LocalTrainStop {
  stationCode: string;
  stationName: string;
  time: string;
  isPassed: boolean;
}

export interface SuburbanTrain {
  id: string;
  line: 'Central' | 'Western' | 'Harbour' | 'TransHarbour' | 'Metro1' | 'Metro2A' | 'Metro7' | 'Metro3';
  direction: 'UP' | 'DOWN';
  destCode: string; // 'K' for Kalyan, 'T' for Thane, 'C' for CSMT, etc.
  destName: string;
  originCode: string;
  originName: string;
  departureTime: string;
  expectedInMinutes: number;
  speedType: 'FAST' | 'SLOW' | 'AC_FAST' | 'AC_SLOW';
  platform: string;
  carLength: '12 CAR' | '15 CAR' | 'AC LOCAL' | '8 CAR' | 'METRO 6-CAR';
  crowdLevel: 'Low' | 'Medium' | 'Heavy' | 'Super Dense';
  liveLocationText: string;
  stops: LocalTrainStop[];
}

export interface MegaBlockNotice {
  id: string;
  line: string;
  section: string;
  timing: string;
  date: string;
  impact: string;
  alternateOptions: string;
}

export interface RailPassenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berthPreference: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window' | 'No Preference';
  allottedCoach?: string;
  allottedBerth?: number;
  allottedBerthType?: string;
  bookingStatus?: string;
  currentStatus?: string;
}

export interface BookedRailTicket {
  id: string;
  pnr: string;
  bookingType: 'IRCTC_RESERVED' | 'UTS_SUBURBAN' | 'METRO_QR';
  trainNumber: string;
  trainName: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  classCode: string;
  quota: string;
  passengers: RailPassenger[];
  totalFare: number;
  baseFare: number;
  taxAmount: number;
  tatkalFee: number;
  status: 'CNF' | 'RAC' | 'WL' | 'CANCELLED';
  chartStatus: 'Chart Prepared' | 'Chart Not Prepared';
  bookedAt: string;
  platform: string;
  qrPayload: string;
  barcodePayload: string;
  refundableAmount?: number;
  cancellationDate?: string;
}

// STATIONS MASTER DATA
export const ALL_STATIONS: StationInfo[] = [
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', zone: 'CR', platforms: 18 },
  { code: 'TNA', name: 'Thane Junction', city: 'Thane', zone: 'CR', platforms: 11 },
  { code: 'KYN', name: 'Kalyan Junction', city: 'Kalyan', zone: 'CR', platforms: 8 },
  { code: 'DR', name: 'Dadar Central / Western', city: 'Mumbai', zone: 'CR', platforms: 14 },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus', city: 'Mumbai Kurla', zone: 'CR', platforms: 5 },
  { code: 'MMCT', name: 'Mumbai Central Terminus', city: 'Mumbai', zone: 'WR', platforms: 9 },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', zone: 'WR', platforms: 7 },
  { code: 'BVI', name: 'Borivali', city: 'Mumbai', zone: 'WR', platforms: 10 },
  { code: 'PNVL', name: 'Panvel Junction', city: 'Navi Mumbai', zone: 'CR', platforms: 7 },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', zone: 'CR', platforms: 6 },
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', zone: 'NR', platforms: 16 },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', zone: 'WR', platforms: 12 },
  { code: 'ST', name: 'Surat Junction', city: 'Surat', zone: 'WR', platforms: 4 },
  { code: 'MAO', name: 'Madgaon Junction', city: 'Goa', zone: 'CR', platforms: 4 },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', zone: 'NR', platforms: 9 },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', zone: 'CR', platforms: 23 },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', zone: 'CR', platforms: 8 },
  { code: 'BSR', name: 'Vasai Road', city: 'Palghar', zone: 'WR', platforms: 7 },
  { code: 'VR', name: 'Virar', city: 'Palghar', zone: 'WR', platforms: 6 },
  { code: 'VSH', name: 'Vashi', city: 'Navi Mumbai', zone: 'Harbour', platforms: 4 },
  { code: 'GKP_M', name: 'Ghatkopar Metro Hub', city: 'Mumbai', zone: 'Metro', platforms: 2 },
  { code: 'VERS_M', name: 'Versova Metro', city: 'Mumbai', zone: 'Metro', platforms: 2 },
  { code: 'ANDH_M', name: 'Andheri Metro Interchange', city: 'Mumbai', zone: 'Metro', platforms: 4 },
  { code: 'BKC_M', name: 'BKC Aqua Line Metro', city: 'Mumbai', zone: 'Metro', platforms: 2 },
];

export const SUBURBAN_STATIONS_LIST = [
  'CSMT', 'Masjid', 'Sandhurst Road', 'Byculla', 'Chinchpokli', 'Currey Road', 'Parel',
  'Dadar', 'Matunga', 'Sion', 'Kurla', 'Vidyavihar', 'Ghatkopar', 'Vikhroli',
  'Kanjurmarg', 'Bhandup', 'Nahur', 'Mulund', 'Thane', 'Kalwa', 'Mumbra', 'Diva',
  'Kopar', 'Dombivli', 'Thakurli', 'Kalyan', 'Shahad', 'Ambivli', 'Titwala', 'Asangaon',
  'Kasara', 'Vithalwadi', 'Ulhasnagar', 'Ambernath', 'Badlapur', 'Vangani', 'Neral',
  'Karjat', 'Khopoli', 'Churchgate', 'Marine Lines', 'Charni Road', 'Grant Road',
  'Mumbai Central', 'Mahalaxmi', 'Lower Parel', 'Prabhadevi', 'Bandra', 'Khar Road',
  'Santa Cruz', 'Vile Parle', 'Andheri', 'Jogeshwari', 'Ram Mandir', 'Goregaon',
  'Malad', 'Kandivali', 'Borivali', 'Dahisar', 'Mira Road', 'Bhayandar', 'Naigaon',
  'Vasai Road', 'Nallasopara', 'Virar', 'Vashi', 'Nerul', 'Belapur', 'Kharghar', 'Panvel'
];

// IRCTC EXPRESS & SUPERFAST TRAINS
export const IRCTC_TRAIN_CATALOG: IRCTCTrain[] = [
  {
    trainNumber: '20901',
    trainName: 'Vande Bharat Express (Mumbai - Gandhinagar)',
    trainType: 'Vande Bharat',
    originCode: 'MMCT',
    originName: 'Mumbai Central Terminus',
    destinationCode: 'ADI',
    destinationName: 'Ahmedabad / Gandhinagar',
    departureTime: '06:10 AM',
    arrivalTime: '11:25 AM',
    duration: '5h 15m',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S'],
    pantry: true,
    rating: 4.8,
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 1420, status: 'AVAILABLE', count: 142, statusText: 'AVAILABLE-142' },
      { classCode: 'EC', className: 'Executive Class', fare: 2630, status: 'AVAILABLE', count: 28, statusText: 'AVAILABLE-28' },
    ],
    routeStops: [
      { stationCode: 'MMCT', stationName: 'Mumbai Central', arrivalTime: 'Start', departureTime: '06:10 AM', haltMinutes: 0, distanceKm: 0, dayNumber: 1, platform: 'PF 5', passed: true },
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '06:38 AM', departureTime: '06:40 AM', haltMinutes: 2, distanceKm: 30, dayNumber: 1, platform: 'PF 6', passed: true },
      { stationCode: 'ST', stationName: 'Surat Junction', arrivalTime: '08:53 AM', departureTime: '08:58 AM', haltMinutes: 5, distanceKm: 263, dayNumber: 1, platform: 'PF 1', passed: false },
      { stationCode: 'BRC', stationName: 'Vadodara Junction', arrivalTime: '09:56 AM', departureTime: '10:00 AM', haltMinutes: 4, distanceKm: 392, dayNumber: 1, platform: 'PF 2', passed: false },
      { stationCode: 'ADI', stationName: 'Ahmedabad Junction', arrivalTime: '11:25 AM', departureTime: '11:30 AM', haltMinutes: 5, distanceKm: 492, dayNumber: 1, platform: 'PF 1', passed: false },
    ],
    liveStatus: {
      currentStation: 'Approaching Surat Junction',
      statusText: 'Right Time (Speed: 128 km/h)',
      delayMinutes: 0,
      lastUpdated: '1 min ago (GPS Telemetry)',
    },
  },
  {
    trainNumber: '12124',
    trainName: 'Deccan Queen Superfast Express',
    trainType: 'Superfast Express',
    originCode: 'PUNE',
    originName: 'Pune Junction',
    destinationCode: 'CSMT',
    destinationName: 'Mumbai CSMT',
    departureTime: '07:15 AM',
    arrivalTime: '10:25 AM',
    duration: '3h 10m',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    pantry: true,
    rating: 4.7,
    classes: [
      { classCode: '2S', className: 'Second Sitting', fare: 105, status: 'AVAILABLE', count: 88, statusText: 'AVAILABLE-88' },
      { classCode: 'CC', className: 'AC Chair Car', fare: 395, status: 'AVAILABLE', count: 34, statusText: 'AVAILABLE-34' },
      { classCode: 'EV', className: 'VistaDome Coach', fare: 915, status: 'RAC', count: 4, statusText: 'RAC 4' },
    ],
    routeStops: [
      { stationCode: 'PUNE', stationName: 'Pune Junction', arrivalTime: 'Start', departureTime: '07:15 AM', haltMinutes: 0, distanceKm: 0, dayNumber: 1, platform: 'PF 5', passed: true },
      { stationCode: 'LNL', stationName: 'Lonavala', arrivalTime: '08:08 AM', departureTime: '08:10 AM', haltMinutes: 2, distanceKm: 64, dayNumber: 1, platform: 'PF 2', passed: true },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '09:58 AM', departureTime: '10:00 AM', haltMinutes: 2, distanceKm: 183, dayNumber: 1, platform: 'PF 6', passed: false },
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrivalTime: '10:25 AM', departureTime: 'End', haltMinutes: 0, distanceKm: 192, dayNumber: 1, platform: 'PF 8', passed: false },
    ],
    liveStatus: {
      currentStation: 'Karjat - Khandala Bhor Ghat Section',
      statusText: 'Delayed by 4 mins',
      delayMinutes: 4,
      lastUpdated: 'Just now',
    },
  },
  {
    trainNumber: '12951',
    trainName: 'Mumbai Tejas Rajdhani Express',
    trainType: 'Rajdhani',
    originCode: 'MMCT',
    originName: 'Mumbai Central Terminus',
    destinationCode: 'NDLS',
    destinationName: 'New Delhi Railway Station',
    departureTime: '05:00 PM',
    arrivalTime: '08:32 AM',
    duration: '15h 32m',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    pantry: true,
    rating: 4.9,
    classes: [
      { classCode: '3A', className: '3 Tier AC', fare: 2195, status: 'AVAILABLE', count: 64, statusText: 'AVAILABLE-64' },
      { classCode: '2A', className: '2 Tier AC', fare: 3120, status: 'AVAILABLE', count: 18, statusText: 'AVAILABLE-18' },
      { classCode: '1A', className: 'First AC (1A)', fare: 5240, status: 'RAC', count: 2, statusText: 'RAC 2' },
    ],
    routeStops: [
      { stationCode: 'MMCT', stationName: 'Mumbai Central', arrivalTime: 'Start', departureTime: '05:00 PM', haltMinutes: 0, distanceKm: 0, dayNumber: 1, platform: 'PF 1' },
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '05:31 PM', departureTime: '05:33 PM', haltMinutes: 2, distanceKm: 30, dayNumber: 1, platform: 'PF 6' },
      { stationCode: 'ST', stationName: 'Surat', arrivalTime: '07:43 PM', departureTime: '07:48 PM', haltMinutes: 5, distanceKm: 263, dayNumber: 1, platform: 'PF 1' },
      { stationCode: 'BRC', stationName: 'Vadodara', arrivalTime: '09:00 PM', departureTime: '09:10 PM', haltMinutes: 10, distanceKm: 392, dayNumber: 1, platform: 'PF 2' },
      { stationCode: 'KOTA', stationName: 'Kota Junction', arrivalTime: '03:15 AM', departureTime: '03:20 AM', haltMinutes: 5, distanceKm: 920, dayNumber: 2, platform: 'PF 1' },
      { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '08:32 AM', departureTime: 'End', haltMinutes: 0, distanceKm: 1384, dayNumber: 2, platform: 'PF 1' },
    ],
    liveStatus: {
      currentStation: 'Pre-departure at Mumbai Central Yard',
      statusText: 'Rake Positioned on PF 1',
      delayMinutes: 0,
      lastUpdated: 'Scheduled for 17:00 hrs',
    },
  },
  {
    trainNumber: '12111',
    trainName: 'CSMT - Amravati Superfast Express',
    trainType: 'Superfast Express',
    originCode: 'CSMT',
    originName: 'Mumbai CSMT',
    destinationCode: 'TNA',
    destinationName: 'Thane & Amravati',
    departureTime: '07:55 PM',
    arrivalTime: '08:38 PM',
    duration: '43m to Thane',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    pantry: true,
    rating: 4.6,
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 145, status: 'AVAILABLE', count: 210, statusText: 'AVAILABLE-210' },
      { classCode: '3E', className: '3 AC Economy', fare: 480, status: 'AVAILABLE', count: 42, statusText: 'AVAILABLE-42' },
      { classCode: '3A', className: '3 Tier AC', fare: 520, status: 'AVAILABLE', count: 36, statusText: 'AVAILABLE-36' },
      { classCode: '2A', className: '2 Tier AC', fare: 760, status: 'AVAILABLE', count: 12, statusText: 'AVAILABLE-12' },
      { classCode: '1A', className: 'First AC', fare: 1290, status: 'RAC', count: 3, statusText: 'RAC 3' },
    ],
    routeStops: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrivalTime: 'Start', departureTime: '07:55 PM', haltMinutes: 0, distanceKm: 0, dayNumber: 1, platform: 'PF 14' },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '08:08 PM', departureTime: '08:10 PM', haltMinutes: 2, distanceKm: 9, dayNumber: 1, platform: 'PF 5' },
      { stationCode: 'TNA', stationName: 'Thane Junction', arrivalTime: '08:33 PM', departureTime: '08:35 PM', haltMinutes: 2, distanceKm: 34, dayNumber: 1, platform: 'PF 5' },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '08:57 PM', departureTime: '09:00 PM', haltMinutes: 3, distanceKm: 54, dayNumber: 1, platform: 'PF 4' },
    ],
    liveStatus: {
      currentStation: 'Originating CSMT Terminal',
      statusText: 'Right Time',
      delayMinutes: 0,
      lastUpdated: 'Platform 14 Assigned',
    },
  },
  {
    trainNumber: '20111',
    trainName: 'Konkan Kanya Superfast Express (Goa)',
    trainType: 'Superfast Express',
    originCode: 'CSMT',
    originName: 'Mumbai CSMT',
    destinationCode: 'MAO',
    destinationName: 'Madgaon Junction (Goa)',
    departureTime: '11:05 PM',
    arrivalTime: '10:45 AM',
    duration: '11h 40m',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    pantry: true,
    rating: 4.8,
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 425, status: 'RAC', count: 18, statusText: 'RAC 18' },
      { classCode: '3A', className: '3 Tier AC', fare: 1150, status: 'AVAILABLE', count: 24, statusText: 'AVAILABLE-24' },
      { classCode: '2A', className: '2 Tier AC', fare: 1640, status: 'WL', count: 14, statusText: 'WL 14 / GNWL' },
      { classCode: '1A', className: 'First AC', fare: 2790, status: 'AVAILABLE', count: 6, statusText: 'AVAILABLE-6' },
    ],
    routeStops: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrivalTime: 'Start', departureTime: '11:05 PM', haltMinutes: 0, distanceKm: 0, dayNumber: 1, platform: 'PF 16' },
      { stationCode: 'TNA', stationName: 'Thane Junction', arrivalTime: '11:47 PM', departureTime: '11:50 PM', haltMinutes: 3, distanceKm: 34, dayNumber: 1, platform: 'PF 7' },
      { stationCode: 'PNVL', stationName: 'Panvel Junction', arrivalTime: '12:35 AM', departureTime: '12:40 AM', haltMinutes: 5, distanceKm: 69, dayNumber: 2, platform: 'PF 7' },
      { stationCode: 'RN', stationName: 'Ratnagiri', arrivalTime: '05:30 AM', departureTime: '05:35 AM', haltMinutes: 5, distanceKm: 347, dayNumber: 2, platform: 'PF 1' },
      { stationCode: 'MAO', stationName: 'Madgaon Junction', arrivalTime: '10:45 AM', departureTime: 'End', haltMinutes: 0, distanceKm: 580, dayNumber: 2, platform: 'PF 2' },
    ],
    liveStatus: {
      currentStation: 'Scheduled for Evening Run',
      statusText: 'Coach Formation Verified',
      delayMinutes: 0,
      lastUpdated: 'Chart preparation at 17:00 hrs',
    },
  },
  {
    trainNumber: '12261',
    trainName: 'Mumbai CSMT - Howrah AC Duronto Express',
    trainType: 'Duronto',
    originCode: 'CSMT',
    originName: 'Mumbai CSMT',
    destinationCode: 'HWH',
    destinationName: 'Howrah Junction',
    departureTime: '05:15 PM',
    arrivalTime: '08:15 PM',
    duration: '27h 00m',
    runsOn: ['T', 'W', 'F', 'S'],
    pantry: true,
    rating: 4.7,
    classes: [
      { classCode: '3A', className: '3 Tier AC', fare: 2480, status: 'AVAILABLE', count: 52, statusText: 'AVAILABLE-52' },
      { classCode: '2A', className: '2 Tier AC', fare: 3510, status: 'AVAILABLE', count: 16, statusText: 'AVAILABLE-16' },
      { classCode: '1A', className: 'First AC', fare: 5930, status: 'AVAILABLE', count: 4, statusText: 'AVAILABLE-4' },
    ],
    routeStops: [
      { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrivalTime: 'Start', departureTime: '05:15 PM', haltMinutes: 0, distanceKm: 0, dayNumber: 1, platform: 'PF 18' },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '06:00 PM', departureTime: '06:03 PM', haltMinutes: 3, distanceKm: 54, dayNumber: 1, platform: 'PF 4' },
      { stationCode: 'NGP', stationName: 'Nagpur Junction', arrivalTime: '04:15 AM', departureTime: '04:20 AM', haltMinutes: 5, distanceKm: 837, dayNumber: 2, platform: 'PF 3' },
      { stationCode: 'HWH', stationName: 'Howrah Junction', arrivalTime: '08:15 PM', departureTime: 'End', haltMinutes: 0, distanceKm: 1968, dayNumber: 2, platform: 'PF 21' },
    ],
    liveStatus: {
      currentStation: 'Pre-boarding Inspection',
      statusText: 'Right Time',
      delayMinutes: 0,
      lastUpdated: 'Clean Train Station audit passed',
    },
  },
];

// m-INDICATOR SUBURBAN TRAINS (Central, Western, Harbour, Trans-Harbour, Metro)
export const SUBURBAN_TIMETABLE: SuburbanTrain[] = [
  {
    id: 'sub-cr-1',
    line: 'Central',
    direction: 'DOWN',
    destCode: 'K',
    destName: 'Kalyan',
    originCode: 'CSMT',
    originName: 'CSMT Mumbai',
    departureTime: '09:34 AM',
    expectedInMinutes: 2,
    speedType: 'FAST',
    platform: 'PF 5',
    carLength: '12 CAR',
    crowdLevel: 'Heavy',
    liveLocationText: 'Approaching Thane Platform 5 (Speed 42 km/h)',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', time: '08:52 AM', isPassed: true },
      { stationCode: 'BY', stationName: 'Byculla', time: '09:00 AM', isPassed: true },
      { stationCode: 'DR', stationName: 'Dadar', time: '09:09 AM', isPassed: true },
      { stationCode: 'CLA', stationName: 'Kurla', time: '09:17 AM', isPassed: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', time: '09:23 AM', isPassed: true },
      { stationCode: 'TNA', stationName: 'Thane', time: '09:34 AM', isPassed: false },
      { stationCode: 'DI', stationName: 'Dombivli', time: '09:48 AM', isPassed: false },
      { stationCode: 'KYN', stationName: 'Kalyan', time: '09:56 AM', isPassed: false },
    ],
  },
  {
    id: 'sub-cr-2',
    line: 'Central',
    direction: 'UP',
    destCode: 'C',
    destName: 'CSMT',
    originCode: 'KYN',
    originName: 'Kalyan',
    departureTime: '09:38 AM',
    expectedInMinutes: 6,
    speedType: 'FAST',
    platform: 'PF 6',
    carLength: '15 CAR',
    crowdLevel: 'Super Dense',
    liveLocationText: 'Crossed Kalwa Creek Bridge (+2m)',
    stops: [
      { stationCode: 'KYN', stationName: 'Kalyan', time: '09:15 AM', isPassed: true },
      { stationCode: 'DI', stationName: 'Dombivli', time: '09:23 AM', isPassed: true },
      { stationCode: 'TNA', stationName: 'Thane', time: '09:38 AM', isPassed: false },
      { stationCode: 'GC', stationName: 'Ghatkopar', time: '09:49 AM', isPassed: false },
      { stationCode: 'CLA', stationName: 'Kurla', time: '09:55 AM', isPassed: false },
      { stationCode: 'DR', stationName: 'Dadar', time: '10:04 AM', isPassed: false },
      { stationCode: 'BY', stationName: 'Byculla', time: '10:12 AM', isPassed: false },
      { stationCode: 'CSMT', stationName: 'CSMT', time: '10:20 AM', isPassed: false },
    ],
  },
  {
    id: 'sub-cr-3',
    line: 'Central',
    direction: 'DOWN',
    destCode: 'N',
    destName: 'Kasara',
    originCode: 'CSMT',
    originName: 'CSMT Mumbai',
    departureTime: '09:44 AM',
    expectedInMinutes: 11,
    speedType: 'FAST',
    platform: 'PF 5',
    carLength: '12 CAR',
    crowdLevel: 'Medium',
    liveLocationText: 'Departed Bhandup on-time',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', time: '09:02 AM', isPassed: true },
      { stationCode: 'DR', stationName: 'Dadar', time: '09:18 AM', isPassed: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', time: '09:31 AM', isPassed: true },
      { stationCode: 'TNA', stationName: 'Thane', time: '09:44 AM', isPassed: false },
      { stationCode: 'KYN', stationName: 'Kalyan', time: '10:04 AM', isPassed: false },
      { stationCode: 'TLW', stationName: 'Titwala', time: '10:18 AM', isPassed: false },
      { stationCode: 'ASG', stationName: 'Asangaon', time: '10:39 AM', isPassed: false },
      { stationCode: 'KSRA', stationName: 'Kasara', time: '11:15 AM', isPassed: false },
    ],
  },
  {
    id: 'sub-cr-4',
    line: 'Central',
    direction: 'DOWN',
    destCode: 'T',
    destName: 'Thane',
    originCode: 'CSMT',
    originName: 'CSMT Mumbai',
    departureTime: '09:48 AM',
    expectedInMinutes: 15,
    speedType: 'AC_SLOW',
    platform: 'PF 2',
    carLength: 'AC LOCAL',
    crowdLevel: 'Low',
    liveLocationText: 'Crossed Mulund slow line (+1m)',
    stops: [
      { stationCode: 'MLND', stationName: 'Mulund', time: '09:43 AM', isPassed: true },
      { stationCode: 'TNA', stationName: 'Thane (Terminating)', time: '09:48 AM', isPassed: false },
    ],
  },
  {
    id: 'sub-cr-5',
    line: 'Central',
    direction: 'DOWN',
    destCode: 'BL',
    destName: 'Badlapur',
    originCode: 'CSMT',
    originName: 'CSMT',
    departureTime: '09:55 AM',
    expectedInMinutes: 22,
    speedType: 'FAST',
    platform: 'PF 5',
    carLength: '12 CAR',
    crowdLevel: 'Heavy',
    liveLocationText: 'Departing Ghatkopar',
    stops: [
      { stationCode: 'TNA', stationName: 'Thane', time: '09:55 AM', isPassed: false },
      { stationCode: 'DI', stationName: 'Dombivli', time: '10:10 AM', isPassed: false },
      { stationCode: 'KYN', stationName: 'Kalyan', time: '10:18 AM', isPassed: false },
      { stationCode: 'ABH', stationName: 'Ambernath', time: '10:30 AM', isPassed: false },
      { stationCode: 'BL', stationName: 'Badlapur', time: '10:40 AM', isPassed: false },
    ],
  },
  // WESTERN LINE
  {
    id: 'sub-wr-1',
    line: 'Western',
    direction: 'DOWN',
    destCode: 'VR',
    destName: 'Virar',
    originCode: 'CCG',
    originName: 'Churchgate',
    departureTime: '09:35 AM',
    expectedInMinutes: 3,
    speedType: 'FAST',
    platform: 'PF 4',
    carLength: '15 CAR',
    crowdLevel: 'Super Dense',
    liveLocationText: 'Arriving Borivali PF 4',
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', time: '08:48 AM', isPassed: true },
      { stationCode: 'BCL', stationName: 'Mumbai Central', time: '08:58 AM', isPassed: true },
      { stationCode: 'DDR', stationName: 'Dadar WR', time: '09:07 AM', isPassed: true },
      { stationCode: 'BA', stationName: 'Bandra', time: '09:14 AM', isPassed: true },
      { stationCode: 'ADH', stationName: 'Andheri', time: '09:23 AM', isPassed: true },
      { stationCode: 'BVI', stationName: 'Borivali', time: '09:35 AM', isPassed: false },
      { stationCode: 'BYR', stationName: 'Bhayandar', time: '09:47 AM', isPassed: false },
      { stationCode: 'BSR', stationName: 'Vasai Road', time: '09:56 AM', isPassed: false },
      { stationCode: 'VR', stationName: 'Virar', time: '10:06 AM', isPassed: false },
    ],
  },
  {
    id: 'sub-wr-2',
    line: 'Western',
    direction: 'DOWN',
    destCode: 'BVI',
    destName: 'Borivali',
    originCode: 'CCG',
    originName: 'Churchgate',
    departureTime: '09:41 AM',
    expectedInMinutes: 8,
    speedType: 'AC_FAST',
    platform: 'PF 5',
    carLength: 'AC LOCAL',
    crowdLevel: 'Medium',
    liveLocationText: 'Departing Andheri WR (+0m)',
    stops: [
      { stationCode: 'ADH', stationName: 'Andheri', time: '09:30 AM', isPassed: true },
      { stationCode: 'BVI', stationName: 'Borivali', time: '09:41 AM', isPassed: false },
    ],
  },
  // TRANS-HARBOUR (Thane <-> Panvel / Vashi)
  {
    id: 'sub-th-1',
    line: 'TransHarbour',
    direction: 'DOWN',
    destCode: 'PL',
    destName: 'Panvel',
    originCode: 'TNA',
    originName: 'Thane Trans-Harbour',
    departureTime: '09:36 AM',
    expectedInMinutes: 4,
    speedType: 'SLOW',
    platform: 'PF 9',
    carLength: '12 CAR',
    crowdLevel: 'Medium',
    liveLocationText: 'At Thane Platform 9 (Ready to depart)',
    stops: [
      { stationCode: 'TNA', stationName: 'Thane', time: '09:36 AM', isPassed: false },
      { stationCode: 'AIR', stationName: 'Airoli', time: '09:44 AM', isPassed: false },
      { stationCode: 'RAB', stationName: 'Rabale', time: '09:48 AM', isPassed: false },
      { stationCode: 'GNS', stationName: 'Ghansoli', time: '09:52 AM', isPassed: false },
      { stationCode: 'KPK', stationName: 'Kopar Khairane', time: '09:56 AM', isPassed: false },
      { stationCode: 'TUR', stationName: 'Turbhe', time: '10:01 AM', isPassed: false },
      { stationCode: 'JNJ', stationName: 'Juinagar', time: '10:06 AM', isPassed: false },
      { stationCode: 'NEU', stationName: 'Nerul', time: '10:10 AM', isPassed: false },
      { stationCode: 'BEPR', stationName: 'Belapur', time: '10:19 AM', isPassed: false },
      { stationCode: 'PNVL', stationName: 'Panvel', time: '10:31 AM', isPassed: false },
    ],
  },
  // MUMBAI METRO
  {
    id: 'sub-mm-1',
    line: 'Metro1',
    direction: 'DOWN',
    destCode: 'VERS',
    destName: 'Versova via Andheri',
    originCode: 'GKP_M',
    originName: 'Ghatkopar Metro',
    departureTime: '09:35 AM',
    expectedInMinutes: 2,
    speedType: 'FAST',
    platform: 'PF 1',
    carLength: 'METRO 6-CAR',
    crowdLevel: 'Medium',
    liveLocationText: 'Platform Screen Doors Closing (Ghatkopar)',
    stops: [
      { stationCode: 'GKP_M', stationName: 'Ghatkopar', time: '09:35 AM', isPassed: false },
      { stationCode: 'SAK_M', stationName: 'Saki Naka', time: '09:41 AM', isPassed: false },
      { stationCode: 'MAR_M', stationName: 'Marol Naka', time: '09:44 AM', isPassed: false },
      { stationCode: 'WES_M', stationName: 'Western Express Highway', time: '09:49 AM', isPassed: false },
      { stationCode: 'AND_M', stationName: 'Andheri Metro', time: '09:52 AM', isPassed: false },
      { stationCode: 'VERS_M', stationName: 'Versova', time: '09:58 AM', isPassed: false },
    ],
  },
  {
    id: 'sub-mm-2',
    line: 'Metro3',
    direction: 'UP',
    destCode: 'BKC',
    destName: 'BKC Aqua Line',
    originCode: 'AAR_M',
    originName: 'Aarey JVLR',
    departureTime: '09:38 AM',
    expectedInMinutes: 5,
    speedType: 'FAST',
    platform: 'PF 2',
    carLength: 'METRO 6-CAR',
    crowdLevel: 'Low',
    liveLocationText: 'Underground Tunnel CSIA T2 -> Sahar',
    stops: [
      { stationCode: 'AAR_M', stationName: 'Aarey JVLR', time: '09:20 AM', isPassed: true },
      { stationCode: 'SEEPZ_M', stationName: 'SEEPZ', time: '09:25 AM', isPassed: true },
      { stationCode: 'T2_M', stationName: 'CSMIA Terminal 2', time: '09:32 AM', isPassed: true },
      { stationCode: 'BKC_M', stationName: 'Bandra Kurla Complex', time: '09:42 AM', isPassed: false },
    ],
  },
];

// LIVE MEGA BLOCK UPDATES
export const MEGA_BLOCK_DATA: MegaBlockNotice[] = [
  {
    id: 'mb-1',
    line: 'Central Line Suburban',
    section: 'Matunga to Mulund (Up & Down Slow Lines)',
    timing: '11:05 AM to 03:55 PM (Sunday)',
    date: 'Next Sunday',
    impact: 'Slow line locals diverted to fast lines between Mulund and Matunga. Will skip Vidyavihar, Kanjurmarg, and Nahur stations.',
    alternateOptions: 'Use FAST locals from Thane / Ghatkopar or BEST AC feeder buses.',
  },
  {
    id: 'mb-2',
    line: 'Harbour Line',
    section: 'CSMT to Chunabhatti / Bandra',
    timing: '11:10 AM to 04:10 PM',
    date: 'Next Sunday',
    impact: 'No Harbour services between CSMT and Kurla. Special shuttle locals will operate between Panvel and Kurla (PF 8).',
    alternateOptions: 'Harbour passengers are permitted to travel via Central Line between Kurla and CSMT.',
  },
  {
    id: 'mb-3',
    line: 'Western Railway',
    section: 'Santacruz to Goregaon (Up & Down Fast Lines)',
    timing: 'Night Block: 00:30 AM to 04:30 AM',
    date: 'Saturday / Sunday Midnight',
    impact: 'Fast locals will run on slow tracks during block period.',
    alternateOptions: 'All scheduled night trains running on slow tracks.',
  },
];

// INITIAL SAMPLE BOOKED TICKETS FOR SEAMLESS FIRST-TIME EXPERIENCE
export const INITIAL_BOOKED_TICKETS: BookedRailTicket[] = [
  {
    id: 'tkt-irctc-1',
    pnr: '8421948201',
    bookingType: 'IRCTC_RESERVED',
    trainNumber: '20901',
    trainName: 'Vande Bharat Express',
    fromCode: 'MMCT',
    fromName: 'Mumbai Central',
    toCode: 'ADI',
    toName: 'Ahmedabad Junction',
    journeyDate: 'Tomorrow, Oct 11',
    departureTime: '06:10 AM',
    arrivalTime: '11:25 AM',
    classCode: 'CC',
    quota: 'General (GN)',
    passengers: [
      {
        name: 'Aarav Deshmukh',
        age: 29,
        gender: 'M',
        berthPreference: 'Window',
        allottedCoach: 'C4',
        allottedBerth: 24,
        allottedBerthType: 'Window (WS)',
        bookingStatus: 'CNF',
        currentStatus: 'CNF',
      },
    ],
    totalFare: 1420,
    baseFare: 1280,
    taxAmount: 70,
    tatkalFee: 0,
    status: 'CNF',
    chartStatus: 'Chart Prepared',
    bookedAt: 'Yesterday 04:30 PM',
    platform: 'PF 5',
    qrPayload: 'IRCTC-PNR-8421948201-TRAIN-20901-CLASS-CC-SEAT-C4-24-CONFIRMED',
    barcodePayload: '8421948201',
    refundableAmount: 1300,
  },
  {
    id: 'tkt-uts-2',
    pnr: 'UTS-MUM-89210',
    bookingType: 'UTS_SUBURBAN',
    trainNumber: 'SUB-CR-FAST',
    trainName: 'Thane ➔ CSMT Fast Suburban Pass',
    fromCode: 'TNA',
    fromName: 'Thane Central',
    toCode: 'CSMT',
    toName: 'Mumbai CSMT',
    journeyDate: 'Today (Valid 3 Hours)',
    departureTime: '09:34 AM',
    arrivalTime: '10:14 AM',
    classCode: 'II (Second Class)',
    quota: 'Suburban UTS',
    passengers: [
      {
        name: 'Aarav Deshmukh',
        age: 29,
        gender: 'M',
        berthPreference: 'No Preference',
        allottedCoach: 'Suburban EMU',
        allottedBerth: 1,
        allottedBerthType: 'Unreserved',
        bookingStatus: 'VALID_TICKET',
        currentStatus: 'ACTIVE',
      },
    ],
    totalFare: 15,
    baseFare: 15,
    taxAmount: 0,
    tatkalFee: 0,
    status: 'CNF',
    chartStatus: 'Chart Prepared',
    bookedAt: 'Today 09:10 AM',
    platform: 'PF 5 / 6',
    qrPayload: 'UTS-CR-THANE-CSMT-VALID-TOKEN-92104-FAST',
    barcodePayload: 'UTS92104THACSMT',
    refundableAmount: 0,
  },
];
