import { useState, useEffect, FormEvent } from 'react';
import { ScreenId, BloodDonor, BloodGroup, UserProfile } from '../types';
import {
  getBloodDonors,
  registerBloodDonor,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import { BloodDonationSkeleton } from '../components/common/SkeletonStates';
import {
  HeartPulse,
  Phone,
  MapPin,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Send,
  X,
  RotateCcw,
} from 'lucide-react';

interface BloodDonationScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

const BLOOD_GROUPS: (BloodGroup | 'All')[] = [
  'All',
  'O+',
  'O-',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
];

export function BloodDonationScreen({ onNavigate, currentUser }: BloodDonationScreenProps) {
  const [donors, setDonors] = useState<BloodDonor[]>(() => getBloodDonors());
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'All'>('All');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to live donor updates
  useEffect(() => {
    setDonors(getBloodDonors());
    const unsub = subscribeToCollection(COLLECTIONS.BLOOD_DONORS, () => {
      setDonors(getBloodDonors());
    });
    return () => unsub();
  }, []);

  // Simulate network fetch latency on initial load & category change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [selectedGroup]);

  const handleRefresh = () => {
    setIsLoading(true);
    setDonors(getBloodDonors());
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };


  // Request form state
  const [patientName, setPatientName] = useState('');
  const [requestedGroup, setRequestedGroup] = useState<BloodGroup>('O+');
  const [hospitalName, setHospitalName] = useState('Central City General Hospital');
  const [unitsNeeded, setUnitsNeeded] = useState('2');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Register donor form state
  const [donorName, setDonorName] = useState(currentUser?.name || 'Alex Morgan');
  const [donorGroup, setDonorGroup] = useState<BloodGroup>('O+');
  const [donorPhone, setDonorPhone] = useState(currentUser?.phone || '+1 (555) 438-9120');

  // Success & Contact modals
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [contactDonor, setContactDonor] = useState<BloodDonor | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  const filteredDonors =
    selectedGroup === 'All'
      ? donors
      : donors.filter((d) => d.bloodGroup === selectedGroup);

  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setIsRequestModalOpen(false);
      setBroadcastSuccess(true);
    }, 1200);
  };

  const handleDonorRegister = (e: FormEvent) => {
    e.preventDefault();
    registerBloodDonor({
      name: donorName,
      bloodGroup: donorGroup,
      location: currentUser?.ward || 'Ward 14 Metro Central',
      phone: donorPhone,
      isAvailable: true,
      lastDonated: 'Never / First Time',
    });
    setDonors(getBloodDonors());
    setIsRegisterModalOpen(false);
    setRegisteredSuccess(true);
  };

  return (
    <div id="screen-blood-donation" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] relative transition-colors">
      <TopAppBar
        currentScreen="blood-donation"
        title="Blood Donor Network"
        subtitle="Emergency Community Blood Registry"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Urgent Alert Banner */}
      <div className="bg-rose-900 text-white px-4 py-3 border-b border-rose-950 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-700 text-white flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-200" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-100">Critical Blood Shortage: O- & B-</div>
            <div className="text-[10px] text-rose-200/80">Metro Trauma Ward needs immediate units</div>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedGroup('O-');
            setIsRequestModalOpen(true);
          }}
          className="px-2.5 py-1 bg-white text-rose-900 hover:bg-rose-50 text-[11px] font-bold rounded-lg shadow-xs flex-shrink-0"
        >
          View Units
        </button>
      </div>

      {/* Action Buttons: Request Blood & Become Donor */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2.5 transition-colors">
        <button
          id="btn-request-blood"
          onClick={() => setIsRequestModalOpen(true)}
          className="py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <HeartPulse className="w-4 h-4" />
          <span>Request Blood</span>
        </button>

        <button
          id="btn-become-donor"
          onClick={() => setIsRegisterModalOpen(true)}
          className="py-3 px-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Become Donor</span>
        </button>
      </div>

      {/* Blood Group Filter Chips & Refresh */}
      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 transition-colors">
        <div className="overflow-x-auto flex items-center gap-1.5 scrollbar-none flex-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex-shrink-0">Group:</span>
          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedGroup === group
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="Refresh donors list"
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
          title="Refresh Donor Registry"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-600 dark:text-rose-400' : ''}`} />
        </button>
      </div>

      {/* Donors List or Skeleton State */}
      {isLoading ? (
        <BloodDonationSkeleton count={5} />
      ) : filteredDonors.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 m-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <HeartPulse className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No registered donors found for {selectedGroup}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Please check all groups or request an emergency broadcast.</p>
          <button
            onClick={() => setSelectedGroup('All')}
            className="mt-3 px-3 py-1.5 bg-rose-700 text-white rounded-xl text-xs font-semibold hover:bg-rose-800"
          >
            Show All Donors
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3 pb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Registered Donors ({filteredDonors.length})</span>
            <span>Verified Local Citizens</span>
          </div>

          {filteredDonors.map((donor) => (
          <div
            key={donor.id}
            id={`donor-card-${donor.id}`}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Blood Group Badge */}
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex flex-col items-center justify-center text-rose-700 dark:text-rose-400 flex-shrink-0">
                <span className="text-sm font-black tracking-tight">{donor.bloodGroup}</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Donor</span>
              </div>

              {/* Donor Details */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {donor.name}
                  </h4>
                  {donor.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" title="Verified Donor" />
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>{donor.location}</span>
                  <span>•</span>
                  <span className="text-teal-700 dark:text-teal-400 font-medium">{donor.distance}</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                      donor.isAvailable
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${donor.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {donor.isAvailable ? 'Available Now' : 'Recently Donated'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Call Button */}
            <button
              onClick={() => {
                setCallStatus(null);
                setContactDonor(donor);
              }}
              className="p-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors flex-shrink-0"
              title={`Contact ${donor.name}`}
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        ))}
        </div>
      )}

      {/* Request Blood Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Request Emergency Blood</h3>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Maria Sanders"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={requestedGroup}
                    onChange={(e) => setRequestedGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500"
                  >
                    {BLOOD_GROUPS.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital / Medical Center
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-200">
                Hospital verified requests trigger push alerts to available matching donors within a 5 km radius.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center justify-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Donor Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Become a Blood Donor</h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDonorRegister} className="space-y-3 pt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={donorGroup}
                    onChange={(e) => setDonorGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100"
                  >
                    {BLOOD_GROUPS.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800"
                >
                  Save Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Success Modal */}
      {broadcastSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Emergency Broadcast Dispatched!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your urgent request for <strong className="text-rose-700 dark:text-rose-400">{requestedGroup} blood</strong> at{' '}
              <strong>{hospitalName}</strong> has been transmitted to <strong>6 verified donors</strong> within 2.5 km.
            </p>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-left text-xs space-y-1">
              <div className="flex justify-between text-rose-900 dark:text-rose-200 font-bold">
                <span>Dispatch Ticket:</span>
                <span className="font-mono">EMG-BLD-{Date.now().toString().slice(-4)}</span>
              </div>
              <div className="text-[11px] text-rose-700 dark:text-rose-300">Hospital Coordinator has been notified.</div>
            </div>

            <button
              onClick={() => setBroadcastSuccess(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-rose-700 hover:bg-slate-800 dark:hover:bg-rose-800 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Registered Success Modal */}
      {registeredSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Registered as Life-Saving Donor!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Thank you for volunteering, <strong>{donorName}</strong>. Your profile has been added to the active{' '}
              <strong className="text-rose-700 dark:text-rose-400">{donorGroup}</strong> municipal registry.
            </p>

            <button
              onClick={() => setRegisteredSuccess(false)}
              className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Donor Modal */}
      {contactDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Contact Verified Donor
                </h3>
              </div>
              <button
                onClick={() => setContactDonor(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{contactDonor.name}</h4>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black text-xs">
                  {contactDonor.bloodGroup}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{contactDonor.location} • {contactDonor.distance}</p>
              <p className="text-xs font-mono font-bold text-teal-800 dark:text-teal-400 pt-1">{contactDonor.phone}</p>
            </div>

            {callStatus ? (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold text-teal-950 dark:text-teal-200">
                {callStatus}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCallStatus(`Dialing ${contactDonor.phone}...`);
                    setTimeout(() => {
                      setCallStatus(null);
                      setContactDonor(null);
                    }, 2000);
                  }}
                  className="py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Donor</span>
                </button>

                <button
                  onClick={() => {
                    setCallStatus(`SMS Emergency dispatched to ${contactDonor.name}`);
                    setTimeout(() => {
                      setCallStatus(null);
                      setContactDonor(null);
                    }, 2000);
                  }}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Send SMS</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setContactDonor(null)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
