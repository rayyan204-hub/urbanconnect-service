import {
  Complaint,
  ParkingLot,
  UserProfile,
} from '../types';
import {
  createComplaint,
  getComplaints,
  getParkingLots,
  reserveParkingSlot,
  getCategorySlaHours,
  computeSlaStatus,
  updateUserCivicPoints,
  addNotification,
} from './dbService';

export interface InChatGrievanceTicket {
  complaint: Complaint;
  slaHours: number;
  assignedDesk: string;
  pointsAwarded: number;
}

export interface InChatParkingPass {
  bookingId: string;
  lotName: string;
  location: string;
  bay: string;
  slotNumber: string;
  rateHourly: number;
  validUntil: string;
  qrCodeSeed: string;
  pointsAwarded: number;
}

export interface InChatTransitPass {
  passId: string;
  route: string;
  serviceType: 'TMT Electric AC' | 'BEST Bus' | 'Central Railway Local' | 'Mumbai Metro';
  validity: string;
  fare: number;
  tokenCode: string;
}

export interface InChatTankerBooking {
  bookingId: string;
  ward: string;
  capacity: string;
  dispatchTime: string;
  rate: number;
  contactNumber: string;
}

export interface ChatActionOption {
  label: string;
  actionId: string;
  payload?: any;
  icon?: 'report' | 'check' | 'parking' | 'transit' | 'water' | 'tax' | 'call' | 'ticket';
  primary?: boolean;
}

export interface AIChatResponse {
  text: string;
  ticket?: InChatGrievanceTicket;
  parkingPass?: InChatParkingPass;
  transitPass?: InChatTransitPass;
  tankerBooking?: InChatTankerBooking;
  actions?: ChatActionOption[];
  source?: 'cache' | 'local_engine' | 'gemini_ai';
  latencyMs?: number;
}

// In-memory high-speed cache for instant retrieval
const responseCache = new Map<string, { response: AIChatResponse; timestamp: number }>();
const geminiCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL_MS = 180000; // 3 minutes TTL for municipal static guides

