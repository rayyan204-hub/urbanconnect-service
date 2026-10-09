import {
  CommunityPost,
  LostFoundItem,
  BloodDonor,
  VolunteerEvent,
  BusRoute,
  TrainSchedule,
  Complaint,
  ComplaintStatus,
  ComplaintTimelineStep,
  UserProfile,
  NotificationItem,
  ParkingLot,
  JourneyOption,
  WardCivicHealth,
  CivicLeaderboardUser,
  CivicReward,
  RedeemedVoucher,
} from '../types';
import {
  SAMPLE_USERS,
  INITIAL_POSTS,
  INITIAL_LOST_FOUND,
  INITIAL_DONORS,
  INITIAL_EVENTS,
  INITIAL_BUS_ROUTES,
  INITIAL_TRAINS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PARKING_LOTS,
  INITIAL_JOURNEY_OPTIONS,
  INITIAL_WARD_CIVIC_HEALTH,
  INITIAL_LEADERBOARD,
  INITIAL_CIVIC_REWARDS,
} from '../data/mockData';

// Storage collection keys matching Firestore structure
const STORAGE_PREFIX = 'urbanconnect_db_';
export const COLLECTIONS = {
  USERS: `${STORAGE_PREFIX}users`,
  POSTS: `${STORAGE_PREFIX}community_posts`,
  LOST_FOUND: `${STORAGE_PREFIX}lost_found`,
  BLOOD_DONORS: `${STORAGE_PREFIX}blood_donors`,
  VOLUNTEER_EVENTS: `${STORAGE_PREFIX}volunteer_events`,
  EVENT_REGISTRATIONS: `${STORAGE_PREFIX}event_registrations`,
  COMPLAINTS: `${STORAGE_PREFIX}complaints`,
  BUS_ROUTES: `${STORAGE_PREFIX}bus_routes`,
  TRAIN_ROUTES: `${STORAGE_PREFIX}train_routes`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  PARKING: `${STORAGE_PREFIX}parking`,
  JOURNEYS: `${STORAGE_PREFIX}journeys`,
  CIVIC_HEALTH: `${STORAGE_PREFIX}civic_health`,
  LEADERBOARD: `${STORAGE_PREFIX}leaderboard`,
  REWARDS: `${STORAGE_PREFIX}civic_rewards`,
  VOUCHERS: `${STORAGE_PREFIX}vouchers`,
} as const;

type EventListener = () => void;
const listeners: Map<string, Set<EventListener>> = new Map();

export function subscribeToCollection(collection: string, listener: EventListener): () => void {
  if (!listeners.has(collection)) {
    listeners.set(collection, new Set());
  }
  listeners.get(collection)!.add(listener);
  return () => {
    listeners.get(collection)?.delete(listener);
  };
}

function notifyCollectionChange(collection: string) {
  listeners.get(collection)?.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(`Error in listener for ${collection}:`, e);
    }
  });
}

