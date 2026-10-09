import { useState, useEffect } from 'react';
import { ScreenId, UserProfile } from '../types';
import { INITIAL_USER } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import { useTheme } from '../context/ThemeContext';
import {
  getComplaints,
  getVolunteerEvents,
  resetAllDataToDefault,
  subscribeToCollection,
  COLLECTIONS,
  getUsers,
} from '../services/dbService';
import { switchUserRole } from '../services/authService';
import { CivicGamificationHub } from '../components/profile/CivicGamificationHub';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
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
  Sun,
  Moon,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

interface UserProfileScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  onUserUpdate?: (user: UserProfile) => void;
}

export function UserProfileScreen({ onNavigate, currentUser, onLogout, onUserUpdate }: UserProfileScreenProps) {
  const [user, setUser] = useState<UserProfile>(currentUser || INITIAL_USER);
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, currentLanguageInfo, t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [nfcTapped, setNfcTapped] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) setUser(currentUser);
    const unsub = subscribeToCollection(COLLECTIONS.USERS, () => {
      const all = getUsers();
      const current = all.find((u) => u.uid === (currentUser?.uid || user.uid));
      if (current) setUser(current);
    });
    return () => unsub();
  }, [currentUser, user.uid]);

  // Dynamic user activity statistics
  const userComplaintsCount = getComplaints().filter((c) => c.userId === user.uid).length;
  const userVolunteeredHours =
    getVolunteerEvents().filter((e) => e.registeredUserIds?.includes(user.uid || '')).length * 4;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleRole = () => {
    const targetRole = user.role === 'admin' ? 'user' : 'admin';
    const updated = switchUserRole(user.uid || 'usr-1', targetRole);
    if (updated) {
      setUser(updated);
      if (onUserUpdate) onUserUpdate(updated);
      showToast(`Account role switched to: ${targetRole.toUpperCase()}`);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset all prototype collections to default seed data?')) {
      resetAllDataToDefault();
      showToast('Prototype data reset to defaults.');
      setTimeout(() => window.location.reload(), 700);
    }
  };

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
    <div id="screen-user-profile" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] transition-colors">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs text-center relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-teal-700 to-emerald-600" />

          {/* Profile Picture */}
          <div className="relative inline-block mt-4 mb-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-md mx-auto"
            />
            <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-white dark:ring-slate-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">{user.name}</h3>
            {user.role === 'admin' ? (
              <span className="text-[10px] font-extrabold uppercase bg-teal-700 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <ShieldAlert className="w-3 h-3" />
                Admin
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                Citizen
              </span>
            )}
          </div>
          <p className="text-xs text-teal-700 dark:text-teal-400 font-bold mt-0.5">{user.ward}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[11px] font-medium border border-transparent dark:border-slate-700">
              <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {user.email}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[11px] font-medium border border-transparent dark:border-slate-700">
              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {user.phone}
            </span>
          </div>

          {/* Action Buttons: Digital ID, Role Switcher & Switch Account */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowIdModal(true)}
              className="py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Smart Pass</span>
            </button>
            <button
              onClick={handleToggleRole}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                user.role === 'admin'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300'
              }`}
              title="Toggle role between citizen and municipal admin"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Role: {user.role === 'admin' ? 'Demote to Citizen' : 'Make Admin'}</span>
            </button>
          </div>

          {/* Dedicated Admin Portal Card if admin */}
          {user.role === 'admin' && (
            <div className="mt-3 p-3 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-teal-300">Admin Operations HQ</span>
                </div>
                <span className="text-[10px] text-slate-300">Resolve tickets, moderate feed & manage transit</span>
              </div>
              <button
                onClick={() => onNavigate('admin')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Open HQ
              </button>
            </div>
          )}
        </div>

        {/* Citizen Activity Stats with real dbService data */}
        <div className="grid grid-cols-3 gap-2.5">
          <div
            onClick={() => onNavigate('complaints')}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 text-center shadow-2xs hover:border-teal-400 dark:hover:border-teal-500 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 flex items-center justify-center mx-auto mb-1">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900 dark:text-slate-100">{userComplaintsCount}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Complaints</div>
          </div>

          <div
            onClick={() => onNavigate('volunteer-events')}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 text-center shadow-2xs hover:border-teal-400 dark:hover:border-teal-500 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900 dark:text-slate-100">{userVolunteeredHours}h</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Volunteered</div>
          </div>

          <div
            onClick={() => onNavigate('blood-donation')}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 text-center shadow-2xs hover:border-teal-400 dark:hover:border-teal-500 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto mb-1">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900 dark:text-slate-100">{user.bloodDonations || 1}x</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Donations</div>
          </div>
        </div>

        {/* Prototype 2: Civic Standing, Gamification & Rewards */}
        <CivicGamificationHub
          user={user}
          onNavigate={onNavigate}
          onUserUpdate={(updated) => {
            setUser(updated);
            if (onUserUpdate) onUserUpdate(updated);
          }}
          onToast={showToast}
        />

        {/* Settings & Preferences List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
          <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>App Settings & Preferences</span>
          </div>

          {/* Theme Appearance Mode Toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Interface Mode</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Currently {isDark ? 'Dark (Night)' : 'Light (Day)'} Theme</div>
              </div>
            </div>
            <button
              id="btn-profile-toggle-theme"
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                isDark ? 'bg-teal-600 dark:bg-teal-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  isDark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Civic Alerts & Notices</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Air quality, transit delays, emergency push</div>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                notificationsEnabled ? 'bg-teal-600 dark:bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
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
          <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <div
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{t('profile_language', 'Interface Language')}</span>
                  <span className="px-1.5 py-0.5 rounded-sm bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-mono text-[10px] font-extrabold uppercase">
                    {currentLanguageInfo.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentLanguageInfo.name} ({currentLanguageInfo.englishName}) • {currentLanguageInfo.description}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <LanguageSwitcher variant="segmented" />
            </div>
          </div>

          {/* Help & Support */}
          <div
            onClick={() => setShowHelpModal(true)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Help & Civic Feedback</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">FAQs, Citizen Charter, Terms of Service</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          {/* Reset Prototype Data */}
          <div
            onClick={handleResetData}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-700 dark:text-rose-300">Reset Prototype Database</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Restore all Firestore mock collections to default</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-slate-900 text-white dark:bg-teal-700 text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          id="btn-logout"
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Switch Citizen Profile</span>
        </button>
      </div>

      {/* Digital ID Modal */}
      {showIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Smart City Citizen Pass</h3>
            <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold">Verified Municipal Card • Ward 14</p>

            <div className="my-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center border border-slate-200">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{user.citizenId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Copy Citizen ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Contactless Transit Pass & City Hall Access</span>
            </div>

            {/* NFC Tap Simulation */}
            <button
              onClick={handleSimulateNfc}
              className="w-full py-2 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{nfcTapped ? '✓ NFC Pass Validated (Beep!)' : 'Simulate NFC Turnstile Tap'}</span>
            </button>

            <button
              onClick={() => setShowIdModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 dark:hover:bg-teal-800 text-white text-xs font-bold"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Sign Out of Account?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to sign out of <strong>{user.name}</strong>? You can sign back in anytime.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
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
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {t('lang_select_title', 'Select Municipal Language')}
                </h3>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('lang_select_subtitle', 'Choose your preferred language for Thane & Mumbai services:')}
            </p>

            <LanguageSwitcher
              variant="modal"
              onLanguageChanged={() => {
                setShowLanguageModal(false);
                showToast(`Language updated to ${currentLanguageInfo.name}`);
              }}
            />
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  UrbanConnect Help Center
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">How do I track my complaint?</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Navigate to the Complaints screen where each submitted ticket displays official department updates and resolution timestamps.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Contact Municipal Headquarters</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Call <strong>311</strong> (Toll-Free) or write to <strong>support@urbanconnect.org</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 dark:hover:bg-teal-800 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
