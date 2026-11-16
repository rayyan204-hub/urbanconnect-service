import { ScreenId } from '../types';

export interface DailyCivicTip {
  id: string;
  dayIndex: number; // 0 to 30 for 31 days of any month
  category: 'waste' | 'policy' | 'procedure' | 'monsoon' | 'health';
  categoryLabel: string;
  bulletinNumber: string;
  title: string;
  summary: string;
  keyPoints: string[];
  officialReference: string;
  civicRewardPoints: number;
  actionLabel?: string;
  actionScreen?: ScreenId;
  relatedActionId?: string;
  fineOrIncentive?: string;
}

export const DAILY_CIVIC_TIPS: DailyCivicTip[] = [
  {
    id: 'tip-waste-3bin',
    dayIndex: 0,
    category: 'waste',
    categoryLabel: 'Solid Waste Management',
    bulletinNumber: 'SWM-2026/01',
    title: 'Mandatory 3-Bin Source Segregation at Home',
    summary:
      'Under the Solid Waste Management Rules 2016 and TMC/BMC by-laws, every household must segregate garbage into Green (Wet), Blue (Dry), and Red (Hazardous).',
    keyPoints: [
      'Green Bin (Wet): Kitchen peels, leftover food, tea leaves. Never bag wet waste in single-use plastic.',
      'Blue Bin (Dry): Paper, clean cardboard, rinsed milk pouches, plastic containers, glass bottles.',
      'Red Bin / Pouch (Domestic Hazardous): Expired medicines, batteries, CFLs, and sanitary pads wrapped in newspaper with a red cross.',
    ],
    officialReference: 'Maharashtra Municipal Solid Waste By-Laws §4(2)',
    fineOrIncentive: 'Societies practicing 100% onsite composting receive a 5% Property Tax rebate under TMC.',
    civicRewardPoints: 10,
    actionLabel: 'Report Waste Violation',
    actionScreen: 'complaints',
  },
  {
    id: 'tip-property-tax-rebate',
    dayIndex: 1,
    category: 'policy',
    categoryLabel: 'Municipal Revenue & Tax',
    bulletinNumber: 'REV-2026/02',
    title: 'Early Property Tax Payment 10% Rebate Window',
    summary:
      'Thane Municipal Corporation (TMC) and BMC offer general tax rebates for citizens who pay their annual property assessment early via the online municipal gateway.',
    keyPoints: [
      '10% general tax rebate if paid in full before June 30 of the current financial year.',
      '5% rebate if cleared between July 1 and July 31.',
      'Always pay via the official tmc.gov.in or portal.mcgm.gov.in gateway to avoid 2% monthly late penalty interest.',
    ],
    officialReference: 'TMC Property Tax Assessment Rules §140',
    fineOrIncentive: 'Save up to ₹2,500–₹6,000 annually per residential flat through early digital settlement.',
    civicRewardPoints: 10,
    actionLabel: 'Ask Tax Concierge',
    actionScreen: 'home',
  },
  {
    id: 'tip-birth-death-reg',
    dayIndex: 2,
    category: 'procedure',
    categoryLabel: 'Civil Registration',
    bulletinNumber: 'CRS-2026/03',
    title: 'Free Birth & Death Registration Within 21 Days',
    summary:
      'Registrations completed within 21 calendar days of the event at the respective Ward Health Post are completely free of government fees and affidavit requirements.',
    keyPoints: [
      'Hospital births are digitally reported to the ward medical officer within 48 hours.',
      'Download digitized, QR-coded birth certificates with digital municipal seal on Aaple Sarkar portal.',
      'Delayed registration after 21 days but within 30 days requires a ₹2 late fee; beyond 1 year requires an SDM court order.',
    ],
    officialReference: 'Registration of Births and Deaths Act 1969 §13',
    fineOrIncentive: 'Zero fees and instant digital issuance within the statutory 21-day window.',
    civicRewardPoints: 5,
    actionLabel: 'Check Ward Directory',
    actionScreen: 'home',
  },
  {
    id: 'tip-plastic-bag-ban',
    dayIndex: 3,
    category: 'waste',
    categoryLabel: 'Environmental Protection',
    bulletinNumber: 'ENV-2026/04',
    title: 'Strict Prohibition on Single-Use Plastic Bags Under 120 Microns',
    summary:
      'Manufacturing, selling, or using plastic carry bags below 120 microns is prohibited across Maharashtra to prevent stormwater drain choking and coastal pollution.',
    keyPoints: [
      'Commercial retailers, vendors, and grocery stores cannot dispense thin non-biodegradable bags.',
      'Carry your own reusable cloth, jute, or cotton tote bags when visiting local mandis or supermarkets.',
      'Biodegradable plastic alternatives must bear a certified CPCB manufacturing license code.',
    ],
    officialReference: 'Maharashtra Non-Biodegradable Garbage Control Act §3',
    fineOrIncentive: 'First-time commercial offense attracts ₹5,000 fine; repeat offenses attract ₹10,000–₹25,000.',
    civicRewardPoints: 5,
    actionLabel: 'Report Litter / Drain Clog',
    actionScreen: 'complaints',
  },
  {
    id: 'tip-pothole-sla',
    dayIndex: 4,
    category: 'procedure',
    categoryLabel: 'Road Infrastructure',
    bulletinNumber: 'RND-2026/05',
    title: '48-Hour Municipal SLA for Reported Potholes',
    summary:
      'Potholes and road craters logged with geo-tagged photographs on UrbanConnect or the municipal helpline have a mandated 48-hour cold-mix asphalt filling SLA.',
    keyPoints: [
      'Take a clear photograph showing the road landmark and crater depth.',
      'The grievance is automatically mapped to the respective Executive Road Engineer.',
      'Track real-time asphalt pouring and road restoration confirmation directly on your complaint card.',
    ],
    officialReference: 'TMC & BMC Citizen Charter 2024 · Pothole Protocol',
    fineOrIncentive: 'Contractors are fined ₹5,000 per pothole per day if SLA exceeds 48 hours without weather impediment.',
    civicRewardPoints: 10,
    actionLabel: 'Track Road Grievances',
    actionScreen: 'complaints',
  },
  {
    id: 'tip-rainwater-harvesting',
    dayIndex: 5,
    category: 'policy',
    categoryLabel: 'Water Conservation',
    bulletinNumber: 'WTR-2026/06',
    title: 'Rainwater Harvesting Rebate for Housing Societies',
    summary:
      'Gated communities and residential buildings equipped with functional rooftop rainwater harvesting systems qualify for rebates on municipal water and sewerage cess.',
    keyPoints: [
      'Mandatory for all plots exceeding 300 sq. meters developed after 2007 under Development Control Regulations.',
      'Recharges groundwater aquifers and reduces reliance on municipal tanker supply during summer months.',
      'Submit an annual percolation audit certificate from an empaneled plumbing consultant to renew tax relief.',
    ],
    officialReference: 'Unified Development Control Regulations §10.2',
    fineOrIncentive: '5% to 7% annual reduction in municipal water tax assessments for compliant housing societies.',
    civicRewardPoints: 10,
    actionLabel: 'View Water & Tanker Desk',
    actionScreen: 'services',
  },
  {
    id: 'tip-noise-pollution',
    dayIndex: 6,
    category: 'policy',
    categoryLabel: 'Public Safety & Peace',
    bulletinNumber: 'POL-2026/07',
    title: 'Residential Noise Limits & 10:00 PM Loudspeaker Curfew',
    summary:
      'Maharashtra Noise Pollution Rules stipulate strict decibel limits to protect children, elderly residents, and hospital zones from hazardous sound levels.',
    keyPoints: [
      'Residential zones: Maximum 55 dB (Day: 06:00 to 22:00) and 45 dB (Night: 22:00 to 06:00).',
      'Silence zones (within 100 meters of hospitals, educational institutes, and courts): 50 dB day / 40 dB night.',
      'Loudspeakers, DJ music consoles, and building construction hammer drills are banned after 22:00 without police clearance.',
    ],
    officialReference: 'Noise Pollution (Regulation and Control) Rules 2000 §5',
    fineOrIncentive: 'Call 112 or TMC Disaster Control 1800-222-108 for immediate decibel meter enforcement and equipment seizure.',
    civicRewardPoints: 5,
    actionLabel: 'Emergency Helplines',
    actionScreen: 'home',
  },
  {
    id: 'tip-tree-pruning',
    dayIndex: 7,
    category: 'monsoon',
    categoryLabel: 'Monsoon Preparedness',
    bulletinNumber: 'GRN-2026/08',
    title: 'Pre-Monsoon Tree Trimming & Branch Clearance Protocol',
    summary:
      'Overhanging or dead branches posing danger to power cables, vehicles, or pedestrians must be pruned by the Tree Authority prior to monsoon squalls.',
    keyPoints: [
      'Housing societies can register for tree trimming on society premises via the Municipal Garden Department.',
      'Public roadside trees are surveyed and trimmed along high-tension electrical routes between April and May.',
      'Never cut or fell trees independently; unauthorized felling is a non-bailable offense under state forestry laws.',
    ],
    officialReference: 'Maharashtra (Urban Areas) Protection & Preservation of Trees Act §8',
    fineOrIncentive: 'Fines up to ₹50,000 and mandatory replacement plantation of 5 saplings per damaged tree.',
    civicRewardPoints: 10,
    actionLabel: 'Log Tree Hazard',
    actionScreen: 'complaints',
  },
  {
    id: 'tip-water-testing',
    dayIndex: 8,
    category: 'health',
    categoryLabel: 'Public Health & Water',
    bulletinNumber: 'HLT-2026/09',
    title: 'Free Municipal Potable Water Testing at Ward Labs',
    summary:
      'Citizens experiencing turbid, discolored, or foul-smelling tap water can request free microbiological water testing at the municipal water laboratory.',
    keyPoints: [
      'Ward hydraulic engineering inspectors collect 1-liter inlet samples at the building boundary valve.',
      'Tested for E. coli, fecal coliforms, residual chlorine levels, and heavy metals within 24 hours.',
      'If pipeline cross-contamination with sewage lines is detected, emergency chlorination booster units are deployed.',
    ],
    officialReference: 'Public Health Department Potable Water Quality Protocol §18',
    fineOrIncentive: 'Free municipal testing protects against typhoid, cholera, and monsoon gastroenteritis outbreaks.',
    civicRewardPoints: 5,
    actionLabel: 'Request Water Quality Inspection',
    actionScreen: 'complaints',
  },
  {
    id: 'tip-monsoon-tides',
    dayIndex: 9,
    category: 'monsoon',
    categoryLabel: 'Monsoon Coastal Safety',
    bulletinNumber: 'DM-2026/10',
    title: 'Spring Tide & Heavy Rain Concurrence Precautions',
    summary:
      'When high tides exceed 4.5 meters concurrently with rainfall over 50mm/hour, sea outfall floodgates must be shut, resulting in temporary low-lying inundation.',
    keyPoints: [
      'Avoid parking underground at Kalwa, Vandana Cinema (Thane), Hindmata, or Milan Subway (Mumbai) during high-tide alert hours.',
      '48 high-capacity dewatering diesel pumps operate continuously at chronic flooding nodes.',
      'Check live flood alerts and railway corridor platform announcements on the UrbanConnect Train Desk before commuting.',
    ],
    officialReference: 'Disaster Management Cell Monsoon Flood SOP §3.4',
    fineOrIncentive: 'Live tracking saves transit delays and prevents hydrostatic engine locking in waterlogged subways.',
    civicRewardPoints: 5,
    actionLabel: 'View Train Corridor Status',
    actionScreen: 'train-info',
  },
  {
    id: 'tip-trade-license',
    dayIndex: 10,
    category: 'procedure',
    categoryLabel: 'Commerce & Urban Livelihood',
    bulletinNumber: 'LIC-2026/11',
    title: 'Gumasta / Shop Act Registration: Instant Online Form G',
    summary:
      'Small commercial establishments, freelancing studios, and retail shops with fewer than 10 workers do not require a physical municipal license inspection.',
    keyPoints: [
      'Simply submit an online intimation (Form G) on the Aaple Sarkar labour portal.',
      'Instant digital receipt acts as a valid, lifelong municipal trade certificate.',
      'No renewal fees or physical municipal clerk visits required for establishments under 10 employees.',
    ],
    officialReference: 'Maharashtra Shops & Establishments (Regulation of Employment) Act 2017 §6',
    fineOrIncentive: 'Zero facilitation fees; legal protection against arbitrary commercial spot-checks.',
    civicRewardPoints: 5,
    actionLabel: 'Ask Civic AI Assistant',
    actionScreen: 'home',
  },
  {
    id: 'tip-e-waste-disposal',
    dayIndex: 11,
    category: 'waste',
    categoryLabel: 'Electronic Waste & Environment',
    bulletinNumber: 'EWT-2026/12',
    title: 'Safe Disposal of Old Batteries, Laptops & Cables',
    summary:
      'Electronic waste dumped in regular garbage contaminates groundwater with lead, cadmium, and mercury. Use designated ward collection centers.',
    keyPoints: [
      'TMC and BMC conduct monthly E-Waste Collection Drives at community ward offices on the 2nd Saturday.',
      'Authorized recyclers dismantle circuit boards safely under Central Pollution Control Board (CPCB) norms.',
      'Never sell damaged lithium-ion batteries or broken screens to informal scrap dealers who practice open burning.',
    ],
    officialReference: 'E-Waste (Management) Rules 2022 §4',
    fineOrIncentive: 'Earn +25 Civic Reward Points when dropping e-waste at municipal collection drives.',
    civicRewardPoints: 10,
    actionLabel: 'Find Volunteer & Drop Drives',
    actionScreen: 'volunteer-events',
  },
];