function getStoredArray<T>(key: string, defaultData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed reading from ${key}:`, err);
    return defaultData;
  }
}

function setStoredArray<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyCollectionChange(key);
  } catch (err) {
    console.error(`Failed writing to ${key}:`, err);
  }
}

// -------------------------------------------------------------
// COMPLAINTS (8-Stage Lifecycle)
// -------------------------------------------------------------
export const COMPLAINT_STAGES: ComplaintStatus[] = [
  'Reported',
  'Under Review',
  'Verified',
  'Assigned',
  'Work Started',
  'Resolution Evidence Added',
  'Awaiting Citizen Confirmation',
  'Resolved',
];

export function getCategorySlaHours(category: string): number {
  const cat = (category || '').toLowerCase();
  if (cat.includes('sanitation') || cat.includes('garbage') || cat.includes('waste')) return 12;
  if (cat.includes('street light') || cat.includes('power') || cat.includes('lamp')) return 24;
  if (cat.includes('water') || cat.includes('pipeline')) return 24;
  if (cat.includes('drainage') || cat.includes('monsoon') || cat.includes('sewage')) return 36;
  if (cat.includes('road') || cat.includes('pothole') || cat.includes('traffic')) return 48;
  return 48;
}

export function computeSlaStatus(complaint: Complaint): {
  status: 'within_sla' | 'approaching' | 'breached';
  hoursRemaining: number;
  label: string;
  badgeColor: string;
} {
  const targetHours = complaint.slaHours || getCategorySlaHours(complaint.category);

  if (complaint.status === 'Resolved') {
    return {
      status: 'within_sla',
      hoursRemaining: 0,
      label: 'Resolved within SLA',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    };
  }

  let filingDate = new Date();
  if (complaint.dateFiled.includes('Sep 5')) filingDate = new Date(Date.now() - 72 * 3600 * 1000);
  else if (complaint.dateFiled.includes('Sep 7')) filingDate = new Date(Date.now() - 28 * 3600 * 1000);
  else if (complaint.dateFiled.includes('Today')) filingDate = new Date(Date.now() - 4 * 3600 * 1000);
  else if (complaint.dateFiled.includes('Yesterday')) filingDate = new Date(Date.now() - 22 * 3600 * 1000);
  else filingDate = new Date(Date.now() - 14 * 3600 * 1000);

  const elapsedHours = (Date.now() - filingDate.getTime()) / (1000 * 3600);
  const remaining = targetHours - elapsedHours;

  if (remaining <= 0) {
    const overdue = Math.abs(Math.round(remaining)) || 1;
    return {
      status: 'breached',
      hoursRemaining: remaining,
      label: `SLA Breached (${overdue}h overdue)`,
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300',
    };
  } else if (remaining < 12) {
    const remH = Math.max(1, Math.round(remaining));
    return {
      status: 'approaching',
      hoursRemaining: remaining,
      label: `Approaching SLA (${remH}h left)`,
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-300 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300',
    };
  } else {
    const remH = Math.round(remaining);
    return {
      status: 'within_sla',
      hoursRemaining: remaining,
      label: `Within SLA (${remH}h left)`,
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    };
  }
}

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function getComplaints(): Complaint[] {
  return getStoredArray<Complaint>(COLLECTIONS.COMPLAINTS, INITIAL_COMPLAINTS);
}

export function getComplaintById(id: string): Complaint | undefined {
  return getComplaints().find((c) => c.id === id || c.ticketId === id);
}

export function createComplaint(
  data: Omit<Complaint, 'id' | 'ticketId' | 'dateFiled' | 'status' | 'lastUpdate' | 'timeline'> & {
    userId?: string;
    userName?: string;
  }
): Complaint {
  const complaints = getComplaints();
  const ticketNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const timeString = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const slaHours = getCategorySlaHours(data.category);
  const deadlineDate = new Date(Date.now() + slaHours * 3600 * 1000);
  const slaDeadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const timelineSteps: ComplaintTimelineStep[] = COMPLAINT_STAGES.map((stage, idx) => ({
    stage,
    timestamp: idx === 0 ? timeString : '',
    note:
      idx === 0
        ? `Grievance ticket created by citizen. Ward SLA: ${slaHours} hours.`
        : `Scheduled: ${stage} stage.`,
    done: idx === 0,
  }));

  const newTicket: Complaint = {
    ...data,
    id: `comp-${Date.now()}`,
    ticketId: `TMC-2026-${ticketNum}`,
    dateFiled: timeString,
    status: 'Reported',
    lastUpdate: `Ticket logged into city municipal grievance dispatch queue (SLA: ${slaHours}h).`,
    endorsementsCount: 1,
    timeline: timelineSteps,
    slaHours,
    slaDeadline,
    slaStatus: 'within_sla',
  };

  const updated = [newTicket, ...complaints];
  setStoredArray(COLLECTIONS.COMPLAINTS, updated);

  // Award Civic Points (+25 for filing complaint)
  if (data.userId) {
    updateUserCivicPoints(data.userId, 25, 'Filing civic grievance');
  }

  // Trigger in-app notification
  addNotification({
    userId: data.userId,
    title: `Ticket Created: ${newTicket.ticketId}`,
    message: `Your complaint regarding "${newTicket.title}" has been logged as Reported (SLA: ${slaHours}h). +25 Civic Points earned!`,
    type: 'complaint',
    actionScreen: 'complaints',
    relatedId: newTicket.id,
  });

  return newTicket;
}

export function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  updateNote?: string,
  officerName?: string
): Complaint | null {
  const complaints = getComplaints();
  const index = complaints.findIndex((c) => c.id === complaintId);
  if (index === -1) return null;

  const target = complaints[index];
  const nowStr = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Map legacy statuses if needed
  let normalizedStatus = newStatus;
  if (newStatus === 'Pending') normalizedStatus = 'Reported';
  if (newStatus === 'In Progress') normalizedStatus = 'Work Started';

  const currentStageIndex = COMPLAINT_STAGES.indexOf(normalizedStatus);

  let updatedTimeline: ComplaintTimelineStep[] = [];
  if (target.timeline && target.timeline.length >= 8) {
    updatedTimeline = target.timeline.map((step) => {
      const stepIdx = COMPLAINT_STAGES.indexOf(step.stage);
      if (stepIdx <= currentStageIndex) {
        return {
          ...step,
          done: true,
          timestamp: step.timestamp || nowStr,
          note: step.stage === normalizedStatus && updateNote ? updateNote : step.note,
          officerName: officerName || step.officerName,
        };
      }
      return {
        ...step,
        done: false,
      };
    });
  } else {
    // Generate fresh 8-stage timeline
    updatedTimeline = COMPLAINT_STAGES.map((stage, idx) => ({
      stage,
      timestamp: idx <= currentStageIndex ? (idx === 0 ? target.dateFiled : nowStr) : '',
      note: idx === currentStageIndex && updateNote ? updateNote : `${stage} stage recorded.`,
      done: idx <= currentStageIndex,
      officerName: idx === currentStageIndex ? officerName : undefined,
    }));
  }

  const updatedComplaint: Complaint = {
    ...target,
    status: normalizedStatus,
    lastUpdate: updateNote || `Status updated to ${normalizedStatus}.`,
    assignedOfficer: officerName || target.assignedOfficer,
    timeline: updatedTimeline,
  };

  complaints[index] = updatedComplaint;
  setStoredArray(COLLECTIONS.COMPLAINTS, complaints);

  // Send notification to complaint creator
  addNotification({
    userId: target.userId,
    title: `Ticket ${target.ticketId} Updated`,
    message: `Status moved to "${normalizedStatus}". ${updateNote ? `Note: ${updateNote}` : ''}`,
    type: 'complaint',
    actionScreen: 'complaints',
    relatedId: target.id,
  });

  return updatedComplaint;
}

export function updateComplaintResolutionEvidence(
  complaintId: string,
  evidenceUrl: string,
  resolutionNotes: string,
  officerName?: string
): Complaint | null {
  const complaints = getComplaints();
  const index = complaints.findIndex((c) => c.id === complaintId);
  if (index === -1) return null;

  const target = complaints[index];
  const nowStr = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const currentStageIndex = COMPLAINT_STAGES.indexOf('Awaiting Citizen Confirmation');

  const updatedTimeline = COMPLAINT_STAGES.map((stage, idx) => {
    const existing = target.timeline?.find((t) => t.stage === stage);
    if (stage === 'Resolution Evidence Added') {
      return {
        stage,
        timestamp: nowStr,
        note: resolutionNotes || 'Field officer uploaded post-work verification photo.',
        done: true,
        officerName: officerName || target.assignedOfficer,
      };
    }
    if (stage === 'Awaiting Citizen Confirmation') {
      return {
        stage,
        timestamp: nowStr,
        note: 'Citizen prompt sent to verify work quality on ground.',
        done: true,
      };
    }
    return {
      stage,
      timestamp: existing?.timestamp || (idx <= currentStageIndex ? nowStr : ''),
      note: existing?.note || `${stage} recorded.`,
      done: idx <= currentStageIndex,
      officerName: existing?.officerName,
    };
  });

  const updated: Complaint = {
    ...target,
    status: 'Awaiting Citizen Confirmation',
    resolutionEvidenceUrl: evidenceUrl,
    resolutionNotes,
    resolvedAt: nowStr,
    assignedOfficer: officerName || target.assignedOfficer,
    lastUpdate: 'Field team finished work and posted proof photos. Please review and confirm resolution.',
    timeline: updatedTimeline,
  };

  complaints[index] = updated;
  setStoredArray(COLLECTIONS.COMPLAINTS, complaints);

  addNotification({
    userId: target.userId,
    title: `Proof Added: ${target.ticketId}`,
    message: 'Municipal engineers submitted resolution evidence. Please review and verify to close!',
    type: 'complaint',
    actionScreen: 'complaints',
    relatedId: target.id,
  });

  return updated;
}

export function confirmCitizenResolution(
  complaintId: string,
  confirmed: boolean,
  feedback?: string,
  citizenUid?: string
): Complaint | null {
  const complaints = getComplaints();
  const index = complaints.findIndex((c) => c.id === complaintId);
  if (index === -1) return null;

  const target = complaints[index];
  const nowStr = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  let nextStatus: ComplaintStatus = 'Resolved';
  let updateNote = 'Citizen inspected site and confirmed issue resolved. +50 Civic Points awarded!';

  if (!confirmed) {
    nextStatus = 'Reopened';
    updateNote = `Citizen verified site and reported issue still persists. Case reopened for immediate field re-inspection. ${
      feedback ? `Citizen Note: "${feedback}"` : ''
    }`;
  }

  const updatedTimeline = (target.timeline || []).map((step) => {
    if (confirmed && step.stage === 'Resolved') {
      return {
        ...step,
        done: true,
        timestamp: nowStr,
        note: 'Citizen confirmed resolution. Grievance closed.',
      };
    }
    return step;
  });

  // If reopening, append a step if not already present or update latest
  if (!confirmed) {
    updatedTimeline.push({
      stage: 'Reopened',
      timestamp: nowStr,
      note: `Grievance Reopened: ${feedback || 'Citizen rejected resolution proof.'}`,
      done: true,
      officerName: target.assignedOfficer,
    });
  }

  const updated: Complaint = {
    ...target,
    status: nextStatus,
    citizenConfirmed: confirmed,
    citizenFeedback: feedback,
    lastUpdate: updateNote,
    timeline: updatedTimeline,
    reopened: !confirmed ? true : target.reopened,
    reopenCount: !confirmed ? (target.reopenCount || 0) + 1 : target.reopenCount,
    reopenReason: !confirmed ? feedback : target.reopenReason,
    reopenedAt: !confirmed ? nowStr : target.reopenedAt,
  };

  complaints[index] = updated;
  setStoredArray(COLLECTIONS.COMPLAINTS, complaints);

  if (confirmed && (citizenUid || target.userId)) {
    updateUserCivicPoints(citizenUid || target.userId!, 50, 'Citizen resolution verification');
  }

  addNotification({
    userId: target.userId,
    title: confirmed ? `Ticket Closed: ${target.ticketId}` : `Ticket Re-opened: ${target.ticketId}`,
    message: confirmed
      ? 'Thank you for verifying! You earned 50 Civic Points for civic engagement.'
      : `Re-open request logged for ${target.ticketId}. Junior Engineer alerted for priority re-inspection.`,
    type: 'complaint',
    actionScreen: 'complaints',
    relatedId: target.id,
  });

  return updated;
}

export function endorseComplaint(complaintId: string, citizenUid?: string): Complaint | null {
  const complaints = getComplaints();
  const index = complaints.findIndex((c) => c.id === complaintId);
  if (index === -1) return null;

  const target = complaints[index];
  const count = (target.endorsementsCount || 1) + 1;
  const updated: Complaint = {
    ...target,
    endorsementsCount: count,
  };

  complaints[index] = updated;
  setStoredArray(COLLECTIONS.COMPLAINTS, complaints);

  if (citizenUid) {
    updateUserCivicPoints(citizenUid, 10, 'Endorsed duplicate civic issue');
  }

  return updated;
}

// -------------------------------------------------------------
// COMMUNITY POSTS
// -------------------------------------------------------------
export function getCommunityPosts(): CommunityPost[] {
  return getStoredArray<CommunityPost>(COLLECTIONS.POSTS, INITIAL_POSTS);
}

export function createCommunityPost(
  data: Omit<CommunityPost, 'id' | 'date' | 'likes' | 'comments'>
): CommunityPost {
  const posts = getCommunityPosts();
  const now = new Date();
  const newPost: CommunityPost = {
    ...data,
    id: `post-${Date.now()}`,
    date: `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    likes: 0,
    comments: 0,
    likedBy: [],
    commentsList: [],
  };

  const updated = [newPost, ...posts];
  setStoredArray(COLLECTIONS.POSTS, updated);

  addNotification({
    title: 'Post Published',
    message: `Your community post "${newPost.title.slice(0, 35)}..." is live.`,
    type: 'notice',
    actionScreen: 'community',
  });

  return newPost;
}

