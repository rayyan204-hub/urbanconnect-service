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
  CheckCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Check,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

interface RegisterScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onLogin: (user: UserProfile) => void;
}

// Email validation regular expression (RFC 5322 compatible regex pattern for web emails)
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmailFormat(emailStr: string): boolean {
  const trimmed = emailStr.trim();
  return EMAIL_REGEX.test(trimmed);
}

interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function evaluatePassword(passwordStr: string): PasswordCriteria {
  return {
    minLength: passwordStr.length >= 8,
    hasUpper: /[A-Z]/.test(passwordStr),
    hasNumber: /[0-9]/.test(passwordStr),
    hasSpecial: /[^A-Za-z0-9]/.test(passwordStr),
  };
}

export function RegisterScreen({ onNavigate, onLogin }: RegisterScreenProps) {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@urbanconnect.org');
  const [phone, setPhone] = useState('+1 (555) 438-9120');
  const [password, setPassword] = useState('SmartCity2026!');
  const [confirmPassword, setConfirmPassword] = useState('SmartCity2026!');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Field interaction states for real-time validation tracking
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form processing feedback & loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time email validation calculation using regex pattern
  const emailValid = useMemo(() => isValidEmailFormat(email), [email]);

  const emailError = useMemo(() => {
    const trimmed = email.trim();

    // If field is empty after user touched or attempted submission
    if (!trimmed) {
      if (emailTouched || submitAttempted) {
        return 'Email address is required.';
      }
      return null;
    }

    // Immediately validate format using regex pattern when user types
    if (!EMAIL_REGEX.test(trimmed)) {
      if (!trimmed.includes('@')) {
        return 'Invalid email format: missing "@" in address (e.g., citizen@urbanconnect.org).';
      }
      const [localPart, domainPart] = trimmed.split('@');
      if (!localPart) {
        return 'Invalid email format: missing username before "@".';
      }
      if (!domainPart || !domainPart.includes('.')) {
        return 'Invalid email format: enter a valid domain (e.g., @city.gov or @example.com).';
      }
      const domainSegments = domainPart.split('.');
      const tld = domainSegments[domainSegments.length - 1];
      if (!tld || tld.length < 2) {
        return 'Invalid email format: domain extension must be at least 2 letters (e.g., .org, .com).';
      }
      return 'Invalid email format: please enter a valid email address (e.g., alex@urbanconnect.org).';
    }

    return null;
  }, [email, emailTouched, submitAttempted]);

  // Real-time password criteria evaluation
  const passwordCriteria = useMemo(() => evaluatePassword(password), [password]);
  const criteriaScore = useMemo(() => {
    return (
      (passwordCriteria.minLength ? 1 : 0) +
      (passwordCriteria.hasUpper ? 1 : 0) +
      (passwordCriteria.hasNumber ? 1 : 0) +
      (passwordCriteria.hasSpecial ? 1 : 0)
    );
  }, [passwordCriteria]);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: 'None', width: '0%', color: 'bg-slate-200 dark:bg-slate-700', textClass: 'text-slate-400' };
    if (criteriaScore === 1) return { label: 'Weak', width: '25%', color: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400' };
    if (criteriaScore === 2) return { label: 'Fair', width: '50%', color: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400' };
    if (criteriaScore === 3) return { label: 'Good', width: '75%', color: 'bg-teal-500', textClass: 'text-teal-600 dark:text-teal-400' };
    return { label: 'Strong', width: '100%', color: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400' };
  }, [password, criteriaScore]);

  const passwordError = useMemo(() => {
    if (!passwordTouched && !submitAttempted) return null;
    if (!password) return 'Password is required.';
    if (!passwordCriteria.minLength) return 'Password must be at least 8 characters long.';
    if (criteriaScore < 3) return 'Password needs at least 3 strength criteria (uppercase, number, or symbol).';
    return null;
  }, [password, passwordTouched, submitAttempted, passwordCriteria, criteriaScore]);

  // Real-time confirm password validation
  const confirmPasswordError = useMemo(() => {
    if (!confirmPasswordTouched && !submitAttempted) return null;
    if (!confirmPassword) return 'Please confirm your password.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }, [password, confirmPassword, confirmPasswordTouched, submitAttempted]);

  // Overall form validity
  const isFormValid =
    name.trim().length > 0 &&
    emailValid &&
    passwordCriteria.minLength &&
    criteriaScore >= 3 &&
    password === confirmPassword &&
    agreeTerms;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (isLoading) return;

    if (emailError) {
      setValidationError(emailError);
      return;
    }

    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    if (confirmPasswordError) {
      setValidationError(confirmPasswordError);
      return;
    }

    if (!agreeTerms) {
      setValidationError('Please accept the Smart City Resident Charter & Privacy Terms.');
      return;
    }

    setValidationError(null);
    setIsLoading(true);

    setTimeout(() => {
      const newUser = register({
        name: name.trim() || 'New Resident',
        email: email.trim(),
        phone: phone.trim() || '+1 (555) 438-9120',
        password,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        ward: 'Ward 14 - Metro Central',
        role: 'user',
      });

      setIsSuccess(true);
      setTimeout(() => {
        onLogin(newUser);
        setIsLoading(false);
        onNavigate('home');
      }, 500);
    }, 600);
  };

  return (
    <div id="screen-register" className="flex-1 flex flex-col justify-between p-6 bg-slate-50 dark:bg-slate-950 min-h-[820px] transition-colors">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2 pb-5">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">UrbanConnect</span>
          </button>
          <span className="text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            Citizen Registration
          </span>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Create Profile 🏛️
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join your municipal network for verified civic services, transit schedules, and community alerts.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-name">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Email with Real-time Regex Validation & Helper Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="reg-email">
                Email Address
              </label>
              {email.trim().length > 0 && (
                <span
                  id="email-status-badge"
                  className={`text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                    emailValid
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800'
                      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {emailValid ? (
                    <>
                      <Check className="w-3 h-3" /> Valid Pattern
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" /> Invalid Pattern
                    </>
                  )}
                </span>
              )}
            </div>
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
                aria-invalid={!emailValid && (email.length > 0 || submitAttempted)}
                aria-describedby="email-helper-text"
                onFocus={() => setEmailTouched(true)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailTouched(true);
                  if (validationError) setValidationError(null);
                }}
                onBlur={() => setEmailTouched(true)}
                placeholder="alex@urbanconnect.org"
                className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xs transition-all ${
                  emailError
                    ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500 focus:border-rose-500'
                    : emailValid && email.trim()
                    ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {email.trim().length > 0 && (
                  emailValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in fade-in" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 animate-in fade-in" />
                  )
                )}
              </div>
            </div>

            {/* Helper Text Displayed Below Input Field Immediately */}
            {emailError ? (
              <div
                id="email-helper-text"
                role="alert"
                aria-live="polite"
                className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-fadeIn"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
                <span id="email-inline-error">{emailError}</span>
              </div>
            ) : email.trim().length > 0 && emailValid ? (
              <div
                id="email-helper-text"
                className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-fadeIn"
              >
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                <span>Valid email address format matching standard pattern.</span>
              </div>
            ) : (
              <p
                id="email-helper-text"
                className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500"
              >
                Format: username@domain.extension (e.g. resident@urbanconnect.org)
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-phone">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="reg-password">
                  Password
                </label>
                {password && (
                  <span className={`text-[10px] font-bold ${passwordStrength.textClass}`}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onFocus={() => setPasswordTouched(true)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                    if (validationError) setValidationError(null);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xs transition-all ${
                    passwordError
                      ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                      : passwordTouched && criteriaScore >= 3
                      ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                  }`}
                />
                <button
                  type="button"
                  id="btn-toggle-reg-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 z-10 px-3.5 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-r-2xl transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="reg-confirm-password">
                  Confirm Password
                </label>
                {confirmPasswordTouched && confirmPassword && (
                  <span
                    className={`text-[10px] font-bold ${
                      password === confirmPassword
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {password === confirmPassword ? 'Matches' : 'Mismatch'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onFocus={() => setConfirmPasswordTouched(true)}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordTouched(true);
                    if (validationError) setValidationError(null);
                  }}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xs transition-all ${
                    confirmPasswordError
                      ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                      : confirmPasswordTouched && password === confirmPassword
                      ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                  }`}
                />
                <button
                  type="button"
                  id="btn-toggle-reg-confirm-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 z-10 px-3.5 flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-r-2xl transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Meter & Real-Time Criteria Checklist */}
          {(passwordTouched || password.length > 0) && (
            <div
              id="password-strength-panel"
              className="p-3 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all"
            >
              {/* Strength Progress Bar */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Security Strength:
                  </span>
                </div>
                <span className={`text-[11px] font-extrabold ${passwordStrength.textClass}`}>
                  {passwordStrength.label}
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
                <div
                  id="password-strength-bar"
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: passwordStrength.width }}
                />
              </div>

              {/* 4 Real-time criteria requirements */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div
                  id="crit-min-length"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.minLength
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {passwordCriteria.minLength ? (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-400 flex-shrink-0 inline-block" />
                  )}
                  <span>8+ characters</span>
                </div>

                <div
                  id="crit-upper"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.hasUpper
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {passwordCriteria.hasUpper ? (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-400 flex-shrink-0 inline-block" />
                  )}
                  <span>Uppercase (A-Z)</span>
                </div>

                <div
                  id="crit-number"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.hasNumber
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {passwordCriteria.hasNumber ? (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-400 flex-shrink-0 inline-block" />
                  )}
                  <span>At least 1 number</span>
                </div>

                <div
                  id="crit-special"
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    passwordCriteria.hasSpecial
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {passwordCriteria.hasSpecial ? (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-400 flex-shrink-0 inline-block" />
                  )}
                  <span>Special symbol (!@#$)</span>
                </div>
              </div>
            </div>
          )}

          {/* Inline Password Error Message */}
          {passwordError && (
            <p
              id="password-inline-error"
              className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{passwordError}</span>
            </p>
          )}

          {/* Inline Confirm Password Error Message */}
          {confirmPasswordError && (
            <p
              id="confirm-password-inline-error"
              className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{confirmPasswordError}</span>
            </p>
          )}

          {/* Top-level Form Alert if submitted with unresolved errors */}
          {validationError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
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
              className="w-4 h-4 text-teal-600 rounded border-slate-300 dark:border-slate-700 focus:ring-teal-500 disabled:opacity-60 cursor-pointer"
            />
            <label htmlFor="reg-terms" className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              I accept the Smart City Resident Charter & Privacy Terms
            </label>
          </div>

          {/* Register Button */}
          <button
            id="btn-register-submit"
            type="submit"
            disabled={isLoading || (!isFormValid && submitAttempted)}
            className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 disabled:bg-teal-700/60 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
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
      <div className="pt-5 pb-2 text-center border-t border-slate-200/80 dark:border-slate-800 mt-auto">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Already registered as a resident?{' '}
          <button
            id="btn-link-to-login"
            onClick={() => onNavigate('login')}
            className="font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 hover:underline cursor-pointer"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
}
