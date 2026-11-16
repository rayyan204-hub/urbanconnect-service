import { TimetableStop, TrainTimetableEntry } from './actualTransitTimetables';

export interface MumbaiStation {
  code: string;
  name: string;
  line: 'Central' | 'Western' | 'Harbour' | 'TransHarbour' | 'Uran' | 'Metro';
  zone: 'CR' | 'WR' | 'Metro';
  isInterchange?: boolean;
  interchangeLines?: string[];
  platforms?: number;
}

// -------------------------------------------------------------
// ALL MUMBAI SUBURBAN STATIONS (Central, Western, Harbour, Trans-Harbour)
// -------------------------------------------------------------
export const MUMBAI_STATIONS_MASTER: MumbaiStation[] = [
  // --- CENTRAL RAILWAY (CR) MAIN LINE ---
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'Harbour'], platforms: 18 },
  { code: 'MSD', name: 'Masjid', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'Harbour'], platforms: 4 },
  { code: 'SNRD', name: 'Sandhurst Road', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'Harbour'], platforms: 4 },
  { code: 'BY', name: 'Byculla', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'CHG', name: 'Chinchpokli', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'CRD', name: 'Currey Road', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'PR', name: 'Parel', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'Western'], platforms: 3 },
  { code: 'DR', name: 'Dadar Central', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'Western'], platforms: 8 },
  { code: 'MTN', name: 'Matunga', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'SIN', name: 'Sion', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'CLA', name: 'Kurla Junction', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'Harbour'], platforms: 8 },
  { code: 'VVH', name: 'Vidyavihar', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'GC', name: 'Ghatkopar', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'Metro'], platforms: 4 },
  { code: 'VK', name: 'Vikhroli', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'KJMG', name: 'Kanjurmarg', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'BND', name: 'Bhandup', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'NHU', name: 'Nahur', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'MLND', name: 'Mulund', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'TNA', name: 'Thane Central', line: 'Central', zone: 'CR', isInterchange: true, interchangeLines: ['Central', 'TransHarbour'], platforms: 11 },
  { code: 'KLVA', name: 'Kalwa', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'MBQ', name: 'Mumbra', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'DIVA', name: 'Diva Junction', line: 'Central', zone: 'CR', platforms: 8 },
  { code: 'KOPR', name: 'Kopar', line: 'Central', zone: 'CR', platforms: 4 },
  { code: 'DI', name: 'Dombivli', line: 'Central', zone: 'CR', platforms: 5 },
  { code: 'THK', name: 'Thakurli', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'KYN', name: 'Kalyan Junction', line: 'Central', zone: 'CR', platforms: 8 },
  // CR North-East Branch (towards Kasara)
  { code: 'SHAD', name: 'Shahad', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'ABY', name: 'Ambivli', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'TLA', name: 'Titwala', line: 'Central', zone: 'CR', platforms: 3 },
  { code: 'KDV', name: 'Khadavli', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'VSD', name: 'Vasind', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'ASO', name: 'Asangaon', line: 'Central', zone: 'CR', platforms: 3 },
  { code: 'ATG', name: 'Atgaon', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'KSRA', name: 'Kasara', line: 'Central', zone: 'CR', platforms: 3 },
  // CR South-East Branch (towards Karjat / Khopoli)
  { code: 'VLDI', name: 'Vithalwadi', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'ULNR', name: 'Ulhasnagar', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'ABH', name: 'Ambernath', line: 'Central', zone: 'CR', platforms: 3 },
  { code: 'BUD', name: 'Badlapur', line: 'Central', zone: 'CR', platforms: 3 },
  { code: 'VGI', name: 'Vangani', line: 'Central', zone: 'CR', platforms: 2 },
  { code: 'NRL', name: 'Neral Junction', line: 'Central', zone: 'CR', platforms: 3 },
  { code: 'KJT', name: 'Karjat Junction', line: 'Central', zone: 'CR', platforms: 3 },
  { code: 'KHPI', name: 'Khopoli', line: 'Central', zone: 'CR', platforms: 2 },

  // --- WESTERN RAILWAY (WR) ---
  { code: 'CCG', name: 'Churchgate', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'MEL', name: 'Marine Lines', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'CYR', name: 'Charni Road', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'GTR', name: 'Grant Road', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'BCL', name: 'Mumbai Central', line: 'Western', zone: 'WR', platforms: 5 },
  { code: 'MX', name: 'Mahalaxmi', line: 'Western', zone: 'WR', platforms: 3 },
  { code: 'PL', name: 'Lower Parel', line: 'Western', zone: 'WR', platforms: 3 },
  { code: 'PBHD', name: 'Prabhadevi', line: 'Western', zone: 'WR', isInterchange: true, interchangeLines: ['Western', 'Central'], platforms: 2 },
  { code: 'DDR', name: 'Dadar Western', line: 'Western', zone: 'WR', isInterchange: true, interchangeLines: ['Western', 'Central'], platforms: 7 },
  { code: 'MRU', name: 'Matunga Road', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'MM', name: 'Mahim Junction', line: 'Western', zone: 'WR', isInterchange: true, interchangeLines: ['Western', 'Harbour'], platforms: 6 },
  { code: 'BA', name: 'Bandra', line: 'Western', zone: 'WR', isInterchange: true, interchangeLines: ['Western', 'Harbour'], platforms: 7 },
  { code: 'KHAR', name: 'Khar Road', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'STC', name: 'Santacruz', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'VLP', name: 'Vile Parle', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'ADH', name: 'Andheri', line: 'Western', zone: 'WR', isInterchange: true, interchangeLines: ['Western', 'Harbour', 'Metro'], platforms: 9 },
  { code: 'JOS', name: 'Jogeshwari', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'RMAR', name: 'Ram Mandir', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'GMN', name: 'Goregaon', line: 'Western', zone: 'WR', isInterchange: true, interchangeLines: ['Western', 'Harbour'], platforms: 7 },
  { code: 'MDD', name: 'Malad', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'KILE', name: 'Kandivali', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'BVI', name: 'Borivali', line: 'Western', zone: 'WR', platforms: 10 },
  { code: 'DIC', name: 'Dahisar', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'MIRA', name: 'Mira Road', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'BYR', name: 'Bhayandar', line: 'Western', zone: 'WR', platforms: 6 },
  { code: 'NIG', name: 'Naigaon', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'BSR', name: 'Vasai Road', line: 'Western', zone: 'WR', platforms: 7 },
  { code: 'NSP', name: 'Nallasopara', line: 'Western', zone: 'WR', platforms: 4 },
  { code: 'VR', name: 'Virar', line: 'Western', zone: 'WR', platforms: 6 },
  { code: 'VTN', name: 'Vaitarna', line: 'Western', zone: 'WR', platforms: 2 },
  { code: 'SAH', name: 'Saphale', line: 'Western', zone: 'WR', platforms: 2 },
  { code: 'PLG', name: 'Palghar', line: 'Western', zone: 'WR', platforms: 3 },
  { code: 'BOR', name: 'Boisar', line: 'Western', zone: 'WR', platforms: 3 },
  { code: 'DRD', name: 'Dahanu Road', line: 'Western', zone: 'WR', platforms: 4 },

  // --- HARBOUR LINE (CSMT - Panvel & Goregaon) ---
  { code: 'DKRD', name: 'Dockyard Road', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'RRD', name: 'Reay Road', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'CTGN', name: 'Cotton Green', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'SVE', name: 'Sewri', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'VDLR', name: 'Vadala Road', line: 'Harbour', zone: 'CR', isInterchange: true, interchangeLines: ['Harbour'], platforms: 4 },
  { code: 'GTBN', name: 'Guru Tegh Bahadur Nagar', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'CHF', name: 'Chunabhatti', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'CLAH', name: 'Kurla Harbour', line: 'Harbour', zone: 'CR', isInterchange: true, interchangeLines: ['Harbour', 'Central'], platforms: 2 },
  { code: 'TKNG', name: 'Tilak Nagar', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'CMBR', name: 'Chembur', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'GV', name: 'Govandi', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'MNKD', name: 'Mankhurd', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'VSH', name: 'Vashi', line: 'Harbour', zone: 'CR', isInterchange: true, interchangeLines: ['Harbour', 'TransHarbour'], platforms: 4 },
  { code: 'SNPD', name: 'Sanpada', line: 'Harbour', zone: 'CR', platforms: 4 },
  { code: 'JNJ', name: 'Juinagar', line: 'Harbour', zone: 'CR', platforms: 4 },
  { code: 'NEU', name: 'Nerul', line: 'Harbour', zone: 'CR', isInterchange: true, interchangeLines: ['Harbour', 'TransHarbour', 'Uran'], platforms: 5 },
  { code: 'SWDV', name: 'Seawoods-Darave', line: 'Harbour', zone: 'CR', platforms: 4 },
  { code: 'BEPR', name: 'Belapur CBD', line: 'Harbour', zone: 'CR', isInterchange: true, interchangeLines: ['Harbour', 'TransHarbour', 'Uran'], platforms: 4 },
  { code: 'KHAG', name: 'Kharghar', line: 'Harbour', zone: 'CR', platforms: 4 },
  { code: 'MANR', name: 'Mansarovar', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'KNDS', name: 'Khandeshwar', line: 'Harbour', zone: 'CR', platforms: 2 },
  { code: 'PNVL', name: 'Panvel Junction', line: 'Harbour', zone: 'CR', isInterchange: true, interchangeLines: ['Harbour', 'TransHarbour'], platforms: 7 },
  // Harbour branch to Western
  { code: 'KCE', name: "King's Circle", line: 'Harbour', zone: 'CR', platforms: 2 },

  // --- TRANS-HARBOUR LINE (Thane - Vashi / Panvel) ---
  { code: 'DIGH', name: 'Digha Gaon', line: 'TransHarbour', zone: 'CR', platforms: 2 },
  { code: 'AIRL', name: 'Airoli', line: 'TransHarbour', zone: 'CR', platforms: 2 },
  { code: 'RABE', name: 'Rabale', line: 'TransHarbour', zone: 'CR', platforms: 2 },
  { code: 'GNSL', name: 'Ghansoli', line: 'TransHarbour', zone: 'CR', platforms: 2 },
  { code: 'KPHN', name: 'Kopar Khairane', line: 'TransHarbour', zone: 'CR', platforms: 2 },
  { code: 'TUH', name: 'Turbhe', line: 'TransHarbour', zone: 'CR', platforms: 4 },

  // --- URAN LINE ---
  { code: 'BMDR', name: 'Bamandongri', line: 'Uran', zone: 'CR', platforms: 2 },
  { code: 'KARK', name: 'Kharkopar', line: 'Uran', zone: 'CR', platforms: 2 },
  { code: 'SHVL', name: 'Shevale', line: 'Uran', zone: 'CR', platforms: 2 },
  { code: 'DRGI', name: 'Dronagiri', line: 'Uran', zone: 'CR', platforms: 2 },
  { code: 'URAN', name: 'Uran', line: 'Uran', zone: 'CR', platforms: 2 },
];

