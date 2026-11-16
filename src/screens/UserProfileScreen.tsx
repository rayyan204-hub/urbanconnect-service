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
import { FirestoreStatusBanner } from '../components/common/FirestoreStatusBanner';
import {
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
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguageInfo, t } = useLanguage();
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
    <div id="screen-user-profile" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] transition-colors font-sans pb-16">
      <TopAppBar
        currentScreen="profile"
        title="Profile & Settings"
        subtitle="Citizen identity & preferences"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      <div className="px-5 sm:px-8 py-5 max-w-2xl mx-auto w-full space-y-5">
        {/* Apple ID Style User Card */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] p-6 shadow-xs text-center relative transition-colors">
          <div className="relative inline-block mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-black/[0.06] dark:ring-white/[0.08] shadow-sm mx-auto"
            />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-[20px] font-bold text-[#1D1D1F] dark:text-white">{user.name}</h2>
            <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B]">{user.ward}</p>
            <p className="text-[13px] text-[#007AFF] font-medium">{user.email} · {user.phone}</p>
          </div>

          {/* Action Buttons: Digital ID, Role Switcher */}
          <div className="mt-5 grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button
              onClick={() => setShowIdModal(true)}
              className="py-2.5 px-4 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Digital ID Pass</span>
            </button>
            <button
              onClick={handleToggleRole}
              className="py-2.5 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-[#007AFF]" />
              <span>{user.role === 'admin' ? 'Role: Admin' : 'Role: Citizen'}</span>
            </button>
          </div>
        </div>

        {/* Dedicated Admin Portal Card if admin */}
        {user.role === 'admin' && (
          <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.04] dark:border-white/[0.06] shadow-xs flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#007AFF]" />
                <span className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">Admin Operations HQ</span>
              </div>
              <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Resolve grievances, moderate feed & transit</span>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-full text-[13px] font-semibold shadow-xs transition-colors"
            >
              Open HQ
            </button>
          </div>
        )}

        {/* Citizen Activity Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div
            onClick={() => onNavigate('complaints')}
            className="p-3.5 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.04] dark:border-white/[0.06] text-center shadow-xs cursor-pointer hover:border-[#007AFF]/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center mx-auto mb-1.5">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-[18px] font-bold text-[#1D1D1F] dark:text-white">{userComplaintsCount}</div>
            <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-medium">Grievances</div>
          </div>

          <div
            onClick={() => onNavigate('volunteer-events')}
            className="p-3.5 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.04] dark:border-white/[0.06] text-center shadow-xs cursor-pointer hover:border-[#007AFF]/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center mx-auto mb-1.5">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-[18px] font-bold text-[#1D1D1F] dark:text-white">{userVolunteeredHours}h</div>
            <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-medium">Volunteered</div>
          </div>

          <div
            onClick={() => onNavigate('blood-donation')}
            className="p-3.5 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.04] dark:border-white/[0.06] text-center shadow-xs cursor-pointer hover:border-[#007AFF]/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center mx-auto mb-1.5">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div className="text-[18px] font-bold text-[#1D1D1F] dark:text-white">{user.bloodDonations || 1}x</div>
            <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-medium">Donations</div>
          </div>
        </div>

        {/* Civic Standing, Gamification & Rewards */}
        <CivicGamificationHub
          user={user}
          onNavigate={onNavigate}
          onUserUpdate={(updated) => {
            setUser(updated);
            if (onUserUpdate) onUserUpdate(updated);
          }}
          onToast={showToast}
        />

        {/* Cloud Database Integration Banner */}
        <FirestoreStatusBanner />

        {/* Settings & Preferences List (Apple Inset Grouped) */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden shadow-xs divide-y divide-black/[0.04] dark:divide-white/[0.06] transition-colors">
          <div className="p-3.5 bg-[#F5F5F7]/60 dark:bg-[#2C2C2E]/40 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Preferences</span>
          </div>

          {/* Theme Appearance Mode Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">Dark Interface Mode</div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Currently {isDark ? 'Dark (Night)' : 'Light (Day)'} Theme</div>
              </div>
            </div>
            <button
              id="btn-profile-toggle-theme"
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                isDark ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'
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
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">Civic Alerts & Notices</div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Air quality, transit delays, emergency push</div>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                notificationsEnabled ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'
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
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-black/[0.01] transition-colors">
            <div
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="w-8 h-8 rounded-[10px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                  <span>{t('profile_language', 'Interface Language')}</span>
                  <span className="px-1.5 py-0.5 rounded-[6px] bg-[#007AFF]/10 text-[#007AFF] text-[10px] font-semibold">
                    {currentLanguageInfo.badge}
                  </span>
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                  {currentLanguageInfo.name} ({currentLanguageInfo.englishName})
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
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/[0.01] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">Help & Civic Feedback</div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">FAQs, Citizen Charter, Terms of Service</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#86868B]" />
          </div>

          {/* Reset Prototype Data */}
          <div
            onClick={handleResetData}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/[0.01] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#FF3B30]">Reset Seed Data</div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Restore all local collections to original state</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#86868B]" />
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-black/90 text-white text-[13px] font-medium rounded-full shadow-lg flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          id="btn-logout"
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3.5 px-4 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Switch Profile</span>
        </button>
      </div>

      {/* Digital ID Modal */}
      {showIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] text-center space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#007AFF] text-white flex items-center justify-center mx-auto shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-bold text-[#1D1D1F] dark:text-white">Municipal Citizen Pass</h3>
            <p className="text-[13px] text-[#007AFF] font-medium">Verified Identity • {user.ward}</p>

            <div className="p-5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[20px] flex flex-col items-center">
              <div className="p-3 bg-white rounded-[16px] shadow-xs">
                <QrCode className="w-32 h-32 text-[#1D1D1F]" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[13px] font-bold text-[#1D1D1F] dark:text-white">{user.citizenId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-[#34C759]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-[#86868B] mt-0.5">Contactless transit & civic facility pass</span>
            </div>

            <button
              onClick={handleSimulateNfc}
              className="w-full py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] text-[#1D1D1F] dark:text-white rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-[#007AFF]" />
              <span>{nfcTapped ? '✓ NFC Pass Validated' : 'Simulate NFC Turnstile Tap'}</span>
            </button>

            <button
              onClick={() => setShowIdModal(false)}
              className="w-full py-3 rounded-full bg-[#007AFF] text-white text-[14px] font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[26px] p-6 shadow-2xl border border-black/[0.06] text-center space-y-3">
            <h3 className="text-[17px] font-bold text-[#1D1D1F] dark:text-white">Sign Out?</h3>
            <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
              Are you sure you want to sign out of <strong>{user.name}</strong>?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white text-[13px] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="py-2.5 rounded-full bg-[#FF3B30] text-white text-[13px] font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <h3 className="text-[16px] font-bold text-[#1D1D1F] dark:text-white">
                {t('lang_select_title', 'Select Interface Language')}
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <h3 className="text-[16px] font-bold text-[#1D1D1F] dark:text-white">
                Help & Support
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[16px]">
                <span className="font-semibold text-[#1D1D1F] dark:text-white block mb-1">Tracking Grievances</span>
                <p className="text-[#6E6E73] dark:text-[#86868B] text-[12px] leading-relaxed">
                  Navigate to Grievances to check live stages, assigned engineers, and resolution photos.
                </p>
              </div>

              <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[16px]">
                <span className="font-semibold text-[#1D1D1F] dark:text-white block mb-1">Citizen Helpline</span>
                <p className="text-[#6E6E73] dark:text-[#86868B] text-[12px] leading-relaxed">
                  Call toll-free <strong>311</strong> or email <strong>support@urbanconnect.org</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-full bg-[#007AFF] text-white text-[14px] font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
