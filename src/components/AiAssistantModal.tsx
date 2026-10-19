import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AiRobotAvatar, RobotState } from './AiRobotAvatar.tsx';

export interface PortfolioCaseCardData {
  id: string;
  caseNumber?: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  patientInfo?: string;
  duration?: string;
  guaranteeText?: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  badge?: string;
}

export interface ChatActionButton {
  id: string;
  type:
    | 'call_clinic'
    | 'open_booking'
    | 'open_cost_calculator'
    | 'open_google_maps'
    | 'open_neshan'
    | 'open_balad'
    | 'navigate_contact'
    | 'navigate_services'
    | 'navigate_gallery';
  label: string;
  url?: string;
  serviceId?: string;
  icon: string;
}

export interface DoctorProfileCardData {
  name: string;
  role: string;
  medicalCouncilCode: string;
  image: string;
  experience: string;
  bio: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  cases?: PortfolioCaseCardData[];
  doctorCard?: DoctorProfileCardData | null;
  actions?: ChatActionButton[];
  followUpSuggestions?: string[];
  isError?: boolean;
  retryPrompt?: string;
  mode?: 'gemini' | 'knowledge_engine';
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePage: (page: 'home' | 'services' | 'about' | 'blog' | 'article' | 'gallery' | 'contact') => void;
  onOpenBooking: (serviceId?: string) => void;
  onOpenCostCalculator: () => void;
}

const INITIAL_WELCOME_MESSAGE =
  'سلام! 👋 من دستیار هوشمند دکتر انوشیروان شمس‌پور هستم. چطور می‌تونم کمکتون کنم؟';

const STARTER_SUGGESTIONS = [
  { id: 'intro-doc', label: 'معرفی دکتر شمس‌پور', icon: 'verified_user' },
  { id: 'view-services', label: 'مشاهده خدمات دندانپزشکی', icon: 'medical_services' },
  { id: 'view-portfolio', label: 'دیدن نمونه‌کارها', icon: 'auto_awesome' },
  { id: 'service-costs', label: 'هزینه خدمات و روش‌های درمان', icon: 'payments' },
  { id: 'clinic-address', label: 'آدرس مطب و راه‌های تماس', icon: 'location_on' },
  { id: 'care-guide', label: 'مراقبت‌های قبل و بعد از درمان', icon: 'health_and_safety' },
  { id: 'ask-dental', label: 'پرسیدن سؤال دندانپزشکی', icon: 'help' },
];

const PORTFOLIO_QUICK_FILTERS = [
  'نمونه‌کار کامپوزیت',
  'نمونه‌کار لمینت',
  'سفید کردن دندان‌ها (بلیچینگ)',
  'نمونه‌کار ایمپلنت',
];

const createInitialMessage = (): ChatMessageItem => ({
  id: 'welcome-msg',
  role: 'assistant',
  content: INITIAL_WELCOME_MESSAGE,
  timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
});

/**
 * Interactive Portfolio Card inside Chat with Before/After toggle & Lightbox trigger
 */