// -------------------------------------------------------------
// EXTENDED COMPREHENSIVE MUMBAI SUBURBAN TRAIN FLEET
// Covering Central, Western, Harbour, and Trans-Harbour
// -------------------------------------------------------------
export const ALL_MUMBAI_SUBURBAN_TRAINS: TrainTimetableEntry[] = [
  // =========================================================
  // CENTRAL LINE (CR): DOWN (CSMT Outbound to Kalyan / Kasara / Karjat)
  // =========================================================
  {
    id: 'cr-dn-01',
    trainNumber: '95311',
    trainName: 'CSMT - Kalyan Fast AC Local',
    line: 'Central',
    direction: 'DOWN',
    origin: 'CSMT Mumbai',
    originCode: 'CSMT',
    destination: 'Kalyan Junction',
    destCode: 'KYN',
    departureTime: '06:42 AM',
    arrivalTime: '07:46 AM',
    durationMinutes: 64,
    speedType: 'AC_FAST',
    platform: 'PF 5',
    rakeType: 'AC LOCAL',
    frequency: 'Daily (Every 8 mins)',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Moderate',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '06:40 AM', departureTime: '06:42 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 0 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '06:49 AM', departureTime: '06:50 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 5 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '06:56 AM', departureTime: '06:58 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 9 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '07:05 AM', departureTime: '07:06 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 15 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '07:11 AM', departureTime: '07:12 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 19 },
      { stationCode: 'BND', stationName: 'Bhandup', arrivalTime: '07:19 AM', departureTime: '07:20 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 27 },
      { stationCode: 'MLND', stationName: 'Mulund', arrivalTime: '07:24 AM', departureTime: '07:25 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 31 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '07:29 AM', departureTime: '07:31 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 34 },
      { stationCode: 'DIVA', stationName: 'Diva Junction', arrivalTime: '07:39 AM', departureTime: '07:40 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 43 },
      { stationCode: 'DI', stationName: 'Dombivli', arrivalTime: '07:43 AM', departureTime: '07:44 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 48 },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '07:46 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 6', distanceKm: 54 },
    ],
  },
  {
    id: 'cr-dn-02',
    trainNumber: '95315',
    trainName: 'CSMT - Kalyan Fast Local',
    line: 'Central',
    direction: 'DOWN',
    origin: 'CSMT Mumbai',
    originCode: 'CSMT',
    destination: 'Kalyan Junction',
    destCode: 'KYN',
    departureTime: '07:18 AM',
    arrivalTime: '08:23 AM',
    durationMinutes: 65,
    speedType: 'FAST',
    platform: 'PF 4',
    rakeType: '15-CAR',
    frequency: 'Daily (Peak Hours)',
    operatingDays: 'Daily',
    status: 'Boarding',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '07:15 AM', departureTime: '07:18 AM', haltMinutes: 3, platform: 'PF 4', distanceKm: 0 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '07:25 AM', departureTime: '07:26 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 5 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '07:32 AM', departureTime: '07:34 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 9 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '07:41 AM', departureTime: '07:42 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 15 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '07:47 AM', departureTime: '07:48 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 19 },
      { stationCode: 'VK', stationName: 'Vikhroli', arrivalTime: '07:53 AM', departureTime: '07:54 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 23 },
      { stationCode: 'MLND', stationName: 'Mulund', arrivalTime: '07:59 AM', departureTime: '08:00 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 31 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:05 AM', departureTime: '08:07 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 34 },
      { stationCode: 'DIVA', stationName: 'Diva Junction', arrivalTime: '08:14 AM', departureTime: '08:15 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 43 },
      { stationCode: 'DI', stationName: 'Dombivli', arrivalTime: '08:19 AM', departureTime: '08:20 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 48 },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '08:23 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 5', distanceKm: 54 },
    ],
  },
  {
    id: 'cr-dn-03',
    trainNumber: '97023',
    trainName: 'CSMT - Kasara Semi-Fast Local',
    line: 'Central',
    direction: 'DOWN',
    origin: 'CSMT Mumbai',
    originCode: 'CSMT',
    destination: 'Kasara',
    destCode: 'KSRA',
    departureTime: '07:34 AM',
    arrivalTime: '10:04 AM',
    durationMinutes: 150,
    speedType: 'FAST',
    platform: 'PF 6',
    rakeType: '12-CAR',
    frequency: 'Hourly',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Heavy',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '07:30 AM', departureTime: '07:34 AM', haltMinutes: 4, platform: 'PF 6', distanceKm: 0 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '07:42 AM', departureTime: '07:43 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 5 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '07:48 AM', departureTime: '07:50 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 9 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '07:57 AM', departureTime: '07:58 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 15 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '08:03 AM', departureTime: '08:04 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 19 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:19 AM', departureTime: '08:21 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 34 },
      { stationCode: 'DI', stationName: 'Dombivli', arrivalTime: '08:32 AM', departureTime: '08:33 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 48 },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '08:38 AM', departureTime: '08:40 AM', haltMinutes: 2, platform: 'PF 7', distanceKm: 54 },
      { stationCode: 'SHAD', stationName: 'Shahad', arrivalTime: '08:45 AM', departureTime: '08:46 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 58 },
      { stationCode: 'ABY', stationName: 'Ambivli', arrivalTime: '08:49 AM', departureTime: '08:50 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 61 },
      { stationCode: 'TLA', stationName: 'Titwala', arrivalTime: '08:56 AM', departureTime: '08:57 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 67 },
      { stationCode: 'KDV', stationName: 'Khadavli', arrivalTime: '09:05 AM', departureTime: '09:06 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 75 },
      { stationCode: 'VSD', stationName: 'Vasind', arrivalTime: '09:14 AM', departureTime: '09:15 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 83 },
      { stationCode: 'ASO', stationName: 'Asangaon', arrivalTime: '09:24 AM', departureTime: '09:25 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 89 },
      { stationCode: 'ATG', stationName: 'Atgaon', arrivalTime: '09:36 AM', departureTime: '09:37 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 99 },
      { stationCode: 'KSRA', stationName: 'Kasara', arrivalTime: '10:04 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 1', distanceKm: 121 },
    ],
  },
  {
    id: 'cr-dn-04',
    trainNumber: '96005',
    trainName: 'CSMT - Karjat Fast Local',
    line: 'Central',
    direction: 'DOWN',
    origin: 'CSMT Mumbai',
    originCode: 'CSMT',
    destination: 'Karjat Junction',
    destCode: 'KJT',
    departureTime: '08:10 AM',
    arrivalTime: '10:18 AM',
    durationMinutes: 128,
    speedType: 'FAST',
    platform: 'PF 5',
    rakeType: '12-CAR',
    frequency: 'Hourly',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '08:05 AM', departureTime: '08:10 AM', haltMinutes: 5, platform: 'PF 5', distanceKm: 0 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '08:17 AM', departureTime: '08:18 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 5 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '08:24 AM', departureTime: '08:26 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 9 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '08:33 AM', departureTime: '08:34 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 15 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '08:39 AM', departureTime: '08:40 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 19 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:54 AM', departureTime: '08:56 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 34 },
      { stationCode: 'DI', stationName: 'Dombivli', arrivalTime: '09:07 AM', departureTime: '09:08 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 48 },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '09:14 AM', departureTime: '09:16 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 54 },
      { stationCode: 'VLDI', stationName: 'Vithalwadi', arrivalTime: '09:21 AM', departureTime: '09:22 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 56 },
      { stationCode: 'ULNR', stationName: 'Ulhasnagar', arrivalTime: '09:25 AM', departureTime: '09:26 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 58 },
      { stationCode: 'ABH', stationName: 'Ambernath', arrivalTime: '09:30 AM', departureTime: '09:31 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 60 },
      { stationCode: 'BUD', stationName: 'Badlapur', arrivalTime: '09:39 AM', departureTime: '09:40 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 68 },
      { stationCode: 'VGI', stationName: 'Vangani', arrivalTime: '09:51 AM', departureTime: '09:52 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 79 },
      { stationCode: 'NRL', stationName: 'Neral Junction', arrivalTime: '10:01 AM', departureTime: '10:02 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 87 },
      { stationCode: 'KJT', stationName: 'Karjat Junction', arrivalTime: '10:18 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 3', distanceKm: 100 },
    ],
  },
  {
    id: 'cr-dn-05',
    trainNumber: '97305',
    trainName: 'CSMT - Thane All-Stops Slow Local',
    line: 'Central',
    direction: 'DOWN',
    origin: 'CSMT Mumbai',
    originCode: 'CSMT',
    destination: 'Thane Central',
    destCode: 'TNA',
    departureTime: '08:25 AM',
    arrivalTime: '09:22 AM',
    durationMinutes: 57,
    speedType: 'SLOW',
    platform: 'PF 2',
    rakeType: '12-CAR',
    frequency: 'Every 5 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '08:20 AM', departureTime: '08:25 AM', haltMinutes: 5, platform: 'PF 2', distanceKm: 0 },
      { stationCode: 'MSD', stationName: 'Masjid', arrivalTime: '08:28 AM', departureTime: '08:29 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 1 },
      { stationCode: 'SNRD', stationName: 'Sandhurst Road', arrivalTime: '08:31 AM', departureTime: '08:32 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 2 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '08:35 AM', departureTime: '08:36 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 5 },
      { stationCode: 'CHG', stationName: 'Chinchpokli', arrivalTime: '08:38 AM', departureTime: '08:39 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 6 },
      { stationCode: 'CRD', stationName: 'Currey Road', arrivalTime: '08:41 AM', departureTime: '08:42 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 7 },
      { stationCode: 'PR', stationName: 'Parel', arrivalTime: '08:44 AM', departureTime: '08:45 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 8 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '08:48 AM', departureTime: '08:49 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 9 },
      { stationCode: 'MTN', stationName: 'Matunga', arrivalTime: '08:52 AM', departureTime: '08:53 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 11 },
      { stationCode: 'SIN', stationName: 'Sion', arrivalTime: '08:56 AM', departureTime: '08:57 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 13 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '09:01 AM', departureTime: '09:02 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 15 },
      { stationCode: 'VVH', stationName: 'Vidyavihar', arrivalTime: '09:05 AM', departureTime: '09:06 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 17 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '09:08 AM', departureTime: '09:09 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 19 },
      { stationCode: 'VK', stationName: 'Vikhroli', arrivalTime: '09:12 AM', departureTime: '09:13 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 23 },
      { stationCode: 'KJMG', stationName: 'Kanjurmarg', arrivalTime: '09:15 AM', departureTime: '09:16 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 25 },
      { stationCode: 'BND', stationName: 'Bhandup', arrivalTime: '09:18 AM', departureTime: '09:19 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 27 },
      { stationCode: 'NHU', stationName: 'Nahur', arrivalTime: '09:21 AM', departureTime: '09:22 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 29 },
      { stationCode: 'MLND', stationName: 'Mulund', arrivalTime: '09:24 AM', departureTime: '09:25 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 31 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '09:30 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 3', distanceKm: 34 },
    ],
  },

  // =========================================================
  // CENTRAL LINE (CR): UP (Inbound towards Dadar & CSMT)
  // =========================================================
  {
    id: 'cr-up-01',
    trainNumber: '95318',
    trainName: 'Kalyan - CSMT Fast AC Local',
    line: 'Central',
    direction: 'UP',
    origin: 'Kalyan Junction',
    originCode: 'KYN',
    destination: 'CSMT Mumbai',
    destCode: 'CSMT',
    departureTime: '07:55 AM',
    arrivalTime: '08:58 AM',
    durationMinutes: 63,
    speedType: 'AC_FAST',
    platform: 'PF 5',
    rakeType: 'AC LOCAL',
    frequency: 'Daily (Peak Hours)',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '07:50 AM', departureTime: '07:55 AM', haltMinutes: 5, platform: 'PF 5', distanceKm: 0 },
      { stationCode: 'DI', stationName: 'Dombivli', arrivalTime: '08:02 AM', departureTime: '08:03 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 6 },
      { stationCode: 'DIVA', stationName: 'Diva Junction', arrivalTime: '08:08 AM', departureTime: '08:09 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 11 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:17 AM', departureTime: '08:19 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 20 },
      { stationCode: 'MLND', stationName: 'Mulund', arrivalTime: '08:24 AM', departureTime: '08:25 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 23 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '08:34 AM', departureTime: '08:35 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 35 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '08:41 AM', departureTime: '08:42 AM', haltMinutes: 1, platform: 'PF 6', distanceKm: 39 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '08:49 AM', departureTime: '08:51 AM', haltMinutes: 2, platform: 'PF 3', distanceKm: 45 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '08:56 AM', departureTime: '08:57 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 49 },
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '09:05 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 4', distanceKm: 54 },
    ],
  },
  {
    id: 'cr-up-02',
    trainNumber: '97312',
    trainName: 'Thane - CSMT All-Stops Slow Local',
    line: 'Central',
    direction: 'UP',
    origin: 'Thane Central',
    originCode: 'TNA',
    destination: 'CSMT Mumbai',
    destCode: 'CSMT',
    departureTime: '08:12 AM',
    arrivalTime: '09:10 AM',
    durationMinutes: 58,
    speedType: 'SLOW',
    platform: 'PF 2',
    rakeType: '12-CAR',
    frequency: 'Every 4 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 2,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:10 AM', departureTime: '08:12 AM', haltMinutes: 2, platform: 'PF 2', distanceKm: 0 },
      { stationCode: 'MLND', stationName: 'Mulund', arrivalTime: '08:16 AM', departureTime: '08:17 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 3 },
      { stationCode: 'NHU', stationName: 'Nahur', arrivalTime: '08:20 AM', departureTime: '08:21 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 5 },
      { stationCode: 'BND', stationName: 'Bhandup', arrivalTime: '08:24 AM', departureTime: '08:25 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 7 },
      { stationCode: 'KJMG', stationName: 'Kanjurmarg', arrivalTime: '08:28 AM', departureTime: '08:29 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 9 },
      { stationCode: 'VK', stationName: 'Vikhroli', arrivalTime: '08:32 AM', departureTime: '08:33 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 11 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '08:37 AM', departureTime: '08:38 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 15 },
      { stationCode: 'VVH', stationName: 'Vidyavihar', arrivalTime: '08:41 AM', departureTime: '08:42 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 17 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '08:45 AM', departureTime: '08:46 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 19 },
      { stationCode: 'SIN', stationName: 'Sion', arrivalTime: '08:50 AM', departureTime: '08:51 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 22 },
      { stationCode: 'MTN', stationName: 'Matunga', arrivalTime: '08:54 AM', departureTime: '08:55 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 24 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '08:58 AM', departureTime: '09:00 AM', haltMinutes: 2, platform: 'PF 3', distanceKm: 25 },
      { stationCode: 'PR', stationName: 'Parel', arrivalTime: '09:03 AM', departureTime: '09:04 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 27 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '09:09 AM', departureTime: '09:10 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 29 },
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '09:16 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 2', distanceKm: 34 },
    ],
  },
  {
    id: 'cr-up-03',
    trainNumber: '95404',
    trainName: 'Kasara - CSMT Fast Local',
    line: 'Central',
    direction: 'UP',
    origin: 'Kasara',
    originCode: 'KSRA',
    destination: 'CSMT Mumbai',
    destCode: 'CSMT',
    departureTime: '06:50 AM',
    arrivalTime: '09:20 AM',
    durationMinutes: 150,
    speedType: 'FAST',
    platform: 'PF 1',
    rakeType: '12-CAR',
    frequency: 'Daily',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'KSRA', stationName: 'Kasara', arrivalTime: '06:45 AM', departureTime: '06:50 AM', haltMinutes: 5, platform: 'PF 1', distanceKm: 0 },
      { stationCode: 'ASO', stationName: 'Asangaon', arrivalTime: '07:28 AM', departureTime: '07:29 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 32 },
      { stationCode: 'TLA', stationName: 'Titwala', arrivalTime: '07:45 AM', departureTime: '07:46 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 54 },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '08:04 AM', departureTime: '08:06 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 67 },
      { stationCode: 'DI', stationName: 'Dombivli', arrivalTime: '08:13 AM', departureTime: '08:14 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 73 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:29 AM', departureTime: '08:31 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 87 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '08:46 AM', departureTime: '08:47 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 102 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '08:53 AM', departureTime: '08:54 AM', haltMinutes: 1, platform: 'PF 6', distanceKm: 106 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '09:02 AM', departureTime: '09:04 AM', haltMinutes: 2, platform: 'PF 3', distanceKm: 112 },
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '09:20 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 5', distanceKm: 121 },
    ],
  },

  // =========================================================
  // WESTERN LINE (WR): DOWN (Churchgate Outbound to Borivali / Virar / Dahanu)
  // =========================================================
  {
    id: 'wr-dn-01',
    trainNumber: '92019',
    trainName: 'Churchgate - Virar AC Fast Local',
    line: 'Western',
    direction: 'DOWN',
    origin: 'Churchgate',
    originCode: 'CCG',
    destination: 'Virar',
    destCode: 'VR',
    departureTime: '07:25 AM',
    arrivalTime: '08:44 AM',
    durationMinutes: 79,
    speedType: 'AC_FAST',
    platform: 'PF 3',
    rakeType: 'AC LOCAL',
    frequency: 'Every 6 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', arrivalTime: '07:20 AM', departureTime: '07:25 AM', haltMinutes: 5, platform: 'PF 3', distanceKm: 0 },
      { stationCode: 'BCL', stationName: 'Mumbai Central', arrivalTime: '07:34 AM', departureTime: '07:35 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 5 },
      { stationCode: 'DDR', stationName: 'Dadar Western', arrivalTime: '07:42 AM', departureTime: '07:44 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 10 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '07:50 AM', departureTime: '07:51 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 15 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '07:59 AM', departureTime: '08:01 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 22 },
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '08:14 AM', departureTime: '08:16 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 34 },
      { stationCode: 'BYR', stationName: 'Bhayandar', arrivalTime: '08:26 AM', departureTime: '08:27 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 43 },
      { stationCode: 'BSR', stationName: 'Vasai Road', arrivalTime: '08:34 AM', departureTime: '08:35 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 52 },
      { stationCode: 'NSP', stationName: 'Nallasopara', arrivalTime: '08:39 AM', departureTime: '08:40 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 56 },
      { stationCode: 'VR', stationName: 'Virar', arrivalTime: '08:44 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 3', distanceKm: 60 },
    ],
  },
  {
    id: 'wr-dn-02',
    trainNumber: '90105',
    trainName: 'Churchgate - Borivali Fast Local',
    line: 'Western',
    direction: 'DOWN',
    origin: 'Churchgate',
    originCode: 'CCG',
    destination: 'Borivali',
    destCode: 'BVI',
    departureTime: '08:15 AM',
    arrivalTime: '09:02 AM',
    durationMinutes: 47,
    speedType: 'FAST',
    platform: 'PF 4',
    rakeType: '15-CAR',
    frequency: 'Every 4 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', arrivalTime: '08:10 AM', departureTime: '08:15 AM', haltMinutes: 5, platform: 'PF 4', distanceKm: 0 },
      { stationCode: 'BCL', stationName: 'Mumbai Central', arrivalTime: '08:24 AM', departureTime: '08:25 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 5 },
      { stationCode: 'DDR', stationName: 'Dadar Western', arrivalTime: '08:32 AM', departureTime: '08:34 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 10 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '08:40 AM', departureTime: '08:41 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 15 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '08:49 AM', departureTime: '08:51 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 22 },
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '09:02 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 5', distanceKm: 34 },
    ],
  },
  {
    id: 'wr-dn-03',
    trainNumber: '90211',
    trainName: 'Churchgate - Andheri All-Stops Slow Local',
    line: 'Western',
    direction: 'DOWN',
    origin: 'Churchgate',
    originCode: 'CCG',
    destination: 'Andheri',
    destCode: 'ADH',
    departureTime: '08:30 AM',
    arrivalTime: '09:18 AM',
    durationMinutes: 48,
    speedType: 'SLOW',
    platform: 'PF 2',
    rakeType: '12-CAR',
    frequency: 'Every 5 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Heavy',
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', arrivalTime: '08:25 AM', departureTime: '08:30 AM', haltMinutes: 5, platform: 'PF 2', distanceKm: 0 },
      { stationCode: 'MEL', stationName: 'Marine Lines', arrivalTime: '08:33 AM', departureTime: '08:34 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 1 },
      { stationCode: 'CYR', stationName: 'Charni Road', arrivalTime: '08:36 AM', departureTime: '08:37 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 2 },
      { stationCode: 'GTR', stationName: 'Grant Road', arrivalTime: '08:40 AM', departureTime: '08:41 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 4 },
      { stationCode: 'BCL', stationName: 'Mumbai Central', arrivalTime: '08:43 AM', departureTime: '08:44 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 5 },
      { stationCode: 'MX', stationName: 'Mahalaxmi', arrivalTime: '08:47 AM', departureTime: '08:48 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 6 },
      { stationCode: 'PL', stationName: 'Lower Parel', arrivalTime: '08:51 AM', departureTime: '08:52 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 8 },
      { stationCode: 'PBHD', stationName: 'Prabhadevi', arrivalTime: '08:55 AM', departureTime: '08:56 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 9 },
      { stationCode: 'DDR', stationName: 'Dadar Western', arrivalTime: '08:58 AM', departureTime: '08:59 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 10 },
      { stationCode: 'MRU', stationName: 'Matunga Road', arrivalTime: '09:02 AM', departureTime: '09:03 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 12 },
      { stationCode: 'MM', stationName: 'Mahim Junction', arrivalTime: '09:05 AM', departureTime: '09:06 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 13 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '09:09 AM', departureTime: '09:10 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 15 },
      { stationCode: 'KHAR', stationName: 'Khar Road', arrivalTime: '09:13 AM', departureTime: '09:14 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 17 },
      { stationCode: 'STC', stationName: 'Santacruz', arrivalTime: '09:16 AM', departureTime: '09:17 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 18 },
      { stationCode: 'VLP', stationName: 'Vile Parle', arrivalTime: '09:20 AM', departureTime: '09:21 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 20 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '09:26 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 4', distanceKm: 22 },
    ],
  },
  {
    id: 'wr-dn-04',
    trainNumber: '93003',
    trainName: 'Churchgate - Dahanu Road Fast Local',
    line: 'Western',
    direction: 'DOWN',
    origin: 'Churchgate',
    originCode: 'CCG',
    destination: 'Dahanu Road',
    destCode: 'DRD',
    departureTime: '07:45 AM',
    arrivalTime: '10:05 AM',
    durationMinutes: 140,
    speedType: 'FAST',
    platform: 'PF 4',
    rakeType: '12-CAR',
    frequency: 'Twice daily',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', arrivalTime: '07:40 AM', departureTime: '07:45 AM', haltMinutes: 5, platform: 'PF 4', distanceKm: 0 },
      { stationCode: 'BCL', stationName: 'Mumbai Central', arrivalTime: '07:54 AM', departureTime: '07:55 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 5 },
      { stationCode: 'DDR', stationName: 'Dadar Western', arrivalTime: '08:02 AM', departureTime: '08:04 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 10 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '08:10 AM', departureTime: '08:11 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 15 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '08:19 AM', departureTime: '08:21 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 22 },
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '08:34 AM', departureTime: '08:36 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 34 },
      { stationCode: 'BYR', stationName: 'Bhayandar', arrivalTime: '08:46 AM', departureTime: '08:47 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 43 },
      { stationCode: 'BSR', stationName: 'Vasai Road', arrivalTime: '08:54 AM', departureTime: '08:55 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 52 },
      { stationCode: 'VR', stationName: 'Virar', arrivalTime: '09:05 AM', departureTime: '09:07 AM', haltMinutes: 2, platform: 'PF 3', distanceKm: 60 },
      { stationCode: 'VTN', stationName: 'Vaitarna', arrivalTime: '09:17 AM', departureTime: '09:18 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 69 },
      { stationCode: 'SAH', stationName: 'Saphale', arrivalTime: '09:26 AM', departureTime: '09:27 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 76 },
      { stationCode: 'PLG', stationName: 'Palghar', arrivalTime: '09:42 AM', departureTime: '09:44 AM', haltMinutes: 2, platform: 'PF 2', distanceKm: 91 },
      { stationCode: 'BOR', stationName: 'Boisar', arrivalTime: '09:54 AM', departureTime: '09:55 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 102 },
      { stationCode: 'DRD', stationName: 'Dahanu Road', arrivalTime: '10:05 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 3', distanceKm: 124 },
    ],
  },

  // =========================================================
  // WESTERN LINE (WR): UP (Inbound towards Bandra, Dadar & Churchgate)
  // =========================================================
  {
    id: 'wr-up-01',
    trainNumber: '92044',
    trainName: 'Borivali - Churchgate Fast Local',
    line: 'Western',
    direction: 'UP',
    origin: 'Borivali',
    originCode: 'BVI',
    destination: 'Churchgate',
    destCode: 'CCG',
    departureTime: '08:05 AM',
    arrivalTime: '08:52 AM',
    durationMinutes: 47,
    speedType: 'FAST',
    platform: 'PF 5',
    rakeType: '15-CAR',
    frequency: 'Every 3 mins',
    operatingDays: 'Daily',
    status: 'Boarding',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '08:00 AM', departureTime: '08:05 AM', haltMinutes: 5, platform: 'PF 5', distanceKm: 0 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '08:18 AM', departureTime: '08:20 AM', haltMinutes: 2, platform: 'PF 7', distanceKm: 12 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '08:28 AM', departureTime: '08:29 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 19 },
      { stationCode: 'DDR', stationName: 'Dadar Western', arrivalTime: '08:35 AM', departureTime: '08:37 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 24 },
      { stationCode: 'BCL', stationName: 'Mumbai Central', arrivalTime: '08:44 AM', departureTime: '08:45 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 29 },
      { stationCode: 'CCG', stationName: 'Churchgate', arrivalTime: '08:52 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 4', distanceKm: 34 },
    ],
  },
  {
    id: 'wr-up-02',
    trainNumber: '92022',
    trainName: 'Virar - Churchgate AC Fast Local',
    line: 'Western',
    direction: 'UP',
    origin: 'Virar',
    originCode: 'VR',
    destination: 'Churchgate',
    destCode: 'CCG',
    departureTime: '08:20 AM',
    arrivalTime: '09:39 AM',
    durationMinutes: 79,
    speedType: 'AC_FAST',
    platform: 'PF 3',
    rakeType: 'AC LOCAL',
    frequency: 'Every 8 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'VR', stationName: 'Virar', arrivalTime: '08:15 AM', departureTime: '08:20 AM', haltMinutes: 5, platform: 'PF 3', distanceKm: 0 },
      { stationCode: 'NSP', stationName: 'Nallasopara', arrivalTime: '08:24 AM', departureTime: '08:25 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 4 },
      { stationCode: 'BSR', stationName: 'Vasai Road', arrivalTime: '08:29 AM', departureTime: '08:30 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 8 },
      { stationCode: 'BYR', stationName: 'Bhayandar', arrivalTime: '08:37 AM', departureTime: '08:38 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 17 },
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '08:49 AM', departureTime: '08:51 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 26 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '09:05 AM', departureTime: '09:07 AM', haltMinutes: 2, platform: 'PF 7', distanceKm: 38 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '09:15 AM', departureTime: '09:16 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 45 },
      { stationCode: 'DDR', stationName: 'Dadar Western', arrivalTime: '09:22 AM', departureTime: '09:24 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 50 },
      { stationCode: 'BCL', stationName: 'Mumbai Central', arrivalTime: '09:31 AM', departureTime: '09:32 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 55 },
      { stationCode: 'CCG', stationName: 'Churchgate', arrivalTime: '09:39 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 3', distanceKm: 60 },
    ],
  },

  // =========================================================
  // HARBOUR LINE (CSMT - Vashi - Panvel & Goregaon)
  // =========================================================
  {
    id: 'hr-dn-01',
    trainNumber: '99214',
    trainName: 'CSMT - Panvel All-Stops Harbour Local',
    line: 'Harbour',
    direction: 'DOWN',
    origin: 'CSMT Mumbai',
    originCode: 'CSMT',
    destination: 'Panvel Junction',
    destCode: 'PNVL',
    departureTime: '07:52 AM',
    arrivalTime: '09:12 AM',
    durationMinutes: 80,
    speedType: 'SLOW',
    platform: 'PF 1',
    rakeType: '12-CAR',
    frequency: 'Every 6 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Heavy',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '07:48 AM', departureTime: '07:52 AM', haltMinutes: 4, platform: 'PF 1', distanceKm: 0 },
      { stationCode: 'MSD', stationName: 'Masjid', arrivalTime: '07:55 AM', departureTime: '07:56 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 1 },
      { stationCode: 'SNRD', stationName: 'Sandhurst Road', arrivalTime: '07:58 AM', departureTime: '07:59 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 2 },
      { stationCode: 'DKRD', stationName: 'Dockyard Road', arrivalTime: '08:02 AM', departureTime: '08:03 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 4 },
      { stationCode: 'RRD', stationName: 'Reay Road', arrivalTime: '08:05 AM', departureTime: '08:06 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 5 },
      { stationCode: 'CTGN', stationName: 'Cotton Green', arrivalTime: '08:08 AM', departureTime: '08:09 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 6 },
      { stationCode: 'SVE', stationName: 'Sewri', arrivalTime: '08:11 AM', departureTime: '08:12 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 8 },
      { stationCode: 'VDLR', stationName: 'Vadala Road', arrivalTime: '08:15 AM', departureTime: '08:16 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 9 },
      { stationCode: 'GTBN', stationName: 'Guru Tegh Bahadur Nagar', arrivalTime: '08:19 AM', departureTime: '08:20 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 12 },
      { stationCode: 'CHF', stationName: 'Chunabhatti', arrivalTime: '08:22 AM', departureTime: '08:23 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 13 },
      { stationCode: 'CLAH', stationName: 'Kurla Harbour', arrivalTime: '08:26 AM', departureTime: '08:27 AM', haltMinutes: 1, platform: 'PF 7', distanceKm: 15 },
      { stationCode: 'TKNG', stationName: 'Tilak Nagar', arrivalTime: '08:30 AM', departureTime: '08:31 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 17 },
      { stationCode: 'CMBR', stationName: 'Chembur', arrivalTime: '08:33 AM', departureTime: '08:34 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 19 },
      { stationCode: 'GV', stationName: 'Govandi', arrivalTime: '08:36 AM', departureTime: '08:37 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 21 },
      { stationCode: 'MNKD', stationName: 'Mankhurd', arrivalTime: '08:40 AM', departureTime: '08:41 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 24 },
      { stationCode: 'VSH', stationName: 'Vashi', arrivalTime: '08:49 AM', departureTime: '08:50 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 29 },
      { stationCode: 'SNPD', stationName: 'Sanpada', arrivalTime: '08:53 AM', departureTime: '08:54 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 31 },
      { stationCode: 'JNJ', stationName: 'Juinagar', arrivalTime: '08:57 AM', departureTime: '08:58 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 33 },
      { stationCode: 'NEU', stationName: 'Nerul', arrivalTime: '09:01 AM', departureTime: '09:02 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 35 },
      { stationCode: 'SWDV', stationName: 'Seawoods-Darave', arrivalTime: '09:05 AM', departureTime: '09:06 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 37 },
      { stationCode: 'BEPR', stationName: 'Belapur CBD', arrivalTime: '09:10 AM', departureTime: '09:11 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 40 },
      { stationCode: 'KHAG', stationName: 'Kharghar', arrivalTime: '09:15 AM', departureTime: '09:16 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 43 },
      { stationCode: 'MANR', stationName: 'Mansarovar', arrivalTime: '09:19 AM', departureTime: '09:20 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 45 },
      { stationCode: 'KNDS', stationName: 'Khandeshwar', arrivalTime: '09:23 AM', departureTime: '09:24 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 47 },
      { stationCode: 'PNVL', stationName: 'Panvel Junction', arrivalTime: '09:30 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 3', distanceKm: 49 },
    ],
  },
  {
    id: 'hr-dn-02',
    trainNumber: '98012',
    trainName: 'CSMT - Goregaon Western-Harbour Local',
    line: 'Harbour',
    direction: 'DOWN',
    origin: 'CSMT Mumbai',
    originCode: 'CSMT',
    destination: 'Goregaon',
    destCode: 'GMN',
    departureTime: '08:18 AM',
    arrivalTime: '09:12 AM',
    durationMinutes: 54,
    speedType: 'SLOW',
    platform: 'PF 2',
    rakeType: '12-CAR',
    frequency: 'Every 15 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Moderate',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '08:14 AM', departureTime: '08:18 AM', haltMinutes: 4, platform: 'PF 2', distanceKm: 0 },
      { stationCode: 'MSD', stationName: 'Masjid', arrivalTime: '08:21 AM', departureTime: '08:22 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 1 },
      { stationCode: 'SNRD', stationName: 'Sandhurst Road', arrivalTime: '08:24 AM', departureTime: '08:25 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 2 },
      { stationCode: 'DKRD', stationName: 'Dockyard Road', arrivalTime: '08:28 AM', departureTime: '08:29 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 4 },
      { stationCode: 'RRD', stationName: 'Reay Road', arrivalTime: '08:31 AM', departureTime: '08:32 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 5 },
      { stationCode: 'CTGN', stationName: 'Cotton Green', arrivalTime: '08:34 AM', departureTime: '08:35 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 6 },
      { stationCode: 'SVE', stationName: 'Sewri', arrivalTime: '08:37 AM', departureTime: '08:38 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 8 },
      { stationCode: 'VDLR', stationName: 'Vadala Road', arrivalTime: '08:41 AM', departureTime: '08:43 AM', haltMinutes: 2, platform: 'PF 3', distanceKm: 9 },
      { stationCode: 'KCE', stationName: "King's Circle", arrivalTime: '08:47 AM', departureTime: '08:48 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 11 },
      { stationCode: 'MM', stationName: 'Mahim Junction', arrivalTime: '08:51 AM', departureTime: '08:52 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 13 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '08:56 AM', departureTime: '08:57 AM', haltMinutes: 1, platform: 'PF 6', distanceKm: 15 },
      { stationCode: 'KHAR', stationName: 'Khar Road', arrivalTime: '09:00 AM', departureTime: '09:01 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 17 },
      { stationCode: 'STC', stationName: 'Santacruz', arrivalTime: '09:03 AM', departureTime: '09:04 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 18 },
      { stationCode: 'VLP', stationName: 'Vile Parle', arrivalTime: '09:07 AM', departureTime: '09:08 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 20 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '09:13 AM', departureTime: '09:14 AM', haltMinutes: 1, platform: 'PF 7', distanceKm: 22 },
      { stationCode: 'JOS', stationName: 'Jogeshwari', arrivalTime: '09:17 AM', departureTime: '09:18 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 24 },
      { stationCode: 'RMAR', stationName: 'Ram Mandir', arrivalTime: '09:20 AM', departureTime: '09:21 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 26 },
      { stationCode: 'GMN', stationName: 'Goregaon', arrivalTime: '09:26 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 6', distanceKm: 28 },
    ],
  },
  {
    id: 'hr-up-01',
    trainNumber: '99215',
    trainName: 'Panvel - CSMT Harbour Local',
    line: 'Harbour',
    direction: 'UP',
    origin: 'Panvel Junction',
    originCode: 'PNVL',
    destination: 'CSMT Mumbai',
    destCode: 'CSMT',
    departureTime: '08:05 AM',
    arrivalTime: '09:25 AM',
    durationMinutes: 80,
    speedType: 'SLOW',
    platform: 'PF 2',
    rakeType: '12-CAR',
    frequency: 'Every 6 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'PNVL', stationName: 'Panvel Junction', arrivalTime: '08:00 AM', departureTime: '08:05 AM', haltMinutes: 5, platform: 'PF 2', distanceKm: 0 },
      { stationCode: 'KNDS', stationName: 'Khandeshwar', arrivalTime: '08:10 AM', departureTime: '08:11 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 2 },
      { stationCode: 'MANR', stationName: 'Mansarovar', arrivalTime: '08:14 AM', departureTime: '08:15 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 4 },
      { stationCode: 'KHAG', stationName: 'Kharghar', arrivalTime: '08:18 AM', departureTime: '08:19 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 6 },
      { stationCode: 'BEPR', stationName: 'Belapur CBD', arrivalTime: '08:23 AM', departureTime: '08:24 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 9 },
      { stationCode: 'SWDV', stationName: 'Seawoods-Darave', arrivalTime: '08:28 AM', departureTime: '08:29 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 12 },
      { stationCode: 'NEU', stationName: 'Nerul', arrivalTime: '08:32 AM', departureTime: '08:33 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 14 },
      { stationCode: 'JNJ', stationName: 'Juinagar', arrivalTime: '08:36 AM', departureTime: '08:37 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 16 },
      { stationCode: 'SNPD', stationName: 'Sanpada', arrivalTime: '08:40 AM', departureTime: '08:41 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 18 },
      { stationCode: 'VSH', stationName: 'Vashi', arrivalTime: '08:44 AM', departureTime: '08:45 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 20 },
      { stationCode: 'MNKD', stationName: 'Mankhurd', arrivalTime: '08:53 AM', departureTime: '08:54 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 25 },
      { stationCode: 'GV', stationName: 'Govandi', arrivalTime: '08:57 AM', departureTime: '08:58 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 28 },
      { stationCode: 'CMBR', stationName: 'Chembur', arrivalTime: '09:00 AM', departureTime: '09:01 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 30 },
      { stationCode: 'TKNG', stationName: 'Tilak Nagar', arrivalTime: '09:03 AM', departureTime: '09:04 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 32 },
      { stationCode: 'CLAH', stationName: 'Kurla Harbour', arrivalTime: '09:07 AM', departureTime: '09:08 AM', haltMinutes: 1, platform: 'PF 8', distanceKm: 34 },
      { stationCode: 'CHF', stationName: 'Chunabhatti', arrivalTime: '09:11 AM', departureTime: '09:12 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 36 },
      { stationCode: 'GTBN', stationName: 'Guru Tegh Bahadur Nagar', arrivalTime: '09:14 AM', departureTime: '09:15 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 37 },
      { stationCode: 'VDLR', stationName: 'Vadala Road', arrivalTime: '09:19 AM', departureTime: '09:20 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 40 },
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '09:35 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 1', distanceKm: 49 },
    ],
  },

  // =========================================================
  // TRANS-HARBOUR LINE (Thane - Vashi / Panvel)
  // =========================================================
  {
    id: 'thr-dn-01',
    trainNumber: '99021',
    trainName: 'Thane - Vashi Trans-Harbour Local',
    line: 'TransHarbour',
    direction: 'DOWN',
    origin: 'Thane Central',
    originCode: 'TNA',
    destination: 'Vashi',
    destCode: 'VSH',
    departureTime: '07:40 AM',
    arrivalTime: '08:09 AM',
    durationMinutes: 29,
    speedType: 'SLOW',
    platform: 'PF 9',
    rakeType: '12-CAR',
    frequency: 'Every 7 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Moderate',
    stops: [
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '07:35 AM', departureTime: '07:40 AM', haltMinutes: 5, platform: 'PF 9', distanceKm: 0 },
      { stationCode: 'DIGH', stationName: 'Digha Gaon', arrivalTime: '07:45 AM', departureTime: '07:46 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 3 },
      { stationCode: 'AIRL', stationName: 'Airoli', arrivalTime: '07:49 AM', departureTime: '07:50 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 6 },
      { stationCode: 'RABE', stationName: 'Rabale', arrivalTime: '07:53 AM', departureTime: '07:54 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 9 },
      { stationCode: 'GNSL', stationName: 'Ghansoli', arrivalTime: '07:57 AM', departureTime: '07:58 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 12 },
      { stationCode: 'KPHN', stationName: 'Kopar Khairane', arrivalTime: '08:01 AM', departureTime: '08:02 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 15 },
      { stationCode: 'TUH', stationName: 'Turbhe', arrivalTime: '08:05 AM', departureTime: '08:06 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 18 },
      { stationCode: 'SNPD', stationName: 'Sanpada', arrivalTime: '08:09 AM', departureTime: '08:10 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 20 },
      { stationCode: 'VSH', stationName: 'Vashi', arrivalTime: '08:15 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 4', distanceKm: 21 },
    ],
  },
  {
    id: 'thr-dn-02',
    trainNumber: '99105',
    trainName: 'Thane - Panvel Direct Trans-Harbour Local',
    line: 'TransHarbour',
    direction: 'DOWN',
    origin: 'Thane Central',
    originCode: 'TNA',
    destination: 'Panvel Junction',
    destCode: 'PNVL',
    departureTime: '08:15 AM',
    arrivalTime: '09:07 AM',
    durationMinutes: 52,
    speedType: 'SLOW',
    platform: 'PF 10',
    rakeType: '12-CAR',
    frequency: 'Every 15 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Heavy',
    stops: [
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:10 AM', departureTime: '08:15 AM', haltMinutes: 5, platform: 'PF 10', distanceKm: 0 },
      { stationCode: 'DIGH', stationName: 'Digha Gaon', arrivalTime: '08:20 AM', departureTime: '08:21 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 3 },
      { stationCode: 'AIRL', stationName: 'Airoli', arrivalTime: '08:24 AM', departureTime: '08:25 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 6 },
      { stationCode: 'RABE', stationName: 'Rabale', arrivalTime: '08:28 AM', departureTime: '08:29 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 9 },
      { stationCode: 'GNSL', stationName: 'Ghansoli', arrivalTime: '08:32 AM', departureTime: '08:33 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 12 },
      { stationCode: 'KPHN', stationName: 'Kopar Khairane', arrivalTime: '08:36 AM', departureTime: '08:37 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 15 },
      { stationCode: 'TUH', stationName: 'Turbhe', arrivalTime: '08:41 AM', departureTime: '08:42 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 18 },
      { stationCode: 'JNJ', stationName: 'Juinagar', arrivalTime: '08:46 AM', departureTime: '08:47 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 21 },
      { stationCode: 'NEU', stationName: 'Nerul', arrivalTime: '08:50 AM', departureTime: '08:51 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 23 },
      { stationCode: 'SWDV', stationName: 'Seawoods-Darave', arrivalTime: '08:54 AM', departureTime: '08:55 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 25 },
      { stationCode: 'BEPR', stationName: 'Belapur CBD', arrivalTime: '08:58 AM', departureTime: '08:59 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 28 },
      { stationCode: 'KHAG', stationName: 'Kharghar', arrivalTime: '09:03 AM', departureTime: '09:04 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 31 },
      { stationCode: 'MANR', stationName: 'Mansarovar', arrivalTime: '09:07 AM', departureTime: '09:08 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 33 },
      { stationCode: 'KNDS', stationName: 'Khandeshwar', arrivalTime: '09:11 AM', departureTime: '09:12 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 35 },
      { stationCode: 'PNVL', stationName: 'Panvel Junction', arrivalTime: '09:18 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 5', distanceKm: 38 },
    ],
  },
  {
    id: 'thr-up-01',
    trainNumber: '99022',
    trainName: 'Vashi - Thane Trans-Harbour Local',
    line: 'TransHarbour',
    direction: 'UP',
    origin: 'Vashi',
    originCode: 'VSH',
    destination: 'Thane Central',
    destCode: 'TNA',
    departureTime: '08:20 AM',
    arrivalTime: '08:49 AM',
    durationMinutes: 29,
    speedType: 'SLOW',
    platform: 'PF 4',
    rakeType: '12-CAR',
    frequency: 'Every 7 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Moderate',
    stops: [
      { stationCode: 'VSH', stationName: 'Vashi', arrivalTime: '08:15 AM', departureTime: '08:20 AM', haltMinutes: 5, platform: 'PF 4', distanceKm: 0 },
      { stationCode: 'SNPD', stationName: 'Sanpada', arrivalTime: '08:23 AM', departureTime: '08:24 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 1 },
      { stationCode: 'TUH', stationName: 'Turbhe', arrivalTime: '08:27 AM', departureTime: '08:28 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 3 },
      { stationCode: 'KPHN', stationName: 'Kopar Khairane', arrivalTime: '08:32 AM', departureTime: '08:33 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 6 },
      { stationCode: 'GNSL', stationName: 'Ghansoli', arrivalTime: '08:36 AM', departureTime: '08:37 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 9 },
      { stationCode: 'RABE', stationName: 'Rabale', arrivalTime: '08:40 AM', departureTime: '08:41 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 12 },
      { stationCode: 'AIRL', stationName: 'Airoli', arrivalTime: '08:44 AM', departureTime: '08:45 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 15 },
      { stationCode: 'DIGH', stationName: 'Digha Gaon', arrivalTime: '08:48 AM', departureTime: '08:49 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 18 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:55 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 9', distanceKm: 21 },
    ],
  },
  {
    id: 'thr-up-02',
    trainNumber: '99106',
    trainName: 'Panvel - Thane Direct Trans-Harbour Local',
    line: 'TransHarbour',
    direction: 'UP',
    origin: 'Panvel Junction',
    originCode: 'PNVL',
    destination: 'Thane Central',
    destCode: 'TNA',
    departureTime: '08:30 AM',
    arrivalTime: '09:22 AM',
    durationMinutes: 52,
    speedType: 'SLOW',
    platform: 'PF 5',
    rakeType: '12-CAR',
    frequency: 'Every 15 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Heavy',
    stops: [
      { stationCode: 'PNVL', stationName: 'Panvel Junction', arrivalTime: '08:25 AM', departureTime: '08:30 AM', haltMinutes: 5, platform: 'PF 5', distanceKm: 0 },
      { stationCode: 'KNDS', stationName: 'Khandeshwar', arrivalTime: '08:35 AM', departureTime: '08:36 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 3 },
      { stationCode: 'MANR', stationName: 'Mansarovar', arrivalTime: '08:39 AM', departureTime: '08:40 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 5 },
      { stationCode: 'KHAG', stationName: 'Kharghar', arrivalTime: '08:43 AM', departureTime: '08:44 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 7 },
      { stationCode: 'BEPR', stationName: 'Belapur CBD', arrivalTime: '08:48 AM', departureTime: '08:49 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 10 },
      { stationCode: 'SWDV', stationName: 'Seawoods-Darave', arrivalTime: '08:53 AM', departureTime: '08:54 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 13 },
      { stationCode: 'NEU', stationName: 'Nerul', arrivalTime: '08:57 AM', departureTime: '08:58 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 15 },
      { stationCode: 'JNJ', stationName: 'Juinagar', arrivalTime: '09:01 AM', departureTime: '09:02 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 17 },
      { stationCode: 'TUH', stationName: 'Turbhe', arrivalTime: '09:06 AM', departureTime: '09:07 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 20 },
      { stationCode: 'KPHN', stationName: 'Kopar Khairane', arrivalTime: '09:11 AM', departureTime: '09:12 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 23 },
      { stationCode: 'GNSL', stationName: 'Ghansoli', arrivalTime: '09:15 AM', departureTime: '09:16 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 26 },
      { stationCode: 'RABE', stationName: 'Rabale', arrivalTime: '09:19 AM', departureTime: '09:20 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 29 },
      { stationCode: 'AIRL', stationName: 'Airoli', arrivalTime: '09:23 AM', departureTime: '09:24 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 32 },
      { stationCode: 'DIGH', stationName: 'Digha Gaon', arrivalTime: '09:27 AM', departureTime: '09:28 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 35 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '09:35 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 10', distanceKm: 38 },
    ],
  },

  // =========================================================
  // URAN LINE (Nerul / Belapur to Uran)
  // =========================================================
  {
    id: 'uran-01',
    trainNumber: '99701',
    trainName: 'Nerul - Uran All-Stops Local',
    line: 'Uran',
    direction: 'DOWN',
    origin: 'Nerul',
    originCode: 'NEU',
    destination: 'Uran',
    destCode: 'URAN',
    departureTime: '08:10 AM',
    arrivalTime: '08:52 AM',
    durationMinutes: 42,
    speedType: 'SLOW',
    platform: 'PF 4',
    rakeType: '12-CAR',
    frequency: 'Hourly',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Moderate',
    stops: [
      { stationCode: 'NEU', stationName: 'Nerul', arrivalTime: '08:05 AM', departureTime: '08:10 AM', haltMinutes: 5, platform: 'PF 4', distanceKm: 0 },
      { stationCode: 'SWDV', stationName: 'Seawoods-Darave', arrivalTime: '08:14 AM', departureTime: '08:15 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 2 },
      { stationCode: 'BMDR', stationName: 'Bamandongri', arrivalTime: '08:24 AM', departureTime: '08:25 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 8 },
      { stationCode: 'KARK', stationName: 'Kharkopar', arrivalTime: '08:30 AM', departureTime: '08:31 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 12 },
      { stationCode: 'SHVL', stationName: 'Shevale', arrivalTime: '08:38 AM', departureTime: '08:39 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 18 },
      { stationCode: 'DRGI', stationName: 'Dronagiri', arrivalTime: '08:45 AM', departureTime: '08:46 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 24 },
      { stationCode: 'URAN', stationName: 'Uran', arrivalTime: '08:52 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 1', distanceKm: 27 },
    ],
  },
  {
    id: 'cr-up-04',
    trainNumber: '96008',
    trainName: 'Karjat - CSMT Fast Local',
    line: 'Central',
    direction: 'UP',
    origin: 'Karjat Junction',
    originCode: 'KJT',
    destination: 'CSMT Mumbai',
    destCode: 'CSMT',
    departureTime: '07:15 AM',
    arrivalTime: '09:23 AM',
    durationMinutes: 128,
    speedType: 'FAST',
    platform: 'PF 2',
    rakeType: '12-CAR',
    frequency: 'Hourly',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'KJT', stationName: 'Karjat Junction', arrivalTime: '07:10 AM', departureTime: '07:15 AM', haltMinutes: 5, platform: 'PF 2', distanceKm: 0 },
      { stationCode: 'NRL', stationName: 'Neral Junction', arrivalTime: '07:27 AM', departureTime: '07:28 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 13 },
      { stationCode: 'VGI', stationName: 'Vangani', arrivalTime: '07:37 AM', departureTime: '07:38 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 21 },
      { stationCode: 'BUD', stationName: 'Badlapur', arrivalTime: '07:49 AM', departureTime: '07:50 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 32 },
      { stationCode: 'ABH', stationName: 'Ambernath', arrivalTime: '07:58 AM', departureTime: '07:59 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 40 },
      { stationCode: 'ULNR', stationName: 'Ulhasnagar', arrivalTime: '08:03 AM', departureTime: '08:04 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 42 },
      { stationCode: 'VLDI', stationName: 'Vithalwadi', arrivalTime: '08:07 AM', departureTime: '08:08 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 44 },
      { stationCode: 'KYN', stationName: 'Kalyan Junction', arrivalTime: '08:14 AM', departureTime: '08:16 AM', haltMinutes: 2, platform: 'PF 4', distanceKm: 46 },
      { stationCode: 'DI', stationName: 'Dombivli', arrivalTime: '08:23 AM', departureTime: '08:24 AM', haltMinutes: 1, platform: 'PF 5', distanceKm: 52 },
      { stationCode: 'TNA', stationName: 'Thane Central', arrivalTime: '08:39 AM', departureTime: '08:41 AM', haltMinutes: 2, platform: 'PF 6', distanceKm: 66 },
      { stationCode: 'GC', stationName: 'Ghatkopar', arrivalTime: '08:55 AM', departureTime: '08:56 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 81 },
      { stationCode: 'CLA', stationName: 'Kurla Junction', arrivalTime: '09:02 AM', departureTime: '09:03 AM', haltMinutes: 1, platform: 'PF 6', distanceKm: 85 },
      { stationCode: 'DR', stationName: 'Dadar Central', arrivalTime: '09:10 AM', departureTime: '09:12 AM', haltMinutes: 2, platform: 'PF 3', distanceKm: 91 },
      { stationCode: 'BY', stationName: 'Byculla', arrivalTime: '09:17 AM', departureTime: '09:18 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 95 },
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '09:23 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 4', distanceKm: 100 },
    ],
  },
  {
    id: 'wr-up-03',
    trainNumber: '90312',
    trainName: 'Borivali - Churchgate All-Stops Slow Local',
    line: 'Western',
    direction: 'UP',
    origin: 'Borivali',
    originCode: 'BVI',
    destination: 'Churchgate',
    destCode: 'CCG',
    departureTime: '08:40 AM',
    arrivalTime: '09:44 AM',
    durationMinutes: 64,
    speedType: 'SLOW',
    platform: 'PF 3',
    rakeType: '12-CAR',
    frequency: 'Every 4 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Super Dense',
    stops: [
      { stationCode: 'BVI', stationName: 'Borivali', arrivalTime: '08:35 AM', departureTime: '08:40 AM', haltMinutes: 5, platform: 'PF 3', distanceKm: 0 },
      { stationCode: 'KILE', stationName: 'Kandivali', arrivalTime: '08:44 AM', departureTime: '08:45 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 3 },
      { stationCode: 'MDD', stationName: 'Malad', arrivalTime: '08:48 AM', departureTime: '08:49 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 5 },
      { stationCode: 'GMN', stationName: 'Goregaon', arrivalTime: '08:52 AM', departureTime: '08:53 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 8 },
      { stationCode: 'RMAR', stationName: 'Ram Mandir', arrivalTime: '08:55 AM', departureTime: '08:56 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 9 },
      { stationCode: 'JOS', stationName: 'Jogeshwari', arrivalTime: '08:59 AM', departureTime: '09:00 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 11 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '09:04 AM', departureTime: '09:06 AM', haltMinutes: 2, platform: 'PF 5', distanceKm: 13 },
      { stationCode: 'VLP', stationName: 'Vile Parle', arrivalTime: '09:10 AM', departureTime: '09:11 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 15 },
      { stationCode: 'STC', stationName: 'Santacruz', arrivalTime: '09:14 AM', departureTime: '09:15 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 17 },
      { stationCode: 'KHAR', stationName: 'Khar Road', arrivalTime: '09:18 AM', departureTime: '09:19 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 18 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '09:23 AM', departureTime: '09:24 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 20 },
      { stationCode: 'MM', stationName: 'Mahim Junction', arrivalTime: '09:27 AM', departureTime: '09:28 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 22 },
      { stationCode: 'MRU', stationName: 'Matunga Road', arrivalTime: '09:31 AM', departureTime: '09:32 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 23 },
      { stationCode: 'DDR', stationName: 'Dadar Western', arrivalTime: '09:35 AM', departureTime: '09:36 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 25 },
      { stationCode: 'PBHD', stationName: 'Prabhadevi', arrivalTime: '09:39 AM', departureTime: '09:40 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 26 },
      { stationCode: 'PL', stationName: 'Lower Parel', arrivalTime: '09:42 AM', departureTime: '09:43 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 27 },
      { stationCode: 'MX', stationName: 'Mahalaxmi', arrivalTime: '09:46 AM', departureTime: '09:47 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 29 },
      { stationCode: 'BCL', stationName: 'Mumbai Central', arrivalTime: '09:50 AM', departureTime: '09:51 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 30 },
      { stationCode: 'GTR', stationName: 'Grant Road', arrivalTime: '09:53 AM', departureTime: '09:54 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 31 },
      { stationCode: 'CYR', stationName: 'Charni Road', arrivalTime: '09:56 AM', departureTime: '09:57 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 33 },
      { stationCode: 'MEL', stationName: 'Marine Lines', arrivalTime: '09:59 AM', departureTime: '10:00 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 34 },
      { stationCode: 'CCG', stationName: 'Churchgate', arrivalTime: '10:04 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 2', distanceKm: 35 },
    ],
  },
  {
    id: 'hr-up-02',
    trainNumber: '98013',
    trainName: 'Goregaon - CSMT Western-Harbour Local',
    line: 'Harbour',
    direction: 'UP',
    origin: 'Goregaon',
    originCode: 'GMN',
    destination: 'CSMT Mumbai',
    destCode: 'CSMT',
    departureTime: '08:45 AM',
    arrivalTime: '09:39 AM',
    durationMinutes: 54,
    speedType: 'SLOW',
    platform: 'PF 6',
    rakeType: '12-CAR',
    frequency: 'Every 15 mins',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Moderate',
    stops: [
      { stationCode: 'GMN', stationName: 'Goregaon', arrivalTime: '08:40 AM', departureTime: '08:45 AM', haltMinutes: 5, platform: 'PF 6', distanceKm: 0 },
      { stationCode: 'RMAR', stationName: 'Ram Mandir', arrivalTime: '08:48 AM', departureTime: '08:49 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 2 },
      { stationCode: 'JOS', stationName: 'Jogeshwari', arrivalTime: '08:52 AM', departureTime: '08:53 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 4 },
      { stationCode: 'ADH', stationName: 'Andheri', arrivalTime: '08:57 AM', departureTime: '08:58 AM', haltMinutes: 1, platform: 'PF 6', distanceKm: 6 },
      { stationCode: 'VLP', stationName: 'Vile Parle', arrivalTime: '09:02 AM', departureTime: '09:03 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 8 },
      { stationCode: 'STC', stationName: 'Santacruz', arrivalTime: '09:06 AM', departureTime: '09:07 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 10 },
      { stationCode: 'KHAR', stationName: 'Khar Road', arrivalTime: '09:10 AM', departureTime: '09:11 AM', haltMinutes: 1, platform: 'PF 1', distanceKm: 11 },
      { stationCode: 'BA', stationName: 'Bandra', arrivalTime: '09:15 AM', departureTime: '09:16 AM', haltMinutes: 1, platform: 'PF 7', distanceKm: 13 },
      { stationCode: 'MM', stationName: 'Mahim Junction', arrivalTime: '09:20 AM', departureTime: '09:21 AM', haltMinutes: 1, platform: 'PF 6', distanceKm: 15 },
      { stationCode: 'KCE', stationName: "King's Circle", arrivalTime: '09:24 AM', departureTime: '09:25 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 17 },
      { stationCode: 'VDLR', stationName: 'Vadala Road', arrivalTime: '09:29 AM', departureTime: '09:30 AM', haltMinutes: 1, platform: 'PF 4', distanceKm: 19 },
      { stationCode: 'SVE', stationName: 'Sewri', arrivalTime: '09:34 AM', departureTime: '09:35 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 20 },
      { stationCode: 'CTGN', stationName: 'Cotton Green', arrivalTime: '09:37 AM', departureTime: '09:38 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 22 },
      { stationCode: 'RRD', stationName: 'Reay Road', arrivalTime: '09:40 AM', departureTime: '09:41 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 23 },
      { stationCode: 'DKRD', stationName: 'Dockyard Road', arrivalTime: '09:43 AM', departureTime: '09:44 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 24 },
      { stationCode: 'SNRD', stationName: 'Sandhurst Road', arrivalTime: '09:47 AM', departureTime: '09:48 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 26 },
      { stationCode: 'MSD', stationName: 'Masjid', arrivalTime: '09:50 AM', departureTime: '09:51 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 27 },
      { stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrivalTime: '09:56 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 2', distanceKm: 28 },
    ],
  },
  {
    id: 'uran-02',
    trainNumber: '99702',
    trainName: 'Uran - Nerul All-Stops Local',
    line: 'Uran',
    direction: 'UP',
    origin: 'Uran',
    originCode: 'URAN',
    destination: 'Nerul',
    destCode: 'NEU',
    departureTime: '09:10 AM',
    arrivalTime: '09:52 AM',
    durationMinutes: 42,
    speedType: 'SLOW',
    platform: 'PF 1',
    rakeType: '12-CAR',
    frequency: 'Hourly',
    operatingDays: 'Daily',
    status: 'On Time',
    delayMinutes: 0,
    crowdLevel: 'Moderate',
    stops: [
      { stationCode: 'URAN', stationName: 'Uran', arrivalTime: '09:05 AM', departureTime: '09:10 AM', haltMinutes: 5, platform: 'PF 1', distanceKm: 0 },
      { stationCode: 'DRGI', stationName: 'Dronagiri', arrivalTime: '09:16 AM', departureTime: '09:17 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 3 },
      { stationCode: 'SHVL', stationName: 'Shevale', arrivalTime: '09:23 AM', departureTime: '09:24 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 9 },
      { stationCode: 'KARK', stationName: 'Kharkopar', arrivalTime: '09:31 AM', departureTime: '09:32 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 15 },
      { stationCode: 'BMDR', stationName: 'Bamandongri', arrivalTime: '09:37 AM', departureTime: '09:38 AM', haltMinutes: 1, platform: 'PF 2', distanceKm: 19 },
      { stationCode: 'SWDV', stationName: 'Seawoods-Darave', arrivalTime: '09:47 AM', departureTime: '09:48 AM', haltMinutes: 1, platform: 'PF 3', distanceKm: 25 },
      { stationCode: 'NEU', stationName: 'Nerul', arrivalTime: '09:52 AM', departureTime: 'Terminates', haltMinutes: 0, platform: 'PF 4', distanceKm: 27 },
    ],
  },
];

// Helper to normalize station query
function normalizeStation(text: string): string {
  return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface MatchedJourneyTrain {
  train: TrainTimetableEntry;
  sourceStop: TimetableStop;
  destStop: TimetableStop;
  durationMinutes: number;
  stopsCount: number;
  stopsSlice: TimetableStop[];
  fareEstimate: {
    secondClass: number;
    firstClass: number;
    acLocal: number;
  };
}

export interface InterRouteSuggestion {
  isInterchange: true;
  transferStation: MumbaiStation;
  leg1: MatchedJourneyTrain;
  leg2: MatchedJourneyTrain;
  totalDurationMinutes: number;
  instructions: string;
}

/**
 * Searches and matches all direct and connecting trains between Source and Destination station
 */
export function searchTrainsBetweenStations(
  sourceInput: string,
  destInput: string
): {
  directTrains: MatchedJourneyTrain[];
  interchangeSuggestions: InterRouteSuggestion[];
  sourceStationObj?: MumbaiStation;
  destStationObj?: MumbaiStation;
} {
  const normSource = normalizeStation(sourceInput);
  const normDest = normalizeStation(destInput);

  if (!normSource || !normDest || normSource === normDest) {
    return { directTrains: [], interchangeSuggestions: [] };
  }

  // Find exact or closest station objects
  const sourceStationObj = MUMBAI_STATIONS_MASTER.find(
    (s) => normalizeStation(s.code) === normSource || normalizeStation(s.name) === normSource || normalizeStation(s.name).includes(normSource)
  );

  const destStationObj = MUMBAI_STATIONS_MASTER.find(
    (s) => normalizeStation(s.code) === normDest || normalizeStation(s.name) === normDest || normalizeStation(s.name).includes(normDest)
  );

  const sourceCode = sourceStationObj?.code || sourceInput;
  const destCode = destStationObj?.code || destInput;

  const directTrains: MatchedJourneyTrain[] = [];

  for (const train of ALL_MUMBAI_SUBURBAN_TRAINS) {
    let sourceIndex = -1;
    let destIndex = -1;

    for (let i = 0; i < train.stops.length; i++) {
      const stop = train.stops[i];
      const matchSource =
        (stop.stationCode && stop.stationCode === sourceCode) ||
        normalizeStation(stop.stationName).includes(normSource) ||
        normSource.includes(normalizeStation(stop.stationName));

      const matchDest =
        (stop.stationCode && stop.stationCode === destCode) ||
        normalizeStation(stop.stationName).includes(normDest) ||
        normDest.includes(normalizeStation(stop.stationName));

      if (matchSource && sourceIndex === -1) {
        sourceIndex = i;
      }
      if (matchDest && sourceIndex !== -1 && destIndex === -1) {
        destIndex = i;
      }
    }

    if (sourceIndex !== -1 && destIndex !== -1 && destIndex > sourceIndex) {
      const sourceStop = train.stops[sourceIndex];
      const destStop = train.stops[destIndex];

      // Calculate approximate duration
      const parseTimeMinutes = (timeStr: string): number => {
        const parts = timeStr.trim().split(' ');
        if (parts.length < 2) return 0;
        const [h, m] = parts[0].split(':').map(Number);
        let mins = h * 60 + m;
        if (parts[1] === 'PM' && h !== 12) mins += 12 * 60;
        if (parts[1] === 'AM' && h === 12) mins -= 12 * 60;
        return mins;
      };

      const startMins = parseTimeMinutes(sourceStop.departureTime);
      const endMins = parseTimeMinutes(destStop.arrivalTime);
      let diff = endMins - startMins;
      if (diff <= 0) diff = (destIndex - sourceIndex) * 3; // fallback estimate

      const distanceKm = Math.abs((destStop.distanceKm || 0) - (sourceStop.distanceKm || 0)) || (destIndex - sourceIndex) * 2.5;

      // Realistic Mumbai local fare calculation based on distance
      const secondClass = distanceKm <= 10 ? 5 : distanceKm <= 20 ? 10 : distanceKm <= 35 ? 15 : 20;
      const firstClass = distanceKm <= 10 ? 50 : distanceKm <= 20 ? 85 : distanceKm <= 35 ? 105 : 140;
      const acLocal = distanceKm <= 10 ? 65 : distanceKm <= 20 ? 105 : distanceKm <= 35 ? 135 : 175;

      directTrains.push({
        train,
        sourceStop,
        destStop,
        durationMinutes: Math.max(diff, (destIndex - sourceIndex) * 2),
        stopsCount: destIndex - sourceIndex,
        stopsSlice: train.stops.slice(sourceIndex, destIndex + 1),
        fareEstimate: {
          secondClass,
          firstClass,
          acLocal,
        },
      });
    }
  }

  // If no direct trains, compute intelligent 1-hop interchange suggestions
  const interchangeSuggestions: InterRouteSuggestion[] = [];

  if (directTrains.length === 0 && sourceStationObj && destStationObj) {
    // Strategic Mumbai interchange junction pairs (e.g. Dadar CR <-> Dadar WR, Kurla CR <-> Kurla Harbour)
    interface HubPair {
      name: string;
      leg1Hubs: string[];
      leg2Hubs: string[];
      displayStationCode: string;
    }

    const hubPairs: HubPair[] = [
      {
        name: 'Dadar Junction (Central ↔ Western Foot Overbridge)',
        leg1Hubs: ['DR', 'DDR'],
        leg2Hubs: ['DDR', 'DR'],
        displayStationCode: 'DR',
      },
      {
        name: 'Kurla Junction (Central ↔ Harbour Foot Overbridge)',
        leg1Hubs: ['CLA', 'CLAH'],
        leg2Hubs: ['CLAH', 'CLA'],
        displayStationCode: 'CLA',
      },
      {
        name: 'Thane Central (Central ↔ Trans-Harbour Platforms)',
        leg1Hubs: ['TNA'],
        leg2Hubs: ['TNA'],
        displayStationCode: 'TNA',
      },
      {
        name: 'Vadala Road (Harbour ↔ Western Branch)',
        leg1Hubs: ['VDLR'],
        leg2Hubs: ['VDLR'],
        displayStationCode: 'VDLR',
      },
      {
        name: 'Bandra / Mahim (Harbour ↔ Western)',
        leg1Hubs: ['BA', 'MM'],
        leg2Hubs: ['BA', 'MM'],
        displayStationCode: 'BA',
      },
      {
        name: 'Vashi / Nerul (Trans-Harbour ↔ Harbour)',
        leg1Hubs: ['VSH', 'NEU'],
        leg2Hubs: ['VSH', 'NEU'],
        displayStationCode: 'VSH',
      },
    ];

    for (const hub of hubPairs) {
      const displayStation = MUMBAI_STATIONS_MASTER.find((s) => s.code === hub.displayStationCode) || sourceStationObj;

      for (const h1 of hub.leg1Hubs) {
        if (h1 === sourceCode) continue;
        const leg1Matches = searchTrainsBetweenStations(sourceCode, h1).directTrains;
        if (leg1Matches.length === 0) continue;

        for (const h2 of hub.leg2Hubs) {
          if (h2 === destCode) continue;
          const leg2Matches = searchTrainsBetweenStations(h2, destCode).directTrains;
          if (leg2Matches.length > 0) {
            const leg1 = leg1Matches[0];
            const leg2 = leg2Matches[0];
            const totalDuration = leg1.durationMinutes + leg2.durationMinutes + 7; // 7 min transfer time

            interchangeSuggestions.push({
              isInterchange: true,
              transferStation: displayStation,
              leg1,
              leg2,
              totalDurationMinutes: totalDuration,
              instructions: `Take ${leg1.train.line} Line to ${displayStation.name}, change via Foot Overbridge to ${leg2.train.line} Line towards ${destStationObj.name}.`,
            });
            break;
          }
        }
        if (interchangeSuggestions.length > 0) break;
      }
      if (interchangeSuggestions.length > 0) break;
    }
  }

  return {
    directTrains,
    interchangeSuggestions,
    sourceStationObj,
    destStationObj,
  };
}
