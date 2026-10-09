import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Car,
  Droplet,
  ChevronRight,
  ShieldCheck,
  Clock,
  Phone,
  CheckCircle2,
  FileText,
  MapPin,
  QrCode,
  Calendar,
  Layers,
  Award,
  Mic,
  MicOff,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Zap,
} from 'lucide-react';
import { ScreenId, UserProfile } from '../../types';
import {
  processCitizenMessage,
  queryGeminiCivicAssistant,
  InChatGrievanceTicket,
  InChatParkingPass,
  InChatTankerBooking,
  ChatActionOption,
} from '../../services/aiCivicBotService';
import { updateUserCivicPoints } from '../../services/dbService';
import { ParkingPassScannerCode } from './ParkingPassScannerCode';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  ticket?: InChatGrievanceTicket;
  parkingPass?: InChatParkingPass;
  tankerBooking?: InChatTankerBooking;
  actions?: ChatActionOption[];
  source?: 'cache' | 'local_engine' | 'gemini_ai';
  latencyMs?: number;
  feedback?: 'like' | 'dislike';
}

interface AIChatAssistantProps {
  currentUser?: UserProfile | null;
  onNavigate: (screen: ScreenId) => void;
  onOpenEmergencyModal?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const SESSION_STORAGE_KEY = 'urbanconnect_civic_chat_v2';

const PROMPT_CATEGORIES = [
  { id: 'all', label: '🔥 All Direct' },
  { id: 'parking', label: '🚗 Smart Parking' },
  { id: 'grievance', label: '🛡️ Grievance' },
  { id: 'water', label: '💧 Water & Tanker' },
  { id: 'tax', label: '🏛️ Tax & Rules' },
  { id: 'emergency', label: '🚨 Helplines' },
];

const CATEGORIZED_PROMPTS: Record<string, string[]> = {
  all: [
    'Generate barcode / QR for scanning parking code',
    'Report a pothole on my road',
    'Book parking at Talao Pali',
    'Water supply schedule',
    'How to pay property tax & rebates',
    'Monsoon emergency helplines',
  ],
  parking: [
    'Generate barcode / QR for scanning parking code',
    'Book parking at Talao Pali',
    'Book parking at Majiwada',
    'Generate QR code for parking pass PRK-THANE-2026',
    'What smart parking slots are available right now?',
    'Report parking violation in no-parking zone',
  ],
  grievance: [
    'Report a pothole on my road',
    'Streetlight pole is dark and not functioning',
    'Overflowing garbage dump near market',
    'Blocked stormwater drain and gutter',
  ],
  water: [
    'Water supply schedule',
    'Book a municipal water tanker',
    'Report low water pressure or pipeline leak',
  ],
  tax: [
    'How to pay property tax & rebates',
    'How to get a birth or death certificate',
    'Shop Act (Gumasta) trade license guidelines',
  ],
  emergency: [
    'Monsoon emergency helplines',
    'Disaster management control room Thane & BMC',
    'Police and medical emergency numbers',
  ],
};

export function AIChatAssistant({
  currentUser,
  onNavigate,
  onOpenEmergencyModal,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: AIChatAssistantProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = controlledOnClose || (() => setInternalIsOpen(false));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const initialGreeting: ChatMessage = {
    id: 'welcome',
    sender: 'ai',
    text: `Namaskar ${
      currentUser?.name ? currentUser.name.split(' ')[0] : 'Citizen'
    }! I am your UrbanConnect Civic Assistant for Mumbai & Thane.\n\nI resolve your municipal matters directly inside our chat without sending you away to external forms:\n• **Parking Barcodes & QR Codes**: Generate instant **optical Barcodes (1D Code 128) and QR Codes (2D)** ready for scanning at parking boom barrier cameras.\n• **Lodge Grievances**: Tell me about potholes, leaks, or garbage — I issue official tickets with municipal SLAs on the spot.\n• **Civic Queries**: Get verified answers on water cut schedules, property tax rebates, trade licenses, or disaster hotlines.`,
    timestamp: 'Just now',
    source: 'local_engine',
    latencyMs: 8,
    actions: [
      { label: 'Generate Parking QR / Barcode', actionId: 'generate_parking_code', icon: 'parking', primary: true },
      { label: 'Report Pothole / Leak', actionId: 'report_pothole', icon: 'report' },
      { label: 'Book Talao Pali Parking', actionId: 'instant_book_talao_pali', icon: 'parking' },
      { label: 'Water Supply Schedule', actionId: 'query_water', icon: 'water' },
    ],
  };

  // Initialize messages from sessionStorage if available for persistent conversation
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [initialGreeting];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        setSpeechSupported(true);
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Save conversation state to sessionStorage
  useEffect(() => {
    try {
      // Store last 20 messages to keep storage light and fast
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      // Ignore storage quota errors
    }
  }, [messages]);

  // Keyboard navigation & accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
      // Quick shortcut Ctrl/Cmd + K to focus chat input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && isOpen) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping, scrollToBottom]);

  // Focus input automatically on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Fallback
    }
  };

