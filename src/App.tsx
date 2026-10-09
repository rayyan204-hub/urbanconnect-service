import { useState, useEffect, useRef, createContext, useContext, useMemo, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenId, UserProfile } from './types';
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

// Subtle slide-in & fade animation variants
const screenTransitionVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 22 : -22,
    opacity: 0,
    filter: 'blur(1px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      x: { type: 'spring', stiffness: 360, damping: 28 },
      opacity: { duration: 0.2, ease: 'easeOut' },
      filter: { duration: 0.18 },
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -18 : 18,
    opacity: 0,
    filter: 'blur(1px)',
    transition: {
      x: { duration: 0.16, ease: [0.4, 0, 1, 1] },
      opacity: { duration: 0.14, ease: 'linear' },
      filter: { duration: 0.12 },
    },
  }),
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
  const prevScreenRef = useRef<ScreenId>('home');
  const { theme, isDark } = useTheme();

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


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] flex flex-col font-sans selection:bg-teal-600 selection:text-white relative transition-colors">
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
          <div className="bg-slate-900/95 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full border border-teal-500/40 shadow-2xl backdrop-blur-md flex items-center gap-2 tracking-wide pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col items-center justify-start p-0">
        <PhoneFrame isDeviceFrame={isDeviceFrame}>
          <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 relative overflow-x-hidden">
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

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
