import { useState, FormEvent } from 'react';
import { ScreenId, UserProfile } from '../types';
import { login, getAvailableProfiles, signInWithGoogle, signInWithApple } from '../services/authService';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Loader2,
  ShieldAlert,
  Apple,
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onLogin: (user: UserProfile) => void;
  currentUser: UserProfile | null;
}

export function LoginScreen({ onNavigate, onLogin, currentUser }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');
  const [email, setEmail] = useState('aarav.deshmukh@urbanconnect.org');
  const [password, setPassword] = useState('smartcity2026');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const availableProfiles = getAvailableProfiles();

  // Loading state for form submit & quick actions
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [quickLoadingId, setQuickLoadingId] = useState<string | null>(null);

  // Social Authentication state
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (socialLoading || isFormLoading || quickLoadingId) return;
    setSocialLoading('google');
    setSocialError(null);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        onLogin(result.user);
        onNavigate('home');
      } else {
        setSocialError(result.error || 'Google sign-in could not be completed.');
      }
    } catch (err: any) {
      setSocialError(err?.message || 'Google sign-in encountered an unexpected error.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    if (socialLoading || isFormLoading || quickLoadingId) return;
    setSocialLoading('apple');
    setSocialError(null);
    try {
      const result = await signInWithApple();
      if (result.success && result.user) {
        onLogin(result.user);
        onNavigate('home');
      } else {
        setSocialError(result.error || 'Apple sign-in could not be completed.');
      }
    } catch (err: any) {
      setSocialError(err?.message || 'Apple sign-in encountered an unexpected error.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleCustomLogin = (e: FormEvent) => {
    e.preventDefault();
    if (isFormLoading) return;
    setIsFormLoading(true);

    setTimeout(() => {
      const user = login(email, password);
      onLogin(user);
      setIsFormLoading(false);
      onNavigate('home');
    }, 450);
  };

  const handleQuickLogin = (user: UserProfile) => {
    if (quickLoadingId || isFormLoading || socialLoading) return;
    setQuickLoadingId(user.email);

    setTimeout(() => {
      onLogin(user);
      setQuickLoadingId(null);
      onNavigate('home');
    }, 400);
  };

  const handleGuestLogin = () => {
    setQuickLoadingId('guest');
    setTimeout(() => {
      const guestUser: UserProfile = {
        uid: `guest-${Date.now()}`,
        name: 'Guest Citizen',
        email: 'guest@urbanconnect.org',
        phone: '+1 (555) 019-2831',
        ward: 'Ward 4 - Majiwada',
        role: 'user',
        citizenId: 'CIT-GUEST-2026',
        civicPoints: 120,
        createdAt: '2026-09-01',
        complaintsFiled: 0,
        volunteerHours: 0,
        bloodDonations: 0,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
      onLogin(guestUser);
      setQuickLoadingId(null);
      onNavigate('home');
    }, 400);
  };

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsResetLoading(true);
    setTimeout(() => {
      setIsResetLoading(false);
      setResetSent(true);
    }, 600);
  };

  return (
    <div id="screen-login" className="flex-1 flex flex-col justify-between p-5 sm:p-8 bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] transition-colors font-sans">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center justify-between pt-1 pb-6">
          <button
            onClick={() => onNavigate('splash')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#007AFF] flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#1D1D1F] dark:text-white text-[15px] block leading-none">
                UrbanConnect
              </span>
              <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] block mt-0.5">Municipal Services</span>
            </div>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>

        {/* Welcome Text */}
        <div className="mb-5 text-center sm:text-left">
          <h2 className="text-[26px] sm:text-[28px] font-bold text-[#1D1D1F] dark:text-white tracking-tight">
            Sign In
          </h2>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mt-1 leading-relaxed">
            Access city services, real-time transit timetables, and civic reporting.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="bg-[#E5E5EA]/60 dark:bg-[#2C2C2E] p-1 rounded-full flex items-center mb-5 text-[12px] font-medium">
          <button
            id="tab-quick-login"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Select Resident</span>
          </button>
          <button
            id="tab-form-login"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Email & Password</span>
          </button>
        </div>

        {/* View 1: Resident Selector */}
        {activeTab === 'quick' && (
          <div className="space-y-2.5">
            <p className="text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] px-1">
              Choose a resident persona to sign in immediately:
            </p>

            <div className="space-y-2 bg-white dark:bg-[#1C1C1E] rounded-[20px] p-2 border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
              {availableProfiles.map((user) => {
                const isSelected = currentUser?.email === user.email;
                return (
                  <div
                    key={user.email}
                    id={`btn-user-select-${user.name.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => handleQuickLogin(user)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickLogin(user)}
                    className={`p-3 rounded-[16px] transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#007AFF]/10 text-[#007AFF]'
                        : 'hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.08] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                            {user.name}
                          </h4>
                          {user.role === 'admin' && (
                            <span className="text-[10px] bg-[#5856D6]/10 text-[#5856D6] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] truncate">
                          {user.ward}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {quickLoadingId === user.email ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />
                      ) : (
                        <span className="text-[13px] font-medium text-[#007AFF] flex items-center gap-0.5">
                          Continue <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Guest Access Button */}
            <button
              onClick={handleGuestLogin}
              className="w-full mt-2 py-3 px-4 rounded-[16px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[13px] font-semibold text-[#1D1D1F] dark:text-white transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              {quickLoadingId === 'guest' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />
              ) : (
                <>
                  <span>Continue as Guest Citizen</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#007AFF]" />
                </>
              )}
            </button>
          </div>
        )}

        {/* View 2: Form Login */}
        {activeTab === 'form' && (
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-4 border border-black/[0.04] dark:border-white/[0.06] shadow-xs space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@urbanconnect.org"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[12px] text-[#007AFF] hover:underline font-medium"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#86868B] hover:text-[#1D1D1F]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isFormLoading}
              className="w-full py-3.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white font-semibold text-[14px] shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {isFormLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Social Authentication */}
        <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleGoogleLogin}
              disabled={Boolean(socialLoading)}
              className="py-2.5 px-3 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[13px] font-medium text-[#1D1D1F] dark:text-white flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={handleAppleLogin}
              disabled={Boolean(socialLoading)}
              className="py-2.5 px-3 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[13px] font-medium text-[#1D1D1F] dark:text-white flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Apple className="w-4 h-4 fill-current" />
              <span>Apple</span>
            </button>
          </div>

          {socialError && (
            <p className="text-center text-[12px] text-[#FF3B30] mt-2 font-medium">
              {socialError}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pt-6 text-center max-w-md mx-auto w-full">
        <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
          New resident in the city?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#007AFF] font-semibold hover:underline"
          >
            Create Citizen Profile
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 max-w-sm w-full border border-black/[0.06] dark:border-white/[0.08] shadow-xl text-center space-y-4">
            <h3 className="text-[17px] font-bold text-[#1D1D1F] dark:text-white">
              Reset Password
            </h3>
            {resetSent ? (
              <div className="space-y-3">
                <p className="text-[13px] text-[#34C759] font-medium">
                  Password reset link sent to {forgotEmail}
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter registered email"
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[13px] font-medium text-[#6E6E73] dark:text-[#86868B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="flex-1 py-2.5 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold"
                  >
                    {isResetLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
