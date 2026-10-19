import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { readDb } from './db';
import { CLINIC_INFO, SERVICES, TRANSFORMATIONS, FAQS, MOBILE_FAQS } from '../src/data/clinicData';
import { ALL_INITIAL_CASES } from '../src/data/clinicalCases';
import { DENTAL_TREATMENTS, formatPersianTomans } from '../src/utils/costCalculator';

export interface StructuredPortfolioCase {
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

export interface DoctorProfileCardData {
  name: string;
  role: string;
  medicalCouncilCode: string;
  image: string;
  experience: string;
  bio: string;
}

export interface ChatActionItem {
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

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponsePayload {
  reply: string;
  cases: StructuredPortfolioCase[];
  doctorCard?: DoctorProfileCardData | null;
  actions: ChatActionItem[];
  followUpSuggestions: string[];
  mode: 'gemini' | 'knowledge_engine';
}

/**
 * Consolidates all real, verified portfolio cases from both clinicalCases.ts and CMS db.json (READ-ONLY)
 */
export function getVerifiedPortfolioCases(): StructuredPortfolioCase[] {
  const db = readDb();
  const cmsTransformations = Array.isArray(db.transformations) && db.transformations.length > 0
    ? db.transformations
    : TRANSFORMATIONS;

  const casesMap = new Map<string, StructuredPortfolioCase>();

  // 1. Add structured clinical cases (each has verified beforeImage and afterImage)
  for (const c of ALL_INITIAL_CASES) {
    casesMap.set(c.id, {
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      category: c.category,
      categoryLabel: c.categoryLabel,
      description: c.description,
      patientInfo: c.patientInfo,
      duration: c.duration,
      guaranteeText: c.guaranteeText,
      beforeImage: c.beforeImage,
      afterImage: c.afterImage,
      beforeLabel: 'قبل از درمان',
      afterLabel: c.afterBadge || 'بعد از درمان',
      badge: c.afterBadge || c.categoryLabel,
    });
  }

  // 2. Add CMS transformations if not duplicate
  for (const t of cmsTransformations) {
    if (!t || (!t.image && !t.beforeImage)) continue;
    const id = String(t.id || `trans-${casesMap.size + 1}`);
    if (casesMap.has(id)) continue;

    const rawText = `${t.id || ''} ${t.title || ''} ${t.category || ''} ${t.description || ''}`.toLowerCase();
    let category = t.category || 'general';
    let categoryLabel = t.categoryLabel || t.badge || 'نمونه درمان';

    if (rawText.includes('کامپوزیت') || rawText.includes('composite')) {
      category = 'composite';
      categoryLabel = 'کامپوزیت ونیر';
    } else if (rawText.includes('لمینت') || rawText.includes('laminate')) {
      category = 'laminate';
      categoryLabel = 'لمینت سرامیکی';
    } else if (rawText.includes('ایمپلنت') || rawText.includes('implant')) {
      category = 'implant';
      categoryLabel = 'ایمپلنت دیجیتال';
    } else if (rawText.includes('بلیچینگ') || rawText.includes('سفید') || rawText.includes('bleaching')) {
      category = 'bleaching';
      categoryLabel = 'بلیچینگ و سفیدسازی';
    } else if (rawText.includes('لثه') || rawText.includes('gummy')) {
      category = 'gummy';
      categoryLabel = 'اصلاح لبخند لثه‌ای';
    }

    const beforeImg = t.beforeImage || t.image;
    const afterImg = t.afterImage || t.mobileImage || t.image;

    casesMap.set(id, {
      id,
      caseNumber: t.caseNumber,
      title: t.title || 'نمونه درمان کلینیک پارمیس',
      category,
      categoryLabel,
      description: t.description || t.subtitle || '',
      patientInfo: t.patientInfo,
      duration: t.duration,
      beforeImage: beforeImg,
      afterImage: afterImg,
      beforeLabel: t.beforeLabel || 'قبل از درمان',
      afterLabel: t.afterLabel || 'بعد از درمان',
      badge: t.badge || categoryLabel,
    });
  }

  return Array.from(casesMap.values());
}

/**
 * Returns read-only Doctor Profile Card data using verified public clinic image
 */
export function getPublicDoctorProfileCard(): DoctorProfileCardData {
  const db = readDb();
  const info = { ...CLINIC_INFO, ...(db.clinicInfo || {}) };
  const doctorImg =
    db.aboutPageSettings?.hero?.doctorImage ||
    db.homePageSettings?.doctor?.imageUrl ||
    db.doctor?.image ||
    info.doctorImage ||
    '/images/dr-shamspoor.jpg';

  return {
    name: info.doctorName || 'دکتر انوشیروان شمس‌پور',
    role: info.doctorRole || 'جراح و دندان‌پزشک • زیبایی و ایمپلنت',
    medicalCouncilCode: info.medicalCouncilCode || '۱۴۷۸۹۳',
    image: doctorImg,
    experience: 'بیش از ۱۲ سال سابقه بالینی و بیش از ۵,۰۰۰ درمان موفق',
    bio:
      db.doctor?.bio ||
      'فارغ‌التحصیل دکترای حرفه‌ای دندان‌پزشکی، دارای بورد تخصصی زیبایی و ایمپلنت‌های دیجیتال با تمرکز بر درمان‌های کم‌تهاجمی و بدون درد در کلینیک پارمیس پاکدشت.',
  };
}

/**
 * Searches verified portfolio cases based on category or query keywords
 */
export function searchPortfolioCases(query: string, categoryFilter?: string): {
  cases: StructuredPortfolioCase[];
  exactMatchFound: boolean;
  requestedCategoryName?: string;
} {
  const allCases = getVerifiedPortfolioCases();
  const q = (query || '').trim().toLowerCase();
  const cat = (categoryFilter || '').trim().toLowerCase();

  const combined = `${q} ${cat}`;

  let targetCategory: string | null = null;
  let requestedCategoryName: string | undefined;

  if (combined.includes('کامپوزیت') || combined.includes('composite') || combined.includes('دیاستم') || combined.includes('فاصله دندان')) {
    targetCategory = 'composite';
    requestedCategoryName = 'کامپوزیت ونیر';
  } else if (combined.includes('لمینت') || combined.includes('laminate') || combined.includes('ایماکس') || combined.includes('e-max') || combined.includes('پرسلن')) {
    targetCategory = 'laminate';
    requestedCategoryName = 'لمینت سرامیکی';
  } else if (combined.includes('ایمپلنت') || combined.includes('کاشت') || combined.includes('implant')) {
    targetCategory = 'implant';
    requestedCategoryName = 'ایمپلنت دندان';
  } else if (combined.includes('بلیچینگ') || combined.includes('سفید') || combined.includes('bleaching') || combined.includes('روشن')) {
    targetCategory = 'bleaching';
    requestedCategoryName = 'بلیچینگ و سفید کردن دندان';
  } else if (combined.includes('لثه') || combined.includes('gummy') || combined.includes('ژنژیوکتومی')) {
    targetCategory = 'gummy';
    requestedCategoryName = 'اصلاح لبخند لثه‌ای';
  } else if (combined.includes('بازسازی') || combined.includes('روکش') || combined.includes('زیرکونیا') || combined.includes('rehabilitation')) {
    targetCategory = 'rehabilitation';
    requestedCategoryName = 'بازسازی فک و روکش زیرکونیا';
  } else if (combined.includes('عصب') || combined.includes('ریشه') || combined.includes('اطفال') || combined.includes('کودک') || combined.includes('جرم') || combined.includes('عقل')) {
    targetCategory = 'other_unsupported_visual';
    requestedCategoryName = combined.includes('عصب')
      ? 'درمان ریشه (عصب‌کشی)'
      : combined.includes('اطفال') || combined.includes('کودک')
      ? 'دندانپزشکی اطفال'
      : combined.includes('جرم')
      ? 'جرم‌گیری'
      : 'جراحی دندان عقل';
  }

  if (targetCategory === 'other_unsupported_visual') {
    return {
      cases: [],
      exactMatchFound: false,
      requestedCategoryName,
    };
  }

  if (targetCategory) {
    const filtered = allCases.filter((item) => item.category === targetCategory);
    return {
      cases: filtered.slice(0, 4),
      exactMatchFound: filtered.length > 0,
      requestedCategoryName,
    };
  }

  return {
    cases: allCases.slice(0, 4),
    exactMatchFound: true,
    requestedCategoryName: 'طراحی لبخند و درمان‌های تخصصی',
  };
}

/**
 * Builds standard contact & booking actions from real clinic info
 */
export function buildClinicActions(types: Array<ChatActionItem['type']>): ChatActionItem[] {
  const db = readDb();
  const info = { ...CLINIC_INFO, ...(db.clinicInfo || {}) };
  const actions: ChatActionItem[] = [];

  for (const type of types) {
    if (type === 'call_clinic') {
      actions.push({
        id: 'act-call',
        type: 'call_clinic',
        label: `تماس با مطب (${info.phoneDisplay || '۰۲۱۳۶۰۴۸۵۸۱'})`,
        url: `tel:${info.phone || '02136048581'}`,
        icon: 'call',
      });
    } else if (type === 'open_booking') {
      actions.push({
        id: 'act-booking',
        type: 'open_booking',
        label: 'ثبت درخواست نوبت آنلاین',
        icon: 'calendar_month',
      });
    } else if (type === 'open_cost_calculator') {
      actions.push({
        id: 'act-cost',
        type: 'open_cost_calculator',
        label: 'محاسبه‌گر هوشمند هزینه درمان',
        icon: 'calculate',
      });
    } else if (type === 'open_google_maps') {
      actions.push({
        id: 'act-gmaps',
        type: 'open_google_maps',
        label: 'مسیریابی در گوگل‌مپ',
        url: info.googleMapsUrl || CLINIC_INFO.googleMapsUrl,
        icon: 'map',
      });
    } else if (type === 'open_neshan') {
      actions.push({
        id: 'act-neshan',
        type: 'open_neshan',
        label: 'مسیریابی با نشان',
        url: info.neshanUrl || CLINIC_INFO.neshanUrl,
        icon: 'near_me',
      });
    } else if (type === 'open_balad') {
      actions.push({
        id: 'act-balad',
        type: 'open_balad',
        label: 'مسیریابی با بلد',
        url: info.baladUrl || CLINIC_INFO.baladUrl,
        icon: 'explore',
      });
    } else if (type === 'navigate_contact') {
      actions.push({
        id: 'act-contact-page',
        type: 'navigate_contact',
        label: 'ورود به صفحه تماس و نقشه',
        icon: 'location_on',
      });
    } else if (type === 'navigate_services') {
      actions.push({
        id: 'act-services-page',
        type: 'navigate_services',
        label: 'مشاهده کامل صفحه خدمات',
        icon: 'medical_services',
      });
    } else if (type === 'navigate_gallery') {
      actions.push({
        id: 'act-gallery-page',
        type: 'navigate_gallery',
        label: 'مشاهده تمام نمونه‌کارها در گالری',
        icon: 'photo_library',
      });
    }
  }

  return actions;
}

/**
 * Builds the rich, conversational system prompt grounded in real verified clinic data (STRICTLY READ-ONLY)
 */
function buildSystemInstruction(portfolioContextNote?: string): string {
  const db = readDb();
  const info = { ...CLINIC_INFO, ...(db.clinicInfo || {}) };
  const services = Array.isArray(db.services) && db.services.length > 0 ? db.services : SERVICES;
  const treatments = Array.isArray(db.treatments) && db.treatments.length > 0 ? db.treatments : DENTAL_TREATMENTS;
  const faqs = [...(Array.isArray(db.faqs) ? db.faqs : FAQS), ...MOBILE_FAQS];

  const servicesSummary = services
    .map(
      (s: any) =>
        `- ${s.title}: ${s.shortDesc} | مدت زمان: ${s.details?.duration || 'متغیر'} | کنترل درد: ${
          s.details?.painControl || 'بی‌حسی موضعی'
        } | مراقبت‌های بعد: ${(s.details?.aftercare || []).join('، ')}`
    )
    .join('\n');

  const pricingSummary = treatments
    .map(
      (t: any) =>
        `- ${t.name}: پایه هر ${t.unit} حدود ${formatPersianTomans(
          Number(t.basePricePerUnitTomans)
        )} (${t.description})`
    )
    .join('\n');

  const faqSummary = faqs.map((f: any) => `سؤال: ${f.question}\nپاسخ: ${f.answer}`).join('\n---\n');

  return `تو «دستیار هوشمند دکتر انوشیروان شمس‌پور» در «کلینیک دندان‌پزشکی پارمیس» هستی.
شخصیت و لحن تو:
- یک مشاور و منشی هوشمند، صمیمی، همدل، محترمانه و حرفه‌ای هستی که به زبان فارسی طبیعی، روان و انسانی با مراجعین گفتگو می‌کنی.
- دقیقاً به سؤال خاص کاربر پاسخ بده، با او تعامل طبیعی داشته باش و اگر سؤالش محاوره‌ای است، با لحنی گرم و صمیمی و در عین حال علمی راهنمایی‌اش کن.
- پاسخ‌هایت خوش‌خوان، مرتب و در حد ۱ تا ۳ پاراگراف کوتاه یا بولت‌پوینت‌های مفید باشد.

محدودیت امنیتی بسیار مهم (عدم دسترسی به بک‌اند):
- تو صرفاً دستیار عمومی راهنمای بیماران و مراجعین هستی و **هیچ‌گونه دسترسی به بک‌اند سایت، دیتابیس، پنل مدیریت یا ویرایش عکس‌ها، متون و تنظیمات سایت نداری**.
- اگر کاربری از تو خواست چیزی را در سایت تغییر دهی، درست کنی، ویرایش کنی یا حذف/اضافه کنی، محترمانه توضیح بده که تو دستیار راهنمای مراجعین هستی و به بک‌اند یا پنل مدیریت سایت دسترسی نداری (مدیریت سایت فقط از طریق پنل ادمین توسط مدیر سایت امکان‌پذیر است).

اطلاعات واقعی کلینیک (فقط به این داده‌ها استناد کن):
- نام پزشک: ${info.doctorName} (${info.doctorRole})
- شماره نظام پزشکی: ${info.medicalCouncilCode}
- تجربه: بیش از ۱۲ سال سابقه بالینی و بیش از ۵,۰۰۰ درمان موفق در زمینه ایمپلنت دیجیتال، طراحی لبخند (کامپوزیت ونیر و لمینت سرامیکی E-Max)، درمان ریشه با روتاری دیجیتال و جراحی دندان عقل
- آدرس دقیق: ${info.address}
- شماره‌های تماس: ${info.phoneDisplay} و ${info.phoneDisplay2}
- ساعات کاری: شنبه تا پنج‌شنبه از ساعت ۹:۰۰ صبح تا ۲۱:۰۰ شب (ویزیت و مشاوره اولیه رایگان با هماهنگی قبلی، ارائه فاکتور رسمی با مهر نظام پزشکی جهت بیمه تکمیلی)

خدمات کلینیک:
${servicesSummary}

تعرفه پایه خدمات (برای اطلاع حدودی؛ قیمت قطعی پس از معاینه حضوری مشخص می‌شود):
${pricingSummary}

پرسش‌های متداول کلینیک:
${faqSummary}

${portfolioContextNote ? `نکته درباره کارت تصویری پیوست‌شده در این پیام: ${portfolioContextNote}` : ''}

اصول ایمنی پزشکی:
۱. اطلاعات جعلی درباره مدرک، جایزه، قیمت یا شماره تماس نساز.
۲. یادآوری کن که راهنمایی‌هایت جایگزین معاینه حضوری دندان‌پزشک نیست؛ دارو تجویز نکن و تشخیص قطعی پزشکی نده.
۳. اگر کاربر علائم اورژانسی (درد بسیار شدید و غیرقابل‌تحمل، تورم شدید صورت/لثه، تب، خونریزی شدید یا مشکل در بلع و تنفس) داشت، با همدلی و جدیت توصیه کن فوراً به اورژانس یا کلینیک مراجعه کند.`;
}

/**
 * Enriches the response with read-only public cards (doctor photo or portfolio cases) and action buttons
 */
function analyzeIntentAndEnrich(userMessage: string): {
  cases: StructuredPortfolioCase[];
  doctorCard: DoctorProfileCardData | null;
  actions: ChatActionItem[];
  followUpSuggestions: string[];
  portfolioNote?: string;
} {
  const msg = userMessage.trim().toLowerCase();
  let cases: StructuredPortfolioCase[] = [];
  let doctorCard: DoctorProfileCardData | null = null;
  const actionTypes = new Set<ChatActionItem['type']>();
  let followUpSuggestions: string[] = [];
  let portfolioNote: string | undefined;

  // Check if user is asking for Doctor's photo or Doctor's introduction
  const isDoctorPhotoOrIntroRequest =
    (msg.includes('دکتر') || msg.includes('شمس')) &&
    (msg.includes('عکس') ||
      msg.includes('تصویر') ||
      msg.includes('چهره') ||
      msg.includes('معرفی') ||
      msg.includes('کیست') ||
      msg.includes('بیوگرافی') ||
      msg.includes('ببینم') ||
      msg.includes('نشون'));

  if (isDoctorPhotoOrIntroRequest) {
    doctorCard = getPublicDoctorProfileCard();
    actionTypes.add('open_booking');
    actionTypes.add('call_clinic');
    portfolioNote =
      'کارت رسمی معرفی و تصویر پروفایل دکتر انوشیروان شمس‌پور در زیر پیام تو به کاربر نمایش داده می‌شود؛ در پاسخ خودت با احترام به معرفی ایشان اشاره کن.';
    followUpSuggestions = [
      'مشاهده خدمات دندانپزشکی',
      'دیدن نمونه‌کارها',
      'آدرس مطب و راه‌های تماس',
    ];
  }

  const isPortfolioRequest =
    !isDoctorPhotoOrIntroRequest &&
    (msg.includes('نمونه') ||
      msg.includes('نمونه‌کار') ||
      msg.includes('نمونه کار') ||
      msg.includes('قبل و بعد') ||
      msg.includes('عکس') ||
      msg.includes('تصویر') ||
      msg.includes('تصاویر') ||
      msg.includes('گالری') ||
      msg === 'سفید کردن دندان‌ها (بلیچینگ)' ||
      (msg.includes('طراحی لبخند') && !msg.includes('مراقبت') && !msg.includes('هزینه')));

  if (isPortfolioRequest) {
    const result = searchPortfolioCases(msg);
    cases = result.cases;
    actionTypes.add('navigate_gallery');
    actionTypes.add('open_booking');
    if (!result.exactMatchFound && result.requestedCategoryName) {
      portfolioNote = `کاربر نمونه‌کار «${result.requestedCategoryName}» را خواسته که در گالری سایت تصویر ثبت‌شده‌ای ندارد؛ به او صادقانه بگو برای این درمان خاص تصویر قبل و بعد در گالری نیست اما می‌تواند سایر نمونه‌کارهای واقعی زیبایی و ایمپلنت را که زیر پیامت نمایش داده شده ببیند.`;
    } else {
      portfolioNote = `کارت‌های تصاویر واقعی قبل و بعد از درمان زیر پیام تو به کاربر نمایش داده می‌شوند؛ در پاسخ خودت با لحنی صمیمی به این تصاویر اشاره کن و بگو که نتیجه نهایی هر درمان به شرایط دندانی هر فرد بستگی دارد.`;
    }
    followUpSuggestions = [
      'نمونه‌کار کامپوزیت',
      'نمونه‌کار لمینت',
      'نمونه‌کار ایمپلنت',
      'هزینه خدمات و روش‌های درمان',
    ];
  }

  if (
    msg.includes('آدرس') ||
    msg.includes('تماس') ||
    msg.includes('تلفن') ||
    msg.includes('شماره') ||
    msg.includes('کجاست') ||
    msg.includes('مسیر') ||
    msg.includes('لوکیشن') ||
    msg.includes('نقشه') ||
    msg.includes('ساعت کاری') ||
    msg.includes('ساعات کاری')
  ) {
    actionTypes.add('call_clinic');
    actionTypes.add('open_google_maps');
    actionTypes.add('open_neshan');
    actionTypes.add('open_balad');
    actionTypes.add('navigate_contact');
    actionTypes.add('open_booking');
    if (followUpSuggestions.length === 0) {
      followUpSuggestions = ['نحوه دریافت نوبت', 'مشاهده خدمات دندانپزشکی', 'معرفی دکتر شمس‌پور'];
    }
  }

  if (msg.includes('نوبت') || msg.includes('رزرو') || msg.includes('ویزیت') || msg.includes('وقت')) {
    actionTypes.add('open_booking');
    actionTypes.add('call_clinic');
    actionTypes.add('navigate_contact');
    if (followUpSuggestions.length === 0) {
      followUpSuggestions = ['آدرس مطب و راه‌های تماس', 'هزینه خدمات و روش‌های درمان', 'مشاهده خدمات دندانپزشکی'];
    }
  }

  if (msg.includes('هزینه') || msg.includes('قیمت') || msg.includes('تعرفه') || msg.includes('بیمه') || msg.includes('اقساط')) {
    actionTypes.add('open_cost_calculator');
    actionTypes.add('open_booking');
    actionTypes.add('call_clinic');
    if (followUpSuggestions.length === 0) {
      followUpSuggestions = ['دیدن نمونه‌کارها', 'تفاوت کامپوزیت و لمینت چیست؟', 'نحوه دریافت نوبت'];
    }
  }

  if (msg.includes('خدمات') || msg.includes('درمان‌ها') || msg.includes('چه کارهایی')) {
    actionTypes.add('navigate_services');
    actionTypes.add('open_booking');
    if (followUpSuggestions.length === 0) {
      followUpSuggestions = ['دیدن نمونه‌کارها', 'هزینه خدمات و روش‌های درمان', 'مراقبت‌های قبل و بعد از درمان'];
    }
  }

  if (msg.includes('دکتر') || msg.includes('شمس') || msg.includes('معرفی') || msg.includes('بیوگرافی') || msg.includes('نظام پزشکی')) {
    actionTypes.add('open_booking');
    actionTypes.add('call_clinic');
    if (followUpSuggestions.length === 0) {
      followUpSuggestions = ['مشاهده خدمات دندانپزشکی', 'دیدن نمونه‌کارها', 'آدرس مطب و راه‌های تماس'];
    }
  }

  if (
    msg.includes('درد شدید') ||
    msg.includes('تورم') ||
    msg.includes('آبسه') ||
    msg.includes('خونریزی') ||
    msg.includes('تب') ||
    msg.includes('اورژانس') ||
    msg.includes('تنفس') ||
    msg.includes('بلع')
  ) {
    actionTypes.add('call_clinic');
    actionTypes.add('open_booking');
  }

  if (followUpSuggestions.length === 0) {
    followUpSuggestions = [
      'دیدن نمونه‌کارها',
      'هزینه خدمات و روش‌های درمان',
      'آدرس مطب و راه‌های تماس',
      'مراقبت‌های قبل و بعد از درمان',
    ];
  }

  return {
    cases,
    doctorCard,
    actions: buildClinicActions(Array.from(actionTypes)),
    followUpSuggestions,
    portfolioNote,
  };
}

/**
 * Fallback response only used if no API key is configured or all Gemini models are unreachable
 */
function buildEmergencyFallbackResponse(userMessage: string): string {
  const db = readDb();
  const info = { ...CLINIC_INFO, ...(db.clinicInfo || {}) };
  return `در حال حاضر ارتباط لحظه‌ای با سرور هوش مصنوعی با اختلال روبه‌رو شده است، اما خوشحال می‌شوم کمکتان کنم!

برای دریافت مشاوره مستقیم با دکتر انوشیروان شمس‌پور یا هماهنگی وقت ویزیت رایگان در کلینیک پارمیس (پاکدشت، مجتمع پزشکی راستین)، می‌توانید با شماره ${info.phoneDisplay} تماس بگیرید یا از دکمه‌های زیر استفاده فرمایید.`;
}

/**
 * Calls Gemini with a fast model cascade so responses are 100% genuine AI while arriving in ~1–2 seconds.
 */
async function generateNaturalGeminiReply(
  apiKey: string,
  systemInstruction: string,
  contents: any[]
): Promise<string | null> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const candidateConfigs: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
    { model: 'gemini-3-flash-preview', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.1-flash-lite-preview', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
  ];

