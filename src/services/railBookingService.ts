import {
  BookedRailTicket,
  INITIAL_BOOKED_TICKETS,
  IRCTCTrain,
  IRCTC_TRAIN_CATALOG,
  RailPassenger,
  SuburbanTrain,
  SUBURBAN_TIMETABLE,
  MEGA_BLOCK_DATA,
  MegaBlockNotice,
} from '../data/transitBookingData';
import { saveBookingToFirestore } from './dbService';

const STORAGE_KEY_TICKETS = 'urbanconnect_rail_booked_tickets';

// Event listener mechanism for reactive updates
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToRailBookings(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Rail booking listener error', e);
    }
  });
}

export function getBookedRailTickets(): BookedRailTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_BOOKED_TICKETS));
      return INITIAL_BOOKED_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKED_TICKETS;
  }
}

export function saveBookedRailTickets(tickets: BookedRailTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    notifyListeners();
  } catch (e) {
    console.error('Failed saving rail tickets', e);
  }
}

// Generate realistic 10-digit Indian Railways PNR
export function generateRandomPNR(): string {
  // First digit usually zone (e.g., 8 for Central / Western)
  const firstDigit = '8';
  const rest = Math.floor(100000000 + Math.random() * 900000000).toString().slice(0, 9);
  return `${firstDigit}${rest}`;
}

export interface BookTicketParams {
  train: IRCTCTrain;
  classCode: string;
  quota: string;
  journeyDate: string;
  passengers: Array<{
    name: string;
    age: number;
    gender: 'M' | 'F' | 'O';
    berthPreference: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window' | 'No Preference';
  }>;
}

// Allot realistic coach and berth numbers based on class
function allocateBerths(classCode: string, passengers: BookTicketParams['passengers']): RailPassenger[] {
  const coachPrefixes: Record<string, string> = {
    '1A': 'H1',
    '2A': 'A1',
    '3A': 'B3',
    '3E': 'M2',
    'CC': 'C4',
    'EC': 'E1',
    'SL': 'S5',
    '2S': 'D2',
    'EV': 'EV1',
  };

  const coach = coachPrefixes[classCode] || 'B1';
  let startBerth = Math.floor(12 + Math.random() * 40);

  return passengers.map((p) => {
    const berthNum = startBerth++;
    let berthType: string = p.berthPreference !== 'No Preference' ? p.berthPreference : 'Lower';

    if (classCode === 'CC' || classCode === 'EC' || classCode === '2S') {
      berthType = p.berthPreference === 'Window' ? 'Window (WS)' : 'Aisle (AS)';
    }

    return {
      name: p.name,
      age: p.age,
      gender: p.gender,
      berthPreference: p.berthPreference,
      allottedCoach: coach,
      allottedBerth: berthNum,
      allottedBerthType: berthType,
      bookingStatus: 'CNF',
      currentStatus: 'CNF',
    };
  });
}