// -------------------------------------------------------------
// COMPREHENSIVE CIVIC KNOWLEDGE BASE (Mumbai & Thane)
// -------------------------------------------------------------
export const CIVIC_KNOWLEDGE = {
  water: {
    timings: `💧 **Official Water Supply Schedule (Mumbai & Thane)**
- **Thane (TMC Wards 1-9 - Naupada, Majiwada, Ghodbunder, Kopri)**:
  • Morning Slot: **06:00 AM – 09:30 AM** (High Pressure)
  • Evening Slot: **05:30 PM – 08:30 PM** (Normal Pressure)
- **BMC Mumbai (Bandra, Dadar, Andheri, Borivali)**:
  • Island City: **04:00 AM – 07:00 AM**
  • Western Suburbs: **05:30 AM – 08:30 AM**
  • Eastern Suburbs: **06:00 AM – 09:00 AM**

**Low Pressure or Contamination Troubleshooting**:
1. Check building booster pumps and main inlet valve.
2. In case of brown or turbid water, avoid drinking; report water pipeline leak.
3. Subsidized Water Tanker booking: **₹800 for 10,000 Liters** via Municipal Water Works (Helpline: **022-25371010**).`,
  },
  propertyTax: {
    steps: `🏛️ **Property Tax Assessment & Online Payment Guide**
- **How to Pay Online Directly**:
  1. Have your **SAC Code** (Street Address Code) or 15-digit **Property ID** ready from your previous physical bill.
  2. For Thane Municipal Corporation: visit **thanecity.gov.in** -> Quick Pay -> Property Tax.
  3. For BMC Mumbai: visit **propertytax.mcgm.gov.in** -> Citizen Portal.
- **Current Rebates & Benefits**:
  • **10% Early Bird Rebate** if full annual bill is cleared before **June 30th**.
  • **5% Green Building Concession** for societies with functional rainwater harvesting or solar panels.
  • Senior citizen rebate of **5%** applies for self-occupied primary residences.
- **Late Penalties**: **2% compounding monthly interest** applies on overdue amounts post-December 31st.`,
  },
  birthDeath: {
    guide: `📜 **Birth & Death Certificate Issuance Protocol**
- **Eligibility & Timeline**:
  • Applications within **21 days** of institutional event: **FREE OF CHARGE** and issued within 3-5 working days.
  • Beyond 21 days up to 30 days: Late fee of **₹25** with hospital birth report slip.
  • Beyond 1 year: Requires Sub-Divisional Magistrate (SDM) order + municipal fee of **₹100**.
- **Digital Download Steps**:
  1. Access Maharashtra state portal: **aaplesarkar.mahaonline.gov.in** or BMC/TMC health registration desk.
  2. Search by Hospital Name, Date of Event, and Mother's/Deceased's full name.
  3. The digitally signed QR-coded certificate is legally valid under the IT Act 2000.`,
  },
  waste: {
    rules: `♻️ **Municipal Waste Segregation & Collection Mandate**
- **2-Bin 1-Bag Segregation Standard**:
  • **Green Bin (Wet Waste)**: Kitchen leftovers, fruit peels, vegetable scraps, eggshells, tea powder. Collected daily from **07:00 AM to 10:00 AM**.
  • **Blue Bin (Dry Waste)**: Clean paper, plastic packaging, cardboard, metal tins, milk pouches. Collected twice weekly.
  • **Red Pouch / Separate Bag (Sanitary & Bio-medical)**: Diapers, sanitary napkins, bandages (wrap in newspaper marked with red dot).
- **Bulk Waste Generators (>100 kg/day)**:
  Housing societies with >100 flats must perform on-site organic waste composting as per SWM Rules 2016.
- **E-Waste Drop-off Centers**:
  • Thane: TMC Ward 4 Naupada Ward Office collection bin (Open Mon-Sat 10:00 AM – 05:00 PM).
  • Mumbai: BMC Dadar G-North Garage & Bandra K-West ward facility.`,
  },
  streetlights: {
    info: `💡 **Streetlight & Electricity Grievance Resolution**
- **Non-Functioning Streetlight SLA**: Fixed within **24 Hours** by the Municipal Electrical Division.
- **Power Outage Helplines**:
  • **MSEDCL (Mahavitaran - Thane & Suburbs)**: Dial **1912** or **1800-212-3435**
  • **BEST Electricity (Island City Mumbai)**: Dial **1905** / **022-22856262**
  • **Adani Electricity (Western Suburbs Mumbai)**: Dial **19122**
- Please share the lamp post number painted in yellow on the pole for instantaneous field technician dispatch.`,
  },
  disaster: {
    helplines: `🚨 **24/7 Disaster Management & High Tide Alerts**
- **Municipal Control Rooms**:
  • **TMC Disaster Management Cell (Thane)**: **1800-222-108** | **022-25371010**
  • **BMC Disaster Management (Mumbai)**: **1916** | **022-22694725**
- **National Emergency Response**:
  • **Police Dispatch**: **112**
  • **Medical Ambulance**: **108**
  • **Fire Brigade**: **101**
  • **Women Safety Helpline**: **1090** / **103**
- **Monsoon Inundation Warning Points**:
  Avoid Milan Subway, King's Circle, Hindmata, Dahisar Subway, and Vandana Cinema circle during heavy rain coincident with tides >4.5 meters.`,
  },
  treeTrimming: {
    rules: `🌳 **Tree Pruning & Dead Branch Trimming Protocol**
- Trimming dangerous overhanging branches requires official clearance from the **Tree Authority**.
- Unauthorized cutting or heavy lopping of trees is a punishable offense under the **Maharashtra (Urban Areas) Protection and Preservation of Trees Act**, attracting fines from **₹5,000 to ₹50,000**.
- TMC & BMC conduct pre-monsoon tree trimming drives annually between March and May. You can lodge a dangerous tree trimming request directly in this chat!`,
  },
  tradeLicense: {
    guide: `🏪 **Shop & Establishment (Gumasta) & Trade License**
- **Applicability**:
  • Businesses with <10 employees: Simple online self-declaration intimation (Form A) on **aaplesarkar.mahaonline.gov.in** (Free of cost).
  • Businesses with ≥10 employees: Statutory Shop & Establishment Registration (Form C), renewable every 1, 3, or 5 years.
- **Documents Needed**: PAN card, Aadhar card of proprietor/partners, shop lease agreement or electricity bill, and photo of the shop banner in Marathi (Devanagari script mandatory under state rules).`,
  },
  transit: {
    routes: `🚆 **Mumbai & Thane Transit Connectivity**
- **Central Railway**: Fast locals skip slow platforms between Thane and Kurla (Thane -> Mulund -> Ghatkopar -> Kurla -> Dadar -> Byculla -> CSMT).
- **Electric AC Buses**:
  • **Route A-700**: Thane Station West to BKC (via Eastern Express Highway & BKC Connector) - Frequency: Every 12 mins.
  • **Route AC-65**: Thane Station East to Borivali Station West (via Ghodbunder Road).
  • **Route C-514**: Mulund Depot to Navi Mumbai APMC Vashi.
- **Digital Ticketing**: Use the UTS mobile app for paperless suburban train tickets or Chalo Smartcard for BEST/TMT bus passes.`,
  },
};