  for (const candidate of candidateConfigs) {
    try {
      const response = await ai.models.generateContent({
        model: candidate.model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.65,
          thinkingConfig: {
            thinkingLevel: candidate.thinkingLevel,
          },
        },
      });

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}

/**
 * Main handler for Public AI Assistant chat requests (Strictly Read-Only, No Backend Write Access)
 */
export async function handleAiAssistantChat(
  message: string,
  history: ChatHistoryMessage[] = []
): Promise<AiChatResponsePayload> {
  const cleanMessage = (message || '').trim().slice(0, 1500);
  if (!cleanMessage) {
    throw new Error('پیام ارسالی نمی‌تواند خالی باشد.');
  }

  // 1. Enrich with read-only public cards (doctor photo or portfolio cases) and action buttons
  const enrichment = analyzeIntentAndEnrich(cleanMessage);
  const cases = [...enrichment.cases];
  const doctorCard = enrichment.doctorCard;
  const actions = [...enrichment.actions];
  const followUpSuggestions = enrichment.followUpSuggestions;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
    return {
      reply: buildEmergencyFallbackResponse(cleanMessage),
      cases,
      doctorCard,
      actions,
      followUpSuggestions,
      mode: 'knowledge_engine',
    };
  }

  const systemInstruction = buildSystemInstruction(enrichment.portfolioNote);

  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
  const contents: any[] = recentHistory
    .filter((h) => h && typeof h.content === 'string' && h.content.trim().length > 0)
    .map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content.trim().slice(0, 1000) }],
    }));

  contents.push({
    role: 'user',
    parts: [{ text: cleanMessage }],
  });

  const aiReply = await generateNaturalGeminiReply(apiKey, systemInstruction, contents);

  if (aiReply) {
    return {
      reply: aiReply,
      cases,
      doctorCard,
      actions,
      followUpSuggestions,
      mode: 'gemini',
    };
  }

  return {
    reply: buildEmergencyFallbackResponse(cleanMessage),
    cases,
    doctorCard,
    actions,
    followUpSuggestions,
    mode: 'knowledge_engine',
  };
}