export function togglePostLike(postId: string, userId: string = 'current_user'): boolean {
  const posts = getCommunityPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) return false;

  const post = posts[index];
  const likedBy = post.likedBy || [];
  const hasLiked = likedBy.includes(userId);

  const newLikedBy = hasLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId];
  const newLikes = hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

  posts[index] = {
    ...post,
    likes: newLikes,
    likedBy: newLikedBy,
  };

  setStoredArray(COLLECTIONS.POSTS, posts);
  return !hasLiked;
}

export function addPostComment(
  postId: string,
  comment: { author: string; avatar: string; text: string }
): CommunityPost | null {
  const posts = getCommunityPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) return null;

  const post = posts[index];
  const newComment = {
    id: `cmt-${Date.now()}`,
    author: comment.author,
    avatar: comment.avatar,
    text: comment.text,
    date: 'Just now',
  };

  posts[index] = {
    ...post,
    comments: (post.comments || 0) + 1,
    commentsList: [...(post.commentsList || []), newComment],
  };

  setStoredArray(COLLECTIONS.POSTS, posts);
  return posts[index];
}

export function deleteCommunityPost(postId: string): boolean {
  const posts = getCommunityPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  if (filtered.length === posts.length) return false;
  setStoredArray(COLLECTIONS.POSTS, filtered);
  return true;
}

