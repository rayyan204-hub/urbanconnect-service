export type ScreenId =
  | 'splash'
  | 'login'
  | 'register'
  | 'home'
  | 'community'
  | 'lost-found'
  | 'blood-donation'
  | 'volunteer-events'
  | 'bus-info'
  | 'train-info'
  | 'complaints'
  | 'profile'
  | 'services'
  | 'admin'
  | 'map'
  | 'journey-planner'
  | 'parking'
  | 'analytics';

export type UserRole = 'user' | 'field_officer' | 'organizer' | 'admin';

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  date: string;
}

export interface CommunityPost {
  id: string;
  postId?: string;
  userId?: string;
  author: string;
  authorRole: string;
  avatar: string;
  title: string;
  description: string;
  category: 'Civic Notice' | 'Neighborhood' | 'Cultural' | 'Environment' | 'General';
  imageUrl?: string;
  date: string;
  createdAt?: string;
  likes: number;
  comments: number;
  pinned?: boolean;
  likedBy?: string[];
  commentsList?: CommentItem[];
}

export interface LostFoundItem {
  id: string;
  userId?: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: string;
  contactName: string;
  contactPhone: string;
  imageUrl: string;
  reward?: string;
  status: 'Open' | 'Claimed';
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export interface BloodDonor {
  id: string;
  userId?: string;
  name: string;
  bloodGroup: BloodGroup;
  location: string;
  distance: string;
  phone: string;
  isAvailable: boolean;
  lastDonated: string;
  verified: boolean;
}

export interface VolunteerEvent {
  id: string;
  title: string;
  organization: string;
  category: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  joinedCount: number;
  maxVolunteers: number;
  imageUrl: string;
  isJoined?: boolean;
  registeredUserIds?: string[];
}

export interface BusStop {
  name: string;
  time: string;
  isPassed?: boolean;
}

export interface BusRoute {
  id: string;
  busNumber: string;
  routeName: string;
  startPoint: string;
  destination: string;
  frequency: string;
  fare: string;
  nextDeparture: string;
  status: 'On Time' | 'Delayed' | 'Departed';
  delayMinutes?: number;
  stops: BusStop[];
}

export interface TrainSchedule {
  id: string;
  trainNumber: string;
  trainName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  platform: string;
  status: 'On Time' | 'Delayed' | 'Boarding';
  delayMinutes?: number;
  frequency: string;
}

// 8-stage complaint lifecycle (with backwards compatibility for Pending & In Progress)
export type ComplaintStatus =
  | 'Reported'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'Work Started'
  | 'Resolution Evidence Added'
  | 'Awaiting Citizen Confirmation'
  | 'Resolved'
  | 'Reopened'
  | 'Pending'
  | 'In Progress';

export interface ComplaintTimelineStep {
  stage: ComplaintStatus;
  timestamp: string;
  note: string;
  done: boolean;
  officerName?: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  userId?: string;
  userName?: string;
  title: string;
  category: string;
  department: string;
  location: string;
  latitude?: number;
  longitude?: number;
  dateFiled: string;
  status: ComplaintStatus;
  description: string;
  lastUpdate: string;
  imageUrl?: string;
  // Prototype 2 extensions
  resolutionEvidenceUrl?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  assignedOfficer?: string;
  assignedOfficerPhone?: string;
  citizenConfirmed?: boolean;
  citizenFeedback?: string;
  endorsementsCount?: number;
  duplicateReportIds?: string[];
  ward?: string;
  timeline?: ComplaintTimelineStep[];
  // SLA & Reopen tracking
  slaHours?: number;
  slaDeadline?: string;
  slaStatus?: 'within_sla' | 'approaching' | 'breached';
  reopened?: boolean;
  reopenCount?: number;
  reopenReason?: string;
  reopenedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'complaint' | 'event' | 'notice' | 'system' | 'transit' | 'emergency' | 'community';
  timestamp: string;
  read: boolean;
  actionScreen?: ScreenId;
  relatedId?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  ward: string;
  citizenId: string;
  role: UserRole;
  createdAt: string;
  complaintsFiled: number;
  volunteerHours: number;
  bloodDonations: number;
  // Prototype 2 gamification
  civicPoints?: number;
  rankTitle?: string;
  badges?: string[];
}

export interface ParkingLot {
  id: string;
  name: string;
  location: string;
  address?: string;
  ward: string;
  latitude: number;
  longitude: number;
  availableSpaces: number;
  totalCapacity: number;
  hourlyRate: string;
  ratePerHour?: number;
  vehicleType?: string;
  evCharging?: boolean;
  type: 'Multi-level' | 'Open Ground' | 'Metro Park & Ride' | 'Underground Complex';
  features: string[];
  distanceKm?: number;
  status: 'Available' | 'Fast Filling' | 'Full';
}

export interface TransitLeg {
  mode: 'bus' | 'train' | 'metro' | 'walk';
  lineName: string;
  fromStop: string;
  toStop: string;
  durationMinutes: number;
  details: string;
  status: 'On Time' | 'Delayed';
}

export interface JourneyOption {
  id: string;
  from: string;
  to: string;
  durationMinutes: number;
  fare: string;
  transfers: number;
  summary: string;
  tags: string[];
  departureTime: string;
  arrivalTime: string;
  legs: TransitLeg[];
  title?: string;
  modes?: string[];
  estimatedFare?: string | number;
  steps?: Array<{
    mode: string;
    instruction: string;
    duration: string;
    line: string;
  }>;
}

export interface WardMetric {
  name: string;
  score: number;
  benchmark: string;
  trend: 'up' | 'down' | 'stable';
}

export interface WardCivicHealth {
  wardId: string;
  wardName: string;
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  complaintResolutionRate: number;
  avgResolutionTimeHours: number;
  activeComplaints: number;
  metrics: {
    roadServices: number;
    wasteManagement: number;
    publicTransport: number;
    communityParticipation: number;
    waterDrainage: number;
  };
  hotspots: {
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }[];
}

export interface CivicLeaderboardUser {
  rank: number;
  uid: string;
  name: string;
  ward: string;
  avatar: string;
  points: number;
  badge: string;
  verified: boolean;
  complaintsCount?: number;
}

export interface CivicReward {
  id: string;
  title: string;
  pointsCost: number;
  category: 'transit' | 'parking' | 'community' | 'merit';
  description: string;
  icon: string;
  terms: string;
  partner: string;
}

export interface RedeemedVoucher {
  id: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  code: string;
  pointsSpent: number;
  redeemedAt: string;
  expiresAt: string;
  partner: string;
}

