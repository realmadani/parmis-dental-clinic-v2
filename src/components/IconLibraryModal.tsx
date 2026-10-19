import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check, Upload, Sparkles, Image as ImageIcon, Globe, FolderHeart, Trash2, Loader2, ArrowUpRight } from 'lucide-react';
import { AppIcon } from './AppIcon.tsx';

export interface IconItem {
  name: string;
  label: string;
  category: 'dental' | 'trust' | 'comfort' | 'clinic' | 'general' | 'communication' | 'action';
  tags?: string[];
}

export const PRESET_ICONS: IconItem[] = [
  // Dental & Medical Specialty
  { name: 'dentistry', label: 'دندان‌پزشکی', category: 'dental', tags: ['دندان', 'کلینیک', 'طرح لبخند', 'ایمپلنت', 'دکتر'] },
  { name: 'medical_services', label: 'خدمات پزشکی', category: 'dental', tags: ['درمان', 'پزشک', 'طبابت', 'تخصصی'] },
  { name: 'health_and_safety', label: 'سلامت و بهداشت', category: 'dental', tags: ['سلامت', 'ایمنی', 'بهداشت', 'حفاظت'] },
  { name: 'biotech', label: 'تجهیزات و فناوری', category: 'dental', tags: ['تکنولوژی', 'مدرن', 'دیجیتال', 'دستگاه'] },
  { name: 'clean_hands', label: 'استریل و ضدعفونی', category: 'dental', tags: ['اتوکلاو', 'بهداشت', 'استریل', 'کلاس B'] },
  { name: 'healing', label: 'ترمیم و عصب‌کشی', category: 'dental', tags: ['عصب‌کشی', 'ترمیم', 'درمان ریشه', 'بهبود'] },
  { name: 'local_hospital', label: 'مرکز درمانی', category: 'dental', tags: ['مطب', 'کلینیک', 'بیمارستان'] },
  { name: 'radiology', label: 'رادیوگرافی و RVG', category: 'dental', tags: ['عکسبرداری', 'اشعه کم', 'دیجیتال', 'سنسور'] },
  { name: 'medication', label: 'دارو و متریال', category: 'dental', tags: ['متریال', 'سوئیسی', 'آلمانی', 'دارو'] },
  { name: 'emergency', label: 'اورژانس دندان', category: 'dental', tags: ['فوری', 'اورژانسی', 'درد شدید'] },
  { name: 'sanitizer', label: 'ضدعفونی مکانیزه', category: 'dental', tags: ['بهداشت', 'ویروس‌زدایی', 'استریلیزاسیون'] },
  { name: 'masks', label: 'ماسک و حفاظت', category: 'dental', tags: ['محافظت', 'بهداشتی', 'پروتکل'] },
  { name: 'stethoscope', label: 'معاینه و چکاپ', category: 'dental', tags: ['چکاپ', 'بررسی بالینی', 'مشاوره'] },
  { name: 'monitor_heart', label: 'پایش علائم حیاتی', category: 'dental', tags: ['قلب', 'علائم حیاتی', 'فشار خون'] },
  { name: 'vaccines', label: 'تزریق بی‌حسی مدرن', category: 'dental', tags: ['بی‌حسی', 'آمپول', 'بدون سوزش'] },
  { name: 'microbiology', label: 'تجهیزات لابراتواری', category: 'dental', tags: ['میکروسکوپ', 'لابراتوار', 'دقت'] },

  // Trust, Standard & Badges
  { name: 'verified', label: 'تاییدیه و اعتبار', category: 'trust', tags: ['پزشک معتمد', 'استاندارد', 'تضمین', 'مجوز'] },
  { name: 'verified_user', label: 'امنیت و تضمین', category: 'trust', tags: ['گارانتی', 'بیمار معتمد', 'اطمینان'] },
  { name: 'shield', label: 'حفاظت و ضمانت', category: 'trust', tags: ['سپر', 'حفاظت', 'ایمن', 'پشتیبانی'] },
  { name: 'shield_with_heart', label: 'مراقبت مطمئن', category: 'trust', tags: ['تعهد', 'دلسوزانه', 'مراقبت ویژه'] },
  { name: 'workspace_premium', label: 'کیفیت ممتاز', category: 'trust', tags: ['مدال', 'ممتاز', 'برتر', 'درجه یک'] },
  { name: 'military_tech', label: 'نشان برتری', category: 'trust', tags: ['افتخار', 'استاندارد عالی', 'رتبه برتر'] },
  { name: 'award_star', label: 'مدال افتخار', category: 'trust', tags: ['ستاره', 'کیفیت برتر', 'رضایت'] },
  { name: 'star', label: 'امتیاز عالی', category: 'trust', tags: ['۵ ستاره', 'کیفیت', 'رضایت ۹۹٪'] },
  { name: 'thumb_up', label: 'رضایت کامل', category: 'trust', tags: ['پسندیده', 'عالی', 'توصیه شده'] },
  { name: 'task_alt', label: 'درمان موفق', category: 'trust', tags: ['تیک سبز', 'نتیجه مثبت', 'موفقیت‌آمیز'] },
  { name: 'grade', label: 'سطح کیفی A+', category: 'trust', tags: ['نمره برتر', 'کیفیت'] },
  { name: 'recommend', label: 'توصیه مراجعین', category: 'trust', tags: ['پیشنهاد شده', 'محبوب', 'اعتماد'] },
  { name: 'policy', label: 'تعهد اخلاقی', category: 'trust', tags: ['منشور اخلاقی', 'صداقت در تشخیص'] },
  { name: 'badge', label: 'نشان اصالت', category: 'trust', tags: ['نشان', 'لوگو', 'اعتبار'] },

  // Comfort, Aesthetics & Smile Design
  { name: 'auto_awesome', label: 'درخشش و سفیدی', category: 'comfort', tags: ['سفیدی دندان', 'بلیچینگ', 'کامپوزیت', 'الماس'] },
  { name: 'auto_fix_high', label: 'اصلاح طرح لبخند', category: 'comfort', tags: ['طراحی دیجیتال', 'DSD', 'زیبایی', 'لمینت'] },
  { name: 'brush', label: 'ظرافت و هنر', category: 'comfort', tags: ['فرم‌دهی طبیعی', 'دقت بالا', 'هنر دندانپزشکی'] },
  { name: 'palette', label: 'رنگ و تناژ طبیعی', category: 'comfort', tags: ['رنگ دندان', 'زیبایی', 'پالت'] },
  { name: 'volunteer_activism', label: 'همدلی و آرامش', category: 'comfort', tags: ['قلب', 'مهربانی', 'بدون استرس', 'همدلی'] },
  { name: 'sentiment_satisfied', label: 'درمان بدون درد', category: 'comfort', tags: ['بی‌حسی دقیق', 'آرامش', 'لبخند'] },
  { name: 'sentiment_very_satisfied', label: 'لبخند هالیوودی', category: 'comfort', tags: ['شادی', 'رضایت کامل', 'تحول لبخند'] },
  { name: 'spa', label: 'فضای آرامش‌بخش', category: 'comfort', tags: ['ریلکس', 'آرام', 'بدون دلهره', 'لوکس'] },
  { name: 'mood', label: 'حس خوب درمان', category: 'comfort', tags: ['خوش‌رویی', 'انرژی مثبت'] },
  { name: 'favorite', label: 'محبوب مراجعین', category: 'comfort', tags: ['علاقه', 'توجه به بیمار'] },
  { name: 'psychology', label: 'کنترل اضطراب', category: 'comfort', tags: ['کنترل استرس', 'کاهش اضطراب'] },
  { name: 'flare', label: 'درخشش الماس', category: 'comfort', tags: ['لبخند هالیوودی', 'شفافیت'] },
  { name: 'diamond', label: 'مقاومت الماسی', category: 'comfort', tags: ['سرامیک مقاوم', 'دوام بالا'] },
  { name: 'layers', label: 'لایه‌گذاری نانو', category: 'comfort', tags: ['کامپوزیت لایه‌ای', 'رنگ طبیعی'] },

  // Clinic Facilities & Location
  { name: 'location_on', label: 'لوکیشن و موقعیت', category: 'clinic', tags: ['آدرس', 'نقشه', 'پاکدشت', 'میدان قدس'] },
  { name: 'pin_drop', label: 'موقعیت کلینیک', category: 'clinic', tags: ['مکان', 'پاکدشت', 'مجتمع راستین'] },
  { name: 'chair', label: 'یونیت ارگونومیک', category: 'clinic', tags: ['صندلی راحت', 'امکانات رفاهی', 'تجهیزات'] },
  { name: 'elevator', label: 'آسانسور فعال', category: 'clinic', tags: ['طبقه دوم', 'دسترسی سالمندان', 'راحتی'] },
  { name: 'local_parking', label: 'پارکینگ خودرو', category: 'clinic', tags: ['جای پارک', 'سهولت تردد'] },
  { name: 'wifi', label: 'اینترنت رایگان', category: 'clinic', tags: ['رفاهی', 'سالن انتظار'] },
  { name: 'schedule', label: 'بدون معطلی', category: 'clinic', tags: ['وقت‌شناسی', 'پذیرش دقیق', 'نظم'] },
  { name: 'alarm', label: 'یادآوری نوبت', category: 'clinic', tags: ['یادآوری پیامکی', 'ساعات دقیق'] },
  { name: 'credit_card', label: 'پرداخت اقساطی', category: 'clinic', tags: ['چک صیادی', 'مرحله‌ای', 'تسهیلات'] },
  { name: 'payments', label: 'تعرفه منصفانه', category: 'clinic', tags: ['قیمت شفاف', 'برآورد کتبی'] },
  { name: 'savings', label: 'صرفه‌جویی هزینه', category: 'clinic', tags: ['ارزش بالا', 'تخفیف', 'اقتصادی'] },
  { name: 'precision_manufacturing', label: 'دقت دیجیتال', category: 'clinic', tags: ['لابراتوار اختصاصی', 'ظرافت'] },
  { name: 'devices', label: 'سیستم‌های نوین', category: 'clinic', tags: ['نرم‌افزار پرونده', 'اسکن'] },

  // Communication & Consultation
  { name: 'call', label: 'تماس تلفنی', category: 'communication', tags: ['پاسخگویی سریع', 'تلفن مطب', 'خط مستقیم'] },
  { name: 'chat', label: 'مشاوره آنلاین', category: 'communication', tags: ['پیام‌رسان', 'پاسخ آنلاین', 'واتساپ'] },
  { name: 'forum', label: 'گفتگو و پرسش', category: 'communication', tags: ['نظرات', 'پرسش‌های متداول', 'مشاوره'] },
  { name: 'support_agent', label: 'پشتیبانی پذیرش', category: 'communication', tags: ['پاسخگویی', 'پیگیری درمان', 'راهنمایی'] },
  { name: 'handshake', label: 'تعهد دوطرفه', category: 'communication', tags: ['همکاری', 'قرارداد شفاف', 'صداقت'] },
  { name: 'calendar_month', label: 'تقویم رزرو نوبت', category: 'communication', tags: ['برنامه‌ریزی', 'رزرو'] },
  { name: 'mail', label: 'پیام و مکاتبه', category: 'communication', tags: ['ایمیل', 'مکاتبه'] },
  { name: 'help_outline', label: 'سوالات متداول', category: 'communication', tags: ['سوالات', 'پاسخ', 'راهنما'] },
  { name: 'quiz', label: 'پرسش و پاسخ', category: 'communication', tags: ['پرسش', 'پاسخ', 'FAQ'] },

  // Action & Common Indicators
  { name: 'check_circle', label: 'تایید و موفقیت', category: 'action', tags: ['تایید', 'درست', 'موفق'] },
  { name: 'check', label: 'علامت تیک', category: 'action', tags: ['تیک', 'تایید'] },
  { name: 'tune', label: 'شخصی‌سازی دقیق', category: 'action', tags: ['شخصی‌سازی', 'تنظیمات'] },
  { name: 'speed', label: 'سرعت و دقت', category: 'action', tags: ['کوتاه‌ترین زمان', 'فوری'] },
  { name: 'eco', label: 'سازگار و طبیعی', category: 'action', tags: ['حفظ مینای دندان', 'ارگانیک'] },
  { name: 'arrow_forward', label: 'فلش جلو', category: 'action', tags: ['جهت', 'ادامه'] },
  { name: 'arrow_back', label: 'فلش بازگشت', category: 'action', tags: ['جهت', 'بازگشت'] },
  { name: 'info', label: 'اطلاعات بیشتر', category: 'action', tags: ['توضیحات', 'آگاهی'] },
  { name: 'menu_book', label: 'مقاله و آموزش', category: 'action', tags: ['کتاب', 'آموزش', 'مقاله'] },
  { name: 'article', label: 'مطلب درمانی', category: 'action', tags: ['مقاله', 'بلاگ', 'محتوا'] },
];