// -------------------------------------------------------------
// LOST & FOUND
// -------------------------------------------------------------
export function getLostFoundItems(): LostFoundItem[] {
  return getStoredArray<LostFoundItem>(COLLECTIONS.LOST_FOUND, INITIAL_LOST_FOUND);
}

export function createLostFoundItem(
  data: Omit<LostFoundItem, 'id' | 'date' | 'status'>
): LostFoundItem {
  const items = getLostFoundItems();
  const newItem: LostFoundItem = {
    ...data,
    id: `lf-${Date.now()}`,
    date: `${data.type === 'lost' ? 'Lost' : 'Found'} Today`,
    status: 'Open',
  };

  setStoredArray(COLLECTIONS.LOST_FOUND, [newItem, ...items]);

  addNotification({
    title: `${data.type === 'lost' ? 'Lost Report' : 'Found Item'} Listed`,
    message: `"${newItem.title}" has been published to the neighborhood registry.`,
    type: 'notice',
    actionScreen: 'lost-found',
  });

  return newItem;
}

export function markLostFoundStatus(id: string, status: 'Open' | 'Claimed'): boolean {
  const items = getLostFoundItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return false;
  items[index] = { ...items[index], status };
  setStoredArray(COLLECTIONS.LOST_FOUND, items);
  return true;
}

