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
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Users,
  ChevronRight,
  Loader2,
  ShieldAlert,
  Apple,
  Chrome,
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

  // Firebase Social Authentication state
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
    }, 550);
  };

  const handleQuickLogin = (user: UserProfile) => {
    if (quickLoadingId || isFormLoading) return;
    setQuickLoadingId(user.email);
    setTimeout(() => {
      const logged = login(user.email, 'smartcity2026');
      onLogin(logged);
      setQuickLoadingId(null);
      onNavigate('home');
    }, 450);
  };


  const handleGuestLogin = () => {
    if (quickLoadingId || isFormLoading) return;
    setQuickLoadingId('guest');
    setTimeout(() => {
      const guestUser: UserProfile = {
        uid: 'guest-user',
        name: 'Guest Citizen',
        email: 'guest@urbanconnect.org',
        phone: '+1 (555) 000-0000',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        ward: 'Metro Visitor / Explorer',
        citizenId: 'UC-GUEST-2026',
        role: 'user',
        createdAt: new Date().toISOString(),
        complaintsFiled: 0,
        volunteerHours: 0,
        bloodDonations: 0,
      };
      onLogin(guestUser);
      setQuickLoadingId(null);
      onNavigate('home');
    }, 550);
  };

  return (
    <div id="screen-login" className="flex-1 flex flex-col justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-[780px] transition-colors">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-1 pb-4">
          <button
            onClick={() => onNavigate('splash')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block leading-none">
                Urban<span className="text-teal-600 dark:text-teal-400">Connect</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Citizen Access Portal</span>
            </div>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Official Portal
          </span>
        </div>

        {/* Welcome Text */}
        <div className="mb-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Sign In to Your Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Connect to municipal services, real-time transit schedules, and emergency support.
          </p>
        </div>

        {/* Tab Switcher: 1-Click Fast Login vs Standard Form */}
        <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center gap-1 mb-4 text-xs font-bold">
          <button
            id="tab-quick-login"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Select Resident Account</span>
          </button>
          <button
            id="tab-form-login"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Email & Password</span>
          </button>
        </div>

        {/* View 1: 1-Click Resident Selector (Super User Friendly) */}
        {activeTab === 'quick' && (
          <div className="space-y-2.5 animate-fadeIn">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1 uppercase tracking-wider">
              Choose a resident persona to test:
            </p>

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
                  className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 group ${
                    isSelected ? 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/20 dark:bg-teal-950/30' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                          {user.name}
                        </h4>
                        {user.role === 'admin' && (
                          <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium truncate">
                        {user.ward}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-600 dark:group-hover:text-white px-2.5 py-1.5 rounded-xl border border-teal-200/80 dark:border-teal-800 transition-all flex-shrink-0 min-w-[76px] justify-center">
                    {quickLoadingId === user.email ? (
                      <div className="flex items-center gap-1 text-teal-700 group-hover:text-white">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[11px]">Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Guest Option */}
            <button
              id="btn-guest-login"
              onClick={handleGuestLogin}
              disabled={quickLoadingId !== null || isFormLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-75 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-colors"
            >
              {quickLoadingId === 'guest' ? (
                <>
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                  <span>Connecting Guest Session...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Continue as Guest Citizen</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* View 2: Standard Email & Password Form */}
        {activeTab === 'form' && (
          <form onSubmit={handleCustomLogin} className="space-y-3.5 animate-fadeIn">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  disabled={isFormLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@urbanconnect.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xs transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isFormLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isFormLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 disabled:bg-teal-700/80 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-200" />
                  <span className="tracking-wide">Authenticating Citizen Profile...</span>
                </>
              ) : (
                <>
                  <span>Log In & Enter UrbanConnect</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Firebase Social Authentication (Google & Apple) */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Or sign in with
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              Firebase Auth
            </span>
          </div>

          {/* Social Auth Error Banner */}
          {socialError && (
            <div
              id="social-auth-error-banner"
              role="alert"
              className="mb-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">Authentication Status</span>
                {socialError}
              </div>
              <button
                type="button"
                onClick={() => setSocialError(null)}
                className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 text-xs font-bold px-1 cursor-pointer"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {/* Google Sign In */}
            <button
              id="btn-social-login-google"
              type="button"
              disabled={socialLoading !== null || isFormLoading || quickLoadingId !== null}
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold shadow-2xs hover:shadow-xs transition-all disabled:opacity-60 cursor-pointer group"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
              ) : (
                <Chrome className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform" />
              )}
              <span className="truncate">
                {socialLoading === 'google' ? 'Signing in...' : 'Google'}
              </span>
            </button>

            {/* Apple Sign In */}
            <button
              id="btn-social-login-apple"
              type="button"
              disabled={socialLoading !== null || isFormLoading || quickLoadingId !== null}
              onClick={handleAppleLogin}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 border border-slate-900 dark:border-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all disabled:opacity-60 cursor-pointer group"
            >
              {socialLoading === 'apple' ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-400 dark:text-teal-600" />
              ) : (
                <Apple className="w-4 h-4 text-white dark:text-slate-900 group-hover:scale-105 transition-transform" />
              )}
              <span className="truncate">
                {socialLoading === 'apple' ? 'Signing in...' : 'Apple'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Register Link */}
      <div className="pt-4 pb-1 text-center border-t border-slate-200/80 dark:border-slate-800 mt-auto">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          New to the city portal?{' '}
          <button
            id="btn-link-to-register"
            onClick={() => onNavigate('register')}
            className="font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 hover:underline"
          >
            Create New Citizen Account
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Reset Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Enter your registered email and we’ll send a link to restore access.
            </p>

            {resetSent ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Password reset instructions sent.</span>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.email@urbanconnect.org"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSent(false);
                  setIsResetLoading(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
              {!resetSent && (
                <button
                  type="button"
                  disabled={isResetLoading || !forgotEmail.trim()}
                  onClick={() => {
                    setIsResetLoading(true);
                    setTimeout(() => {
                      setIsResetLoading(false);
                      setResetSent(true);
                    }, 500);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {isResetLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