// Book an IRCTC Reserved Ticket
export function bookIRCTCTicket(params: BookTicketParams): BookedRailTicket {
  const { train, classCode, quota, journeyDate, passengers } = params;
  const pnr = generateRandomPNR();
  const selectedClass = train.classes.find((c) => c.classCode === classCode) || train.classes[0];
  const baseRate = selectedClass?.fare || 350;
  const totalBase = baseRate * passengers.length;
  const tax = Math.round(totalBase * 0.05); // 5% GST
  const tatkalFee = quota.includes('Tatkal') || quota === 'TQ' ? 150 * passengers.length : 0;
  const totalFare = totalBase + tax + tatkalFee;

  const allottedPassengers = allocateBerths(classCode, passengers);
  const now = new Date();
  const bookedAtStr = `Today ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newTicket: BookedRailTicket = {
    id: `irctc-${Date.now()}`,
    pnr,
    bookingType: 'IRCTC_RESERVED',
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    fromCode: train.originCode,
    fromName: train.originName,
    toCode: train.destinationCode,
    toName: train.destinationName,
    journeyDate: journeyDate || 'Tomorrow',
    departureTime: train.departureTime,
    arrivalTime: train.arrivalTime,
    classCode,
    quota,
    passengers: allottedPassengers,
    totalFare,
    baseFare: totalBase,
    taxAmount: tax,
    tatkalFee,
    status: 'CNF',
    chartStatus: 'Chart Prepared',
    bookedAt: bookedAtStr,
    platform: train.routeStops[0]?.platform || 'PF 1',
    qrPayload: `IRCTC-PNR-${pnr}-TR-${train.trainNumber}-CLS-${classCode}-PAX-${passengers.length}-CNF`,
    barcodePayload: pnr,
    refundableAmount: Math.round(totalFare * 0.9), // 10% clerkage charge
  };

  const existing = getBookedRailTickets();
  saveBookedRailTickets([newTicket, ...existing]);
  saveBookingToFirestore(newTicket);
  return newTicket;
}

// Book UTS Suburban Ticket (Unreserved QR Pass)
export function bookUTSSuburbanTicket(params: {
  fromStation: string;
  toStation: string;
  ticketType: 'Single Journey' | 'Return Journey' | 'Monthly Season Pass' | 'AC Local Pass';
  passengerName?: string;
  coachType: 'Second Class (II)' | 'First Class (I)' | 'AC EMU Local';
  fare: number;
}): BookedRailTicket {
  const { fromStation, toStation, ticketType, passengerName, coachType, fare } = params;
  const tokenNumber = Math.floor(10000 + Math.random() * 90000);
  const pnr = `UTS-${fromStation.slice(0, 3).toUpperCase()}-${tokenNumber}`;
  const now = new Date();
  const bookedAtStr = `Today ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newTicket: BookedRailTicket = {
    id: `uts-${Date.now()}`,
    pnr,
    bookingType: 'UTS_SUBURBAN',
    trainNumber: 'CR-WR-SUBURBAN',
    trainName: `${fromStation} ➔ ${toStation} (${ticketType})`,
    fromCode: fromStation.slice(0, 4).toUpperCase(),
    fromName: fromStation,
    toCode: toStation.slice(0, 4).toUpperCase(),
    toName: toStation,
    journeyDate: `Today (Valid 3 Hours from booking)`,
    departureTime: 'Next Suburban Train',
    arrivalTime: 'As per route',
    classCode: coachType,
    quota: 'UTS Suburban Rail',
    passengers: [
      {
        name: passengerName || 'Suburban Commuter',
        age: 28,
        gender: 'M',
        berthPreference: 'No Preference',
        allottedCoach: coachType,
        allottedBerth: 1,
        allottedBerthType: 'Unreserved EMU',
        bookingStatus: 'ACTIVE',
        currentStatus: 'ACTIVE',
      },
    ],
    totalFare: fare,
    baseFare: fare,
    taxAmount: 0,
    tatkalFee: 0,
    status: 'CNF',
    chartStatus: 'Chart Prepared',
    bookedAt: bookedAtStr,
    platform: 'All Suburban Platforms',
    qrPayload: `UTS-OPTICAL-PASS-TOKEN-${tokenNumber}-${fromStation}-${toStation}-${coachType}-VALID`,
    barcodePayload: `UTS${tokenNumber}`,
    refundableAmount: 0,
  };

  const existing = getBookedRailTickets();
  saveBookedRailTickets([newTicket, ...existing]);
  saveBookingToFirestore(newTicket);
  return newTicket;
}

