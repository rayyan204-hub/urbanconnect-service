import { useState, FormEvent } from 'react';
import { ScreenId, UserProfile } from '../types';
import { User, Mail, Phone, Lock, ArrowRight, Building2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface RegisterScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onLogin: (user: UserProfile) => void;
}

export function RegisterScreen({ onNavigate, onLogin }: RegisterScreenProps) {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@urbanconnect.org');
  const [phone, setPhone] = useState('+1 (555) 438-9120');
  const [password, setPassword] = useState('smartcity2026');
  const [confirmPassword, setConfirmPassword] = useState('smartcity2026');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Form processing feedback & loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!agreeTerms) {
      setValidationError('Please accept the Smart City Resident Charter & Privacy Terms.');
      return;
    }

    setValidationError(null);
    setIsLoading(true);

    const newUser: UserProfile = {
      name: name.trim() || 'New Resident',
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 438-9120',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      ward: 'Ward 14 - Metro Central',
      citizenId: `UC-${Math.floor(1000 + Math.random() * 9000)}-2026`,
      complaintsFiled: 0,
      volunteerHours: 0,
      bloodDonations: 0,
    };

    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        onLogin(newUser);
        setIsLoading(false);
        onNavigate('home');
      }, 500);
    }, 700);
  };

  return (
    <div id="screen-register" className="flex-1 flex flex-col justify-between p-6 bg-slate-50 min-h-[820px]">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2 pb-5">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">UrbanConnect</span>
          </button>
          <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Citizen Registration
          </span>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Profile 🏛️
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Join your municipal network for verified civic services, transit schedules, and community alerts.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="reg-name"
                type="text"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="alex@urbanconnect.org"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-phone">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="reg-phone"
                type="tel"
                required
                disabled={isLoading}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 shadow-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 shadow-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Terms checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="reg-terms"
              disabled={isLoading}
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (validationError) setValidationError(null);
              }}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 disabled:opacity-60"
            />
            <label htmlFor="reg-terms" className="text-[11px] text-slate-600 cursor-pointer select-none">
              I accept the Smart City Resident Charter & Privacy Terms
            </label>
          </div>

          {/* Register Button */}
          <button
            id="btn-register-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 disabled:bg-teal-700/80 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
          >
            {isLoading ? (
              isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300 animate-pulse" />
                  <span>Citizen Profile Created! Opening Portal...</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-200" />
                  <span className="tracking-wide">Registering Resident Profile...</span>
                </>
              )
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Link */}
      <div className="pt-5 pb-2 text-center border-t border-slate-200/80 mt-auto">
        <p className="text-xs text-slate-600">
          Already registered as a resident?{' '}
          <button
            id="btn-link-to-login"
            onClick={() => onNavigate('login')}
            className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
}