// -------------------------------------------------------------
// BLOOD DONORS
// -------------------------------------------------------------
export function getBloodDonors(): BloodDonor[] {
  return getStoredArray<BloodDonor>(COLLECTIONS.BLOOD_DONORS, INITIAL_DONORS);
}

export function registerBloodDonor(data: Omit<BloodDonor, 'id' | 'distance' | 'verified'>): BloodDonor {
  const donors = getBloodDonors();
  const newDonor: BloodDonor = {
    ...data,
    id: `donor-${Date.now()}`,
    distance: 'Nearby (Ward Registered)',
    verified: true,
  };

  setStoredArray(COLLECTIONS.BLOOD_DONORS, [newDonor, ...donors]);

  // Prototype 2: Award Civic Points for active blood donor registration
  updateUserCivicPoints('usr-1', 150, 'Registered on Municipal Blood Donor Roster');

  addNotification({
    title: 'Donor Registration Confirmed',
    message: `Thank you for registering as an active ${newDonor.bloodGroup} blood donor! (+150 Civic Points awarded)`,
    type: 'notice',
    actionScreen: 'blood-donation',
  });

  return newDonor;
}

// -------------------------------------------------------------
// VOLUNTEER EVENTS
// -------------------------------------------------------------
export function getVolunteerEvents(): VolunteerEvent[] {
  return getStoredArray<VolunteerEvent>(COLLECTIONS.VOLUNTEER_EVENTS, INITIAL_EVENTS);
}

export function joinVolunteerEvent(eventId: string, userId: string = 'usr-1'): boolean {
  const events = getVolunteerEvents();
  const index = events.findIndex((e) => e.id === eventId);
  if (index === -1) return false;

  const event = events[index];
  const registered = event.registeredUserIds || [];

  if (registered.includes(userId) || event.isJoined) {
    return false; // Already joined
  }

  const updatedEvent: VolunteerEvent = {
    ...event,
    joinedCount: event.joinedCount + 1,
    isJoined: true,
    registeredUserIds: [...registered, userId],
  };

  events[index] = updatedEvent;
  setStoredArray(COLLECTIONS.VOLUNTEER_EVENTS, events);

  // Update user volunteer hours in profile
  const users = getUsers();
  const uIndex = users.findIndex((u) => u.uid === userId);
  if (uIndex !== -1) {
    users[uIndex] = {
      ...users[uIndex],
      volunteerHours: (users[uIndex].volunteerHours || 0) + 4,
    };
    setStoredArray(COLLECTIONS.USERS, users);
  }

  // Prototype 2: Award Civic Points for volunteering
  updateUserCivicPoints(userId, 100, `Joining civic drive: ${event.title}`);

  addNotification({
    userId,
    title: 'Event Joined! (+100 Points)',
    message: `You are registered for "${event.title}". Meetup details sent. +100 Civic Points added to profile!`,
    type: 'event',
    actionScreen: 'volunteer-events',
    relatedId: event.id,
  });

  return true;
}