// Cancel an existing booked ticket with refund
export function cancelRailTicket(ticketId: string): { success: boolean; refundAmount: number; message: string } {
  const tickets = getBookedRailTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) {
    return { success: false, refundAmount: 0, message: 'Ticket not found' };
  }

  const ticket = tickets[idx];
  if (ticket.status === 'CANCELLED') {
    return { success: false, refundAmount: 0, message: 'Ticket already cancelled' };
  }

  const refund = ticket.refundableAmount || Math.round(ticket.totalFare * 0.8);
  const now = new Date();

  tickets[idx] = {
    ...ticket,
    status: 'CANCELLED',
    refundableAmount: 0,
    cancellationDate: `Today ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    passengers: ticket.passengers.map((p) => ({
      ...p,
      currentStatus: 'CANCELLED',
    })),
  };

  saveBookedRailTickets(tickets);
  return {
    success: true,
    refundAmount: refund,
    message: `Ticket PNR ${ticket.pnr} cancelled successfully. Refund of ₹${refund} credited to your civic wallet/card.`,
  };
}

// PNR Status lookup
export function lookupPNRStatus(pnrQuery: string): BookedRailTicket | null {
  const clean = pnrQuery.replace(/\D/g, '');
  const tickets = getBookedRailTickets();

  // Try exact or clean numeric match
  const match = tickets.find((t) => t.pnr.replace(/\D/g, '') === clean || t.pnr.toLowerCase().includes(pnrQuery.toLowerCase().trim()));
  if (match) return match;

  // Fallback: If not found in user tickets, synthesize a realistic live PNR record
  if (clean.length >= 6) {
    return {
      id: `live-pnr-${clean}`,
      pnr: clean.length === 10 ? clean : `84${clean.padEnd(8, '0')}`,
      bookingType: 'IRCTC_RESERVED',
      trainNumber: '12111',
      trainName: 'CSMT - Amravati Superfast Express',
      fromCode: 'CSMT',
      fromName: 'Mumbai CSMT',
      toCode: 'TNA',
      toName: 'Thane Junction',
      journeyDate: 'Today',
      departureTime: '07:55 PM',
      arrivalTime: '08:38 PM',
      classCode: '3A',
      quota: 'General (GN)',
      passengers: [
        {
          name: 'Passenger 1',
          age: 34,
          gender: 'M',
          berthPreference: 'Lower',
          allottedCoach: 'B2',
          allottedBerth: 28,
          allottedBerthType: 'Lower (LB)',
          bookingStatus: 'WL 12',
          currentStatus: 'CNF (Confirmed)',
        },
      ],
      totalFare: 520,
      baseFare: 490,
      taxAmount: 30,
      tatkalFee: 0,
      status: 'CNF',
      chartStatus: 'Chart Prepared',
      bookedAt: 'Yesterday 10:20 AM',
      platform: 'PF 14',
      qrPayload: `IRCTC-PNR-${clean}-CNF-LIVE-INSPECTION`,
      barcodePayload: clean,
    };
  }

  return null;
}

// Search IRCTC trains by station query
export function searchIRCTCTrains(fromCode: string, toCode: string): IRCTCTrain[] {
  if (!fromCode && !toCode) return IRCTC_TRAIN_CATALOG;

  return IRCTC_TRAIN_CATALOG.filter((t) => {
    const matchOrigin = !fromCode || t.originCode.toLowerCase() === fromCode.toLowerCase() || t.originName.toLowerCase().includes(fromCode.toLowerCase());
    const matchDest = !toCode || t.destinationCode.toLowerCase() === toCode.toLowerCase() || t.destinationName.toLowerCase().includes(toCode.toLowerCase()) || t.routeStops.some((s) => s.stationCode.toLowerCase() === toCode.toLowerCase() || s.stationName.toLowerCase().includes(toCode.toLowerCase()));
    return matchOrigin || matchDest;
  });
}

// Get Suburban timetable with line and direction filters
export function getSuburbanTimetable(
  lineFilter?: string,
  directionFilter?: 'UP' | 'DOWN' | 'ALL',
  speedFilter?: 'ALL' | 'FAST' | 'SLOW' | 'AC'
): SuburbanTrain[] {
  return SUBURBAN_TIMETABLE.filter((train) => {
    if (lineFilter && lineFilter !== 'All' && train.line !== lineFilter) {
      return false;
    }
    if (directionFilter && directionFilter !== 'ALL' && train.direction !== directionFilter) {
      return false;
    }
    if (speedFilter && speedFilter !== 'ALL') {
      if (speedFilter === 'FAST' && !train.speedType.includes('FAST')) return false;
      if (speedFilter === 'SLOW' && !train.speedType.includes('SLOW')) return false;
      if (speedFilter === 'AC' && !train.speedType.startsWith('AC')) return false;
    }
    return true;
  });
}

export function getMegaBlocks(): MegaBlockNotice[] {
  return MEGA_BLOCK_DATA;
}
