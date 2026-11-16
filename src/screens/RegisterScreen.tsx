import { useState, useMemo, FormEvent } from 'react';
import { ScreenId, UserProfile } from '../types';
import { register } from '../services/authService';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

interface RegisterScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onLogin: (user: UserProfile) => void;
}

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmailFormat(emailStr: string): boolean {
  return EMAIL_REGEX.test(emailStr.trim());
}

export function RegisterScreen({ onNavigate, onLogin }: RegisterScreenProps) {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@urbanconnect.org');
  const [phone, setPhone] = useState('+1 (555) 438-9120');
  const [ward, setWard] = useState('Ward 4 - Majiwada');
  const [password, setPassword] = useState('SmartCity2026!');
  const [confirmPassword, setConfirmPassword] = useState('SmartCity2026!');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isPasswordValid = password.length >= 8;
  const isMatch = password === confirmPassword;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isValidEmailFormat(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    if (!isMatch) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setValidationError('Please agree to the civic terms & data privacy guidelines.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser = register({
        name,
        email,
        phone,
        password,
        ward,
      });
      setIsLoading(false);
      onLogin(newUser);
      onNavigate('home');
    }, 550);
  };

  return (
    <div id="screen-register" className="flex-1 flex flex-col justify-between p-5 sm:p-8 bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] transition-colors font-sans">
      <div className="max-w-md mx-auto w-full">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pt-1 pb-4">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-1 text-[14px] text-[#007AFF] font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Identity</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h2 className="text-[26px] sm:text-[28px] font-bold text-[#1D1D1F] dark:text-white tracking-tight">
            Create Profile
          </h2>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 leading-relaxed">
            Register your verified citizen identity for municipal services.
          </p>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-[14px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[13px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Group 1: Personal Details */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-4 border border-black/[0.04] dark:border-white/[0.06] shadow-xs space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Citizen name"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>
            </div>

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
                  placeholder="citizen@urbanconnect.org"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                Residential Ward
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
              >
                <option value="Ward 4 - Majiwada">Ward 4 - Majiwada & Naupada</option>
                <option value="Ward 14 - Bandra West">Ward 14 - Bandra West</option>
                <option value="Ward 7 - Andheri East">Ward 7 - Andheri East</option>
                <option value="Ward 2 - Vartak Nagar">Ward 2 - Vartak Nagar</option>
              </select>
            </div>
          </div>

          {/* Card Group 2: Password */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] p-4 border border-black/[0.04] dark:border-white/[0.06] shadow-xs space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#86868B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#86868B]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 px-1 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#007AFF] focus:ring-[#007AFF]"
            />
            <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-tight">
              I agree to the Municipal Citizen Charter and verified identity privacy guidelines.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white font-semibold text-[14px] shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pt-6 text-center max-w-md mx-auto w-full">
        <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#007AFF] font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
