import { useState, useEffect, useRef, createContext, useContext, useMemo, ReactNode, Component, ErrorInfo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ScreenId, UserProfile } from './types';
import { GMP_QUOTA_EXCEEDED_EVENT } from './utils/gmpQuota';
import { INITIAL_USER } from './data/mockData';
import { PrototypeBar } from './components/common/PrototypeBar';
import { PhoneFrame } from './components/common/PhoneFrame';
import { BottomNavBar } from './components/common/BottomNavBar';

import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeDashboard } from './screens/HomeDashboard';
import { CommunityFeedScreen } from './screens/CommunityFeedScreen';
import { LostFoundScreen } from './screens/LostFoundScreen';
import { BloodDonationScreen } from './screens/BloodDonationScreen';
import { VolunteerEventsScreen } from './screens/VolunteerEventsScreen';
import { BusInfoScreen } from './screens/BusInfoScreen';
import { TrainInfoScreen } from './screens/TrainInfoScreen';
import { ComplaintTrackingScreen } from './screens/ComplaintTrackingScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { ServicesHubScreen } from './screens/ServicesHubScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { UnifiedMapScreen } from './screens/UnifiedMapScreen';
import { SmartParkingScreen } from './screens/SmartParkingScreen';
import { JourneyPlannerScreen } from './screens/JourneyPlannerScreen';
import { CivicAnalyticsScreen } from './screens/CivicAnalyticsScreen';
import { AIChatAssistant } from './components/common/AIChatAssistant';
import { EmergencyModal } from './components/common/EmergencyModal';
import { getCurrentAuthUser } from './services/authService';
import { LanguageProvider } from './context/LanguageContext';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'urbanconnect_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Logical screen order to establish directional navigation depth
const SCREEN_DEPTH: Record<ScreenId, number> = {
  splash: 0,
  login: 1,
  register: 2,
  home: 10,
  map: 11,
  'bus-info': 12,
  'train-info': 13,
  'journey-planner': 14,
  parking: 15,
  complaints: 16,
  'blood-donation': 17,
  'volunteer-events': 18,
  analytics: 19,
  services: 20,
  community: 30,
  'lost-found': 40,
  profile: 50,
  admin: 60,
};

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
  screenKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ScreenErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  declare setState: (
    state: ErrorBoundaryState | ((prevState: Readonly<ErrorBoundaryState>) => ErrorBoundaryState)
  ) => void;
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unexpected rendering error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Screen render error:', error, info);
  }

  componentDidUpdate(prevProps: { screenKey?: string }) {
    if (this.state.hasError && prevProps.screenKey !== this.props.screenKey) {
      this.setState({ hasError: false, errorMessage: '' });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#F5F5F7] dark:bg-[#1C1C1E]">
          <div className="max-w-sm w-full bg-white dark:bg-[#2C2C2E] rounded-3xl p-6 shadow-xl border border-black/10 dark:border-white/10 space-y-3">
            <h2 className="text-base font-bold text-[#1D1D1F] dark:text-white">
              Unable to load this view
            </h2>
            <p className="text-xs text-[#6E6E73] dark:text-[#8E8E93] break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                this.props.onReset?.();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0062CC] transition-colors"
            >
              Reload View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Opacity-only transitions avoid CSS filter/transform GPU compositing bugs with Leaflet map panes on mobile
const screenTransitionVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
    transition: {
      opacity: { duration: 0.16, ease: 'easeOut' as const },
    },
  },
  exit: {
    opacity: 0,
    transition: {
      opacity: { duration: 0.1, ease: 'linear' as const },
    },
  },
};

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const authUser = getCurrentAuthUser();
      if (authUser) return authUser;
      const saved = localStorage.getItem('urbanconnect_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState<number>(1);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isGmpQuotaExceeded, setIsGmpQuotaExceeded] = useState(false);
  const prevScreenRef = useRef<ScreenId>('home');
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setIsGmpQuotaExceeded(true);
    };
    window.addEventListener(GMP_QUOTA_EXCEEDED_EVENT, handleQuotaExceeded);
    return () => {
      window.removeEventListener(GMP_QUOTA_EXCEEDED_EVENT, handleQuotaExceeded);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleNavigate = (screen: ScreenId) => {
    if (screen === currentScreen) return;

    const prevDepth = SCREEN_DEPTH[prevScreenRef.current] ?? 10;
    const nextDepth = SCREEN_DEPTH[screen] ?? 10;
    const navDirection = nextDepth >= prevDepth ? 1 : -1;

    setDirection(navDirection);
    prevScreenRef.current = screen;
    setCurrentScreen(screen);

    // Scroll to top inside viewport smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('urbanconnect_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    showToast(`Signed in as ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('urbanconnect_user');
    } catch {
      // ignore
    }
    showToast('Signed out successfully');
    setCurrentScreen('login');
  };

  const showBottomNav = ![
    'splash',
    'login',
    'register',
    'admin',
  ].includes(currentScreen);

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onNavigate={handleNavigate} />;
      case 'login':
        return (
          <LoginScreen
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            currentUser={currentUser}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onNavigate={handleNavigate}
            onLogin={handleLogin}
          />
        );
      case 'home':
        return (
          <HomeDashboard
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onOpenAIChat={() => setIsAIChatOpen(true)}
          />
        );
      case 'community':
        return <CommunityFeedScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'lost-found':
        return <LostFoundScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'blood-donation':
        return <BloodDonationScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'volunteer-events':
        return <VolunteerEventsScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'bus-info':
        return <BusInfoScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'train-info':
        return <TrainInfoScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'complaints':
        return <ComplaintTrackingScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'map':
        return <UnifiedMapScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'parking':
        return <SmartParkingScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'journey-planner':
        return <JourneyPlannerScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'analytics':
        return <CivicAnalyticsScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'admin':
        return <AdminDashboardScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'profile':
        return (
          <UserProfileScreen
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onLogout={handleLogout}
            onUserUpdate={(updated) => {
              setCurrentUser(updated);
              try {
                localStorage.setItem('urbanconnect_user', JSON.stringify(updated));
              } catch {
                // ignore
              }
            }}
          />
        );
      case 'services':
        return <ServicesHubScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      default:
        return (
          <HomeDashboard
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        );
    }
  };


  const isFullViewportMap = currentScreen === 'map' && !isDeviceFrame;

  return (
    <div
      className={`${
        isFullViewportMap ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'
      } bg-[#F5F5F7] dark:bg-[#000000] flex flex-col font-sans selection:bg-[#007AFF] selection:text-white relative transition-colors`}
    >
      {isGmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Prototype Navigation & Viewport Mode Bar */}
      <PrototypeBar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isDeviceFrame={isDeviceFrame}
        onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Interactive Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 transition-all pointer-events-none">
          <div className="bg-[#1D1D1F]/90 dark:bg-[#2C2C2E]/90 text-white text-[13px] font-semibold px-4 py-2 rounded-full border border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-2 tracking-normal pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 w-full flex flex-col justify-start p-0 min-h-0">
        <PhoneFrame isDeviceFrame={isDeviceFrame}>
          <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 relative overflow-x-hidden">
              <ScreenErrorBoundary
                screenKey={currentScreen}
                onReset={() => handleNavigate('home')}
              >
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={currentScreen}
                    custom={direction}
                    variants={screenTransitionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex-1 flex flex-col min-h-0 w-full"
                  >
                    {renderActiveScreen()}
                  </motion.div>
                </AnimatePresence>
              </ScreenErrorBoundary>
            </div>
            {showBottomNav && (
              <>
                <AIChatAssistant
                  isOpen={isAIChatOpen}
                  onClose={() => setIsAIChatOpen(false)}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
                />
                <BottomNavBar
                  currentScreen={currentScreen}
                  onNavigate={handleNavigate}
                  onOpenAIChat={() => setIsAIChatOpen(true)}
                  isAIChatOpen={isAIChatOpen}
                />
              </>
            )}
          </div>
        </PhoneFrame>

        {/* Global Emergency Hotline Mode Overlay */}
        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
        />
      </main>
    </div>
  );
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  const appShell = (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );

  if (!GOOGLE_MAPS_API_KEY) {
    return appShell;
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      language="en"
      region="IN"
      libraries={['places', 'marker']}
    >
      {appShell}
    </APIProvider>
  );
}