// -------------------------------------------------------------
// CORE CHAT ENGINE RESOLUTION LOGIC
// -------------------------------------------------------------
export async function processCitizenMessage(
  userQuery: string,
  currentUser?: UserProfile | null,
  conversationHistory: { sender: 'ai' | 'user'; text: string }[] = []
): Promise<AIChatResponse> {
  const startTime = performance.now();
  const q = userQuery.toLowerCase().trim();
  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Citizen';
  const wardName = currentUser?.ward || 'TMC Ward 4 - Majiwada & Naupada';

  // Check cache for repetitive informational civic queries (excluding dynamic reservations/tickets)
  const isDynamicQuery =
    q.includes('book') ||
    q.includes('reserve') ||
    q.includes('complaint') ||
    q.includes('report') ||
    q.includes('ticket') ||
    q.includes('pothole') ||
    q.includes('khadda') ||
    q.includes('kachra') ||
    q.includes('leak') ||
    q.includes('status');

  if (!isDynamicQuery && responseCache.has(q)) {
    const cached = responseCache.get(q)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        ...cached.response,
        source: 'cache',
        latencyMs: Math.round(performance.now() - startTime),
      };
    }
  }

  // 1. IN-CHAT PARKING RESERVATION & OPTICAL BARCODE / QR GENERATION RESOLUTION
  // Detects: "generate a barcode / qr for scanning parking code", "parking qr", "parking barcode", "book parking", "reserve slot", etc.
  const isBarcodeQrSpecific =
    (q.includes('barcode') || q.includes('qr') || q.includes('scan') || q.includes('scanning')) &&
    (q.includes('parking') || q.includes('park') || q.includes('code') || q.includes('pass') || q.includes('prk') || q.includes('boom'));

  const isParkingBookingIntent =
    isBarcodeQrSpecific ||
    q.includes('book parking') ||
    q.includes('reserve parking') ||
    q.includes('reserve slot') ||
    q.includes('book slot') ||
    q.includes('reserve a spot') ||
    q.includes('book spot') ||
    (q.includes('parking') &&
      (q.includes('book') ||
        q.includes('reserve') ||
        q.includes('talao pali') ||
        q.includes('majiwada') ||
        q.includes('dadar')));

  if (isParkingBookingIntent) {
    const parkingLots = getParkingLots();
    let targetLot = parkingLots[0]; // Talao Pali default

    if (q.includes('majiwada')) {
      targetLot = parkingLots.find((l) => l.name.toLowerCase().includes('majiwada')) || targetLot;
    } else if (q.includes('dadar')) {
      targetLot = parkingLots.find((l) => l.name.toLowerCase().includes('dadar')) || targetLot;
    } else if (q.includes('bkc')) {
      targetLot = parkingLots.find((l) => l.name.toLowerCase().includes('bkc')) || targetLot;
    }

    // Extract any existing code mentioned in user query (e.g. PRK-1234 or UC-PARK-1234)
    const matchedToken = q.match(/(?:prk|uc-park)[a-z0-9\-_]*/i);
    const bookingCode = matchedToken
      ? matchedToken[0].toUpperCase()
      : `PRK-${targetLot.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Call reservation directly in database service
    reserveParkingSlot(targetLot.id);
    const bayLetters = ['A', 'B', 'C', 'D'];
    const bay = `Bay ${bayLetters[Math.floor(Math.random() * bayLetters.length)]}${Math.floor(1 + Math.random() * 3)}`;
    const slotNum = `Slot #${Math.floor(10 + Math.random() * 85)}`;

    const validUntilDate = new Date(Date.now() + 3 * 3600 * 1000);
    const validUntilStr = validUntilDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const parsedRate =
      targetLot.ratePerHour ||
      parseInt(String(targetLot.hourlyRate).replace(/[^0-9]/g, ''), 10) ||
      20;

    const parkingPass: InChatParkingPass = {
      bookingId: bookingCode,
      lotName: targetLot.name,
      location: targetLot.location,
      bay,
      slotNumber: slotNum,
      rateHourly: parsedRate,
      validUntil: `Today until ${validUntilStr} (3h reserved hold)`,
      qrCodeSeed: `URBANCONNECT:PARKING:${bookingCode}:${targetLot.id}`,
      pointsAwarded: 15,
    };

    addNotification({
      title: 'Parking Barcode & QR Generated',
      message: `Optical scanning pass ready for ${targetLot.name} (${bookingCode}).`,
      type: 'transit',
      actionScreen: 'parking',
    });

    const responseText = isBarcodeQrSpecific
      ? `🎟️ **Optical Barcode & QR Code Generated for Parking!**\n\nI have generated your high-contrast **2D QR Code** and **1D Barcode (Code 128)** for pass **${bookingCode}** at **${targetLot.name}**.\n\n• **Scanning Instructions**: Hold this screen 6 inches from the boom barrier optical scanner or FASTag camera at the entry gate.\n• **Formats Available**: Switch between **2D QR** and **1D Barcode** below, or tap **Maximize / Kiosk Mode** for full-screen brightness boost.\n• **Test Scan**: Tap the "Test Scan" button below to verify boom barrier opening before arrival.`
      : `✅ **Parking Successfully Booked & Scannable Code Generated!**\n\nI have reserved a smart parking bay for you at **${targetLot.name}** without needing to leave our conversation. Your digital pass with live **scannable Barcode & QR Code** is generated below with a guaranteed 3-hour hold. You earned **+15 Civic Reward Points** for using municipal smart transit.`;

    return {
      text: responseText,
      parkingPass,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Check Other Facilities', actionId: 'check_parking_status', icon: 'parking' },
        { label: 'Water Supply Timings', actionId: 'query_water', icon: 'water' },
        { label: 'File a Grievance', actionId: 'prompt_complaint', icon: 'report' },
      ],
    };
  }

  // General Parking Availability Query (Non-booking)
  if (q.includes('parking') || q.includes('car park') || q.includes('slot available')) {
    const lots = getParkingLots();
    const lotsSummary = lots
      .map(
        (l) =>
          `• **${l.name}** (${l.location}): **${l.availableSpaces}** slots free • ₹${l.hourlyRate}/hr [${l.status}]`
      )
      .join('\n');

    const res: AIChatResponse = {
      text: `🚗 **Live Municipal Smart Parking Availability**\n\nHere is the real-time sensor occupancy across Mumbai & Thane decks:\n\n${lotsSummary}\n\nWould you like me to reserve a spot at **Talao Pali** or **Majiwada** for you directly in this chat? Just type "Book Talao Pali" or tap the instant reserve button below!`,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Book Talao Pali (₹20/hr)', actionId: 'instant_book_talao_pali', icon: 'parking', primary: true },
        { label: 'Book Majiwada Slot', actionId: 'instant_book_majiwada', icon: 'parking' },
        { label: 'Report Parking Violation', actionId: 'report_parking_violation', icon: 'report' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 2. IN-CHAT COMPLAINT & GRIEVANCE RESOLUTION (Multi-lingual & Vernacular Detection)
  const isComplaintIntent =
    q.includes('pothole') ||
    q.includes('potholes') ||
    q.includes('khadda') ||
    q.includes('khadde') ||
    q.includes('gadda') ||
    q.includes('gaddhe') ||
    q.includes('leak') ||
    q.includes('pipeline') ||
    q.includes('water leak') ||
    q.includes('paani leak') ||
    q.includes('garbage') ||
    q.includes('kachra') ||
    q.includes('kachara') ||
    q.includes('safai') ||
    q.includes('trash') ||
    q.includes('debris') ||
    q.includes('drain') ||
    q.includes('drainage') ||
    q.includes('sewage') ||
    q.includes('naala') ||
    q.includes('nala') ||
    q.includes('gutter') ||
    q.includes('gatari') ||
    q.includes('manhole') ||
    q.includes('street light') ||
    q.includes('streetlight') ||
    q.includes('batti') ||
    q.includes('bijli') ||
    q.includes('andhera') ||
    q.includes('lamp') ||
    q.includes('broken road') ||
    q.includes('footpath') ||
    q.includes('file complaint') ||
    q.includes('register complaint') ||
    q.includes('lodge complaint') ||
    q.includes('report issue');

  if (isComplaintIntent && !q.includes('status') && !q.includes('track')) {
    // Determine category and department
    let category = 'Roads & Bridges';
    let department = 'Public Works Department (PWD)';
    let title = 'Citizen Grievance: Road & Infrastructure Issue';
    let defaultLocation = `${wardName}, Near Main Road`;

    if (q.includes('pothole') || q.includes('khadda') || q.includes('gadda') || q.includes('road') || q.includes('footpath')) {
      category = 'Roads & Bridges';
      department = 'TMC / BMC Road Infrastructure Division';
      title = 'Deep Pothole & Road Surface Damage';
    } else if (q.includes('garbage') || q.includes('kachra') || q.includes('trash') || q.includes('debris') || q.includes('waste') || q.includes('safai')) {
      category = 'Sanitation & Waste';
      department = 'Solid Waste Management (SWM)';
      title = 'Overflowing Garbage & Waste Accumulation';
    } else if (q.includes('leak') || q.includes('pipeline') || q.includes('water') || q.includes('paani')) {
      category = 'Water Supply';
      department = 'Municipal Water Works & Hydraulics';
      title = 'Underground Pipeline Leakage & Water Wastage';
    } else if (q.includes('street light') || q.includes('streetlight') || q.includes('lamp') || q.includes('light') || q.includes('batti') || q.includes('bijli') || q.includes('andhera')) {
      category = 'Electrical & Streetlights';
      department = 'Electrical Maintenance Department';
      title = 'Non-Functional Streetlight / Pole Blackout';
    } else if (q.includes('drain') || q.includes('sewage') || q.includes('manhole') || q.includes('naala') || q.includes('nala') || q.includes('gutter')) {
      category = 'Drainage & Stormwater';
      department = 'Sewerage Operations & Stormwater Drain (SWD)';
      title = 'Blocked Drainage Canal & Sewage Overflow';
    }

    // Try to extract location from query if mentioned
    let identifiedLocation = defaultLocation;
    const locationKeywords = [
      'ghodbunder',
      'naupada',
      'majiwada',
      'talao pali',
      'station',
      'dadar',
      'bandra',
      'andheri',
      'kurla',
      'thane west',
      'thane east',
      'wagle estate',
      'hiranandani',
      'teen hath naka',
      'bkc',
    ];
    for (const kw of locationKeywords) {
      if (q.includes(kw)) {
        identifiedLocation = `${kw.toUpperCase().replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}, ${wardName}`;
        break;
      }
    }

    // Directly register the complaint into the civic database!
    const newComplaint = createComplaint({
      title,
      category,
      department,
      location: identifiedLocation,
      description: userQuery,
      ward: wardName,
      userId: currentUser?.uid || 'usr-citizen',
      userName: currentUser?.name || 'Concerned Citizen',
      assignedOfficer: 'Er. Rajesh Patil (Assistant Ward Engineer)',
      assignedOfficerPhone: '98201-94821',
      slaHours: getCategorySlaHours(category),
    });

    // Reward the user 25 civic points for lodging civic report
    updateUserCivicPoints(currentUser?.uid || 'usr-citizen', 25, `Filed grievance ticket ${newComplaint.ticketId}`);

    const slaHours = getCategorySlaHours(category);
    const grievanceTicket: InChatGrievanceTicket = {
      complaint: newComplaint,
      slaHours,
      assignedDesk: department,
      pointsAwarded: 25,
    };

    return {
      text: `🛡️ **Grievance Officially Lodged Right in This Chat!**\n\nI have registered your grievance directly with **${department}** without redirecting you to any forms. Your official ticket number is **${newComplaint.ticketId}** with a mandatory **${slaHours}-Hour Municipal SLA**. You earned **+25 Civic Points** for helping keep our city clean and safe.`,
      ticket: grievanceTicket,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Check Live Status', actionId: `status_${newComplaint.ticketId}`, icon: 'check', primary: true },
        { label: 'View Officer Contact', actionId: 'officer_contact', icon: 'call' },
        { label: 'Water Supply Schedule', actionId: 'query_water', icon: 'water' },
        { label: 'Ask Another Question', actionId: 'ask_question', icon: 'ticket' },
      ],
    };
  }

  // 3. IN-CHAT COMPLAINT STATUS TRACKING (No diversion to tracking screen)
  if (q.includes('status') || q.includes('track') || q.includes('my complaint') || q.includes('complaint status') || q.includes('ticket')) {
    const allComplaints = getComplaints();
    // Try to match a ticket ID in user's query
    const ticketMatch = userQuery.match(/TMC-\d{4}-\d{4}|COMP-\d+/i);
    let matchedComplaint: Complaint | undefined;

    if (ticketMatch) {
      matchedComplaint = allComplaints.find(
        (c) => c.ticketId.toLowerCase() === ticketMatch[0].toLowerCase() || c.id.toLowerCase() === ticketMatch[0].toLowerCase()
      );
    }

    if (!matchedComplaint) {
      // Pick the most recent complaint
      matchedComplaint = allComplaints[0];
    }

    if (matchedComplaint) {
      const slaInfo = computeSlaStatus(matchedComplaint);
      const officer = matchedComplaint.assignedOfficer || 'Er. S. Deshmukh (Ward Inspection Desk)';
      const phone = matchedComplaint.assignedOfficerPhone || '022-25371010';

      return {
        text: `🔍 **Live Grievance Status: ${matchedComplaint.ticketId}**\n\n• **Title**: ${matchedComplaint.title}\n• **Current Stage**: **${matchedComplaint.status}**\n• **Department**: ${matchedComplaint.department}\n• **Location**: ${matchedComplaint.location}\n• **SLA Target**: ${slaInfo.label}\n• **Assigned Officer**: ${officer} (📞 ${phone})\n\nEverything is logged and verified on the municipal ledger. If work is not completed within the SLA, it automatically escalates to the Additional Municipal Commissioner.`,
        ticket: {
          complaint: matchedComplaint,
          slaHours: matchedComplaint.slaHours || 48,
          assignedDesk: matchedComplaint.department,
          pointsAwarded: 0,
        },
        source: 'local_engine',
        latencyMs: Math.round(performance.now() - startTime),
        actions: [
          { label: 'Call Officer Desk', actionId: 'call_officer', icon: 'call' },
          { label: 'Book Smart Parking', actionId: 'book_parking', icon: 'parking' },
          { label: 'Property Tax Guide', actionId: 'query_tax', icon: 'tax' },
        ],
      };
    }
  }

  // 4. WATER SUPPLY & TANKER BOOKINGS
  if (q.includes('water cut') || q.includes('water supply') || q.includes('water timing') || q.includes('water time') || q.includes('no water') || q.includes('water pressure') || q.includes('paani') || q.includes('pani')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.water.timings,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Book Subsidized Tanker (₹800)', actionId: 'book_tanker', icon: 'water', primary: true },
        { label: 'Report Low Pressure / Leak', actionId: 'report_water_leak', icon: 'report' },
        { label: 'Property Tax Details', actionId: 'query_tax', icon: 'tax' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // In-Chat Water Tanker Booking
  if (q.includes('book tanker') || q.includes('water tanker') || q.includes('order tanker') || q.includes('tanker')) {
    const bookingId = `TNK-${Math.floor(1000 + Math.random() * 9000)}`;
    const tankerBooking: InChatTankerBooking = {
      bookingId,
      ward: wardName,
      capacity: '10,000 Liters (Potable Water)',
      dispatchTime: 'Dispatched within 2 Hours (Priority)',
      rate: 800,
      contactNumber: '022-25371010 (TMC Water Dispatch Desk)',
    };

    return {
      text: `💧 **Municipal Water Tanker Booked Directly in Chat!**\n\n• **Order Token**: **${bookingId}**\n• **Ward**: ${wardName}\n• **Capacity**: 10,000 Liters\n• **Subsidized Tariff**: ₹800 (Pay on Delivery / Municipal Cash Receipt)\n• **Estimated Arrival**: Within 90-120 minutes from Kopri Water Works.\n• **Dispatcher Desk**: 022-25371010.`,
      tankerBooking,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Check Water Timings', actionId: 'query_water', icon: 'water' },
        { label: 'Find Smart Parking', actionId: 'check_parking_status', icon: 'parking' },
      ],
    };
  }

  // 5. PROPERTY TAX & REBATES
  if (q.includes('property tax') || q.includes('tax payment') || q.includes('tax rebate') || q.includes('house tax') || q.includes('sac code') || q.includes('ghar patti')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.propertyTax.steps,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Disaster Helplines', actionId: 'query_disaster', icon: 'call' },
        { label: 'Waste Segregation Rules', actionId: 'query_waste', icon: 'report' },
        { label: 'Check Smart Parking', actionId: 'check_parking_status', icon: 'parking' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 6. CERTIFICATES (Birth, Death, Domicile, Income)
  if (q.includes('birth certificate') || q.includes('death certificate') || q.includes('certificate') || q.includes('caste') || q.includes('domicile') || q.includes('dakhla')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.birthDeath.guide,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Trade License Steps', actionId: 'query_trade', icon: 'check' },
        { label: 'Water Supply Schedule', actionId: 'query_water', icon: 'water' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 7. WASTE SEGREGATION & GARBAGE PICKUP
  if (q.includes('waste') || q.includes('segregation') || q.includes('wet waste') || q.includes('dry waste') || q.includes('e-waste') || q.includes('dustbin') || q.includes('kachra')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.waste.rules,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Report Garbage Dump', actionId: 'report_garbage', icon: 'report', primary: true },
        { label: 'Tree Trimming Protocol', actionId: 'query_tree', icon: 'check' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 8. STREET LIGHTS & POWER CUTS
  if (q.includes('street light') || q.includes('streetlight') || q.includes('power cut') || q.includes('electricity') || q.includes('msedcl') || q.includes('best electricity') || q.includes('batti') || q.includes('bijli')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.streetlights.info,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Report Dark Street / Pole', actionId: 'report_light', icon: 'report', primary: true },
        { label: 'Disaster Helplines', actionId: 'query_disaster', icon: 'call' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 9. TREE TRIMMING
  if (q.includes('tree') || q.includes('branch') || q.includes('pruning') || q.includes('ped') || q.includes('jhaad')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.treeTrimming.rules,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Report Dangerous Branch', actionId: 'report_tree', icon: 'report', primary: true },
        { label: 'Disaster Hotline', actionId: 'query_disaster', icon: 'call' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 10. TRADE LICENSE & GUMASTA
  if (q.includes('trade license') || q.includes('gumasta') || q.includes('shop act') || q.includes('business registration')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.tradeLicense.guide,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Property Tax Payment', actionId: 'query_tax', icon: 'tax' },
        { label: 'Birth / Death Certificates', actionId: 'query_cert', icon: 'check' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 11. MONSOON & EMERGENCY HELPLINES
  if (q.includes('emergency') || q.includes('helpline') || q.includes('flood') || q.includes('high tide') || q.includes('disaster') || q.includes('police') || q.includes('fire') || q.includes('madat')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.disaster.helplines,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'TMC Helpline (1800-222-108)', actionId: 'call_tmc', icon: 'call', primary: true },
        { label: 'BMC Disaster (1916)', actionId: 'call_bmc', icon: 'call' },
        { label: 'National Police (112)', actionId: 'call_police', icon: 'call' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 12. TRANSIT, TRAINS, BUSES, METRO
  if (q.includes('train') || q.includes('bus') || q.includes('bkc') || q.includes('metro') || q.includes('route') || q.includes('journey') || q.includes('local')) {
    const res: AIChatResponse = {
      text: CIVIC_KNOWLEDGE.transit.routes,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Book Smart Parking', actionId: 'check_parking_status', icon: 'parking' },
        { label: 'Report Transit Grievance', actionId: 'report_transit', icon: 'report' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // 13. WARD HEALTH & CIVIC SCORE
  if (q.includes('ward') || q.includes('score') || q.includes('health') || q.includes('points') || q.includes('leaderboard')) {
    const userPts = currentUser?.civicPoints || 420;
    const res: AIChatResponse = {
      text: `📊 **${wardName} Civic Performance Index**\n\n• **Overall Health Score**: **84 / 100** (Grade A Certified)\n• **Pothole Repair SLA Adherence**: 88.4% within 48 hours\n• **Waste Segregation Index**: 89% compliance\n• **Drinking Water Purity**: 96.2% potability rating\n• **Your Personal Civic Points**: **${userPts} Points** (Rank #4 in Ward Leaderboard)\n\nYou can earn more points by reporting issues or booking smart parking right here in the chat!`,
      source: 'local_engine',
      latencyMs: Math.round(performance.now() - startTime),
      actions: [
        { label: 'Report Grievance (+25 pts)', actionId: 'prompt_complaint', icon: 'report', primary: true },
        { label: 'Book Parking (+15 pts)', actionId: 'instant_book_talao_pali', icon: 'parking' },
      ],
    };
    responseCache.set(q, { response: res, timestamp: Date.now() });
    return res;
  }

  // DEFAULT CONVERSATIONAL RESPONSE
  const res: AIChatResponse = {
    text: `Namaskar ${userName}! I am here to help you resolve municipal matters directly without sending you away to other pages.\n\nI can directly assist you with:\n1. **Filing & Tracking Grievances** (potholes, garbage, streetlights, water leaks — tickets are registered right here!)\n2. **Reserving Smart Parking** (Talao Pali, Majiwada, Dadar decks with instant passes)\n3. **Civic Queries** (water cut timings, property tax payment steps, birth/death certificates, waste rules)\n4. **Emergency Helplines** (TMC 1800-222-108, BMC 1916, Police 112)\n\nWhat would you like assistance with right now?`,
    source: 'local_engine',
    latencyMs: Math.round(performance.now() - startTime),
    actions: [
      { label: 'Report a Pothole / Leak', actionId: 'report_pothole', icon: 'report', primary: true },
      { label: 'Book Smart Parking Spot', actionId: 'check_parking_status', icon: 'parking' },
      { label: 'Water Supply Schedule', actionId: 'query_water', icon: 'water' },
      { label: 'Property Tax Payment', actionId: 'query_tax', icon: 'tax' },
    ],
  };
  responseCache.set(q, { response: res, timestamp: Date.now() });
  return res;
}

// -------------------------------------------------------------
// SERVER-SIDE GEMINI API CALL WITH TIMEOUT & LOCAL CACHE
// -------------------------------------------------------------
export async function queryGeminiCivicAssistant(
  userQuery: string,
  currentUser?: UserProfile | null
): Promise<string | null> {
  const normKey = userQuery.toLowerCase().trim();
  const cached = geminiCache.get(normKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.text;
  }

  // Strict 2.6s timeout to prevent UI freeze and maintain ultra-fast responsiveness
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2600);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        context: {
          userName: currentUser?.name || 'Citizen',
          ward: currentUser?.ward || 'TMC Ward 4 - Majiwada & Naupada',
          civicPoints: currentUser?.civicPoints || 420,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.fallback || !data.text) return null;

    geminiCache.set(normKey, { text: data.text, timestamp: Date.now() });
    return data.text;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
