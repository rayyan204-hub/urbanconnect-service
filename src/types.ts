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
  | 'services';

export interface CommunityPost {
  id: string;
  author: string;
  authorRole: string;
  avatar: string;
  title: string;
  description: string;
  category: 'Civic Notice' | 'Neighborhood' | 'Cultural' | 'Environment';
  imageUrl?: string;
  date: string;
  likes: number;
  comments: number;
  pinned?: boolean;
}

export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  description: string;
  location: string;
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
  description: string;
  joinedCount: number;
  maxVolunteers: number;
  imageUrl: string;
  isJoined?: boolean;
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

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  ticketId: string;
  title: string;
  category: string;
  department: string;
  location: string;
  dateFiled: string;
  status: ComplaintStatus;
  description: string;
  lastUpdate: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  ward: string;
  citizenId: string;
  complaintsFiled: number;
  volunteerHours: number;
  bloodDonations: number;
}