export function leaveVolunteerEvent(eventId: string, userId: string = 'usr-1'): boolean {
  const events = getVolunteerEvents();
  const index = events.findIndex((e) => e.id === eventId);
  if (index === -1) return false;

  const event = events[index];
  const registered = (event.registeredUserIds || []).filter((id) => id !== userId);

  events[index] = {
    ...event,
    joinedCount: Math.max(0, event.joinedCount - 1),
    isJoined: false,
    registeredUserIds: registered,
  };

  setStoredArray(COLLECTIONS.VOLUNTEER_EVENTS, events);
  return true;
}

export function createVolunteerEvent(data: Omit<VolunteerEvent, 'id' | 'joinedCount' | 'isJoined'>): VolunteerEvent {
  const events = getVolunteerEvents();
  const newEvt: VolunteerEvent = {
    ...data,
    id: `evt-${Date.now()}`,
    joinedCount: 1,
    isJoined: false,
    registeredUserIds: [],
  };

  setStoredArray(COLLECTIONS.VOLUNTEER_EVENTS, [newEvt, ...events]);
  return newEvt;
}

// -------------------------------------------------------------
// BUS & TRAIN PROTOTYPE DATA
// -------------------------------------------------------------
export function getBusRoutes(): BusRoute[] {
  return getStoredArray<BusRoute>(COLLECTIONS.BUS_ROUTES, INITIAL_BUS_ROUTES);
}

export function createBusRoute(data: Omit<BusRoute, 'id'>): BusRoute {
  const routes = getBusRoutes();
  const newRoute: BusRoute = {
    ...data,
    id: `bus-${Date.now()}`,
  };
  setStoredArray(COLLECTIONS.BUS_ROUTES, [newRoute, ...routes]);
  return newRoute;
}

export function getTrainSchedules(): TrainSchedule[] {
  return getStoredArray<TrainSchedule>(COLLECTIONS.TRAIN_ROUTES, INITIAL_TRAINS);
}

export function createTrainSchedule(data: Omit<TrainSchedule, 'id'>): TrainSchedule {
  const trains = getTrainSchedules();
  const newTrain: TrainSchedule = {
    ...data,
    id: `tr-${Date.now()}`,
  };
  setStoredArray(COLLECTIONS.TRAIN_ROUTES, [newTrain, ...trains]);
  return newTrain;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export function getNotifications(userId?: string): NotificationItem[] {
  const all = getStoredArray<NotificationItem>(COLLECTIONS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (!userId) return all;
  return all.filter((n) => !n.userId || n.userId === userId);
}

export function addNotification(
  data: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & {
    id?: string;
    timestamp?: string;
    read?: boolean;
  }
): NotificationItem {
  const all = getNotifications();
  const newNotif: NotificationItem = {
    id: data.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    timestamp: data.timestamp || 'Just now',
    read: data.read ?? false,
    actionScreen: data.actionScreen,
    relatedId: data.relatedId,
  };

  setStoredArray(COLLECTIONS.NOTIFICATIONS, [newNotif, ...all]);
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const all = getNotifications();
  const index = all.findIndex((n) => n.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], read: true };
    setStoredArray(COLLECTIONS.NOTIFICATIONS, all);
  }
}

export function markAllNotificationsAsRead(userId?: string): void {
  const all = getNotifications();
  const updated = all.map((n) => {
    if (!userId || !n.userId || n.userId === userId) {
      return { ...n, read: true };
    }
    return n;
  });
  setStoredArray(COLLECTIONS.NOTIFICATIONS, updated);
}

export function clearNotifications(): void {
  setStoredArray(COLLECTIONS.NOTIFICATIONS, []);
}

// -------------------------------------------------------------
// USERS & PROFILE
// -------------------------------------------------------------
export function getUsers(): UserProfile[] {
  return getStoredArray<UserProfile>(COLLECTIONS.USERS, SAMPLE_USERS);
}

export function getUserById(uid: string): UserProfile | undefined {
  return getUsers().find((u) => u.uid === uid);
}

export function updateUserProfile(uid: string, updates: Partial<UserProfile>): UserProfile | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.uid === uid);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  setStoredArray(COLLECTIONS.USERS, users);
  return users[index];
}

