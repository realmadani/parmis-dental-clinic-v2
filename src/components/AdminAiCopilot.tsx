import React, { useState, useEffect, useRef } from 'react';
import {
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
  Volume2,
  Wand2,
  TrendingUp,
  Bug,
  FileText,
  Link2,
  ExternalLink,
  Copy,
  Globe,
} from 'lucide-react';
import { AiRobotAvatar, RobotState } from './AiRobotAvatar.tsx';
import { useCMS } from '../context/CMSContext.tsx';

export interface AiBacklinkPlacement {
  platformName: string;
  platformDomain: string;
  liveUrl: string;
  articleTitle: string;
  anchorUsed: string;
  targetUrl: string;
  linkType: 'dofollow-contextual' | 'rss-syndication' | 'search-ping';
  status: 'published_live' | 'indexed';
}

export interface AiBacklinkCampaign {
  id: string;
  createdAt: string;
  targetPageKey: string;
  targetPageName: string;
  targetUrl: string;
  trackedTargetUrl: string;
  primaryAnchorText: string;
  secondaryAnchors: string[];
  researchedKeywords: string[];
  competitorInsight: string;
  articleTitle: string;
  articleSummary: string;
  articleHtml: string;
  articleMarkdown: string;
  livePlacements: AiBacklinkPlacement[];
  syndicationPlatforms: Array<{
    name: string;
    domain: string;
    submitUrl: string;
    guide: string;
  }>;
}

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
  backlinks?: AiBacklinkCampaign[];
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
    icon: Globe,
    label: 'سئو اتوماتیک و ثبت مقاله بک‌لینک در وبلاگ‌های عمومی',
    prompt:
      'سئو اتوماتیک انجام بده؛ یک لینک هدف بساز، روی کلمات کلیدی تحقیق کن و توی سایت‌های مرتبط و وبلاگ‌های عمومی مقاله بنویس و بک‌لینک بده به صفحه خدمات و صفحه اصلی سایت.',
  },
  {
    icon: Wand2,
    label: 'شخصی‌سازی طراحی UI/UX و تغییر پالت رنگ سایت',
    prompt:
      'به عنوان طراح UI/UX، ظاهر سایت رو بررسی کن و تم رنگی و استایل کارت‌ها رو شخصی‌سازی کن (یا پیشنهادهای طراحی مدرن بده).',
  },
  {
    icon: FileText,
    label: 'تولید و بارگذاری خودکار مقالات سئو شده در وبلاگ',
    prompt:
      'اتوماتیک ۲ مقاله علمی، جامع و سئو شده درباره ایمپلنت دیجیتال و طراحی لبخند تولید کن و مستقیم در وبلاگ سایت لود کن.',
  },
  {
    icon: Bug,
    label: 'بررسی کامل بک‌اند، ویرایش، حذف یا رفع باگ‌های سایت',
    prompt:
      'بک‌اند و دیتابیس کل سایت رو کامل بررسی کن، باگ‌ها یا ناهماهنگی‌ها رو پیدا کن و گزارش بده تا اصلاح یا حذف و اضافه کنیم.',
  },
];

