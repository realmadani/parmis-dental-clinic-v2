import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Image as ImageIcon,
  Video,
  Mic,
  Square,
  Check,
  X,
  Paperclip,
  Volume2,
  Wand2,
  ShieldCheck,
  TrendingUp,
  Bug,
  FileText,
  Clock,
} from 'lucide-react';
import { AiRobotAvatar, RobotState } from './AiRobotAvatar.tsx';

export interface AiAdminProposal {
  id: string;
  title: string;
  category: 'seo' | 'content' | 'media' | 'clinic' | 'engagement' | 'pricing' | 'bugfix';
  categoryLabel: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedImpact: string;
  actionType: string;
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  executedAt?: string;
}

export interface ChatAttachmentItem {
  id: string;
  url?: string;
  mimeType: string;
  name: string;
  base64Data?: string;
  previewUrl: string;
}

interface AdminChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: ChatAttachmentItem[];
  proposals?: AiAdminProposal[];
  executedActions?: string[];
}

interface AdminAiCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onCmsUpdated: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'تحلیل کامل سئو و ارائه ایده‌های خلاقانه و فنی برای رتبه ۱ گوگل',
    prompt: 'سایت رو از نظر سئو کامل تحلیل کن و ایده‌های خلاقانه و فنی برای رسیدن به رتبه یک گوگل بده تا بعد از تاییدم پیاده‌سازی کنی.',
  },
  {
    icon: Bug,
    label: 'بررسی فنی کل سایت، شناسایی باگ‌ها و رفع خودکار پس از تأیید',
    prompt: 'کل سایت رو از هر نظری تحلیل و بررسی کن، باگ‌ها یا ناهماهنگی‌ها (مثل عکس دکتر شمس‌پور، اسلاگ‌ها و تگ‌های Alt) رو پیدا کن و پیشنهاد رفعشون رو بده تا تایید کنم.',
  },
  {
    icon: FileText,
    label: 'نگارش و انتشار مقاله علمی سئو شده جدید در وبلاگ',
    prompt: 'یک مقاله علمی، جامع و سئو شده درباره ایمپلنت دیجیتال و طراحی لبخند آماده کن تا با تایید من در سایت منتشر بشه.',
  },
  {
    icon: Clock,
    label: 'تنظیم انتشار خودکار روزانه پست و مقاله سر ساعت مشخص',
    prompt: 'می‌خوام هر روز سر ساعت ۱۰:۰۰ صبح به صورت خودکار یک مقاله و پست سئو شده در سایت منتشر کنی.',
  },
];