  const handleFeedback = (msgId: string, rating: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: rating } : m))
    );
    if (rating === 'like') {
      if (currentUser?.uid) {
        updateUserCivicPoints(currentUser.uid, 2, 'Helpful feedback on AI Assistant');
      }
      setFeedbackNotice('Thanks for rating! +2 Civic Points credited.');
      setTimeout(() => setFeedbackNotice(null), 2400);
    }
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Fallback
    }
    setMessages([initialGreeting]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Build light conversation history
    const history = messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text }));

    const startTime = performance.now();

    // Process via local trained civic engine (handles direct bookings, complaint filings, status checks)
    const localResolution = await processCitizenMessage(query, currentUser, history);

    let finalAnswerText = localResolution.text;
    let engineSource = localResolution.source || 'local_engine';
    const isSpecializedFlow =
      Boolean(localResolution.ticket) ||
      Boolean(localResolution.parkingPass) ||
      Boolean(localResolution.tankerBooking);

    // Only query Gemini if it's not a direct card flow
    if (!isSpecializedFlow && localResolution.source !== 'cache') {
      try {
        const geminiAnswer = await queryGeminiCivicAssistant(query, currentUser);
        if (geminiAnswer && geminiAnswer.trim().length > 20) {
          finalAnswerText = geminiAnswer;
          engineSource = 'gemini_ai';
        }
      } catch {
        // Fallback to local resolution
      }
    }

    const totalLatency = Math.round(performance.now() - startTime);

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: finalAnswerText,
      timestamp: 'Just now',
      ticket: localResolution.ticket,
      parkingPass: localResolution.parkingPass,
      tankerBooking: localResolution.tankerBooking,
      actions: localResolution.actions,
      source: engineSource,
      latencyMs: localResolution.latencyMs || totalLatency,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  // Handles clicking actionable buttons directly in the chat
  const handleActionClick = (action: ChatActionOption) => {
    switch (action.actionId) {
      case 'generate_parking_code':
        handleSend('Generate a barcode / QR for scanning parking code');
        break;
      case 'report_pothole':
        handleSend('There is a pothole on the main road in my ward that needs urgent repair.');
        break;
      case 'instant_book_talao_pali':
        handleSend('Book parking at Talao Pali Multi-Level Parking');
        break;
      case 'instant_book_majiwada':
        handleSend('Book parking at Majiwada Park & Ride');
        break;
      case 'check_parking_status':
        handleSend('What smart parking slots are available right now?');
        break;
      case 'query_water':
        handleSend('What are the official municipal water supply timings?');
        break;
      case 'book_tanker':
        handleSend('Book a municipal water tanker for my ward');
        break;
      case 'query_tax':
        handleSend('How to pay property tax online and what are the current rebates?');
        break;
      case 'query_waste':
        handleSend('What are the waste segregation rules for wet and dry waste?');
        break;
      case 'query_cert':
        handleSend('How can I download a birth or death certificate?');
        break;
      case 'query_disaster':
        handleSend('What are the 24/7 disaster management and emergency helplines?');
        break;
      case 'call_officer':
        window.location.href = 'tel:9820194821';
        break;
      case 'call_tmc':
        window.location.href = 'tel:1800222108';
        break;
      case 'call_bmc':
        window.location.href = 'tel:1916';
        break;
      case 'call_police':
        window.location.href = 'tel:112';
        break;
      case 'officer_contact':
        handleSend('Who is the assigned ward officer and what is their contact desk?');
        break;
      case 'prompt_complaint':
        handleSend('I need to file an infrastructure grievance.');
        break;
      case 'report_water_leak':
        handleSend('There is an active water pipeline leak on the main street.');
        break;
      case 'report_garbage':
        handleSend('There is an overflowing garbage dump near the market junction.');
        break;
      case 'report_light':
        handleSend('Streetlight pole is dark and not functioning.');
        break;
      case 'report_tree':
        handleSend('Dangerous overhanging tree branch needs trimming.');
        break;
      case 'report_transit':
        handleSend('Bus schedule delay and passenger transit issue.');
        break;
      default:
        if (action.actionId.startsWith('status_')) {
          const ticketId = action.actionId.replace('status_', '');
          handleSend(`What is the live status of complaint ${ticketId}?`);
        } else {
          handleSend(action.label);
        }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            id="ai-assistant-modal"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full sm:max-w-xl h-[88vh] sm:h-[660px] flex flex-col bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header with Civic Identity and Performance Telemetry */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-800 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/25">
                  <Bot className="w-5 h-5 text-teal-100" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-wide">UrbanConnect AI</h3>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Optimized Civic Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-100/80 truncate max-w-[240px]">
                    Direct Resolution • {currentUser?.ward || 'Mumbai & Thane'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id="reset-chat-btn"
                  onClick={handleReset}
                  title="Clear history & restart"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-[10px]"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  id="close-chat-btn"
                  onClick={handleClose}
                  title="Close Assistant (Esc)"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Micro Feedback Notification Toast */}
            {feedbackNotice && (
              <div className="bg-emerald-500 text-white text-[11px] font-semibold text-center py-1 px-3 shadow-xs animate-fadeIn">
                {feedbackNotice}
              </div>
            )}

            {/* Conversation Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-slate-950">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs relative group ${
                      msg.sender === 'user'
                        ? 'bg-teal-700 text-white rounded-br-none font-medium'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1.5">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split('\n').map((line, lIdx) => {
                            // Highlight bold labels
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <span key={lIdx} className="block">
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong
                                        key={partIdx}
                                        className={
                                          msg.sender === 'user'
                                            ? 'font-bold text-white'
                                            : 'font-bold text-slate-900 dark:text-slate-100'
                                        }
                                      >
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </span>
                            );
                          })}
                        </p>
                      ))}
                    </div>

                    {/* Bottom Metadata & Fast Reaction Row */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 gap-2">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'ai' && msg.latencyMs !== undefined && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[9px]">
                            <Zap className="w-2.5 h-2.5 text-amber-500" />
                            {msg.latencyMs}ms
                          </span>
                        )}
                      </div>

                      {/* AI Utilities (Copy & Rate) */}
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            title="Copy response"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'like')}
                            title="Helpful (+2 pts)"
                            className={`p-1 rounded transition-colors ${
                              msg.feedback === 'like'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'dislike')}
                            title="Needs improvement"
                            className={`p-1 rounded transition-colors ${
                              msg.feedback === 'dislike'
                                ? 'text-rose-500'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1. IN-CHAT GRIEVANCE TICKET RESOLUTION CARD */}
                  {msg.ticket && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 w-full max-w-[92%] sm:max-w-[85%] rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 shadow-md overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-200" />
                          <span className="text-[11px] font-bold tracking-wide">
                            Official Grievance Registered
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold">
                            {msg.ticket.complaint.ticketId}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                msg.ticket!.complaint.ticketId,
                                `ticket-${msg.ticket!.complaint.ticketId}`
                              )
                            }
                            title="Copy ticket ID"
                            className="p-1 text-white/80 hover:text-white"
                          >
                            {copiedId === `ticket-${msg.ticket.complaint.ticketId}` ? (
                              <Check className="w-3 h-3 text-emerald-200" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {msg.ticket.complaint.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{msg.ticket.complaint.location}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[10px] shrink-0 border border-emerald-200 dark:border-emerald-800">
                            {msg.ticket.complaint.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Department</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {msg.ticket.complaint.department}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Municipal SLA</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {msg.ticket.slaHours} Hours Window
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Assigned Engineer</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {msg.ticket.complaint.assignedOfficer || 'Assistant Ward Engineer'}
                            </span>
                          </div>
                          {msg.ticket.complaint.assignedOfficerPhone && (
                            <a
                              href={`tel:${msg.ticket.complaint.assignedOfficerPhone}`}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call Desk</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            +25 Civic Points Credited
                          </span>
                          <button
                            onClick={() =>
                              handleSend(
                                `What is the latest status update for complaint ${msg.ticket?.complaint.ticketId}?`
                              )
                            }
                            className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Check Live Stage</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. IN-CHAT SMART PARKING PASS RESERVATION CARD */}
                  {msg.parkingPass && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 w-full max-w-[92%] sm:max-w-[85%] rounded-2xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800/80 shadow-md overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Car className="w-4 h-4 text-blue-200" />
                          <span className="text-[11px] font-bold tracking-wide">
                            Municipal Smart Parking Pass
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold">
                            {msg.parkingPass.bookingId}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                msg.parkingPass!.bookingId,
                                `parking-${msg.parkingPass!.bookingId}`
                              )
                            }
                            title="Copy pass token"
                            className="p-1 text-white/80 hover:text-white"
                          >
                            {copiedId === `parking-${msg.parkingPass.bookingId}` ? (
                              <Check className="w-3 h-3 text-blue-200" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {msg.parkingPass.lotName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>{msg.parkingPass.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Tariff</span>
                            <span className="font-extrabold text-blue-700 dark:text-blue-400 text-sm">
                              ₹{msg.parkingPass.rateHourly}/hr
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 grid grid-cols-2 gap-2 text-center">
                          <div className="border-r border-blue-200 dark:border-blue-900 pr-1">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Reserved Space
                            </span>
                            <span className="font-mono font-black text-blue-800 dark:text-blue-300 text-sm">
                              {msg.parkingPass.slotNumber}
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 block">
                              {msg.parkingPass.bay}
                            </span>
                          </div>
                          <div className="pl-1 flex flex-col justify-center">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Scanning Pass Token
                            </span>
                            <span className="font-mono font-bold text-blue-900 dark:text-blue-300 text-xs">
                              {msg.parkingPass.bookingId}
                            </span>
                            <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Fast Barrier Ready
                            </span>
                          </div>
                        </div>

                        {/* Optical Barcode & QR Code Generator Component */}
                        <div className="pt-0.5">
                          <ParkingPassScannerCode
                            value={msg.parkingPass.bookingId}
                            lotName={msg.parkingPass.lotName}
                            bayNumber={`${msg.parkingPass.slotNumber} • ${msg.parkingPass.bay}`}
                            validUntil={msg.parkingPass.validUntil}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>{msg.parkingPass.validUntil}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-500" />
                            +{msg.parkingPass.pointsAwarded} pts
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. IN-CHAT WATER TANKER BOOKING CARD */}
                  {msg.tankerBooking && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 w-full max-w-[92%] sm:max-w-[85%] rounded-2xl bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-800/80 shadow-md overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-700 to-teal-800 text-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Droplet className="w-4 h-4 text-cyan-200" />
                          <span className="text-[11px] font-bold tracking-wide">
                            Municipal Water Tanker Dispatched
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold">
                            {msg.tankerBooking.bookingId}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                msg.tankerBooking!.bookingId,
                                `tanker-${msg.tankerBooking!.bookingId}`
                              )
                            }
                            title="Copy tanker booking ID"
                            className="p-1 text-white/80 hover:text-white"
                          >
                            {copiedId === `tanker-${msg.tankerBooking.bookingId}` ? (
                              <Check className="w-3 h-3 text-cyan-200" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Capacity</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {msg.tankerBooking.capacity}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 text-[10px] block">Subsidized Tariff</span>
                            <span className="font-extrabold text-cyan-700 dark:text-cyan-400 text-sm">
                              ₹{msg.tankerBooking.rate}
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-[11px] space-y-1">
                          <div className="flex items-center gap-1.5 text-cyan-900 dark:text-cyan-200 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-cyan-600" />
                            <span>{msg.tankerBooking.dispatchTime}</span>
                          </div>
                          <div className="text-[10px] text-cyan-800 dark:text-cyan-300">
                            Helpline Desk: {msg.tankerBooking.contactNumber}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 4. CONVERSATIONAL IN-CHAT ACTION CHIPS */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shadow-2xs ${
                            act.primary
                              ? 'bg-teal-700 hover:bg-teal-800 text-white'
                              : 'bg-white hover:bg-teal-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {act.icon === 'report' && (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          )}
                          {act.icon === 'parking' && <Car className="w-3 h-3 text-blue-500" />}
                          {act.icon === 'water' && <Droplet className="w-3 h-3 text-cyan-500" />}
                          {act.icon === 'call' && <Phone className="w-3 h-3 text-rose-500" />}
                          {act.icon === 'check' && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          )}
                          {act.icon === 'tax' && <FileText className="w-3 h-3 text-purple-500" />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-28 shadow-2xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Resolving</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Categorized Filter Tabs for Quick Prompts */}
            <div className="px-3 pt-2 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800/80">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                {PROMPT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-1.5 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {(CATEGORIZED_PROMPTS[activeCategory] || CATEGORIZED_PROMPTS.all).map(
                (prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {prompt}
                  </button>
                )
              )}
            </div>

            {/* Conversational Input Bar with Speech-to-Text */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  id="ai-assistant-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    isListening
                      ? 'Listening to your voice... speak now'
                      : 'Ask queries, report potholes, book parking...'
                  }
                  className={`w-full text-xs bg-slate-100 dark:bg-slate-800 border rounded-xl pl-3.5 pr-9 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                    isListening
                      ? 'border-emerald-500 ring-2 ring-emerald-400/40 animate-pulse'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    title={isListening ? 'Stop recording voice' : 'Voice input (Hindi/English)'}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                      isListening
                        ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 animate-bounce'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <button
                id="ai-assistant-send-btn"
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white transition-all shadow-sm"
                title="Send query (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