const READ_TIPS_STORAGE_KEY = 'urbanconnect_read_civic_tips';
const BOOKMARKED_TIPS_KEY = 'urbanconnect_bookmarked_civic_tips';

/**
 * Deterministically retrieves today's civic tip based on current day of the year.
 */
export function getTodayCivicTip(date: Date = new Date()): DailyCivicTip {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % DAILY_CIVIC_TIPS.length;
  return DAILY_CIVIC_TIPS[index];
}

export function isTipRead(tipId: string): boolean {
  try {
    const raw = localStorage.getItem(READ_TIPS_STORAGE_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.includes(tipId);
  } catch {
    return false;
  }
}

export function markTipAsRead(tipId: string): void {
  try {
    const raw = localStorage.getItem(READ_TIPS_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(tipId)) {
      list.push(tipId);
      localStorage.setItem(READ_TIPS_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage errors
  }
}

export function isTipBookmarked(tipId: string): boolean {
  try {
    const raw = localStorage.getItem(BOOKMARKED_TIPS_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.includes(tipId);
  } catch {
    return false;
  }
}

export function toggleTipBookmark(tipId: string): boolean {
  try {
    const raw = localStorage.getItem(BOOKMARKED_TIPS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const index = list.indexOf(tipId);
    let bookmarked = false;
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(tipId);
      bookmarked = true;
    }
    localStorage.setItem(BOOKMARKED_TIPS_KEY, JSON.stringify(list));
    return bookmarked;
  } catch {
    return false;
  }
}