const ChatPortfolioCard: React.FC<{
  item: PortfolioCaseCardData;
  onInspect: (item: PortfolioCaseCardData, initialStage: 'before' | 'after') => void;
}> = ({ item, onInspect }) => {
  const [activeView, setActiveView] = useState<'after' | 'before' | 'split'>('split');

  return (
    <div className="bg-white rounded-2xl border border-[#c3c6d7]/50 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden group">
        {activeView === 'split' ? (
          <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-white/20">
            {/* Before Side */}
            <div
              onClick={() => onInspect(item, 'before')}
              className="relative w-full h-full overflow-hidden cursor-zoom-in"
            >
              <img
                src={item.beforeImage}
                alt={`${item.title} - ${item.beforeLabel}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                {item.beforeLabel || 'قبل از درمان'}
              </span>
            </div>
            {/* After Side */}
            <div
              onClick={() => onInspect(item, 'after')}
              className="relative w-full h-full overflow-hidden cursor-zoom-in"
            >
              <img
                src={item.afterImage}
                alt={`${item.title} - ${item.afterLabel}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#004ac6]/90 text-white backdrop-blur-xs">
                {item.afterLabel || 'بعد از درمان'}
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onInspect(item, activeView)}
            className="relative w-full h-full cursor-zoom-in"
          >
            <img
              src={activeView === 'after' ? item.afterImage : item.beforeImage}
              alt={`${item.title} - ${activeView === 'after' ? item.afterLabel : item.beforeLabel}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span
              className={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white backdrop-blur-xs ${
                activeView === 'after' ? 'bg-[#004ac6]/90' : 'bg-slate-900/80'
              }`}
            >
              {activeView === 'after'
                ? item.afterLabel || 'بعد از درمان'
                : item.beforeLabel || 'قبل از درمان'}
            </span>
          </div>
        )}

        {/* Top Category Badge & Zoom Button */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-[#004ac6] shadow-xs">
            {item.categoryLabel}
          </span>
          <button
            type="button"
            onClick={() => onInspect(item, activeView === 'before' ? 'before' : 'after')}
            aria-label={`بزرگنمایی تصویر ${item.title}`}
            className="pointer-events-auto w-7 h-7 rounded-full bg-slate-900/75 hover:bg-[#004ac6] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="مشاهده در اندازه بزرگ‌تر"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
          </button>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between gap-1 px-2.5 py-1.5 bg-[#f2f4f6] border-b border-[#c3c6d7]/30 text-[10px] font-bold">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveView('split')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              activeView === 'split'
                ? 'bg-[#004ac6] text-white'
                : 'text-[#565e74] hover:bg-white'
            }`}
          >
            مقایسه قبل و بعد
          </button>
          <button
            type="button"
            onClick={() => setActiveView('before')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              activeView === 'before'
                ? 'bg-slate-800 text-white'
                : 'text-[#565e74] hover:bg-white'
            }`}
          >
            قبل از درمان
          </button>
          <button
            type="button"
            onClick={() => setActiveView('after')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              activeView === 'after'
                ? 'bg-[#004ac6] text-white'
                : 'text-[#565e74] hover:bg-white'
            }`}
          >
            بعد از درمان
          </button>
        </div>
        <button
          type="button"
          onClick={() => onInspect(item, 'after')}
          className="text-[#004ac6] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>بزرگنمایی</span>
          <span className="material-symbols-outlined text-[13px]">open_in_full</span>
        </button>
      </div>

      {/* Card Details */}
      <div className="p-3 text-right">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-xs font-extrabold text-[#191c1e] leading-snug">{item.title}</h4>
          {item.caseNumber && (
            <span className="text-[10px] font-bold text-[#004ac6] bg-[#dbe1ff]/60 px-2 py-0.5 rounded-full shrink-0">
              {item.caseNumber}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#565e74] leading-relaxed line-clamp-2">{item.description}</p>
        {(item.duration || item.patientInfo) && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-semibold">
            {item.patientInfo && <span>👤 {item.patientInfo}</span>}
            {item.duration && <span>⏱ {item.duration}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigatePage,
  onOpenBooking,
  onOpenCostCalculator,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => [createInitialMessage()]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingSeconds, setProcessingSeconds] = useState(0);
  const [robotState, setRobotState] = useState<RobotState>('entering');
  const [farewellStep, setFarewellStep] = useState<'turn_and_wave' | 'glide_out' | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [lightboxData, setLightboxData] = useState<{
    item: PortfolioCaseCardData;
    stage: 'before' | 'after' | 'split';
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const exitTimersRef = useRef<number[]>([]);

  const clearExitTimers = () => {
    exitTimersRef.current.forEach((id) => window.clearTimeout(id));
    exitTimersRef.current = [];
  };

  const resetSessionState = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearExitTimers();
    setMessages([createInitialMessage()]);
    setInputText('');
    setIsLoading(false);
    setProcessingSeconds(0);
    setIsExiting(false);
    setFarewellStep(null);
    setLightboxData(null);
  }, []);

  // Handle opening animation and body scroll lock on mobile
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false);
      setFarewellStep(null);
      setRobotState('entering');
      const greetTimer = window.setTimeout(() => {
        setRobotState('greeting');
      }, 180);
      const idleTimer = window.setTimeout(() => {
        setRobotState((prev) => (prev === 'greeting' ? 'idle' : prev));
      }, 2400);

      // Focus input on desktop
      if (window.innerWidth >= 768) {
        window.setTimeout(() => textareaRef.current?.focus(), 250);
      }

      return () => {
        window.clearTimeout(greetTimer);
        window.clearTimeout(idleTimer);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Processing timer display
  useEffect(() => {
    if (!isLoading) {
      setProcessingSeconds(0);
      return;
    }
    const interval = window.setInterval(() => {
      setProcessingSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading, isExiting, isOpen]);

  // Fast close (Escape key or clicking outside backdrop)
  const handleQuickClose = useCallback(() => {
    if (lightboxData) {
      setLightboxData(null);
      return;
    }
    resetSessionState();
    document.body.style.overflow = '';
    onClose();
  }, [lightboxData, onClose, resetSessionState]);

  // Keyboard Escape handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleQuickClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleQuickClose]);

  /**
   * Dedicated Exit & Farewell Sequence when clicking the × button:
   * 1. Stop new requests & enter exiting mode
   * 2. Robot turns toward the screen & waves goodbye
   * 3. Show farewell message «خوشحال شدم کمکتون کنم! 👋»
   * 4. Robot glides out smoothly
   * 5. Close window & wipe temporary session chat history
   */
  const handleCloseButtonFarewell = () => {
    if (isExiting) return;

    // 1. Stop any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsExiting(true);

    // Check if reduced motion is preferred by system
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      resetSessionState();
      document.body.style.overflow = '';
      onClose();
      return;
    }

    // 2 & 3 & 4. Robot turns toward user, waves hand, and shows farewell message
    setRobotState('farewell');
    setFarewellStep('turn_and_wave');

    // 5. Glide out toward the edge
    const t1 = window.setTimeout(() => {
      setFarewellStep('glide_out');
    }, 1150);

    // 6, 7 & 8. Close modal, clear temporary session history, restore scroll
    const t2 = window.setTimeout(() => {
      resetSessionState();
      document.body.style.overflow = '';
      onClose();
    }, 1600);

    exitTimersRef.current.push(t1, t2);
  };

  /**
   * Sends a message to the backend AI endpoint
   */
  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading || isExiting) return;

    // Special starter chip: if user clicks "پرسیدن سؤال دندانپزشکی", guide them and focus input
    if (trimmed === 'پرسیدن سؤال دندانپزشکی') {
      const userMsg: ChatMessageItem = {
        id: `usr-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      const guideMsg: ChatMessageItem = {
        id: `ast-${Date.now() + 1}`,
        role: 'assistant',
        content:
          'هر سؤالی درباره سلامت دهان و دندان دارید بپرسید! برای نمونه می‌توانید یکی از موضوعات زیر را انتخاب کنید یا سؤال خودتان را در کادر پایین بنویسید:',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        followUpSuggestions: [
          'تفاوت کامپوزیت و لمینت چیست؟',
          'آیا عصب‌کشی دندان درد دارد؟',
          'ماندگاری کامپوزیت و لمینت چقدر است؟',
          'مراقبت‌های بعد از جراحی دندان عقل',
          'علت حساسیت دندان بعد از درمان چیست؟',
        ],
      };
      setMessages((prev) => [...prev, userMsg, guideMsg]);
      setRobotState('speaking');
      window.setTimeout(() => {
        setRobotState('idle');
        textareaRef.current?.focus();
      }, 1200);
      return;
    }

    const userMessageObj: ChatMessageItem = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Build history for backend context
    const historyPayload = messages
      .filter((m) => !m.isError)
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMessageObj]);
    setInputText('');
    setIsLoading(true);
    setRobotState('thinking');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'خطا در دریافت پاسخ از سرور.');
      }

      const assistantMsg: ChatMessageItem = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        cases: Array.isArray(data.cases) && data.cases.length > 0 ? data.cases : undefined,
        doctorCard: data.doctorCard || undefined,
        actions: Array.isArray(data.actions) && data.actions.length > 0 ? data.actions : undefined,
        followUpSuggestions:
          Array.isArray(data.followUpSuggestions) && data.followUpSuggestions.length > 0
            ? data.followUpSuggestions
            : undefined,
        mode: data.mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setRobotState('speaking');
      window.setTimeout(() => {
        setRobotState((prev) => (prev === 'speaking' ? 'idle' : prev));
      }, 2200);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;

      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          err?.message ||
          'ارتباط با سرور دچار اختلال شد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        retryPrompt: trimmed,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setRobotState('idle');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleActionClick = (action: ChatActionButton) => {
    if (action.type === 'call_clinic' && action.url) {
      window.location.href = action.url;
    } else if (
      (action.type === 'open_google_maps' ||
        action.type === 'open_neshan' ||
        action.type === 'open_balad') &&
      action.url
    ) {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'open_booking') {
      resetSessionState();
      onClose();
      onOpenBooking(action.serviceId);
    } else if (action.type === 'open_cost_calculator') {
      resetSessionState();
      onClose();
      onOpenCostCalculator();
    } else if (action.type === 'navigate_contact') {
      resetSessionState();
      onClose();
      onNavigatePage('contact');
    } else if (action.type === 'navigate_services') {
      resetSessionState();
      onClose();
      onNavigatePage('services');
    } else if (action.type === 'navigate_gallery') {
      resetSessionState();
      onClose();
      onNavigatePage('gallery');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop & Dialog Container */}
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-dialog-title"
        className="fixed inset-0 z-50 flex items-end md:items-end justify-center md:justify-start md:p-5 pointer-events-auto"
      >
        {/* Backdrop Overlay (Clicking outside triggers standard quick close) */}
        <div
          onClick={handleQuickClose}
          className={`fixed inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity duration-300 ${
            isExiting ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />

        {/* Chat Window Panel: Full-screen safe sheet on mobile, Floating panel on desktop */}
        <section
          className={`relative z-10 w-full h-[100dvh] md:h-[min(680px,88vh)] md:w-[430px] lg:w-[450px] bg-[#f7f9fb] md:rounded-3xl shadow-2xl border border-[#c3c6d7]/50 flex flex-col overflow-hidden transition-all duration-300 ${
            isExiting && farewellStep === 'glide_out'
              ? 'opacity-0 translate-y-4 scale-95'
              : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          {/* ================= A) TOP HEADER ================= */}
          <div className="bg-gradient-to-l from-[#004ac6] via-[#1d56d4] to-[#2563eb] text-white px-4 py-3.5 shrink-0 shadow-sm relative overflow-hidden">
            {/* Subtle decorative mesh */}
            <div className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Small Robot / AI Badge in Header */}
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-xs font-black tracking-wider text-white">AI</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2
                      id="ai-assistant-dialog-title"
                      className="text-sm sm:text-base font-extrabold text-white truncate"
                    >
                      دستیار هوشمند دکتر شمس‌پور
                    </h2>
                    {/* Live Status Indicator */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-emerald-100 border border-white/20">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLoading
                            ? 'bg-amber-300 animate-ping'
                            : 'bg-emerald-400 animate-pulse'
                        }`}
                      />
                      <span>{isLoading ? 'در حال پاسخ...' : 'آنلاین'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium mt-0.5 leading-snug">
                    درباره خدمات، نمونه‌کارها و مراقبت‌های دندانپزشکی از من بپرسید.
                  </p>
                </div>
              </div>

              {/* Dedicated Close Button (×) with Farewell Sequence */}
              <button
                type="button"
                onClick={handleCloseButtonFarewell}
                disabled={isExiting}
                aria-label="بستن پنجره دستیار هوشمند"
                title="بستن گفتگو"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center text-xl font-bold leading-none transition-all cursor-pointer shrink-0"
              >
                ×
              </button>
            </div>
          </div>

          {/* ================= B) INTERACTIVE 3D ROBOT STAGE BAR ================= */}
          <div className="bg-white border-b border-[#c3c6d7]/40 px-4 py-2 shrink-0 flex items-center justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <AiRobotAvatar state={robotState} farewellStep={farewellStep} compact />

              <div className="min-w-0 flex-1">
                {isExiting ? (
                  <div className="bg-[#dbe1ff]/60 border border-[#004ac6]/25 rounded-2xl px-3 py-2 text-xs font-extrabold text-[#004ac6] animate-bounce">
                    خوشحال شدم کمکتون کنم! 👋
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#004ac6] flex items-center gap-1.5">
                      <span>در حال تحلیل و جستجو در اطلاعات کلینیک...</span>
                    </span>
                    <span className="text-[10px] text-[#565e74] mt-0.5">
                      زمان سپری‌شده: {new Intl.NumberFormat('fa-IR').format(processingSeconds)} ثانیه
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#191c1e]">
                      راهنمای دیجیتال کلینیک دندان‌پزشکی پارمیس
                    </span>
                    <span className="text-[10px] text-[#565e74] truncate">
                      پاسخگویی بر اساس اطلاعات تأییدشده مطب و نمونه‌کارهای واقعی
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Portfolio Filter Trigger */}
            {!isExiting && (
              <button
                type="button"
                onClick={() => sendMessage('دیدن نمونه‌کارها')}
                disabled={isLoading}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#dbe1ff]/60 hover:bg-[#dbe1ff] text-[#004ac6] text-[10px] font-bold transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">photo_library</span>
                <span>نمونه‌کارها</span>
              </button>
            )}
          </div>

          {/* ================= C) CONVERSATION MESSAGES AREA ================= */}
          <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-4 space-y-4 scroll-smooth overscroll-contain">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} w-full`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[92%] sm:max-w-[88%] ${
                      isUser ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                        isUser
                          ? 'bg-[#004ac6] text-white'
                          : 'bg-[#dbe1ff] text-[#004ac6] border border-[#004ac6]/20'
                      }`}
                    >
                      {isUser ? (
                        <span className="material-symbols-outlined text-[15px]">person</span>
                      ) : (
                        <span className="text-[10px] font-black">AI</span>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-[#004ac6] text-white rounded-br-xs font-medium'
                          : msg.isError
                          ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-xs'
                          : 'bg-white text-[#191c1e] border border-[#c3c6d7]/40 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line break-words">{msg.content}</div>

                      {/* Error Retry Button */}
                      {msg.isError && msg.retryPrompt && (
                        <div className="mt-2.5 pt-2 border-t border-red-200/70 flex justify-end">
                          <button
                            type="button"
                            onClick={() => sendMessage(msg.retryPrompt!)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                            <span>تلاش مجدد</span>
                          </button>
                        </div>
                      )}

                      {/* Timestamp & Source Mode */}
                      <div
                        className={`mt-1.5 flex items-center justify-between gap-2 text-[9px] ${
                          isUser ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.mode && (
                          <span className="text-[9px] font-semibold">
                            {msg.mode === 'gemini' ? 'پاسخ هوش مصنوعی' : 'پایگاه دانش تأییدشده کلینیک'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Starter Suggestions directly under the first Welcome Message */}
                  {idx === 0 && messages.length === 1 && !isLoading && (
                    <div className="w-full mt-3 pr-1">
                      <p className="text-[11px] font-bold text-[#565e74] mb-2">
                        پیشنهادهای آماده برای شروع گفتگو:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {STARTER_SUGGESTIONS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => sendMessage(item.label)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#dbe1ff]/60 border border-[#c3c6d7]/60 hover:border-[#004ac6]/40 text-[#191c1e] hover:text-[#004ac6] text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px] text-[#004ac6]">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Read-only Doctor Profile Card when user asks for Doctor's photo or bio */}
                  {!isUser && msg.doctorCard && (
                    <div className="w-full mt-3 bg-white rounded-2xl border border-[#c3c6d7]/60 overflow-hidden shadow-xs flex flex-col sm:flex-row items-center gap-3.5 p-3.5 text-right">
                      <img
                        src={msg.doctorCard.image}
                        alt={msg.doctorCard.name}
                        className="w-24 h-28 sm:w-24 sm:h-28 rounded-xl object-cover border border-[#dbe1ff] shrink-0 shadow-xs"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="text-xs font-extrabold text-[#191c1e]">{msg.doctorCard.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#dbe1ff]/60 text-[#004ac6] text-[10px] font-bold">
                            نظام پزشکی: {msg.doctorCard.medicalCouncilCode}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#004ac6]">{msg.doctorCard.role}</p>
                        <p className="text-[10px] font-semibold text-emerald-700">{msg.doctorCard.experience}</p>
                        <p className="text-[11px] text-[#565e74] leading-relaxed line-clamp-3">{msg.doctorCard.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Real Portfolio Cases Gallery attached to Assistant Message */}
                  {!isUser && msg.cases && msg.cases.length > 0 && (
                    <div className="w-full mt-3 space-y-2.5">
                      {/* Quick Category Pills for Portfolio */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {PORTFOLIO_QUICK_FILTERS.map((filterLabel) => (
                          <button
                            key={filterLabel}
                            type="button"
                            onClick={() => sendMessage(filterLabel)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-[#dbe1ff]/60 border border-[#c3c6d7]/60 text-[#004ac6] text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                          >
                            {filterLabel}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {msg.cases.map((caseItem) => (
                          <ChatPortfolioCard
                            key={caseItem.id}
                            item={caseItem}
                            onInspect={(item, stage) => setLightboxData({ item, stage })}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Contact / Booking / Routing Action Buttons */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="w-full mt-2.5 flex flex-wrap gap-1.5">
                      {msg.actions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
                            act.type === 'call_clinic' || act.type === 'open_booking'
                              ? 'bg-[#004ac6] hover:bg-[#2563eb] text-white'
                              : 'bg-white hover:bg-[#dbe1ff]/50 text-[#004ac6] border border-[#004ac6]/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">{act.icon}</span>
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Suggestions */}
                  {!isUser &&
                    idx === messages.length - 1 &&
                    msg.followUpSuggestions &&
                    msg.followUpSuggestions.length > 0 &&
                    !isLoading && (
                      <div className="w-full mt-2.5 flex flex-wrap gap-1.5">
                        {msg.followUpSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => sendMessage(sug)}
                            className="px-2.5 py-1 rounded-full bg-[#eceef0] hover:bg-[#dbe1ff] text-[#565e74] hover:text-[#004ac6] text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}

            {/* Thinking / Processing Bubble */}
            {isLoading && (
              <div className="flex items-end gap-2 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center shrink-0 text-[10px] font-black">
                  AI
                </div>
                <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-[#004ac6] animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-[#004ac6] animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#565e74]">
                    دستیار هوشمند در حال فکر کردن...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ================= D) INPUT COMPOSER AREA ================= */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white border-t border-[#c3c6d7]/40 p-2.5 sm:p-3 shrink-0 pb-[max(0.65rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-end gap-2 bg-[#f2f4f6] border border-[#c3c6d7]/60 focus-within:border-[#004ac6] focus-within:bg-white rounded-2xl px-3 py-1.5 transition-colors">
              <textarea
                ref={textareaRef}
                rows={1}
                 dir="rtl"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDownInput}
                disabled={isLoading || isExiting}
                placeholder="سؤال خود را درباره خدمات، نمونه‌کارها یا نوبت بنویسید..."
                aria-label="متن پیام به دستیار هوشمند"
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#191c1e] placeholder:text-slate-400 focus:outline-none resize-none max-h-24 py-1 leading-relaxed"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || isExiting}
                aria-label="ارسال پیام"
                className="w-9 h-9 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:bg-slate-300 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px] rotate-180">send</span>
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[9px] text-slate-400">
              <span>پاسخ‌ها جنبه راهنمایی داشته و جایگزین معاینه پزشک نیستند.</span>
              <span className="hidden sm:inline">ارسال با Enter • خط جدید با Shift+Enter</span>
            </div>
          </form>
        </section>
      </div>

      {/* ================= FULLSCREEN PORTFOLIO IMAGE LIGHTBOX ================= */}
      {lightboxData && (
        <div
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label={`تصویر بزرگ‌شده ${lightboxData.item.title}`}
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxData(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/95 border-b border-white/10 text-white">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#004ac6] text-white">
                    {lightboxData.item.categoryLabel}
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold truncate">
                    {lightboxData.item.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxData(null)}
                aria-label="بستن تصویر بزرگ‌شده"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Lightbox Image Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center justify-center bg-black/40">
              {lightboxData.stage === 'split' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950">
                    <img
                      src={lightboxData.item.beforeImage}
                      alt={`${lightboxData.item.title} - قبل از درمان`}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/85 text-white">
                      {lightboxData.item.beforeLabel || 'قبل از درمان'}
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-[#004ac6]/60 bg-slate-950">
                    <img
                      src={lightboxData.item.afterImage}
                      alt={`${lightboxData.item.title} - بعد از درمان`}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-[#004ac6] text-white">
                      {lightboxData.item.afterLabel || 'بعد از درمان'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-h-[62vh] rounded-2xl overflow-hidden flex items-center justify-center bg-slate-950">
                  <img
                    src={
                      lightboxData.stage === 'after'
                        ? lightboxData.item.afterImage
                        : lightboxData.item.beforeImage
                    }
                    alt={lightboxData.item.title}
                    className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl"
                  />
                  <span
                    className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                      lightboxData.stage === 'after' ? 'bg-[#004ac6]' : 'bg-slate-900/85'
                    }`}
                  >
                    {lightboxData.stage === 'after'
                      ? lightboxData.item.afterLabel || 'بعد از درمان'
                      : lightboxData.item.beforeLabel || 'قبل از درمان'}
                  </span>
                </div>
              )}

              {/* Switch Stage Controls */}
              <div className="mt-4 flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => setLightboxData({ ...lightboxData, stage: 'split' })}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    lightboxData.stage === 'split'
                      ? 'bg-[#004ac6] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  مقایسه کنار هم
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxData({ ...lightboxData, stage: 'before' })}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    lightboxData.stage === 'before'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  تصویر قبل از درمان
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxData({ ...lightboxData, stage: 'after' })}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    lightboxData.stage === 'after'
                      ? 'bg-[#004ac6] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  تصویر بعد از درمان
                </button>
              </div>
            </div>

            {/* Lightbox Footer Caption */}
            <div className="px-4 py-3 bg-slate-900 border-t border-white/10 text-slate-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="leading-relaxed">{lightboxData.item.description}</p>
              {lightboxData.item.guaranteeText && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold shrink-0">
                  ✓ {lightboxData.item.guaranteeText}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