const GOOGLE_CATEGORIES = [
  { id: 'all', label: 'همه آیکون‌ها' },
  { id: 'dental', label: 'دندان‌پزشکی و استریل' },
  { id: 'trust', label: 'اعتبار و استاندارد' },
  { id: 'comfort', label: 'زیبایی و آرامش' },
  { id: 'clinic', label: 'امکانات و لوکیشن' },
  { id: 'communication', label: 'تماس و نوبت‌دهی' },
  { id: 'action', label: 'نشانگرها و عمومی' },
];

interface UploadedIconItem {
  id: string;
  name: string;
  url: string;
  date?: string;
}

interface IconLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
  title?: string;
}

export const IconLibraryModal: React.FC<IconLibraryModalProps> = ({
  isOpen,
  onClose,
  currentIcon,
  onSelectIcon,
  title = 'کتابخانه و انتخاب آیکون',
}) => {
  // Main Tab: 'google' (Google Material Symbols) vs 'upload' (Custom File Upload)
  const [activeSourceTab, setActiveSourceTab] = useState<'google' | 'upload'>('google');

  // Search & Filter state for Google Icons
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Uploaded icons list from localStorage
  const [uploadedIcons, setUploadedIcons] = useState<UploadedIconItem[]>(() => {
    try {
      const saved = localStorage.getItem('parmis_uploaded_custom_icons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize on open
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setUploadError(null);
    } else {
      // If current icon is a file path, auto open the upload tab
      if (
        currentIcon &&
        (currentIcon.startsWith('/') ||
          currentIcon.startsWith('http') ||
          currentIcon.startsWith('data:image/'))
      ) {
        setActiveSourceTab('upload');
      } else {
        setActiveSourceTab('google');
      }
    }
  }, [isOpen, currentIcon]);

  // Filter Google Icons
  const filteredGoogleIcons = useMemo(() => {
    let list = PRESET_ICONS;

    if (selectedCategory !== 'all') {
      list = list.filter((i) => i.category === selectedCategory);
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [search, selectedCategory]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension / MIME
    const allowedExtensions = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setUploadError('فرمت فایل نامعتبر است. لطفاً فایل با پسوند SVG، PNG یا WebP انتخاب کنید.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('حجم فایل آیکون نباید بیشتر از ۲ مگابایت باشد.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'site');
      formData.append('title', `آیکون اختصاصی ${file.name}`);
      formData.append('alt', file.name);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('خطا در بارگذاری فایل آیکون روی سرور');
      }

      const data = await res.json();
      const uploadedUrl = data?.media?.url || data?.url;

      if (!uploadedUrl) {
        throw new Error('آدرس فایل بارگذاری‌شده دریافت نشد.');
      }

      const newIconItem: UploadedIconItem = {
        id: `up-icon-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: uploadedUrl,
        date: new Date().toLocaleDateString('fa-IR'),
      };

      const updatedList = [newIconItem, ...uploadedIcons].slice(0, 40);
      setUploadedIcons(updatedList);
      try {
        localStorage.setItem('parmis_uploaded_custom_icons', JSON.stringify(updatedList));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }

      // Automatically select and apply
      onSelectIcon(uploadedUrl);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'خطا در بارگذاری فایل');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteUploadedIcon = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = uploadedIcons.filter((item) => item.id !== id);
    setUploadedIcons(updated);
    try {
      localStorage.setItem('parmis_uploaded_custom_icons', JSON.stringify(updated));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs overflow-hidden p-1.5">
              <AppIcon name={currentIcon || 'dentistry'} className="text-[26px] max-w-full max-h-full" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                آیکون فعلی: <code className="font-mono bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] dir-ltr inline-block truncate max-w-[200px] align-middle">{currentIcon || 'dentistry'}</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Navigation Tabs: Google Library vs Custom Upload */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSourceTab('google')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSourceTab === 'google'
                ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>کتابخانه جامع آیکون‌های گوگل (Google Material Symbols)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSourceTab('upload')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSourceTab === 'upload'
                ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>بارگذاری آیکون دلخواه (فایل SVG / PNG / WebP)</span>
            {uploadedIcons.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono">
                {uploadedIcons.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: GOOGLE MATERIAL SYMBOLS */}
        {activeSourceTab === 'google' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در نام انگلیسی یا فارسی آیکون (مثلاً: dentistry, استریل, رضایت, implant...)"
                  className="w-full pr-10 pl-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {GOOGLE_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google Icons Grid */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
              {filteredGoogleIcons.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">آیکونی با این مشخصات یافت نشد</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    می‌توانید کلمه دیگری را جستجو کنید یا به برگه <strong>بارگذاری آیکون دلخواه</strong> بروید و فایل آیکون مورد نظر را آپلود نمایید.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredGoogleIcons.map((icon) => {
                    const isSelected = currentIcon === icon.name;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => {
                          onSelectIcon(icon.name);
                          onClose();
                        }}
                        className={`group relative p-3 rounded-2xl border text-right transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-xs'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 left-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}

                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[26px]">
                            {icon.name}
                          </span>
                        </div>

                        <div className="text-center w-full">
                          <span className="block text-xs font-bold text-slate-800 truncate" title={icon.label}>
                            {icon.label}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono dir-ltr truncate mt-0.5" title={icon.name}>
                            {icon.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM FILE UPLOAD */}
        {activeSourceTab === 'upload' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-6 space-y-5 bg-slate-50/50">
            {/* Upload Drop Zone */}
            <div className="p-6 rounded-3xl bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-center space-y-3 transition-colors shrink-0 shadow-2xs">
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp"
                className="hidden"
                id="custom-icon-upload-input"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {isUploading ? 'در حال بارگذاری فایل آیکون...' : 'بارگذاری فایل آیکون از سیستم'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  فایل‌های با فرمت وکتور <strong>SVG</strong> (پیشنهادی برای بالاترین کیفیت) یا تصاویر باکیفیت و بدون پس‌زمینه <strong>PNG / WebP</strong> را انتخاب کنید (حداکثر ۲ مگابایت).
                </p>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 py-1.5 px-3 rounded-xl inline-block">
                  {uploadError}
                </p>
              )}

              <div>
                <label
                  htmlFor="custom-icon-upload-input"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ba0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>انتخاب فایل آیکون</span>
                </label>
              </div>
            </div>

            {/* Previously Uploaded Icons Gallery */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderHeart className="w-4 h-4 text-indigo-600" />
                  <span>آیکون‌های بارگذاری‌شده شما ({uploadedIcons.length} آیکون)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  برای انتخاب و اعمال، روی آیکون مورد نظر کلیک نمایید
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {uploadedIcons.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200/80">
                    <p className="text-xs text-slate-400">
                      هنوز هیچ فایل آیکونی بارگذاری نکرده‌اید. با دکمه بالا می‌توانید اولین فایل SVG یا PNG خود را آپلود کنید.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {uploadedIcons.map((uIcon) => {
                      const isSelected = currentIcon === uIcon.url;
                      return (
                        <div
                          key={uIcon.id}
                          onClick={() => {
                            onSelectIcon(uIcon.url);
                            onClose();
                          }}
                          className={`group relative p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                              : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 left-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDeleteUploadedIcon(uIcon.id, e)}
                            className="absolute top-2 right-2 w-5 h-5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            title="حذف از لیست"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                            <img
                              src={uIcon.url}
                              alt={uIcon.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          <div className="text-center w-full">
                            <span className="block text-xs font-bold text-slate-800 truncate" title={uIcon.name}>
                              {uIcon.name}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono dir-ltr truncate mt-0.5">
                              {uIcon.url.split('/').pop()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              پشتیبانی از بیش از ۵۰۰۰ آیکون استاندارد گوگل + بارگذاری مستقیم انواع فایل‌های وکتور SVG و تصویر PNG
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://fonts.google.com/icons?icon.set=Material+Symbols"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[11px] inline-flex items-center gap-1"
            >
              <span>مخزن آیکون‌های گوگل</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