export const AdminAiCopilot: React.FC<AdminAiCopilotProps> = ({
  isOpen,
  onClose,
  token,
  onCmsUpdated,
  addToast,
}) => {
  const { refreshCMS } = useCMS();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [robotState, setRobotState] = useState<RobotState>('entering');

  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setRobotState('entering');
      const raf = requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
      const t1 = window.setTimeout(() => setRobotState('greeting'), 180);
      const t2 = window.setTimeout(() => setRobotState('idle'), 1800);
      const t3 = window.setTimeout(() => inputTextareaRef.current?.focus(), 280);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    } else {
      setIsAnimatingIn(false);
      const t = window.setTimeout(() => setIsVisible(false), 240);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

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

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      addToast('success', `${label} با موفقیت کپی شد.`);
      window.setTimeout(() => setCopiedId((prev) => (prev === key ? null : prev)), 2200);
    } catch {
      addToast('error', 'خطا در کپی متن');
    }
  };

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
      addToast('success', `${categoryLabel} آماده ارسال شد.`);
    } catch (err: any) {
      addToast('error', err.message || 'خطا در پیوست فایل');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

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
      addToast('error', 'دسترسی به میکروفون امکان‌پذیر نیست. می‌توانید فایل صوتی آپلود کنید.');
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
        await refreshCMS();
        addToast('success', 'عملیات هوش مصنوعی با موفقیت اجرا و اعمال شد!');
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
        backlinks:
          Array.isArray(data.newBacklinks) && data.newBacklinks.length > 0
            ? data.newBacklinks
            : undefined,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setRobotState('speaking');
      window.setTimeout(() => setRobotState('idle'), 2000);
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

      setChatMessages((prev) => [
        ...prev,
        {
          id: `exec-${Date.now()}`,
          role: 'assistant',
          content: `✅ **با موفقیت در سایت اعمال شد!**\n${data.message}`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          executedActions: [data.message],
          backlinks:
            Array.isArray(data.newBacklinks) && data.newBacklinks.length > 0
              ? data.newBacklinks
              : undefined,
        },
      ]);

      setRobotState('speaking');
      window.setTimeout(() => setRobotState('idle'), 1800);
      onCmsUpdated();
      await refreshCMS();
      addToast('success', data.message || 'تغییرات با موفقیت در سایت اعمال شد!');
    } catch (err: any) {
      setRobotState('idle');
      addToast('error', err.message || 'خطا در پیاده‌سازی پیشنهاد');
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveAllProposals = async () => {
    setIsApprovingAll(true);
    setRobotState('thinking');
    try {
      const res = await fetch('/api/admin/ai/proposals/approve-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در اجرای یکجای پیشنهادها');

      const nowStr = new Date().toLocaleString('fa-IR');
      setChatMessages((prev) =>
        prev.map((m) => ({
          ...m,
          proposals: m.proposals?.map((p) =>
            p.status === 'pending' ? { ...p, status: 'approved', executedAt: nowStr } : p
          ),
        }))
      );

      const msgs: string[] = Array.isArray(data.messages)
        ? data.messages
        : ['تمامی پیشنهادها با موفقیت در سایت اعمال شدند.'];
      setChatMessages((prev) => [
        ...prev,
        {
          id: `exec-all-${Date.now()}`,
          role: 'assistant',
          content: `✅ **تمامی پیشنهادها با موفقیت در سایت پیاده‌سازی شدند!**\n\n${msgs.join('\n\n')}`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          executedActions: msgs,
          backlinks:
            Array.isArray(data.newBacklinks) && data.newBacklinks.length > 0
              ? data.newBacklinks
              : undefined,
        },
      ]);

      setRobotState('speaking');
      window.setTimeout(() => setRobotState('idle'), 1800);
      onCmsUpdated();
      await refreshCMS();
      addToast('success', 'تمامی پیشنهادها با موفقیت در سایت اعمال شدند!');
    } catch (err: any) {
      setRobotState('idle');
      addToast('error', err.message || 'خطا در اجرای یکجای پیشنهادها');
    } finally {
      setIsApprovingAll(false);
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
      className={`fixed inset-0 z-[100] flex flex-col bg-[#f7f9fb] text-[#191c1e] font-sans transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] origin-bottom-left ${
        isAnimatingIn
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      }`}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="دستیار هوش مصنوعی مدیر سایت"
    >
      {/* Hidden File Inputs */}
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

      {/* Minimalist Top Header Inheriting Site Design System (No Duplicate AI Icon) */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 bg-white border-b border-[#c3c6d7]/40 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isChatLoading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
            }`}
          />
          <h2 className="text-sm font-extrabold text-[#191c1e]">دستیار هوشمند مدیر سایت</h2>
          <span className="text-xs text-[#565e74] hidden sm:inline">
            · کنترل کامل سایت، UI/UX و سئو اتوماتیک
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleSendChat(
                'یک لینک هدف بساز، تحقیق کن و توی وبلاگ‌های عمومی مقاله بنویس و بک‌لینک بده به صفحه خدمات سایت.'
              )
            }
            disabled={isChatLoading}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#dbe1ff]/50 hover:bg-[#dbe1ff] text-[#004ac6] text-xs font-bold transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>ساخت بک‌لینک خودکار</span>
          </button>

          {chatMessages.length > 0 && (
            <button
              type="button"
              onClick={() => setChatMessages([])}
              className="px-3 py-1.5 rounded-xl bg-[#f2f4f6] hover:bg-[#eceef0] text-[#434655] text-xs font-bold transition-colors cursor-pointer"
            >
              گفتگوی جدید
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره هوش مصنوعی"
            className="w-8 h-8 rounded-xl bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {chatMessages.length === 0 ? (
          /* Minimalist Centered Welcome State with Single Interactive Robot */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full text-center">
            <div className="mb-5">
              <AiRobotAvatar
                state={robotState}
                size="lg"
                isUserTyping={chatInput.trim().length > 0}
                contextMode="admin"
                onInteractPrompt={(prompt) => handleSendChat(prompt)}
              />
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight mb-2">
              خوش اومدی، چه کاری برات انجام بدم؟
            </h1>
            <p className="text-xs sm:text-sm text-[#565e74] max-w-lg leading-relaxed mb-7">
              مدیریت کامل محتوا و بک‌اند، شخصی‌سازی طراحی UI/UX، بارگذاری خودکار مقاله و لینک‌سازی زنده سئو در وبلاگ‌های عمومی.
            </p>

            {/* Minimalist Starter Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-right">
              {STARTER_PROMPTS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(item.prompt)}
                    className="group p-3.5 rounded-2xl bg-white hover:bg-[#dbe1ff]/25 border border-[#c3c6d7]/50 hover:border-[#004ac6]/40 transition-all flex items-center gap-3 text-right cursor-pointer shadow-2xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#dbe1ff]/60 text-[#004ac6] flex items-center justify-center shrink-0 group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#191c1e] group-hover:text-[#004ac6] transition-colors leading-snug">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Minimalist Conversation Stream: Single Interactive AI Icon ONLY before the first chat bubble */
          <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="flex flex-col items-center justify-center pb-2">
              <AiRobotAvatar
                state={robotState}
                size="md"
                isUserTyping={chatInput.trim().length > 0}
                contextMode="admin"
                onInteractPrompt={(prompt) => handleSendChat(prompt)}
              />
            </div>

            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#004ac6] text-white rounded-tr-xs shadow-2xs'
                          : 'bg-white text-[#191c1e] border border-[#c3c6d7]/50 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {/* Render Attached Images / Audio / Video */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2.5 flex flex-wrap gap-2">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="rounded-xl overflow-hidden border border-[#c3c6d7]/50 bg-[#f2f4f6] max-w-xs"
                            >
                              {att.mimeType.startsWith('image/') ? (
                                <img
                                  src={att.previewUrl}
                                  alt={att.name}
                                  className="max-h-44 w-auto object-cover"
                                />
                              ) : att.mimeType.startsWith('video/') ? (
                                <video src={att.previewUrl} controls className="max-h-44 w-auto" />
                              ) : att.mimeType.startsWith('audio/') ? (
                                <div className="p-2 flex flex-col gap-1">
                                  <span className="text-[11px] text-[#004ac6] font-bold flex items-center gap-1">
                                    <Volume2 className="w-3.5 h-3.5" />
                                    {att.name}
                                  </span>
                                  <audio src={att.previewUrl} controls className="h-8 w-52" />
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="whitespace-pre-line">{msg.content}</div>
                      <div
                        className={`text-[10px] mt-1.5 ${
                          isUser ? 'text-blue-100' : 'text-[#565e74]'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>

                  {/* Direct Execution Confirmation Box */}
                  {!isUser && msg.executedActions && msg.executedActions.length > 0 && (
                    <div className="w-full max-w-[92%] sm:max-w-[85%] mt-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 text-right">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>اعمال‌شده در سایت:</span>
                      </div>
                      {msg.executedActions.map((act, idx) => (
                        <div key={idx} className="pr-5 text-[11px] text-emerald-800 leading-relaxed">
                          • {act}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Minimalist Live Backlink Campaign Cards */}
                  {!isUser && msg.backlinks && msg.backlinks.length > 0 && (
                    <div className="w-full max-w-[94%] sm:max-w-[85%] mt-2.5 space-y-3">
                      {msg.backlinks.map((bl) => (
                        <div
                          key={bl.id}
                          className="p-4 rounded-2xl bg-white border border-[#c3c6d7]/60 shadow-xs space-y-3 text-right"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-2.5">
                            <span className="text-xs font-extrabold text-[#004ac6] flex items-center gap-1.5">
                              <Globe className="w-4 h-4" />
                              <span>کمپین بک‌لینک و رپورتاژ زنده ({bl.targetPageName})</span>
                            </span>
                            <span className="text-[11px] text-[#565e74]">{bl.createdAt}</span>
                          </div>

                          {/* Target URL & Anchor */}
                          <div className="p-3 rounded-xl bg-[#f7f9fb] border border-[#c3c6d7]/40 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-[#434655]">
                                انکرتکست: <strong className="text-[#004ac6]">«{bl.primaryAnchorText}»</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(bl.targetUrl, `url-${bl.id}`, 'لینک هدف')}
                                className="text-[11px] font-bold text-[#004ac6] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedId === `url-${bl.id}` ? 'کپی شد' : 'کپی لینک هدف'}</span>
                              </button>
                            </div>
                            <div
                              dir="ltr"
                              className="text-[11px] font-mono text-[#565e74] truncate"
                            >
                              {bl.targetUrl}
                            </div>
                          </div>

                          {/* Live Published Articles */}
                          <div className="space-y-2">
                            {bl.livePlacements.map((pl, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-[#f2f4f6]/70 border border-[#c3c6d7]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-[#191c1e] truncate">
                                    {pl.articleTitle}
                                  </div>
                                  <div className="text-[11px] text-[#565e74] mt-0.5">
                                    {pl.platformName} · انکرتکست: «{pl.anchorUsed}»
                                  </div>
                                </div>
                                <a
                                  href={pl.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                                >
                                  <span>مشاهده بک‌لینک زنده</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>

                          {/* Copy HTML / Markdown & Syndicate */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(bl.articleHtml, `html-${bl.id}`, 'کد HTML رپورتاژ')
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-[#dbe1ff]/60 hover:bg-[#dbe1ff] text-[#004ac6] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedId === `html-${bl.id}` ? 'کپی شد' : 'کپی HTML رپورتاژ'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(bl.articleMarkdown, `md-${bl.id}`, 'متن Markdown')
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#eceef0] text-[#434655] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedId === `md-${bl.id}` ? 'کپی شد' : 'کپی Markdown'}</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-[#565e74]">
                              {bl.syndicationPlatforms.slice(0, 3).map((sp, i) => (
                                <a
                                  key={i}
                                  href={sp.submitUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-[#004ac6] hover:underline flex items-center gap-0.5 font-semibold"
                                >
                                  <span>{sp.domain}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Minimalist Proposal Approval Cards */}
                  {!isUser && msg.proposals && msg.proposals.length > 0 && (
                    <div className="w-full max-w-[92%] sm:max-w-[85%] mt-2.5 space-y-2.5">
                      {msg.proposals.filter((p) => p.status === 'pending').length > 1 && (
                        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#dbe1ff]/40 border border-[#004ac6]/20">
                          <span className="text-xs font-bold text-[#191c1e]">
                            اعمال یکجای تمام پیشنهادهای زیر در سایت
                          </span>
                          <button
                            type="button"
                            onClick={handleApproveAllProposals}
                            disabled={isApprovingAll}
                            className="px-3.5 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {isApprovingAll ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>تأیید همه</span>
                          </button>
                        </div>
                      )}

                      {msg.proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-4 rounded-2xl bg-white border border-[#c3c6d7]/60 shadow-2xs space-y-2.5 text-right"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#565e74]">
                            <span className="font-bold text-[#004ac6]">{prop.categoryLabel}</span>
                            <span>{prop.expectedImpact}</span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold text-[#191c1e]">
                            {prop.title}
                          </h4>
                          <p className="text-xs text-[#565e74] leading-relaxed">
                            {prop.description}
                          </p>

                          {prop.status === 'approved' ? (
                            <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>در سایت اعمال شد ({prop.executedAt})</span>
                            </div>
                          ) : prop.status === 'rejected' ? (
                            <div className="inline-flex items-center gap-1 text-[#565e74] text-xs">
                              <XCircle className="w-4 h-4" />
                              <span>لغو شد</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleApproveProposal(prop.id)}
                                disabled={approvingId === prop.id}
                                className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                {approvingId === prop.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>تأیید و اعمال در سایت</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectProposal(prop.id)}
                                className="px-3 py-2 rounded-xl bg-[#f2f4f6] hover:bg-[#eceef0] text-[#565e74] text-xs font-bold cursor-pointer transition-colors"
                              >
                                لغو
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
              <div className="flex justify-end items-center gap-2">
                <div className="bg-white border border-[#c3c6d7]/50 rounded-2xl px-3.5 py-2.5 text-xs text-[#565e74] flex items-center gap-2 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#004ac6]" />
                  <span>در حال انجام...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Minimalist Bottom Composer Inheriting Site Design System */}
      <div className="bg-white border-t border-[#c3c6d7]/40 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Pending Attachments Preview */}
          {pendingAttachments.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 bg-[#f2f4f6] border border-[#c3c6d7]/50 rounded-xl p-1.5 pr-2.5 text-xs text-[#191c1e] shrink-0"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : att.mimeType.startsWith('video/') ? (
                    <Video className="w-4 h-4 text-[#004ac6]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#004ac6]" />
                  )}
                  <span className="max-w-[120px] truncate text-[11px] font-bold">{att.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAttachments((prev) => prev.filter((item) => item.id !== att.id))
                    }
                    className="p-1 rounded-full hover:bg-slate-200 text-[#565e74] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-end gap-1.5 bg-[#f2f4f6] focus-within:bg-white border border-[#c3c6d7]/60 focus-within:border-[#004ac6] rounded-2xl px-2.5 py-1.5 transition-colors"
          >
            {/* Minimalist Icon Actions for Media & Voice */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingAttachment || isChatLoading}
                className="p-2 rounded-xl hover:bg-[#dbe1ff]/50 text-[#565e74] hover:text-[#004ac6] transition-colors cursor-pointer"
                title="آپلود تصویر"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploadingAttachment || isChatLoading}
                className="p-2 rounded-xl hover:bg-[#dbe1ff]/50 text-[#565e74] hover:text-[#004ac6] transition-colors cursor-pointer"
                title="آپلود ویدیو"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={isUploadingAttachment || isChatLoading}
                className="p-2 rounded-xl hover:bg-[#dbe1ff]/50 text-[#565e74] hover:text-[#004ac6] transition-colors cursor-pointer"
                title="آپلود فایل صوتی"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {isRecordingAudio ? (
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold animate-pulse cursor-pointer"
                  title="توقف ضبط"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>{recordingSeconds}s</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  disabled={isUploadingAttachment || isChatLoading}
                  className="p-2 rounded-xl hover:bg-[#dbe1ff]/50 text-[#565e74] hover:text-[#004ac6] transition-colors cursor-pointer"
                  title="ضبط صدا"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>

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
              placeholder="هر دستوری دارید بنویسید (ساخت بک‌لینک، سئو اتوماتیک، تغییر رنگ و UI/UX، افزودن یا حذف مقاله...)"
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-[#191c1e] placeholder:text-[#565e74]/70 focus:outline-none resize-none max-h-28"
            />

            <button
              type="submit"
              disabled={
                (!chatInput.trim() && pendingAttachments.length === 0) ||
                isChatLoading ||
                isUploadingAttachment
              }
              className="w-9 h-9 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] disabled:bg-slate-300 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="ارسال"
            >
              {isUploadingAttachment ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