export function updateUserCivicPoints(uid: string, pointsDelta: number, reason?: string): UserProfile | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.uid === uid);
  if (index === -1) return null;

  const currentPoints = users[index].civicPoints || 0;
  const newPoints = Math.max(0, currentPoints + pointsDelta);

  let rankTitle = users[index].rankTitle || 'Active Citizen';
  if (newPoints >= 2500) rankTitle = 'Senior City Guardian';
  else if (newPoints >= 1500) rankTitle = 'Lead Community Organizer';
  else if (newPoints >= 800) rankTitle = 'Civic Champion';
  else if (newPoints >= 300) rankTitle = 'Engaged Resident';

  users[index] = {
    ...users[index],
    civicPoints: newPoints,
    rankTitle,
  };

  setStoredArray(COLLECTIONS.USERS, users);

  if (pointsDelta > 0) {
    addNotification({
      userId: uid,
      title: `+${pointsDelta} Civic Points!`,
      message: reason ? `Earned for: ${reason}` : `Your civic score increased to ${newPoints}.`,
      type: 'system',
      actionScreen: 'profile',
    });
  }

  return users[index];
}

// -------------------------------------------------------------
// SMART PARKING
// -------------------------------------------------------------
export function getParkingLots(): ParkingLot[] {
  return getStoredArray<ParkingLot>(COLLECTIONS.PARKING, INITIAL_PARKING_LOTS);
}

export function reserveParkingSlot(lotId: string): { success: boolean; message: string; lot?: ParkingLot } {
  const lots = getParkingLots();
  const index = lots.findIndex((l) => l.id === lotId);
  if (index === -1) return { success: false, message: 'Parking facility not found' };

  const lot = lots[index];
  if (lot.availableSpaces <= 0) {
    return { success: false, message: 'Parking facility is currently full' };
  }

  const updatedSpaces = lot.availableSpaces - 1;
  const updatedStatus = updatedSpaces === 0 ? 'Full' : updatedSpaces < 10 ? 'Fast Filling' : 'Available';

  lots[index] = {
    ...lot,
    availableSpaces: updatedSpaces,
    status: updatedStatus,
  };

  setStoredArray(COLLECTIONS.PARKING, lots);

  // Prototype 2: Award Civic Points for green parking usage
  updateUserCivicPoints('usr-1', 15, `Smart parking slot booked at ${lot.name}`);

  return {
    success: true,
    message: `1 hour pass reserved at ${lot.name}. Slot booked! (+15 Civic Points)`,
    lot: lots[index],
  };
}

export function releaseParkingSlot(lotId: string): { success: boolean; message: string; lot?: ParkingLot } {
  const lots = getParkingLots();
  const index = lots.findIndex((l) => l.id === lotId);
  if (index === -1) return { success: false, message: 'Parking facility not found' };

  const lot = lots[index];
  const updatedSpaces = Math.min(lot.totalCapacity, lot.availableSpaces + 1);
  const updatedStatus = updatedSpaces === 0 ? 'Full' : updatedSpaces < 10 ? 'Fast Filling' : 'Available';

  lots[index] = {
    ...lot,
    availableSpaces: updatedSpaces,
    status: updatedStatus,
  };

  setStoredArray(COLLECTIONS.PARKING, lots);
  return {
    success: true,
    message: `Parking slot released at ${lot.name}. Space restored.`,
    lot: lots[index],
  };
}

// -------------------------------------------------------------
// JOURNEY PLANNER
// -------------------------------------------------------------
export function getJourneyOptions(): JourneyOption[] {
  return getStoredArray<JourneyOption>(COLLECTIONS.JOURNEYS, INITIAL_JOURNEY_OPTIONS);
}

// -------------------------------------------------------------
// WARD CIVIC HEALTH
// -------------------------------------------------------------
export function getWardCivicHealth(wardName?: string): WardCivicHealth {
  const allHealth = getStoredArray<Record<string, WardCivicHealth>>(
    COLLECTIONS.CIVIC_HEALTH,
    [INITIAL_WARD_CIVIC_HEALTH]
  )[0] || INITIAL_WARD_CIVIC_HEALTH;

  if (wardName && allHealth[wardName]) {
    return allHealth[wardName];
  }
  return allHealth['TMC Ward 4 - Majiwada & Naupada'] || Object.values(allHealth)[0];
}

export function getAllWardCivicHealth(): Record<string, WardCivicHealth> {
  return getStoredArray<Record<string, WardCivicHealth>>(
    COLLECTIONS.CIVIC_HEALTH,
    [INITIAL_WARD_CIVIC_HEALTH]
  )[0] || INITIAL_WARD_CIVIC_HEALTH;
}

// -------------------------------------------------------------
// LEADERBOARD
// -------------------------------------------------------------
export function getLeaderboard(): CivicLeaderboardUser[] {
  return getStoredArray<CivicLeaderboardUser>(COLLECTIONS.LEADERBOARD, INITIAL_LEADERBOARD);
}