export const AdminAiCopilot: React.FC<AdminAiCopilotProps> = ({
  isOpen,
  onClose,
  token,
  onCmsUpdated,
  addToast,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [robotState, setRobotState] = useState<RobotState>('entering');

  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<AdminChatMsg[]>([]);

  // Multimodal attachments state (Image, Audio, Video)
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachmentItem[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // Live Voice Recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Smooth open/close animation from under the AI header icon
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setRobotState('entering');
      const raf = requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
      const t1 = window.setTimeout(() => setRobotState('greeting'), 200);
      const t2 = window.setTimeout(() => setRobotState('idle'), 2200);
      const t3 = window.setTimeout(() => inputTextareaRef.current?.focus(), 320);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    } else {
      setIsAnimatingIn(false);
      const t = window.setTimeout(() => setIsVisible(false), 280);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  // Escape key to close popup
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages, isChatLoading, isOpen]);

  const fileToBase64 = (file: File | Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (file: File, categoryLabel: string) => {
    setIsUploadingAttachment(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      let base64Data: string | undefined;
      if (file.size <= 12 * 1024 * 1024) {
        base64Data = await fileToBase64(file);
      }

      // Also upload to /api/media so it gets a permanent server URL if the admin wants to use it on the site
      let uploadedServerUrl: string | undefined;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'upload');
      formData.append('title', file.name || categoryLabel);
      formData.append('alt', `${file.name} - کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور`);

      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        uploadedServerUrl = data.media?.url;
        onCmsUpdated();
      }

      const item: ChatAttachmentItem = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: uploadedServerUrl,
        mimeType: file.type || 'application/octet-stream',
        name: file.name || categoryLabel,
        base64Data,
        previewUrl: uploadedServerUrl || previewUrl,
      };

      setPendingAttachments((prev) => [...prev, item]);
      addToast('success', `${categoryLabel} آماده ارسال به هوش مصنوعی شد.`);
    } catch (err: any) {
      addToast('error', err.message || 'خطا در پیوست فایل');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  // Live Microphone Voice Recorder
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingSeconds(0);

        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          const audioFile = new File([audioBlob], `voice-command-${Date.now()}.webm`, {
            type: 'audio/webm',
          });
          await handleFileUpload(audioFile, 'پیام صوتی');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      addToast('error', 'دسترسی به میکروفون امکان‌پذیر نیست یا توسط مرورگر مسدود شده است. می‌توانید فایل صوتی آپلود کنید.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const handleSendChat = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : chatInput).trim();
    if ((!textToSend && pendingAttachments.length === 0) || isChatLoading) return;

    const currentAttachments = [...pendingAttachments];
    const userMsg: AdminChatMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content:
        textToSend ||
        `فایل پیوست‌شده (${currentAttachments.map((a) => a.name).join('، ')}) را بررسی و تحلیل کن.`,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const historyPayload = chatMessages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setChatMessages((prev) => [...prev, userMsg]);
    if (customText === undefined) setChatInput('');
    setPendingAttachments([]);
    setIsChatLoading(true);
    setRobotState('thinking');

    try {
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg.content,
          history: historyPayload,
          attachments: currentAttachments.map((a) => ({
            url: a.url,
            mimeType: a.mimeType,
            name: a.name,
            base64Data: a.base64Data,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'خطا در دریافت پاسخ از هوش مصنوعی');
      }

      if (Array.isArray(data.executedActions) && data.executedActions.length > 0) {
        onCmsUpdated();
      }

      const assistantMsg: AdminChatMsg = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        proposals:
          Array.isArray(data.newProposals) && data.newProposals.length > 0
            ? data.newProposals
            : undefined,
        executedActions:
          Array.isArray(data.executedActions) && data.executedActions.length > 0
            ? data.executedActions
            : undefined,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setRobotState('speaking');
      window.setTimeout(() => setRobotState('idle'), 2400);
    } catch (err: any) {
      setRobotState('idle');
      addToast('error', err.message || 'خطا در ارتباط با هوش مصنوعی');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleApproveProposal = async (proposalId: string) => {
    setApprovingId(proposalId);
    setRobotState('thinking');
    try {
      const res = await fetch(`/api/admin/ai/proposals/${proposalId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در اجرای پیشنهاد');

      setChatMessages((prev) =>
        prev.map((m) => ({
          ...m,
          proposals: m.proposals?.map((p) =>
            p.id === proposalId
              ? { ...p, status: 'approved', executedAt: new Date().toLocaleString('fa-IR') }
              : p
          ),
        }))
      );

      // Append a confirmation message in the chat
      setChatMessages((prev) => [
        ...prev,
        {
          id: `exec-${Date.now()}`,
          role: 'assistant',
          content: `✅ **با موفقیت انجام شد!**\n${data.message}`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setRobotState('speaking');
      window.setTimeout(() => setRobotState('idle'), 2000);
      onCmsUpdated();
      addToast('success', data.message || 'تغییرات با موفقیت در سایت اعمال شد!');
    } catch (err: any) {
      setRobotState('idle');
      addToast('error', err.message || 'خطا در پیاده‌سازی پیشنهاد');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await fetch(`/api/admin/ai/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatMessages((prev) =>
        prev.map((m) => ({
          ...m,
          proposals: m.proposals?.map((p) =>
            p.id === proposalId ? { ...p, status: 'rejected' } : p
          ),
        }))
      );
      addToast('info', 'پیشنهاد لغو شد.');
    } catch {
      addToast('error', 'خطا در لغو پیشنهاد');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col bg-[#0b1120]/95 backdrop-blur-xl text-white font-sans transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top-left ${
        isAnimatingIn
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-90 -translate-y-6 pointer-events-none'
      }`}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="دستیار هوش مصنوعی مدیر سایت"
    >
      {/* Hidden File Inputs for Image, Audio, Video */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f, 'تصویر');
          e.target.value = '';
        }}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f, 'فایل صوتی');
          e.target.value = '';
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f, 'ویدیو');
          e.target.value = '';
        }}
      />

      {/* Ambient Subtle Glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-[#004ac6]/25 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />

      {/* Top Bar with Close Button */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-gradient-to-tr from-[#004ac6] via-[#2563eb] to-[#38bdf8] text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-pulse" />
            <span className="text-xs font-black tracking-wider">AI</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>هوش مصنوعی مدیر سایت و سئو</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                دسترسی کامل به بک‌اند
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              تحلیل و بهینه‌سازی سئو • رفع باگ‌ها پس از تأیید • ایده‌پردازی رتبه ۱ گوگل • پشتیبانی تصویر، صدا و ویدیو
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && (
            <button
              type="button"
              onClick={() => setChatMessages([])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              گفتگوی جدید
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره هوش مصنوعی"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/90 text-white text-xs font-extrabold border border-white/15 transition-all cursor-pointer active:scale-95"
          >
            <span>بستن</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col">
        {chatMessages.length === 0 ? (
          /* Centered Welcome State: «خوش اومدی، چه کاری برات انجام بدم؟» */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center">
            <div className="w-32 h-32 sm:w-36 sm:h-36 mb-4 flex items-center justify-center">
              <AiRobotAvatar state={robotState} />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
              خوش اومدی، چه کاری برات انجام بدم؟
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mb-8">
              من دستیار هوش مصنوعی مدیریت سایت دکتر انوشیروان شمس‌پور هستم. می‌توانی با من چت کنی، عکس، صدا یا ویدیو بفرستی، یا از من بخواهی سئو و باگ‌های سایت را تحلیل کنم و پس از تأییدت خودکار پیاده‌سازی کنم.
            </p>

            {/* Quick Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl text-right">
              {STARTER_PROMPTS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(item.prompt)}
                    className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-400/50 transition-all flex items-start gap-3.5 text-right cursor-pointer shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#38bdf8] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors block leading-snug">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        کلیک کنید تا تحلیل و پیشنهادهای اجرایی آماده شود
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Conversation Stream */
          <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start gap-3 max-w-[94%] sm:max-w-[85%]">
                    {!isUser && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#004ac6] to-[#38bdf8] flex items-center justify-center shrink-0 mt-1 shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`rounded-3xl px-5 py-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-[#004ac6] text-white rounded-tr-xs'
                          : 'bg-slate-800/90 text-slate-100 border border-white/10 rounded-tl-xs'
                      }`}
                    >
                      {/* Render Attached Images / Audio / Video */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2.5">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="rounded-2xl overflow-hidden border border-white/20 bg-black/30 max-w-xs"
                            >
                              {att.mimeType.startsWith('image/') ? (
                                <img
                                  src={att.previewUrl}
                                  alt={att.name}
                                  className="max-h-48 w-auto object-cover"
                                />
                              ) : att.mimeType.startsWith('video/') ? (
                                <video
                                  src={att.previewUrl}
                                  controls
                                  className="max-h-48 w-auto"
                                />
                              ) : att.mimeType.startsWith('audio/') ? (
                                <div className="p-2.5 flex flex-col gap-1.5">
                                  <span className="text-[11px] text-sky-200 font-bold flex items-center gap-1">
                                    <Volume2 className="w-3.5 h-3.5" />
                                    {att.name}
                                  </span>
                                  <audio src={att.previewUrl} controls className="h-8 w-56" />
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="whitespace-pre-line">{msg.content}</div>
                      <div className="text-[10px] opacity-60 mt-2">{msg.timestamp}</div>
                    </div>
                  </div>

                  {/* Interactive Approval Cards for Site Changes / SEO / Bug Fixes */}
                  {!isUser && msg.proposals && msg.proposals.length > 0 && (
                    <div className="w-full max-w-[94%] sm:max-w-[82%] mt-3 space-y-3">
                      {msg.proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border-2 border-sky-400/40 shadow-xl space-y-3 text-right"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[11px] font-extrabold">
                              ⚡ پیشنهاد آماده پیاده‌سازی • {prop.categoryLabel}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-400">
                              🎯 {prop.expectedImpact}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-extrabold text-white">
                            {prop.title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {prop.description}
                          </p>

                          {prop.status === 'approved' ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>تأیید شد و در سایت پیاده‌سازی گردید ({prop.executedAt})</span>
                            </div>
                          ) : prop.status === 'rejected' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs font-bold">
                              <XCircle className="w-4 h-4" />
                              <span>لغو شده</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleApproveProposal(prop.id)}
                                disabled={approvingId === prop.id}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                              >
                                {approvingId === prop.id ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>در حال اعمال در سایت...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>تأیید و پیاده‌سازی خودکار در سایت</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectProposal(prop.id)}
                                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-bold cursor-pointer transition-colors"
                              >
                                رد پیشنهاد
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex justify-end">
                <div className="bg-slate-800/90 border border-white/10 rounded-2xl px-4 py-3 text-xs text-sky-200 flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>در حال تحلیل سایت و آماده‌سازی پاسخ...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Multimodal Chat Composer (Image + Audio/Voice + Video + Text) */}
      <div className="relative z-10 border-t border-white/10 bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Pending Attachments Preview Strip */}
          {pendingAttachments.length > 0 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="relative group flex items-center gap-2 bg-slate-800 border border-sky-400/40 rounded-xl p-2 pr-3 text-xs text-white shrink-0"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : att.mimeType.startsWith('video/') ? (
                    <Video className="w-5 h-5 text-sky-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <span className="max-w-[140px] truncate text-[11px] font-bold">{att.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAttachments((prev) => prev.filter((item) => item.id !== att.id))
                    }
                    className="p-1 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white cursor-pointer"
                    title="حذف پیوست"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Composer Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 bg-slate-800/90 border border-white/15 focus-within:border-sky-400 rounded-2xl p-2 shadow-lg transition-colors"
          >
            {/* Media Upload Buttons: Image, Video, Audio File, Live Voice Record */}
            <div className="flex items-center gap-1 shrink-0 px-1">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingAttachment || isChatLoading}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-sky-300 text-[11px] font-bold transition-colors cursor-pointer"
                title="آپلود تصویر"
              >
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">تصویر</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploadingAttachment || isChatLoading}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-indigo-300 text-[11px] font-bold transition-colors cursor-pointer"
                title="آپلود ویدیو"
              >
                <Video className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline">ویدیو</span>
              </button>

              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={isUploadingAttachment || isChatLoading}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                title="آپلود فایل صوتی"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">فایل صوتی</span>
              </button>

              {isRecordingAudio ? (
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold animate-pulse cursor-pointer"
                  title="توقف ضبط و پیوست صدا"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>توقف ({recordingSeconds}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  disabled={isUploadingAttachment || isChatLoading}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-rose-300 text-[11px] font-bold transition-colors cursor-pointer"
                  title="ضبط مستقیم صدا با میکروفون"
                >
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span className="hidden md:inline">ضبط صدا</span>
                </button>
              )}
            </div>

            {/* Text Input */}
            <textarea
              ref={inputTextareaRef}
              rows={1}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder="هر کاری می‌خواهید بنویسید (تحلیل سئو، رفع باگ، ایده رتبه ۱ گوگل، انتشار مقاله، تغییر عکس یا متن...) یا فایل بفرستید"
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none resize-none max-h-32"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!chatInput.trim() && pendingAttachments.length === 0) || isChatLoading || isUploadingAttachment}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-tr from-[#004ac6] via-[#2563eb] to-[#38bdf8] hover:opacity-95 disabled:opacity-40 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
            >
              {isUploadingAttachment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>آپلود...</span>
                </>
              ) : (
                <>
                  <span>ارسال</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
