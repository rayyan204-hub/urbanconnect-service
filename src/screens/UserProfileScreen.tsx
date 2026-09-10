import { useState } from 'react';
import { ScreenId, UserProfile } from '../types';
import { INITIAL_USER } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  HeartPulse,
  AlertOctagon,
  Settings,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  QrCode,
  UserCheck,
  LogIn,
  CheckCircle2,
  X,
  Copy,
  Check,
  Smartphone,
} from 'lucide-react';

interface UserProfileScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export function UserProfileScreen({ onNavigate, currentUser, onLogout }: UserProfileScreenProps) {
  const user = currentUser || INITIAL_USER;
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US Municipal)');
  const [copiedId, setCopiedId] = useState(false);
  const [nfcTapped, setNfcTapped] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(user.citizenId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSimulateNfc = () => {
    setNfcTapped(true);
    setTimeout(() => setNfcTapped(false), 2400);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('login');
    }
  };

  return (
    <div id="screen-user-profile" className="flex-1 flex flex-col bg-slate-50 min-h-[780px]">
      <TopAppBar
        currentScreen="profile"
        title="Citizen Profile"
        subtitle="Verified Municipal Resident"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      <div className="p-4 space-y-3.5 pb-8">
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-teal-700 to-emerald-600" />

          {/* Profile Picture */}
          <div className="relative inline-block mt-4 mb-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md mx-auto"
            />
            <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-base font-black text-slate-900">{user.name}</h3>
          <p className="text-xs text-teal-700 font-bold mt-0.5">{user.ward}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full text-[11px] font-medium">
              <Mail className="w-3 h-3 text-slate-400" />
              {user.email}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full text-[11px] font-medium">
              <Phone className="w-3 h-3 text-slate-400" />
              {user.phone}
            </span>
          </div>

          {/* Action Buttons: Digital ID & Switch Account */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowIdModal(true)}
              className="py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-teal-600" />
              <span>Smart Pass</span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>Switch User</span>
            </button>
          </div>
        </div>

        {/* Citizen Activity Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div
            onClick={() => onNavigate('complaints')}
            className="p-3 bg-white rounded-2xl border border-slate-200/90 text-center shadow-2xs hover:border-teal-400 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-1">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900">{user.complaintsFiled}</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">Complaints</div>
          </div>

          <div
            onClick={() => onNavigate('volunteer-events')}
            className="p-3 bg-white rounded-2xl border border-slate-200/90 text-center shadow-2xs hover:border-teal-400 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900">{user.volunteerHours}h</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">Volunteered</div>
          </div>

          <div
            onClick={() => onNavigate('blood-donation')}
            className="p-3 bg-white rounded-2xl border border-slate-200/90 text-center shadow-2xs hover:border-teal-400 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-1">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900">{user.bloodDonations}x</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">Donations</div>
          </div>
        </div>

        {/* Settings & Preferences List */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs divide-y divide-slate-100">
          <div className="p-3.5 bg-slate-50/70 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-teal-600" />
            <span>App Settings & Preferences</span>
          </div>

          {/* Notifications Toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Civic Alerts & Notices</div>
                <div className="text-[11px] text-slate-500">Air quality, transit delays, emergency push</div>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                notificationsEnabled ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language Selector */}
          <div
            onClick={() => setShowLanguageModal(true)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Language</div>
                <div className="text-[11px] text-slate-500">{selectedLanguage}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Help & Support */}
          <div
            onClick={() => setShowHelpModal(true)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Help & Civic Feedback</div>
                <div className="text-[11px] text-slate-500">FAQs, Citizen Charter, Terms of Service</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          id="btn-logout"
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Switch Citizen Profile</span>
        </button>
      </div>

      {/* Digital ID Modal */}
      {showIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Smart City Citizen Pass</h3>
            <p className="text-xs text-teal-700 font-semibold">Verified Municipal Card • Ward 14</p>

            <div className="my-2 p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center">
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center border border-slate-200">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="font-mono text-xs font-bold text-slate-800">{user.citizenId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200"
                  title="Copy Citizen ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Contactless Transit Pass & City Hall Access</span>
            </div>

            {/* NFC Tap Simulation */}
            <button
              onClick={handleSimulateNfc}
              className="w-full py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-teal-700" />
              <span>{nfcTapped ? '✓ NFC Pass Validated (Beep!)' : 'Simulate NFC Turnstile Tap'}</span>
            </button>

            <button
              onClick={() => setShowIdModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Sign Out of Account?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to sign out of <strong>{user.name}</strong>? You can sign back in anytime.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selector Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Select Municipal Language
                </h3>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {[
                { name: 'English (US Municipal)', code: 'en' },
                { name: 'Español (Ciudad Inteligente)', code: 'es' },
                { name: 'Français (Portail Citoyen)', code: 'fr' },
                { name: 'Deutsch (Bürgerservice)', code: 'de' },
                { name: 'Hindi (स्मार्ट सिटी)', code: 'hi' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.name);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between border transition-all ${
                    selectedLanguage === lang.name
                      ? 'bg-blue-50 text-blue-900 border-blue-300'
                      : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <span>{lang.name}</span>
                  {selectedLanguage === lang.name && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  UrbanConnect Help Center
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">How do I track my complaint?</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Navigate to the Complaints screen where each submitted ticket displays official department updates and resolution timestamps.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Contact Municipal Headquarters</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Call <strong>311</strong> (Toll-Free) or write to <strong>support@urbanconnect.org</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