// -------------------------------------------------------------
// CIVIC REWARDS & VOUCHERS (PROTOTYPE 2 GAMIFICATION)
// -------------------------------------------------------------
export function getCivicRewards(): CivicReward[] {
  return getStoredArray<CivicReward>(COLLECTIONS.REWARDS, INITIAL_CIVIC_REWARDS);
}

export function getRedeemedVouchers(userId: string = 'usr-1'): RedeemedVoucher[] {
  const allVouchers = getStoredArray<RedeemedVoucher>(COLLECTIONS.VOUCHERS, []);
  return allVouchers.filter((v) => !userId || v.userId === userId);
}

export function redeemCivicReward(
  userId: string,
  rewardId: string
): { success: boolean; message: string; voucher?: RedeemedVoucher; user?: UserProfile } {
  const rewards = getCivicRewards();
  const reward = rewards.find((r) => r.id === rewardId);
  if (!reward) {
    return { success: false, message: 'Civic reward not found.' };
  }

  const users = getUsers();
  const uIndex = users.findIndex((u) => u.uid === userId);
  if (uIndex === -1) {
    return { success: false, message: 'User profile not found.' };
  }

  const user = users[uIndex];
  const userPoints = user.civicPoints || 0;
  if (userPoints < reward.pointsCost) {
    return {
      success: false,
      message: `Insufficient Civic Points. You have ${userPoints} pts but need ${reward.pointsCost} pts.`,
    };
  }

  // Deduct points
  const updatedPoints = userPoints - reward.pointsCost;
  users[uIndex] = {
    ...user,
    civicPoints: updatedPoints,
  };
  setStoredArray(COLLECTIONS.USERS, users);

  // Generate voucher
  const voucherCode = `UC-${reward.category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const voucher: RedeemedVoucher = {
    id: `vch-${Date.now()}`,
    userId,
    rewardId: reward.id,
    rewardTitle: reward.title,
    code: voucherCode,
    pointsSpent: reward.pointsCost,
    redeemedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    expiresAt: expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    partner: reward.partner,
  };

  const currentVouchers = getStoredArray<RedeemedVoucher>(COLLECTIONS.VOUCHERS, []);
  setStoredArray(COLLECTIONS.VOUCHERS, [voucher, ...currentVouchers]);

  addNotification({
    userId,
    title: 'Civic Reward Redeemed!',
    message: `You redeemed "${reward.title}" for ${reward.pointsCost} pts. Voucher: ${voucherCode}`,
    type: 'system',
    actionScreen: 'profile',
    relatedId: voucher.id,
  });

  return {
    success: true,
    message: `Voucher generated: ${voucherCode}`,
    voucher,
    user: users[uIndex],
  };
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(COLLECTIONS.USERS, JSON.stringify(SAMPLE_USERS));
  localStorage.setItem(COLLECTIONS.POSTS, JSON.stringify(INITIAL_POSTS));
  localStorage.setItem(COLLECTIONS.LOST_FOUND, JSON.stringify(INITIAL_LOST_FOUND));
  localStorage.setItem(COLLECTIONS.BLOOD_DONORS, JSON.stringify(INITIAL_DONORS));
  localStorage.setItem(COLLECTIONS.VOLUNTEER_EVENTS, JSON.stringify(INITIAL_EVENTS));
  localStorage.setItem(COLLECTIONS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  localStorage.setItem(COLLECTIONS.BUS_ROUTES, JSON.stringify(INITIAL_BUS_ROUTES));
  localStorage.setItem(COLLECTIONS.TRAIN_ROUTES, JSON.stringify(INITIAL_TRAINS));
  localStorage.setItem(COLLECTIONS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(COLLECTIONS.PARKING, JSON.stringify(INITIAL_PARKING_LOTS));
  localStorage.setItem(COLLECTIONS.JOURNEYS, JSON.stringify(INITIAL_JOURNEY_OPTIONS));
  localStorage.setItem(COLLECTIONS.CIVIC_HEALTH, JSON.stringify([INITIAL_WARD_CIVIC_HEALTH]));
  localStorage.setItem(COLLECTIONS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
  localStorage.setItem(COLLECTIONS.REWARDS, JSON.stringify(INITIAL_CIVIC_REWARDS));
  localStorage.setItem(COLLECTIONS.VOUCHERS, JSON.stringify([]));

  // Trigger all listeners
  Object.values(COLLECTIONS).forEach((col) => notifyCollectionChange(col));
}
