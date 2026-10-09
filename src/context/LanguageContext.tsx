import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export type LanguageCode = 'en' | 'mr' | 'hi';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  englishName: string;
  nativeScript: string;
  badge: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    nativeScript: 'English',
    badge: 'EN',
    description: 'Municipal Official & Administrative',
  },
  {
    code: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    nativeScript: 'मराठी',
    badge: 'मरा',
    description: 'महाराष्ट्र राज्य अधिकृत भाषा (Thane & Mumbai)',
  },
  {
    code: 'hi',
    name: 'हिंदी',
    englishName: 'Hindi',
    nativeScript: 'हिंदी',
    badge: 'हिं',
    description: 'सार्वजनिक नागरिक संपर्क भाषा',
  },
];

export const TRANSLATIONS = {
  en: {
    // App identity
    app_name: 'UrbanConnect',
    app_subheading: 'Mumbai & Thane Smart City Hub',
    tagline: 'Empowering Citizens, Connecting Neighborhoods',

    // Navigation
    nav_home: 'Home',
    nav_transit: 'Transit',
    nav_complaints: 'Grievances',
    nav_community: 'Community',
    nav_profile: 'Profile',
    nav_services: 'Services',
    nav_map: 'City Map',
    nav_admin: 'Admin HQ',
    nav_emergency: 'Emergency',
    nav_analytics: 'Analytics',
    nav_parking: 'Smart Parking',
    nav_journey: 'Trip Planner',
    nav_blood: 'Blood Donor',
    nav_volunteer: 'Volunteer',
    nav_back: 'Back',

    // Top Bar & Common Actions
    action_search: 'Search',
    action_filter: 'Filter',
    action_submit: 'Submit',
    action_cancel: 'Cancel',
    action_confirm: 'Confirm',
    action_save: 'Save',
    action_update: 'Update',
    action_call: 'Call',
    action_call_hotline: 'Call Hotline',
    action_view_details: 'View Details',
    action_report_issue: 'Report Issue',
    action_endorse: 'Endorse',
    action_share: 'Share',
    action_close: 'Close',
    action_copy: 'Copy',
    action_copied: 'Copied!',
    action_redeem: 'Redeem',
    action_switch_language: 'Change Language',
    action_switch_role: 'Switch Role',
    action_logout: 'Sign Out',
    action_login: 'Sign In',

    // Home Screen
    home_welcome_back: 'Welcome back',
    home_greeting_morning: 'Good Morning',
    home_greeting_afternoon: 'Good Afternoon',
    home_greeting_evening: 'Good Evening',
    home_search_placeholder: 'Search buses, local trains, ward services, tickets...',
    home_quick_actions: 'Quick Municipal Services',
    home_bus_title: 'TMT & BEST Buses',
    home_bus_desc: 'Live arrival & route schedules',
    home_train_title: 'Mumbai Local Trains',
    home_train_desc: 'Central & Western timetables',
    home_report_title: 'Report Civic Issue',
    home_report_desc: 'Potholes, water leaks, garbage',
    home_parking_title: 'Smart Parking',
    home_parking_desc: 'Find & reserve open bays',
    home_blood_title: 'Emergency Blood',
    home_blood_desc: 'Donors roster & requests',
    home_volunteer_title: 'Volunteer Drives',
    home_volunteer_desc: 'Yeoor green & lake cleanup',
    home_live_notices: 'City Alerts & Municipal Bulletins',
    home_weather_forecast: 'Live Weather & Monsoon Watch',
    home_air_quality: 'Thane Air Quality Index (AQI)',
    home_air_good: 'Moderate • Good for outdoor commute',
    home_civic_score: 'Your Civic Standing',

    // Grievance / Complaints
    comp_title: 'Civic Grievance Redressal',
    comp_subtitle: 'TMC & BMC Ward Operations',
    comp_new_report: 'File New Complaint',
    comp_search: 'Search ticket ID or location...',
    comp_status_all: 'All',
    comp_status_reported: 'Reported',
    comp_status_under_review: 'Under Review',
    comp_status_verified: 'Verified',
    comp_status_assigned: 'Assigned',
    comp_status_work_started: 'Work Started',
    comp_status_evidence_added: 'Resolution Evidence Added',
    comp_status_awaiting_citizen: 'Awaiting Citizen Confirmation',
    comp_status_resolved: 'Resolved',
    comp_field_officer: 'Assigned Field Officer',
    comp_call_desk: 'Call Desk',
    comp_citizen_verified: 'Citizen Verified & Signed Off',
    comp_duplicates_merged: 'Consolidated Tickets Merged',
    comp_verify_btn: 'Verify Resolution (+50 Pts)',
    comp_evidence_title: 'Official Proof of Work Evidence',

    // Transit
    transit_buses_title: 'TMT & BEST Bus Tracker',
    transit_trains_title: 'Mumbai Local Railway Schedules',
    transit_planner_title: 'Intermodal Transit Planner',
    transit_live_arrivals: 'Live Upcoming Buses',
    transit_platform: 'Platform',
    transit_on_time: 'On Time',
    transit_delayed: 'Delayed',
    transit_frequency: 'Frequency',
    transit_fare: 'Fare',

    // Gamification & Profile
    gamification_title: 'Civic Gamification & Rewards',
    gamification_points: 'Civic Points',
    gamification_rank: 'Current Rank',
    gamification_next_rank: 'Next Rank',
    gamification_rewards_store: 'Rewards Store',
    gamification_my_vouchers: 'My Vouchers',
    gamification_badges: 'Achievement Badges',
    gamification_earn_guide: 'Earn Points',

    // Profile Settings
    profile_title: 'Citizen Account & Settings',
    profile_subtitle: 'Municipal Identity & Preferences',
    profile_settings: 'App Settings & Preferences',
    profile_theme: 'Appearance Theme',
    profile_language: 'Interface Language',
    profile_notifications: 'Civic Alerts & Notices',
    profile_support: 'Help & Municipal Headquarters',
    profile_role: 'Account Access Role',

    // Emergency Modal
    emergency_title: 'Emergency Municipal Hotlines',
    emergency_subtitle: '24/7 Rapid Response Services for Thane & Mumbai',
    emergency_police: 'Police Control Room (112)',
    emergency_fire: 'Fire Brigade Emergency (101)',
    emergency_ambulance: 'Ambulance Emergency (108)',
    emergency_disaster: 'TMC Disaster Cell (1077)',
    emergency_women: 'Women Helpline (1090)',

    // Language switcher
    lang_current: 'English',
    lang_select_title: 'Select App Language',
    lang_select_subtitle: 'उपयोजन भाषा निवडा / भाषा चुनें',
    lang_hint: 'Instant update across screens',
  },

  mr: {
    // App identity
    app_name: 'अर्बनकनेक्ट',
    app_subheading: 'मुंबई आणि ठाणे स्मार्ट सिटी पोर्टल',
    tagline: 'सशक्त नागरिक, जोडलेले शेजारी',

    // Navigation
    nav_home: 'मुख्यपृष्ठ',
    nav_transit: 'वाहतूक',
    nav_complaints: 'तक्रारी',
    nav_community: 'समुदाय',
    nav_profile: 'प्रोफाइल',
    nav_services: 'सेवा',
    nav_map: 'शहर नकाशा',
    nav_admin: 'प्रशासक मुख्यालय',
    nav_emergency: 'आपत्कालीन',
    nav_analytics: 'विश्लेषण',
    nav_parking: 'स्मार्ट पार्किंग',
    nav_journey: 'प्रवास योजना',
    nav_blood: 'रक्तदाता',
    nav_volunteer: 'स्वयंसेवक',
    nav_back: 'मागे जा',

    // Top Bar & Common Actions
    action_search: 'शोधा',
    action_filter: 'फिल्टर',
    action_submit: 'दाखल करा',
    action_cancel: 'रद्द करा',
    action_confirm: 'पुष्टी करा',
    action_save: 'जतन करा',
    action_update: 'अद्यतन करा',
    action_call: 'कॉल करा',
    action_call_hotline: 'हेल्पलाइनवर कॉल करा',
    action_view_details: 'तपशील पहा',
    action_report_issue: 'समस्या नोंदवा',
    action_endorse: 'पाठिंबा द्या',
    action_share: 'शेअर करा',
    action_close: 'बंद करा',
    action_copy: 'कॉपी करा',
    action_copied: 'कॉपी झाले!',
    action_redeem: 'वापरा (रिडीम)',
    action_switch_language: 'भाषा बदला',
    action_switch_role: 'भूमिका बदला',
    action_logout: 'बाहेर पडा',
    action_login: 'लॉग इन करा',

    // Home Screen
    home_welcome_back: 'पुन्हा स्वागत आहे',
    home_greeting_morning: 'शुभ सकाळ',
    home_greeting_afternoon: 'शुभ दुपार',
    home_greeting_evening: 'शुभ संध्याकाळ',
    home_search_placeholder: 'बस, लोकल ट्रेन, वॉर्ड सेवा, तक्रार तिकीट शोधा...',
    home_quick_actions: 'जलद महानगरपालिका सेवा',
    home_bus_title: 'टीएमटी आणि बेस्ट बसेस',
    home_bus_desc: 'थेट बस आगमन आणि मार्ग वेळापत्रक',
    home_train_title: 'मुंबई लोकल ट्रेन',
    home_train_desc: 'मध्य आणि पश्चिम रेल्वे वेळापत्रक',
    home_report_title: 'नागरी समस्या नोंदवा',
    home_report_desc: 'खड्डे, पाणी गळती, कचरा साचणे',
    home_parking_title: 'स्मार्ट पार्किंग',
    home_parking_desc: 'रिकामी जागा शोधा आणि आरक्षित करा',
    home_blood_title: 'आपत्कालीन रक्तपुरवठा',
    home_blood_desc: 'रक्तदात्यांची यादी आणि तातडीच्या गरजा',
    home_volunteer_title: 'स्वयंसेवक उपक्रम',
    home_volunteer_desc: 'येऊर हरित मोहीम आणि तलाव स्वच्छता',
    home_live_notices: 'शहर सूचना आणि महानगरपालिका परिपत्रके',
    home_weather_forecast: 'थेट हवामान आणि मान्सून अंदाज',
    home_air_quality: 'ठाणे हवेची गुणवत्ता (AQI)',
    home_air_good: 'मध्यम • बाहेरील प्रवासासाठी अनुकूल',
    home_civic_score: 'तुमचे नागरी गुण (Civic Points)',

    // Grievance / Complaints
    comp_title: 'नागरी तक्रार निवारण कक्ष',
    comp_subtitle: 'ठाणे (TMC) आणि मुंबई (BMC) वॉर्ड सेवा',
    comp_new_report: 'नवीन तक्रार नोंदवा',
    comp_search: 'तिकीट क्रमांक किंवा ठिकाण शोधा...',
    comp_status_all: 'सर्व',
    comp_status_reported: 'नोंदवले',
    comp_status_under_review: 'पुनरावलोकनाधीन',
    comp_status_verified: 'पडताळणी झाली',
    comp_status_assigned: 'अधिकारी नियुक्त',
    comp_status_work_started: 'काम सुरू',
    comp_status_evidence_added: 'कामाचा पुरावा जोडला',
    comp_status_awaiting_citizen: 'नागरिकांच्या पुष्टीची प्रतीक्षा',
    comp_status_resolved: 'निवारण झाले',
    comp_field_officer: 'नियुक्त क्षेत्रीय अधिकारी',
    comp_call_desk: 'कॉल करा',
    comp_citizen_verified: 'नागरिकाने कामाची पाहणी करून पुष्टी केली',
    comp_duplicates_merged: 'समान तक्रारी एका तिकिटात एकत्रित',
    comp_verify_btn: 'काम तपासून गुण मिळवा (+५० गुण)',
    comp_evidence_title: 'दुरुस्तीचे अधिकृत फोटो व पुरावा',

    // Transit
    transit_buses_title: 'टीएमटी आणि बेस्ट बस ट्रॅकर',
    transit_trains_title: 'मुंबई लोकल रेल्वे वेळापत्रक',
    transit_planner_title: 'प्रवास मार्गदर्शक (ट्रॅव्हल प्लॅनर)',
    transit_live_arrivals: 'आगामी बसेसची थेट स्थिती',
    transit_platform: 'प्लॅटफॉर्म',
    transit_on_time: 'वेळेवर',
    transit_delayed: 'उशिरा',
    transit_frequency: 'वारंवारता',
    transit_fare: 'भाडे',

    // Gamification & Profile
    gamification_title: 'नागरी गुण आणि सन्मान पुरस्कार',
    gamification_points: 'नागरी गुण',
    gamification_rank: 'सध्याचा दर्जा',
    gamification_next_rank: 'पुढील दर्जा',
    gamification_rewards_store: 'पुरस्कार दालन',
    gamification_my_vouchers: 'माझे डिजिटल व्हाउचर',
    gamification_badges: 'सन्मान पदके',
    gamification_earn_guide: 'गुण कसे मिळवावे',

    // Profile Settings
    profile_title: 'नागरिक खाते आणि सेटिंग्ज',
    profile_subtitle: 'महानगरपालिका ओळख आणि प्राधान्ये',
    profile_settings: 'अ‍ॅप सेटिंग्ज आणि प्राधान्ये',
    profile_theme: 'रंगरूप (थीम)',
    profile_language: 'अ‍ॅपची भाषा',
    profile_notifications: 'नागरी सूचना आणि अलर्ट',
    profile_support: 'मदत आणि महानगरपालिका मुख्यालय',
    profile_role: 'वापरकर्ता भूमिका',

    // Emergency Modal
    emergency_title: 'आपत्कालीन महानगरपालिका हेल्पलाइन',
    emergency_subtitle: 'ठाणे आणि मुंबईसाठी २४/७ तातडीची मदत',
    emergency_police: 'पोलीस नियंत्रण कक्ष (११२)',
    emergency_fire: 'अग्निशामक दल (१०१)',
    emergency_ambulance: 'रुग्णवाहिका आपत्कालीन सेवा (१०८)',
    emergency_disaster: 'ठाणे महापालिका आपत्ती नियंत्रण (१०७७)',
    emergency_women: 'महिला हेल्पलाइन (१०९०)',

    // Language switcher
    lang_current: 'मराठी',
    lang_select_title: 'अ‍ॅपची भाषा निवडा',
    lang_select_subtitle: 'मराठी, हिंदी किंवा इंग्रजी निवडा',
    lang_hint: 'सर्व स्क्रीनवर त्वरित भाषा बदलली जाईल',
  },

  hi: {
    // App identity
    app_name: 'अर्बनकनेक्ट',
    app_subheading: 'मुंबई एवं ठाणे स्मार्ट सिटी पोर्टल',
    tagline: 'सशक्त नागरिक, परस्पर जुड़ा शहर',

    // Navigation
    nav_home: 'होम',
    nav_transit: 'यातायात',
    nav_complaints: 'शिकायतें',
    nav_community: 'समुदाय',
    nav_profile: 'प्रोफाइल',
    nav_services: 'सेवाएं',
    nav_map: 'शहर का नक्शा',
    nav_admin: 'प्रशासक मुख्यालय',
    nav_emergency: 'आपातकालीन',
    nav_analytics: 'विश्लेषण',
    nav_parking: 'स्मार्ट पार्किंग',
    nav_journey: 'यात्रा योजना',
    nav_blood: 'रक्तदाता',
    nav_volunteer: 'स्वयंसेवक',
    nav_back: 'वापस',

    // Top Bar & Common Actions
    action_search: 'खोजें',
    action_filter: 'फ़िल्टर',
    action_submit: 'जमा करें',
    action_cancel: 'रद्द करें',
    action_confirm: 'पुष्टि करें',
    action_save: 'सहेजें',
    action_update: 'अद्यतन करें',
    action_call: 'कॉल करें',
    action_call_hotline: 'हेल्पलाइन पर कॉल करें',
    action_view_details: 'विवरण देखें',
    action_report_issue: 'समस्या दर्ज करें',
    action_endorse: 'समर्थन दें',
    action_share: 'साझा करें',
    action_close: 'बंद करें',
    action_copy: 'कॉपी करें',
    action_copied: 'कॉपी हो गया!',
    action_redeem: 'उपयोग करें (रिडीम)',
    action_switch_language: 'भाषा बदलें',
    action_switch_role: 'भूमिका बदलें',
    action_logout: 'लॉग आउट',
    action_login: 'लॉग इन',

    // Home Screen
    home_welcome_back: 'वापसी पर स्वागत है',
    home_greeting_morning: 'शुभ प्रभात',
    home_greeting_afternoon: 'शुभ दोपहर',
    home_greeting_evening: 'शुभ संध्या',
    home_search_placeholder: 'बस, लोकल ट्रेन, वार्ड सेवाएं, शिकायत टिकट खोजें...',
    home_quick_actions: 'त्वरित नगरपालिका सेवाएं',
    home_bus_title: 'टीएमटी एवं बेस्ट बसें',
    home_bus_desc: 'लाइव बस आगमन और रूट समय सारिणी',
    home_train_title: 'मुंबई लोकल ट्रेन',
    home_train_desc: 'सेंट्रल व वेस्टर्न रेलवे समय सारिणी',
    home_report_title: 'नागरिक समस्या दर्ज करें',
    home_report_desc: 'गड्ढे, पानी लीकेज, कचरा डंप',
    home_parking_title: 'स्मार्ट पार्किंग',
    home_parking_desc: 'खाली स्थान खोजें और आरक्षित करें',
    home_blood_title: 'आपातकालीन रक्तदाता',
    home_blood_desc: 'रक्तदाता सूची और तत्काल अनुरोध',
    home_volunteer_title: 'स्वयंसेवक अभियान',
    home_volunteer_desc: 'येऊर हरित ड्राइव और झील स्वच्छता',
    home_live_notices: 'शहर की सूचनाएं और नगरपालिका बुलेटिन',
    home_weather_forecast: 'लाइव मौसम एवं मानसून पूर्वानुमान',
    home_air_quality: 'ठाणे वायु गुणवत्ता सूचकांक (AQI)',
    home_air_good: 'मध्यम • सामान्य आवागमन के लिए सुरक्षित',
    home_civic_score: 'आपका नागरिक स्कोर (Civic Points)',

    // Grievance / Complaints
    comp_title: 'नागरिक शिकायत निवारण',
    comp_subtitle: 'टीएमसी और बीएमसी वार्ड सेवाएं',
    comp_new_report: 'नई शिकायत दर्ज करें',
    comp_search: 'टिकट संख्या या स्थान खोजें...',
    comp_status_all: 'सभी',
    comp_status_reported: 'दर्ज',
    comp_status_under_review: 'समीक्षाधीन',
    comp_status_verified: 'सत्यापित',
    comp_status_assigned: 'अधिकारी नियुक्त',
    comp_status_work_started: 'कार्य प्रगति पर',
    comp_status_evidence_added: 'सुधार साक्ष्य संलग्न',
    comp_status_awaiting_citizen: 'नागरिक पुष्टि प्रतीक्षित',
    comp_status_resolved: 'निवारित',
    comp_field_officer: 'नियुक्त क्षेत्रीय अधिकारी',
    comp_call_desk: 'कॉल करें',
    comp_citizen_verified: 'नागरिक द्वारा स्थल सत्यापन संपन्न',
    comp_duplicates_merged: 'समान शिकायतें एक साथ जोड़ी गईं',
    comp_verify_btn: 'सत्यापित करें व अंक पाएं (+५० अंक)',
    comp_evidence_title: 'सफाई / मरम्मत का आधिकारिक फोटो साक्ष्य',

    // Transit
    transit_buses_title: 'टीएमटी एवं बेस्ट बस ट्रैकर',
    transit_trains_title: 'मुंबई लोकल ट्रेन समय सारिणी',
    transit_planner_title: 'यात्रा योजनाकार (ट्रिप प्लानर)',
    transit_live_arrivals: 'आने वाली बसों का लाइव समय',
    transit_platform: 'प्लेटफ़ॉर्म',
    transit_on_time: 'समय पर',
    transit_delayed: 'विलंबित',
    transit_frequency: 'आवृत्ति',
    transit_fare: 'किराया',

    // Gamification & Profile
    gamification_title: 'नागरिक अंक एवं पुरस्कार',
    gamification_points: 'नागरिक अंक',
    gamification_rank: 'वर्तमान पद',
    gamification_next_rank: 'अगला पद',
    gamification_rewards_store: 'पुरस्कार स्टोर',
    gamification_my_vouchers: 'मेरे डिजिटल वाउचर',
    gamification_badges: 'उपलब्धि बैज',
    gamification_earn_guide: 'अंक कैसे अर्जित करें',

    // Profile Settings
    profile_title: 'नागरिक खाता एवं सेटिंग्स',
    profile_subtitle: 'नगरपालिका पहचान एवं प्राथमिकताएं',
    profile_settings: 'ऐप सेटिंग्स एवं प्राथमिकताएं',
    profile_theme: 'थीम (रंगरूप)',
    profile_language: 'इंटरफ़ेस भाषा',
    profile_notifications: 'नागरिक अलर्ट व सूचनाएं',
    profile_support: 'सहायता एवं नगरपालिका मुख्यालय',
    profile_role: 'खाता भूमिका',

    // Emergency Modal
    emergency_title: 'आपातकालीन नगरपालिका हेल्पलाइन',
    emergency_subtitle: 'ठाणे और मुंबई के लिए २४/७ त्वरित सेवाएं',
    emergency_police: 'पुलिस नियंत्रण कक्ष (११२)',
    emergency_fire: 'दमकल विभाग (१०१)',
    emergency_ambulance: 'एम्बुलेंस आपातकालीन सेवा (१०८)',
    emergency_disaster: 'ठाणे आपदा प्रबंधन कक्ष (१०७७)',
    emergency_women: 'महिला हेल्पलाइन (१०९०)',

    // Language switcher
    lang_current: 'हिंदी',
    lang_select_title: 'ऐप की भाषा चुनें',
    lang_select_subtitle: 'हिंदी, मराठी या अंग्रेज़ी चुनें',
    lang_hint: 'सभी स्क्रीन पर तुरंत प्रभावी',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
}

const LANGUAGE_STORAGE_KEY = 'urbanconnect_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'en' || saved === 'mr' || saved === 'hi') {
        return saved;
      }
      // Check browser preferred language
      if (typeof navigator !== 'undefined' && navigator.language) {
        if (navigator.language.startsWith('mr')) return 'mr';
        if (navigator.language.startsWith('hi')) return 'hi';
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: TranslationKey, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] as Record<string, string>;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS.en as Record<string, string>;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageInfo,
    }),
    [language, currentLanguageInfo]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
