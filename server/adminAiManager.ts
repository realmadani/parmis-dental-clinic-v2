import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type, FunctionDeclaration } from '@google/genai';
import { readDb, writeDb, DbSchema } from './db';
import { CLINIC_INFO, SERVICES, FAQS, MOBILE_FAQS } from '../src/data/clinicData';
import { DENTAL_TREATMENTS, formatPersianTomans } from '../src/utils/costCalculator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export type ProposalActionType =
  | 'seo_settings'
  | 'rank_one_seo_package'
  | 'fix_site_bugs'
  | 'sync_doctor_profile'
  | 'apply_uploaded_media'
  | 'publish_seo_article'
  | 'enrich_articles_seo'
  | 'fix_media_alt_tags'
  | 'add_seo_faqs'
  | 'reply_unanswered_comments'
  | 'update_clinic_info'
  | 'update_treatment_price'
  | 'update_homepage_hero'
  | 'custom_cms_patch';

export interface AiAdminProposal {
  id: string;
  title: string;
  category: 'seo' | 'content' | 'media' | 'clinic' | 'engagement' | 'pricing' | 'bugfix';
  categoryLabel: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedImpact: string;
  actionType: ProposalActionType;
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  executedAt?: string;
}

export interface AiSchedulerConfig {
  enabled: boolean;
  publishTime: string;
  frequency: 'daily' | 'every_2_days' | 'weekly';
  autoPublish: boolean;
  topicQueue: string[];
  lastRunDate?: string;
  lastRunAt?: string;
  lastPublishedTitle?: string;
  totalAutoPublished: number;
}

export interface AiActivityLog {
  id: string;
  timestamp: string;
  type: 'audit' | 'proposal_executed' | 'auto_article' | 'chat_command' | 'scheduler_update';
  title: string;
  details: string;
}

export interface SeoAuditReport {
  generatedAt: string;
  overallScore: number;
  scores: {
    technicalSeo: number;
    contentSeo: number;
    mediaSeo: number;
    conversionHealth: number;
  };
  stats: {
    articlesCount: number;
    servicesCount: number;
    casesCount: number;
    faqsCount: number;
    pendingAppointments: number;
    unansweredComments: number;
    mediaMissingAlt: number;
  };
  strengths: string[];
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    section: string;
    message: string;
  }>;
}

export interface AdminChatAttachment {
  url?: string;
  mimeType: string;
  name: string;
  base64Data?: string;
}

export interface AiAdminState {
  scheduler: AiSchedulerConfig;
  proposals: AiAdminProposal[];
  activityLogs: AiActivityLog[];
  lastAudit?: SeoAuditReport;
}

const DEFAULT_SEO_TOPICS = [
  'مقایسه جامع کامپوزیت ونیر نانوسرامیک و لمینت سرامیکی E-Max؛ کدام برای لبخند شما مناسب‌تر است؟',
  'راهنمای کامل کاشت ایمپلنت دیجیتال بدون درد و جراحی؛ مراحل، مزایا و طول عمر',
  'مراقبت‌های طلایی بعد از عصب‌کشی (درمان ریشه دیجیتال) برای پیشگیری از شکستگی دندان',
  'علت حساسیت دندان به سرما و گرما چیست و چگونه در کلینیک دندان‌پزشکی درمان می‌شود؟',
  'بلیچینگ تخصصی مطب در مقایسه با روش‌های خانگی؛ سفید کردن ایمن دندان بدون آسیب به مینا',
  'بهترین سن معاینه دندان‌پزشکی کودکان، فیشورسیلانت و فلورایدتراپی برای پیشگیری از پوسیدگی',
  'جراحی دندان عقل نهفته و نیمه‌نهفته؛ علائم هشداردهنده و مراقبت‌های پس از جراحی',
  'اصلاح طرح لبخند لثه‌ای (ژنژیوکتومی با لیزر) و تاثیر آن بر تناسب زیبایی چهره',
];

const ARTICLE_COVER_POOL = [
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
];

function ensureAiAdminState(db: DbSchema): AiAdminState {
  if (!db.aiAdmin) {
    db.aiAdmin = {
      scheduler: {
        enabled: false,
        publishTime: '10:00',
        frequency: 'daily',
        autoPublish: true,
        topicQueue: [...DEFAULT_SEO_TOPICS.slice(0, 4)],
        totalAutoPublished: 0,
      },
      proposals: [],
      activityLogs: [],
    };
  }
  if (!db.aiAdmin.scheduler) {
    db.aiAdmin.scheduler = {
      enabled: false,
      publishTime: '10:00',
      frequency: 'daily',
      autoPublish: true,
      topicQueue: [...DEFAULT_SEO_TOPICS.slice(0, 4)],
      totalAutoPublished: 0,
    };
  }
  if (!Array.isArray(db.aiAdmin.proposals)) {
    db.aiAdmin.proposals = [];
  }
  if (!Array.isArray(db.aiAdmin.activityLogs)) {
    db.aiAdmin.activityLogs = [];
  }
  return db.aiAdmin as AiAdminState;
}

function addActivityLog(
  db: DbSchema,
  type: AiActivityLog['type'],
  title: string,
  details: string
) {
  const state = ensureAiAdminState(db);
  state.activityLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleString('fa-IR'),
    type,
    title,
    details,
  });
  state.activityLogs = state.activityLogs.slice(0, 40);
}

async function callGeminiText(systemInstruction: string, prompt: string, jsonMode = false): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || !apiKey.trim()) return null;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });

  const candidates: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
    { model: 'gemini-3-flash-preview', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.1-flash-lite-preview', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
  ];

  for (const c of candidates) {
    try {
      const res = await ai.models.generateContent({
        model: c.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          temperature: jsonMode ? 0.35 : 0.6,
          responseMimeType: jsonMode ? 'application/json' : undefined,
          thinkingConfig: { thinkingLevel: c.thinkingLevel },
        },
      });
      const text = res.text?.trim();
      if (text) return text;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * 1. Comprehensive Site & SEO Audit + Automatic Proposal Generation
 */
export function runSiteAndSeoAudit(saveToDb = true): {
  audit: SeoAuditReport;
  proposals: AiAdminProposal[];
} {
  const db = readDb();
  const state = ensureAiAdminState(db);

  const siteSettings = db.siteSettings || {};
  const info = { ...CLINIC_INFO, ...(db.clinicInfo || {}) };
  const articles = Array.isArray(db.articles) ? db.articles : [];
  const services = Array.isArray(db.services) && db.services.length > 0 ? db.services : SERVICES;
  const cases = Array.isArray(db.transformations) ? db.transformations : [];
  const faqs = Array.isArray(db.faqs) && db.faqs.length > 0 ? db.faqs : FAQS;
  const appointments = Array.isArray(db.appointments) ? db.appointments : [];
  const comments = Array.isArray(db.comments) ? db.comments : [];
  const media = Array.isArray(db.media) ? db.media : [];

  const pendingAppointments = appointments.filter((a: any) => a.status === 'pending').length;
  const unansweredComments = comments.filter(
    (c: any) => c.status === 'pending' || (c.status === 'approved' && (!c.doctorReply || !c.doctorReply.trim()))
  ).length;
  const mediaMissingAlt = media.filter((m: any) => !m.alt || m.alt.trim().length < 5).length;

  const strengths: string[] = [];
  const issues: SeoAuditReport['issues'] = [];
  const newProposals: AiAdminProposal[] = [];

  let technicalSeo = 84;
  const titleLen = (siteSettings.siteTitle || '').length;
  const descLen = (siteSettings.metaDescription || '').length;
  const keywordsCount = (siteSettings.metaKeywords || '').split(/[،,]/).filter(Boolean).length;

  if (titleLen >= 35 && titleLen <= 75) {
    technicalSeo += 6;
    strengths.push('عنوان سئو (Title Tag) دارای طول استاندارد و شامل نام پزشک و موقعیت مکانی است.');
  } else {
    technicalSeo -= 6;
    issues.push({
      severity: 'high',
      section: 'سئو تکنیکال و متاتگ‌ها',
      message: 'عنوان سئو سایت (Title) یا توضیحات متا (Meta Description) می‌تواند برای کلمات کلیدی محلی پاکدشت و شرق تهران غنی‌تر شود.',
    });
  }

  if (descLen >= 110 && descLen <= 185 && keywordsCount >= 8) {
    technicalSeo += 8;
    strengths.push('توضیحات متا (Meta Description) و داده‌های ساختاریافته Schema.org (Dentist + FAQPage) فعال هستند.');
  } else {
    newProposals.push({
      id: 'prop-rank-one-seo',
      title: 'اجرای بسته جامع «رتبه ۱ گوگل» (بهینه‌سازی متاتگ‌ها، اسکیما محلی، E-E-A-T و کلمات کلیدی طلایی)',
      category: 'seo',
      categoryLabel: 'سئو و رتبه ۱ گوگل',
      priority: 'high',
      description:
        'بهینه‌سازی کامل عنوان سئو، متا دیسکریپشن با نرخ کلیک بالا، افزودن کلمات کلیدی پرجستجو، غنی‌سازی اسکیما FAQPage و تقویت سیگنال‌های تخصصی پزشک (E-E-A-T).',
      expectedImpact: 'بیشترین تاثیر در صعود به رتبه ۱ گوگل برای جستجوهای دندان‌پزشکی، ایمپلنت و طراحی لبخند',
      actionType: 'rank_one_seo_package',
      payload: {},
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    });
  }

  // Bug & Consistency check across the database
  const docImgClinic = db.clinicInfo?.doctorImage;
  const docImgHome = db.homePageSettings?.doctor?.imageUrl;
  const docImgAbout = db.aboutPageSettings?.hero?.doctorImage;
  const canonicalDocImage = docImgAbout || docImgHome || docImgClinic || '/images/dr-shamspoor.jpg';

  const articlesMissingSlug = articles.filter((a: any) => !a.slug || !a.slug.trim()).length;

  if (!docImgClinic || !docImgHome || !docImgAbout || docImgClinic !== docImgAbout || articlesMissingSlug > 0) {
    issues.push({
      severity: 'medium',
      section: 'بررسی فنی و رفع باگ‌های یکپارچگی سایت',
      message:
        'عدم تطابق برخی آدرس‌های تصاویر (از جمله تصویر پروفایل پزشک در بخش‌های مختلف)، اسلاگ مقالات یا تگ‌های Alt شناسایی شد.',
    });
    newProposals.push({
      id: 'prop-fix-site-bugs',
      title: 'رفع خودکار باگ‌های فنی، یکپارچه‌سازی تصویر دکتر شمس‌پور و استانداردسازی لینک‌ها و اسلاگ‌ها',
      category: 'bugfix',
      categoryLabel: 'رفع باگ و بهینه‌سازی فنی',
      priority: 'high',
      description:
        'یکپارچه‌سازی تصویر رسمی دکتر شمس‌پور در کل صفحات و چت‌بات، اصلاح اسلاگ‌های خالی مقالات، همگام‌سازی شماره‌های تماس و تکمیل تگ‌های Alt تصاویر.',
      expectedImpact: 'رفع ۱۰۰٪ ناهماهنگی‌های بصری و خطاهای احتمالی ایندکس گوگل',
      actionType: 'fix_site_bugs',
      payload: {
        doctorImage: canonicalDocImage,
      },
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    });
  } else {
    strengths.push('یکپارچگی فنی تصاویر، اسلاگ‌ها و پروفایل رسمی دکتر شمس‌پور در تمام بخش‌های سایت برقرار است.');
  }

  let contentSeo = Math.min(96, 65 + articles.length * 5);
  const articlesMissingFaqs = articles.filter((a: any) => !Array.isArray(a.faqs) || a.faqs.length === 0).length;

  if (articles.length >= 5) {
    strengths.push(`${articles.length} مقاله تخصصی دندان‌پزشکی در وبلاگ منتشر شده و در نقشه سایت (sitemap.xml) ثبت است.`);
  }

  newProposals.push({
    id: 'prop-new-seo-article',
    title: 'نگارش و انتشار مقاله جامع سئو: «راهنمای کامل ایمپلنت دیجیتال بدون درد و مراحل کاشت»',
    category: 'content',
    categoryLabel: 'تولید محتوا و مقالات سئو',
    priority: 'high',
    description:
      'تولید یک مقاله علمی، کامل و سئو شده شامل مقدمه، جدول مقایسه ایمپلنت با بریج، نکات مراقبتی، پرسش‌های متداول (FAQ Schema) و تگ‌های هدفمند.',
    expectedImpact: 'جذب ترافیک ارگانیک گوگل برای عبارات پرجستجوی کاشت دندان و ایمپلنت',
    actionType: 'publish_seo_article',
    payload: {
      topic: 'راهنمای کامل کاشت ایمپلنت دیجیتال بدون درد؛ مراحل، ماندگاری و مراقبت‌های پس از جراحی',
      category: 'implant',
    },
    status: 'pending',
    createdAt: new Date().toLocaleString('fa-IR'),
  });

  if (articlesMissingFaqs > 0) {
    contentSeo -= 6;
    newProposals.push({
      id: 'prop-enrich-articles',
      title: 'غنی‌سازی خودکار ساختار سئو، نکات کلیدی و FAQ تمام مقالات موجود',
      category: 'content',
      categoryLabel: 'بهینه‌سازی محتوا',
      priority: 'medium',
      description:
        'بررسی تمام مقالات منتشرشده و افزودن خودکار پرسش‌های متداول، نکات کلیدی، برچسب‌های سئو و اسلاگ استاندارد به مقالاتی که نقص دارند.',
      expectedImpact: 'فعال‌سازی Rich Snippets گوگل برای تمامی صفحات مقالات',
      actionType: 'enrich_articles_seo',
      payload: {},
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    });
  }

  let mediaSeo = mediaMissingAlt === 0 ? 95 : Math.max(68, 92 - mediaMissingAlt * 4);
  let conversionHealth = unansweredComments === 0 ? 94 : 84;

  if (unansweredComments > 0) {
    newProposals.push({
      id: 'prop-reply-comments',
      title: `پاسخ‌دهی هوشمند پزشکی و تأیید ${unansweredComments} دیدگاه بی‌پاسخ بیماران`,
      category: 'engagement',
      categoryLabel: 'تعامل و اعتمادسازی',
      priority: 'high',
      description:
        'نگارش پاسخ علمی، محترمانه و اختصاصی از طرف دکتر انوشیروان شمس‌پور برای دیدگاه‌های در انتظار بررسی یا بدون پاسخ در مقالات.',
      expectedImpact: 'افزایش اعتماد مراجعین و به‌روزرسانی محتوای تعاملی صفحات (UGC SEO)',
      actionType: 'reply_unanswered_comments',
      payload: {},
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    });
  }

  const overallScore = Math.round(
    technicalSeo * 0.3 + contentSeo * 0.3 + mediaSeo * 0.2 + conversionHealth * 0.2
  );

  const audit: SeoAuditReport = {
    generatedAt: new Date().toLocaleString('fa-IR'),
    overallScore: Math.min(100, Math.max(50, overallScore)),
    scores: {
      technicalSeo: Math.min(100, Math.max(50, technicalSeo)),
      contentSeo: Math.min(100, Math.max(50, contentSeo)),
      mediaSeo: Math.min(100, Math.max(50, mediaSeo)),
      conversionHealth: Math.min(100, Math.max(50, conversionHealth)),
    },
    stats: {
      articlesCount: articles.length,
      servicesCount: services.length,
      casesCount: cases.length,
      faqsCount: faqs.length,
      pendingAppointments,
      unansweredComments,
      mediaMissingAlt,
    },
    strengths,
    issues,
  };

  if (saveToDb) {
    state.lastAudit = audit;
    const existingPendingIds = new Set(
      state.proposals.filter((p) => p.status === 'pending').map((p) => p.id)
    );
    for (const np of newProposals) {
      if (!existingPendingIds.has(np.id)) {
        state.proposals.unshift(np);
      }
    }
    state.proposals = state.proposals.slice(0, 25);
    writeDb(db);
  }

  return {
    audit,
    proposals: state.proposals,
  };
}

/**
 * 2. Generates a rich, medically accurate, SEO-optimized Dental Article
 */
export async function generateFullSeoArticleObject(topicInput?: string, preferredCategory?: string): Promise<any> {
  const db = readDb();
  const info = { ...CLINIC_INFO, ...(db.clinicInfo || {}) };
  const existingTitles = new Set((db.articles || []).map((a: any) => (a.title || '').trim()));

  let topic = (topicInput || '').trim();
  if (!topic) {
    const unused = DEFAULT_SEO_TOPICS.find((t) => !existingTitles.has(t));
    topic = unused || `راهنمای جامع سلامت دهان، طراحی لبخند و درمان‌های نوین دندان‌پزشکی (${new Date().toLocaleDateString('fa-IR')})`;
  }

  const systemPrompt = `تو نویسنده ارشد علمی و متخصص سئو پزشکی در «کلینیک دندان‌پزشکی پارمیس» به مدیریت «${info.doctorName}» (کد نظام پزشکی ${info.medicalCouncilCode}، واقع در پاکدشت، مجتمع پزشکی راستین) هستی.
وظیفه تو نگارش یک مقاله دندان‌پزشکی فوق‌العاده باکیفیت، علمی، جامع و سئو شده به زبان فارسی در قالب JSON دقیق است.

ساختار JSON خروجی باید دقیقاً شامل فیلدهای زیر باشد:
{
  "title": "عنوان جذاب و سئو شده مقاله",
  "slug": "english-url-friendly-slug",
  "category": "یکی از مقادیر: cosmetic | implant | restorative | endo | pediatric | surgery | prevention",
  "categoryName": "نام فارسی دسته",
  "readTime": "۷ دقیقه مطالعه",
  "summary": "چکیده جذاب ۲ تا ۳ جمله‌ای برای متا دیسکریپشن و کارت مقاله",
  "introduction": "مقدمه علمی و همدلانه ۲ پاراگرافی درباره اهمیت موضوع برای مراجعین",
  "content": "متن کامل و جامع مقاله در ۵ تا ۶ بخش با تیترهای مشخص، توضیحات علمی دقیق، مراحل درمان در کلینیک پارمیس و مزایا",
  "keyHighlights": ["نکته کلیدی اول", "نکته کلیدی دوم", "نکته کلیدی سوم", "نکته کلیدی چهارم"],
  "comparisonTable": {
    "title": "عنوان جدول مقایسه‌ای مرتبط با موضوع مقاله",
    "headers": ["ویژگی / معیار", "روش اول / استاندارد", "روش دوم / سنتی"],
    "rows": [
      ["طول عمر و ماندگاری", "بسیار بالا (۱۰ تا ۱۵ سال)", "متوسط (۵ تا ۷ سال)"],
      ["میزان درد و تهاجم", "کاملاً بدون درد با بی‌حسی دیجیتال", "نیازمند دوره نقاهت طولانی‌تر"],
      ["تعداد جلسات درمان", "۱ تا ۲ جلسه در کلینیک پارمیس", "۳ جلسه یا بیشتر"]
    ]
  },
  "doctorQuote": {
    "quote": "نقل‌قول علمی و اطمینان‌بخش از دکتر انوشیروان شمس‌پور درباره این درمان",
    "doctorName": "دکتر انوشیروان شمس‌پور",
    "doctorTitle": "جراح و دندان‌پزشک - نظام پزشکی ۱۴۷۸۹۳"
  },
  "tips": ["توصیه مراقبتی اول", "توصیه مراقبتی دوم", "توصیه مراقبتی سوم"],
  "faqs": [
    { "question": "سوال پرتکرار اول بیماران؟", "answer": "پاسخ علمی و دقیق اول" },
    { "question": "سوال پرتکرار دوم بیماران؟", "answer": "پاسخ علمی و دقیق دوم" }
  ],
  "tags": ["ایمپلنت_پاکدشت", "دکتر_انوشیروان_شمس_پور", "کلینیک_پارمیس", "طراحی_لبخند"]
}`;

  const rawJson = await callGeminiText(
    systemPrompt,
    `موضوع مقاله برای نگارش کامل سئو: «${topic}»`,
    true
  );

  let parsed: any = null;
  if (rawJson) {
    try {
      const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }
  }

  const coverImage = ARTICLE_COVER_POOL[Math.floor(Math.random() * ARTICLE_COVER_POOL.length)];
  const nowId = `art-ai-${Date.now()}`;
  const persianDate = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (parsed && parsed.title && parsed.content) {
    return {
      id: nowId,
      slug: parsed.slug || `dental-guide-${Date.now().toString(36)}`,
      title: parsed.title,
      category: preferredCategory || parsed.category || 'cosmetic',
      categoryName: parsed.categoryName || 'آموزش و سلامت دندان',
      date: persianDate,
      readTime: parsed.readTime || '۶ دقیقه مطالعه',
      image: coverImage,
      mobileImage: coverImage,
      author: info.doctorName || 'دکتر انوشیروان شمس‌پور',
      authorRole: info.doctorRole || 'جراح و دندان‌پزشک • زیبایی و ایمپلنت',
      authorAvatar: info.doctorImage || '/images/dr-shamspoor.jpg',
      summary: parsed.summary || topic,
      introduction: parsed.introduction || parsed.summary || '',
      content: parsed.content,
      keyHighlights: Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights : [],
      comparisonTable: parsed.comparisonTable || undefined,
      doctorQuote: parsed.doctorQuote || {
        quote: 'هدف ما در کلینیک پارمیس، ارائه درمان‌های کم‌تهاجمی، بدون درد و ماندگار با حفظ سلامت طبیعی بافت دندان است.',
        doctorName: info.doctorName || 'دکتر انوشیروان شمس‌پور',
        doctorTitle: `جراح و دندان‌پزشک • نظام پزشکی ${info.medicalCouncilCode || '۱۴۷۸۹۳'}`,
      },
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
      tags: Array.isArray(parsed.tags)
        ? parsed.tags
        : ['دکتر_انوشیروان_شمس_پور', 'کلینیک_دندانپزشکی_پارمیس', 'دندانپزشکی_پاکدشت'],
      showComments: true,
    };
  }

  return {
    id: nowId,
    slug: `parmis-dental-seo-${Date.now().toString(36)}`,
    title: topic,
    category: preferredCategory || 'cosmetic',
    categoryName: 'مقالات تخصصی کلینیک پارمیس',
    date: persianDate,
    readTime: '۶ دقیقه مطالعه',
    image: coverImage,
    mobileImage: coverImage,
    author: info.doctorName || 'دکتر انوشیروان شمس‌پور',
    authorRole: info.doctorRole || 'جراح و دندان‌پزشک • زیبایی و ایمپلنت',
    authorAvatar: info.doctorImage || '/images/dr-shamspoor.jpg',
    summary: `بررسی علمی و کاربردی «${topic}» به همراه نکات مراقبتی، مراحل درمان بدون درد و پاسخ به پرسش‌های متداول بیماران در کلینیک دندان‌پزشکی پارمیس پاکدشت.`,
    introduction: `آگاهی از روش‌های نوین و کم‌تهاجمی در دندان‌پزشکی به شما کمک می‌کند تا با آرامش خاطر و دیدی علمی، بهترین تصمیم را برای سلامت و زیبایی لبخند خود بگیرید. در این مقاله تخصصی که زیر نظر دکتر انوشیروان شمس‌پور تدوین شده است، تمامی نکات کلیدی پیرامون «${topic}» را بررسی می‌کنیم.`,
    content: `۱. اهمیت تشخیص دقیق و طرح درمان اختصاصی\nدر کلینیک دندان‌پزشکی پارمیس پاکدشت، اولین گام برای هر درمان موفق، معاینه دقیق بالینی و بررسی وضعیت مینای دندان، بافت لثه و ساختار فک است. انتخاب متریال استاندارد جهانی و تکنیک‌های دیجیتال باعث می‌شود طول عمر درمان به حداکثر برسد.\n\n۲. مراحل انجام درمان بدون درد\nبا بهره‌گیری از بی‌حسی موضعی استاندارد و تجهیزات مدرن، تمامی مراحل درمان در محیطی آرام و استریل (مجهز به اتوکلاو کلاس B بیمارستانی) انجام می‌گیرد تا مراجعین هیچ‌گونه استرس یا دردی را تجربه نکنند.\n\n۳. مراقبت‌های طلایی برای ماندگاری طولانی‌مدت\nرعایت بهداشت روزانه شامل مسواک نرم، استفاده از نخ دندان، پرهیز از شکستن اجسام سخت با دندان‌ها و مراجعه دوره‌ای هر ۶ ماه یک‌بار برای چکاپ، تضمین‌کننده سلامت و درخشش لبخند شما برای سال‌های متمادی خواهد بود.`,
    keyHighlights: [
      'انجام کلیه مراحل تحت نظر مستقیم دکتر انوشیروان شمس‌پور (نظام پزشکی ۱۴۷۸۹۳)',
      'بهره‌گیری از متریال اورجینال سوئیسی، آلمانی و آمریکایی با ضمانت کیفیت',
      'رعایت کامل پروتکل‌های استریلیزاسیون بیمارستانی (اتوکلاو کلاس B)',
      'ویزیت اولیه رایگان و صدور فاکتور رسمی جهت بیمه‌های تکمیلی',
    ],
    tips: [
      'تا ۴۸ ساعت پس از درمان‌های زیبایی از مصرف مواد غذایی و نوشیدنی‌های رنگدانه‌دار غلیظ پرهیز کنید.',
      'استفاده شبانه از نخ دندان، اصلی‌ترین عامل پیشگیری از پوسیدگی‌های بین‌دندانی و التهاب لثه است.',
    ],
    faqs: [
      {
        question: 'آیا ویزیت و مشاوره اولیه در کلینیک پارمیس هزینه دارد؟',
        answer: 'خیر، ویزیت اولیه، معاینه و ارائه طرح درمان اختصاصی توسط دکتر انوشیروان شمس‌پور با هماهنگی قبلی کاملاً رایگان است.',
      },
    ],
    tags: ['دکتر_انوشیروان_شمس_پور', 'کلینیک_پارمیس', 'دندانپزشکی_پاکدشت', 'طراحی_لبخند'],
    showComments: true,
  };
}

/**
 * 3. Executes an approved proposal and writes changes to db.json
 */
export async function executeAdminProposal(proposalId: string): Promise<{
  success: boolean;
  message: string;
  proposal?: AiAdminProposal;
}> {
  const db = readDb();
  const state = ensureAiAdminState(db);
  const proposal = state.proposals.find((p) => p.id === proposalId);

  if (!proposal) {
    throw new Error('پیشنهاد مورد نظر یافت نشد.');
  }
  if (proposal.status === 'approved') {
    return {
      success: true,
      message: 'این پیشنهاد قبلاً تأیید و پیاده‌سازی شده است.',
      proposal,
    };
  }

  const { actionType, payload } = proposal;
  let resultMessage = '';

  if (actionType === 'seo_settings' || actionType === 'rank_one_seo_package') {
    db.siteSettings = {
      ...(db.siteSettings || {}),
      siteTitle:
        payload.siteTitle ||
        'دکتر انوشیروان شمس‌پور | بهترین دندان‌پزشک زیبایی، ایمپلنت و عصب‌کشی در پاکدشت (کلینیک پارمیس)',
      metaDescription:
        payload.metaDescription ||
        'کلینیک تخصصی دندان‌پزشکی پارمیس به مدیریت دکتر انوشیروان شمس‌پور (نظام پزشکی ۱۴۷۸۹۳) در پاکدشت. ایمپلنت دیجیتال بدون درد، لمینت سرامیکی، کامپوزیت ونیر، عصب‌کشی روتاری و ویزیت رایگان.',
      metaKeywords:
        payload.metaKeywords ||
        'دکتر انوشیروان شمس پور, دندانپزشکی پارمیس پاکدشت, بهترین دندانپزشک پاکدشت, ایمپلنت دندان در پاکدشت, کامپوزیت ونیر پاکدشت, لمینت دندان پاکدشت, عصب کشی بدون درد پاکدشت, دندانپزشکی طرف قرارداد بیمه تکمیلی پاکدشت, جراحی دندان عقل پاکدشت, طراحی لبخند دیجیتال',
    };

    if (actionType === 'rank_one_seo_package') {
      // Also enrich FAQs and Articles for Schema.org
      if (!Array.isArray(db.faqs)) db.faqs = [...FAQS];
      if (db.faqs.length < 10) {
        db.faqs.push({
          id: `faq-rank1-${Date.now()}`,
          icon: 'verified',
          question: 'چرا کلینیک دندان‌پزشکی پارمیس دکتر شمس‌پور بهترین انتخاب برای ایمپلنت و طراحی لبخند در پاکدشت است؟',
          answer:
            'بهره‌گیری از بیش از ۱۲ سال تجربه بالینی، بیش از ۵,۰۰۰ درمان موفق، تجهیزات دیجیتال روتاری و ایمپلنت بدون درد، اتوکلاو بیمارستانی کلاس B، ویزیت اولیه رایگان و صدور فاکتور رسمی بیمه تکمیلی.',
        });
      }
      resultMessage =
        'بسته جامع سئو رتبه ۱ گوگل (متاتگ‌های طلایی، کلمات کلیدی محلی، اسکیما FAQPage و سیگنال‌های E-E-A-T) با موفقیت در سایت پیاده‌سازی شد.';
    } else {
      resultMessage = 'تنظیمات سئو سراسری (عنوان، توضیحات متا و کلمات کلیدی) با موفقیت در دیتابیس سایت اعمال شد.';
    }
  } else if (actionType === 'fix_site_bugs' || actionType === 'sync_doctor_profile') {
    const img =
      payload.doctorImage ||
      db.aboutPageSettings?.hero?.doctorImage ||
      db.homePageSettings?.doctor?.imageUrl ||
      '/images/dr-shamspoor.jpg';
    const name = payload.doctorName || 'دکتر انوشیروان شمس‌پور';
    const role = payload.doctorRole || 'جراح و دندان‌پزشک • زیبایی و ایمپلنت';
    const code = payload.medicalCouncilCode || '۱۴۷۸۹۳';

    db.clinicInfo = {
      ...(db.clinicInfo || {}),
      doctorName: name,
      doctorRole: role,
      medicalCouncilCode: code,
      doctorImage: img,
    };
    db.doctor = {
      ...(db.doctor || {}),
      name,
      role,
      medicalCouncilCode: code,
      image: img,
    };
    if (db.homePageSettings?.doctor) {
      db.homePageSettings.doctor.imageUrl = img;
      db.homePageSettings.doctor.name = name;
    }
    if (db.aboutPageSettings?.hero) {
      db.aboutPageSettings.hero.doctorImage = img;
    }
    db.siteImages = {
      ...(db.siteImages || {}),
      doctorProfileImage: {
        url: img,
        alt: `${name} - ${role}`,
        title: `${name} (کد نظام پزشکی ${code})`,
      },
    };

    // Also fix any missing slugs on articles and missing alt tags on media
    if (Array.isArray(db.articles)) {
      db.articles = db.articles.map((a: any, idx: number) => ({
        ...a,
        slug: a.slug && a.slug.trim() ? a.slug : `parmis-dental-article-${a.id || idx + 1}`,
        authorAvatar: a.authorAvatar || img,
      }));
    }
    if (Array.isArray(db.media)) {
      db.media = db.media.map((m: any) => ({
        ...m,
        alt:
          m.alt && m.alt.trim().length >= 5
            ? m.alt
            : `${m.title || 'تصویر کلینیک'} - کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور`,
      }));
    }

    resultMessage =
      'کلیه باگ‌های فنی، ناهماهنگی‌های تصویر پروفایل دکتر شمس‌پور در صفحات، اسلاگ‌های مقالات و تگ‌های Alt تصاویر به صورت خودکار رفع و یکپارچه‌سازی شدند.';
  } else if (actionType === 'apply_uploaded_media') {
    const mediaUrl = payload.mediaUrl;
    const target = payload.target || 'doctor';
    if (mediaUrl) {
      if (target === 'doctor') {
        db.clinicInfo = { ...(db.clinicInfo || {}), doctorImage: mediaUrl };
        db.doctor = { ...(db.doctor || {}), image: mediaUrl };
        if (db.homePageSettings?.doctor) db.homePageSettings.doctor.imageUrl = mediaUrl;
        if (db.aboutPageSettings?.hero) db.aboutPageSettings.hero.doctorImage = mediaUrl;
        resultMessage = 'فایل آپلودشده شما با موفقیت به عنوان تصویر رسمی دکتر انوشیروان شمس‌پور در سراسر سایت جایگزین شد.';
      } else if (target === 'hero') {
        db.hero = { ...(db.hero || {}), image: mediaUrl };
        if (db.homePageSettings?.hero) db.homePageSettings.hero.imageUrl = mediaUrl;
        resultMessage = 'فایل آپلودشده شما با موفقیت در بنر اصلی (Hero) صفحه اول سایت قرار گرفت.';
      } else {
        resultMessage = 'رسانه آپلودشده با موفقیت در بخش مورد نظر سایت اعمال شد.';
      }
    }
  } else if (actionType === 'publish_seo_article') {
    const articleObj = await generateFullSeoArticleObject(payload.topic, payload.category);
    if (payload.coverImage) {
      articleObj.image = payload.coverImage;
      articleObj.mobileImage = payload.coverImage;
    }
    if (!Array.isArray(db.articles)) db.articles = [];
    db.articles.unshift(articleObj);
    resultMessage = `مقاله علمی و سئو شده «${articleObj.title}» با موفقیت تولید و در بخش وبلاگ سایت منتشر شد.`;
  } else if (actionType === 'enrich_articles_seo') {
    if (Array.isArray(db.articles)) {
      db.articles = db.articles.map((art: any) => {
        const updated = { ...art };
        if (!Array.isArray(updated.faqs) || updated.faqs.length === 0) {
          updated.faqs = [
            {
              question: `آیا درمان مطرح‌شده در «${updated.title}» درد دارد؟`,
              answer:
                'خیر؛ در کلینیک پارمیس تمامی مراحل با بی‌حسی موضعی استاندارد و تکنیک‌های دیجیتال کم‌تهاجمی کاملاً بدون درد انجام می‌شود.',
            },
            {
              question: 'چگونه می‌توانم برای مشاوره حضوری با دکتر شمس‌پور وقت بگیرم؟',
              answer:
                'شما می‌توانید از طریق دکمه نوبت‌دهی آنلاین در بالای سایت یا تماس با شماره ۰۲۱۳۶۰۴۸۵۸۱، وقت ویزیت رایگان خود را هماهنگ فرمایید.',
            },
          ];
        }
        if (!Array.isArray(updated.keyHighlights) || updated.keyHighlights.length === 0) {
          updated.keyHighlights = [
            'تشخیص دقیق بالینی توسط دکتر انوشیروان شمس‌پور',
            'استفاده از متریال استاندارد جهانی با ماندگاری بالا',
            'رعایت کامل استریلیزاسیون بیمارستانی (اتوکلاو کلاس B)',
          ];
        }
        if (!Array.isArray(updated.tags) || updated.tags.length === 0) {
          updated.tags = ['دکتر_انوشیروان_شمس_پور', 'کلینیک_پارمیس', 'دندانپزشکی_پاکدشت'];
        }
        return updated;
      });
      resultMessage = `ساختار سئو، پرسش‌های متداول (FAQ Schema) و نکات کلیدی برای تمامی مقالات سایت تکمیل و بهینه‌سازی شد.`;
    }
  } else if (actionType === 'fix_media_alt_tags') {
    let fixedCount = 0;
    if (Array.isArray(db.media)) {
      db.media = db.media.map((m: any) => {
        if (!m.alt || m.alt.trim().length < 5) {
          fixedCount++;
          return {
            ...m,
            alt: `${m.title || 'تصویر درمانی'} - کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور پاکدشت`,
            title: m.title || 'کلینیک دندان‌پزشکی پارمیس - دکتر انوشیروان شمس‌پور',
          };
        }
        return m;
      });
    }
    resultMessage = `تگ‌های Alt و عنوان سئو برای ${fixedCount} فایل رسانه‌ای در کتابخانه سایت بهینه‌سازی شد.`;
  } else if (actionType === 'add_seo_faqs') {
    if (!Array.isArray(db.faqs)) db.faqs = [...FAQS];
    const newFaqs = [
      {
        id: `faq-seo-${Date.now()}-1`,
        icon: 'receipt_long',
        question: 'آیا کلینیک پارمیس برای بیمه‌های تکمیلی فاکتور رسمی صادر می‌کند؟',
        answer:
          'بله؛ پس از انجام کلیه خدمات درمانی، فاکتور رسمی و معتبر ممهور به مهر نظام پزشکی دکتر انوشیروان شمس‌پور (۱۴۷۸۹۳) جهت دریافت هزینه از تمامی بیمه‌های تکمیلی صادر و تقدیم می‌گردد.',
      },
      {
        id: `faq-seo-${Date.now()}-2`,
        icon: 'verified',
        question: 'ماندگاری کامپوزیت ونیر و لمینت سرامیکی در کلینیک پارمیس چقدر است؟',
        answer:
          'کامپوزیت ونیرهای نانوسرامیک به طور میانگین ۵ تا ۸ سال و لمینت‌های سرامیکی E-Max بین ۱۰ تا ۱۵ سال دوام و ثبات رنگ دارند.',
      },
    ];
    db.faqs = [...db.faqs, ...newFaqs];
    resultMessage = 'پرسش و پاسخ‌های کلیدی سئو به بخش سوالات متداول سایت و اسکیما FAQPage گوگل اضافه شدند.';
  } else if (actionType === 'reply_unanswered_comments') {
    let repliedCount = 0;
    if (Array.isArray(db.comments)) {
      db.comments = db.comments.map((c: any) => {
        if (c.status === 'pending' || (c.status === 'approved' && (!c.doctorReply || !c.doctorReply.trim()))) {
          repliedCount++;
          return {
            ...c,
            status: 'approved',
            doctorReply:
              payload.customReply ||
              `مراجع گرامی ${c.authorName || ''} عزیز، از ثبت دیدگاه و پرسش شما سپاسگزاریم. در کلینیک دندان‌پزشکی پارمیس، انتخاب دقیق‌ترین روش درمانی پس از معاینه حضوری (ویزیت اولیه رایگان) انجام می‌شود. برای هماهنگی وقت می‌توانید با شماره ۰۲۱۳۶۰۴۸۵۸۱ تماس بگیرید.`,
            repliedAt: new Date().toLocaleDateString('fa-IR'),
            repliedBy: 'دکتر انوشیروان شمس‌پور',
          };
        }
        return c;
      });
    }
    resultMessage = `پاسخ تخصصی پزشک برای ${repliedCount} دیدگاه ثبت شد و وضعیت آن‌ها به «تأیید شده» تغییر یافت.`;
  } else if (actionType === 'update_clinic_info') {
    db.clinicInfo = {
      ...(db.clinicInfo || {}),
      ...payload,
    };
    if (db.contact) {
      if (payload.phoneDisplay) db.contact.phone = payload.phoneDisplay;
      if (payload.address) db.contact.address = payload.address;
    }
    resultMessage = 'اطلاعات تماس و مشخصات کلینیک با موفقیت در سراسر سایت به‌روزرسانی شد.';
  } else if (actionType === 'update_treatment_price') {
    if (Array.isArray(db.treatments) && payload.treatmentId && payload.basePricePerUnitTomans) {
      db.treatments = db.treatments.map((t: any) =>
        t.id === payload.treatmentId
          ? { ...t, basePricePerUnitTomans: Number(payload.basePricePerUnitTomans) }
          : t
      );
    }
    resultMessage = `تعرفه درمان «${payload.treatmentName || payload.treatmentId}» با موفقیت در محاسبه‌گر هزینه و سایت به‌روزرسانی شد.`;
  } else if (actionType === 'update_homepage_hero') {
    db.hero = {
      ...(db.hero || {}),
      ...payload,
    };
    if (db.homePageSettings?.hero) {
      db.homePageSettings.hero = {
        ...db.homePageSettings.hero,
        ...payload,
      };
    }
    resultMessage = 'بخش هیرو (بنر ابتدایی صفحه اصلی) با موفقیت به‌روزرسانی شد.';
  } else if (actionType === 'custom_cms_patch') {
    const targetSection = payload.section;
    if (targetSection && payload.data !== undefined) {
      if (typeof payload.data === 'object' && !Array.isArray(payload.data) && db[targetSection]) {
        db[targetSection] = { ...db[targetSection], ...payload.data };
      } else {
        db[targetSection] = payload.data;
      }
      resultMessage = `بخش «${targetSection}» در دیتابیس سایت با موفقیت به‌روزرسانی شد.`;
    }
  }

  proposal.status = 'approved';
  proposal.executedAt = new Date().toLocaleString('fa-IR');

  addActivityLog(db, 'proposal_executed', `اجرای پیشنهاد: ${proposal.title}`, resultMessage);
  writeDb(db);

  runSiteAndSeoAudit(true);

  return {
    success: true,
    message: resultMessage || 'تغییرات با موفقیت در سایت اعمال شد.',
    proposal,
  };
}

export function rejectAdminProposal(proposalId: string): AiAdminProposal[] {
  const db = readDb();
  const state = ensureAiAdminState(db);
  const prop = state.proposals.find((p) => p.id === proposalId);
  if (prop) {
    prop.status = 'rejected';
    writeDb(db);
  }
  return state.proposals;
}

export function getAdminAiDashboardData(): {
  scheduler: AiSchedulerConfig;
  proposals: AiAdminProposal[];
  activityLogs: AiActivityLog[];
  audit: SeoAuditReport;
} {
  const db = readDb();
  const state = ensureAiAdminState(db);
  if (!state.lastAudit) {
    const { audit } = runSiteAndSeoAudit(true);
    return {
      scheduler: state.scheduler,
      proposals: state.proposals,
      activityLogs: state.activityLogs,
      audit,
    };
  }
  return {
    scheduler: state.scheduler,
    proposals: state.proposals,
    activityLogs: state.activityLogs,
    audit: state.lastAudit,
  };
}

export function updateSchedulerConfig(partial: Partial<AiSchedulerConfig>): AiSchedulerConfig {
  const db = readDb();
  const state = ensureAiAdminState(db);
  state.scheduler = {
    ...state.scheduler,
    ...partial,
  };
  addActivityLog(
    db,
    'scheduler_update',
    `به‌روزرسانی زمان‌بندی خودکار تولید محتوا (${state.scheduler.enabled ? `فعال در ساعت ${state.scheduler.publishTime}` : 'غیرفعال'})`,
    `فرکانس: ${state.scheduler.frequency} | تعداد موضوعات در صف: ${state.scheduler.topicQueue.length}`
  );
  writeDb(db);
  return state.scheduler;
}

export async function triggerScheduledOrImmediateArticle(
  customTopic?: string,
  source: 'manual' | 'scheduled' = 'manual'
): Promise<{
  article?: any;
  proposal?: AiAdminProposal;
  publishedDirectly: boolean;
  message: string;
}> {
  const db = readDb();
  const state = ensureAiAdminState(db);

  let topicToUse = (customTopic || '').trim();
  if (!topicToUse && state.scheduler.topicQueue.length > 0) {
    topicToUse = state.scheduler.topicQueue.shift() || '';
  }

  const articleObj = await generateFullSeoArticleObject(topicToUse);
  const todayIso = new Date().toISOString().slice(0, 10);

  if (source === 'manual' || state.scheduler.autoPublish) {
    if (!Array.isArray(db.articles)) db.articles = [];
    db.articles.unshift(articleObj);
    state.scheduler.lastRunDate = todayIso;
    state.scheduler.lastRunAt = new Date().toLocaleString('fa-IR');
    state.scheduler.lastPublishedTitle = articleObj.title;
    state.scheduler.totalAutoPublished = (state.scheduler.totalAutoPublished || 0) + 1;

    addActivityLog(
      db,
      'auto_article',
      `${source === 'scheduled' ? '⏰ انتشار خودکار زمان‌بندی‌شده' : '✨ تولید و انتشار فوری مقاله سئو'}: «${articleObj.title}»`,
      `مقاله کامل به همراه جدول مقایسه، نکات کلیدی و سوالات متداول در وبلاگ سایت منتشر شد.`
    );
    writeDb(db);

    return {
      article: articleObj,
      publishedDirectly: true,
      message: `مقاله «${articleObj.title}» با موفقیت تولید و در وبلاگ سایت منتشر شد.`,
    };
  } else {
    const prop: AiAdminProposal = {
      id: `prop-scheduled-art-${Date.now()}`,
      title: `انتشار مقاله آماده زمان‌بندی‌شده: «${articleObj.title}»`,
      category: 'content',
      categoryLabel: 'مقاله خودکار زمان‌بندی‌شده',
      priority: 'high',
      description: articleObj.summary,
      expectedImpact: 'افزایش رتبه سئو و جذب مراجعین جدید از گوگل',
      actionType: 'publish_seo_article',
      payload: {
        topic: articleObj.title,
        category: articleObj.category,
      },
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    };
    state.proposals.unshift(prop);
    state.scheduler.lastRunDate = todayIso;
    state.scheduler.lastRunAt = new Date().toLocaleString('fa-IR');
    writeDb(db);

    return {
      proposal: prop,
      publishedDirectly: false,
      message: `مقاله «${articleObj.title}» آماده شد و در صف پیشنهادهای منتظر تأیید شما قرار گرفت.`,
    };
  }
}

let schedulerIntervalId: NodeJS.Timeout | null = null;
let isSchedulerRunningJob = false;

export function initAdminAiSchedulerDaemon() {
  if (schedulerIntervalId) return;

  schedulerIntervalId = setInterval(async () => {
    if (isSchedulerRunningJob) return;
    try {
      const db = readDb();
      const state = ensureAiAdminState(db);
      const sched = state.scheduler;
      if (!sched.enabled || !sched.publishTime) return;

      const now = new Date();
      let currentHm = '';
      try {
        currentHm = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Tehran',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);
      } catch {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        currentHm = `${hh}:${mm}`;
      }

      const todayIso = now.toISOString().slice(0, 10);
      if (sched.lastRunDate === todayIso) {
        return;
      }

      if (currentHm === sched.publishTime) {
        isSchedulerRunningJob = true;
        await triggerScheduledOrImmediateArticle(undefined, 'scheduled');
        isSchedulerRunningJob = false;
      }
    } catch {
      isSchedulerRunningJob = false;
    }
  }, 30 * 1000);
}

/**
 * 5. Multimodal & Tool-Equipped Admin AI Chat
 */
const adminAiTools: FunctionDeclaration[] = [
  {
    name: 'create_site_improvement_proposal',
    description:
      'ایجاد یک پیشنهاد عملیاتی برای بهینه‌سازی سئو، رسیدن به رتبه ۱ گوگل، رفع باگ‌های فنی، انتشار مقاله، جایگزینی عکس/ویدیو آپلودشده، تغییر اطلاعات تماس یا پاسخ به کامنت‌ها که مدیر با یک کلیک («تأیید و پیاده‌سازی») آن را اجرا کند.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'عنوان واضح تغییر یا ایده پیشنهادی' },
        category: {
          type: Type.STRING,
          description: 'دسته تغییر: seo | content | media | clinic | engagement | pricing | bugfix',
        },
        priority: { type: Type.STRING, description: 'اولویت: high | medium | low' },
        description: { type: Type.STRING, description: 'توضیح دقیق آنچه در سایت تغییر خواهد کرد' },
        expectedImpact: { type: Type.STRING, description: 'تاثیر مورد انتظار بر سئو، رتبه ۱ گوگل یا تجربه کاربری' },
        actionType: {
          type: Type.STRING,
          description:
            'نوع عملیات: rank_one_seo_package | fix_site_bugs | seo_settings | sync_doctor_profile | apply_uploaded_media | publish_seo_article | enrich_articles_seo | fix_media_alt_tags | add_seo_faqs | reply_unanswered_comments | update_clinic_info | update_treatment_price | update_homepage_hero',
        },
        topic: { type: Type.STRING, description: 'اگر عملیات publish_seo_article است، موضوع مقاله' },
        mediaUrl: { type: Type.STRING, description: 'اگر فایل تصویری یا ویدیویی آپلود شده است، آدرس آن' },
        target: { type: Type.STRING, description: 'بخش هدف برای رسانه: doctor | hero | gallery | article' },
        siteTitle: { type: Type.STRING, description: 'عنوان سئو جدید' },
        metaDescription: { type: Type.STRING, description: 'متا دیسکریپشن جدید' },
        metaKeywords: { type: Type.STRING, description: 'کلمات کلیدی جدید' },
        phoneDisplay: { type: Type.STRING, description: 'شماره تلفن جدید مطب' },
        address: { type: Type.STRING, description: 'آدرس جدید مطب' },
        heroTitle: { type: Type.STRING, description: 'تیتر جدید صفحه اصلی' },
      },
      required: ['title', 'actionType', 'description'],
    },
  },
  {
    name: 'configure_auto_post_scheduler',
    description: 'تنظیم یا فعال‌سازی انتشار خودکار زمان‌بندی‌شده مقاله در ساعت مشخص روزانه',
    parameters: {
      type: Type.OBJECT,
      properties: {
        enabled: { type: Type.BOOLEAN, description: 'فعال یا غیرفعال بودن زمان‌بندی خودکار' },
        publishTime: { type: Type.STRING, description: 'ساعت انتشار به فرمت ۲۴ ساعته مثل 09:00 یا 18:30' },
        newTopicToAdd: { type: Type.STRING, description: 'موضوع جدید برای افزودن به صف مقالات خودکار' },
      },
      required: ['enabled'],
    },
  },
];

export async function handleAdminAiCopilotChat(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  attachments: AdminChatAttachment[] = []
): Promise<{
  reply: string;
  newProposals: AiAdminProposal[];
  executedActions: string[];
  scheduler?: AiSchedulerConfig;
  audit?: SeoAuditReport;
}> {
  const cleanMessage = (message || '').trim() || (attachments.length > 0 ? 'این فایل پیوست‌شده را بررسی و تحلیل کن.' : '');
  if (!cleanMessage) {
    throw new Error('پیام یا فایل ارسالی نمی‌تواند خالی باشد.');
  }

  const db = readDb();
  const state = ensureAiAdminState(db);
  const { audit } = runSiteAndSeoAudit(false);
  const info = { ...CLINIC_INFO, ...(db.clinicInfo || {}) };

  const newProposals: AiAdminProposal[] = [];
  const executedActions: string[] = [];

  const msgLower = cleanMessage.toLowerCase();

  // 1. Check if Admin is typing "تایید" / "انجام بده" / "اعمال کن" to approve the latest pending proposal right inside chat!
  if (
    msgLower === 'تایید' ||
    msgLower === 'تأیید' ||
    msgLower === 'انجام بده' ||
    msgLower === 'انجامش بده' ||
    msgLower === 'اعمال کن' ||
    msgLower === 'پیاده سازی کن' ||
    msgLower === 'پیاده‌سازی کن' ||
    msgLower === 'بله تایید'
  ) {
    const latestPending = state.proposals.find((p) => p.status === 'pending');
    if (latestPending) {
      const execRes = await executeAdminProposal(latestPending.id);
      const updatedDashboard = getAdminAiDashboardData();
      return {
        reply: `✅ با کمال میل! پیشنهاد **«${latestPending.title}»** پس از تأیید شما به صورت خودکار در سایت پیاده‌سازی شد:\n\n${execRes.message}`,
        newProposals: [],
        executedActions: [execRes.message],
        scheduler: updatedDashboard.scheduler,
        audit: updatedDashboard.audit,
      };
    }
  }

  // 2. If user uploaded an image or video attachment, also prepare a quick proposal if they want to apply it on the site
  const uploadedUrls = attachments.map((a) => a.url).filter(Boolean) as string[];
  if (uploadedUrls.length > 0 && (msgLower.includes('دکتر') || msgLower.includes('پروفایل') || msgLower.includes('جایگزین') || msgLower.includes('بذار'))) {
    const mediaProp: AiAdminProposal = {
      id: `prop-upload-${Date.now()}`,
      title: 'اعمال فایل رسانه‌ای آپلودشده در بخش مورد نظر سایت',
      category: 'media',
      categoryLabel: 'اعمال تصویر / ویدیو آپلودشده',
      priority: 'high',
      description: `قرار دادن فایل آپلودشده (${attachments[0].name}) در سایت و به‌روزرسانی خودکار تگ‌های Alt سئو.`,
      expectedImpact: 'به‌روزرسانی فوری رسانه در صفحات سایت',
      actionType: 'apply_uploaded_media',
      payload: {
        mediaUrl: uploadedUrls[0],
        target: msgLower.includes('بنر') || msgLower.includes('صفحه اصلی') ? 'hero' : 'doctor',
      },
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    };
    state.proposals.unshift(mediaProp);
    newProposals.push(mediaProp);
    writeDb(db);
  }

  // 3. Deterministic proposals when admin asks for SEO analysis, bug fixes, or Rank #1 ideas
  if (
    msgLower.includes('سئو') ||
    msgLower.includes('رتبه یک') ||
    msgLower.includes('رتبه ۱') ||
    msgLower.includes('گوگل') ||
    msgLower.includes('تحلیل') ||
    msgLower.includes('باگ') ||
    msgLower.includes('بهتر') ||
    msgLower.includes('ایده')
  ) {
    const rank1Prop: AiAdminProposal = {
      id: `prop-rank1-${Date.now()}`,
      title: 'اجرای بسته جامع «رتبه ۱ گوگل» (متاتگ‌های طلایی، اسکیما محلی، E-E-A-T و سئو محتوا)',
      category: 'seo',
      categoryLabel: 'سئو و رتبه ۱ گوگل',
      priority: 'high',
      description:
        'بهینه‌سازی عنوان و توضیحات متا برای بالاترین نرخ کلیک (CTR)، تقویت اسکیما Dentist و FAQPage، غنی‌سازی مقالات با سوالات پرتکرار گوگل و تکمیل تگ‌های Alt تصاویر.',
      expectedImpact: 'ارتقای مستقیم جایگاه سایت در صفحه اول گوگل برای کلیدواژه‌های دندان‌پزشکی و ایمپلنت',
      actionType: 'rank_one_seo_package',
      payload: {},
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    };
    const bugFixProp: AiAdminProposal = {
      id: `prop-bugfix-${Date.now() + 1}`,
      title: 'رفع خودکار باگ‌های فنی، یکپارچه‌سازی عکس دکتر شمس‌پور و استانداردسازی اسلاگ‌ها و تصاویر',
      category: 'bugfix',
      categoryLabel: 'رفع باگ و سلامت فنی',
      priority: 'high',
      description:
        'همگام‌سازی تصویر رسمی دکتر انوشیروان شمس‌پور در صفحه اصلی، درباره ما و چت‌بات، اصلاح اسلاگ‌های مقالات و تکمیل Alt تمام تصاویر فاقد توضیحات.',
      expectedImpact: 'رفع ۱۰۰٪ نواقص فنی و بصری در سراسر سایت',
      actionType: 'fix_site_bugs',
      payload: {
        doctorImage: db.aboutPageSettings?.hero?.doctorImage || '/images/dr-shamspoor.jpg',
      },
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    };
    state.proposals.unshift(bugFixProp, rank1Prop);
    newProposals.push(rank1Prop, bugFixProp);
    writeDb(db);
  }

  const systemInstruction = `تو «هوش مصنوعی ارشد مدیریت سایت و سئو (Admin AI)» برای وب‌سایت «کلینیک دندان‌پزشکی پارمیس (دکتر انوشیروان شمس‌پور)» هستی.
مخاطب تو شخص «مدیر سایت / دکتر شمس‌پور» است.

قابلیت‌های ویژه تو:
۱. تو توانایی دیدن و تحلیل **تصویر، صدا (ویس) و ویدیو** ارسالی مدیر را داری.
۲. تو به کل دیتابیس سایت دسترسی داری و می‌توانی سایت را از نظر **سئو، فنی، تجربه کاربری، سرعت، ساختار اسکیما، مقالات، تصاویر و باگ‌ها** تحلیل کنی.
۳. برای رسیدن سایت به **رتبه ۱ گوگل**، ایده‌های خلاقانه و فنی (Local SEO، Schema.org Dentist/FAQPage، خوشه‌های محتوایی E-E-A-T، بهینه‌سازی نرخ تبدیل و سرعت) ارائه بده.
۴. هر زمان تغییری، رفع باگی یا بهینه‌سازی پیشنهاد دادی، از ابزار \`create_site_improvement_proposal\` استفاده کن تا کارت **«تأیید و پیاده‌سازی در سایت»** زیر پیامت ظاهر شود (یا به مدیر بگو می‌تواند روی دکمه تأیید کلیک کند یا کلمه «تایید» را بنویسد تا خودکار پیاده‌سازی شود).

وضعیت لحظه‌ای سایت:
- امتیاز سلامت و سئو فعلی: ${audit.overallScore} از ۱۰۰ (تکنیکال: ${audit.scores.technicalSeo}%، محتوا: ${audit.scores.contentSeo}%، تصاویر: ${audit.scores.mediaSeo}%، تعامل: ${audit.scores.conversionHealth}%)
- عنوان سئو فعلی: ${db.siteSettings?.siteTitle || 'پیش‌فرض'}
- تعداد مقالات: ${audit.stats.articlesCount} | خدمات: ${audit.stats.servicesCount} | نمونه‌کارها: ${audit.stats.casesCount}
- نوبت‌های در انتظار: ${audit.stats.pendingAppointments} | کامنت‌های بی‌پاسخ: ${audit.stats.unansweredComments} | تصاویر بدون Alt: ${audit.stats.mediaMissingAlt}
- زمان‌بندی انتشار خودکار مقاله: ${state.scheduler.enabled ? `فعال (هر روز ساعت ${state.scheduler.publishTime})` : 'غیرفعال'}
${attachments.length > 0 ? `- فایل‌های پیوست‌شده در این پیام توسط مدیر: ${attachments.map((a) => `${a.name} (${a.mimeType}) -> URL: ${a.url || 'inline'}`).join(', ')}` : ''}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || !apiKey.trim()) {
    return {
      reply:
        'تحلیل سایت انجام شد و پیشنهادهای بهینه‌سازی سئو و رفع باگ در زیر این پیام آماده تأیید و پیاده‌سازی خودکار هستند.',
      newProposals,
      executedActions,
      scheduler: state.scheduler,
      audit,
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  const contents: any[] = history.slice(-6).map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content.slice(0, 1000) }],
  }));

  // Build multimodal user parts (text + any attached image/audio/video)
  const userParts: any[] = [{ text: cleanMessage }];

  for (const att of attachments) {
    try {
      if (att.base64Data) {
        const cleanBase64 = att.base64Data.includes(',')
          ? att.base64Data.split(',')[1]
          : att.base64Data;
        userParts.push({
          inlineData: {
            mimeType: att.mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      } else if (att.url && att.url.startsWith('/uploads/')) {
        const filePath = path.join(rootDir, 'public', att.url);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          // Only inline files up to 15MB for fast multimodal inference
          if (stat.size <= 15 * 1024 * 1024) {
            const buf = fs.readFileSync(filePath);
            userParts.push({
              inlineData: {
                mimeType: att.mimeType || 'image/jpeg',
                data: buf.toString('base64'),
              },
            });
          }
        }
      }
    } catch {
      // Ignore attachment read error and continue with text + URL metadata
    }
  }

  contents.push({
    role: 'user',
    parts: userParts,
  });

  const candidateModels: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
    { model: 'gemini-3-flash-preview', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.1-flash-lite-preview', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
  ];

  let replyText = '';

  for (const candidate of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: candidate.model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.55,
          tools: [{ functionDeclarations: adminAiTools }],
          thinkingConfig: { thinkingLevel: candidate.thinkingLevel },
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const freshDb = readDb();
        const freshState = ensureAiAdminState(freshDb);

        for (const call of functionCalls) {
          const args = (call.args || {}) as Record<string, any>;
          if (call.name === 'create_site_improvement_proposal') {
            const actionType = (args.actionType || 'rank_one_seo_package') as ProposalActionType;
            const prop: AiAdminProposal = {
              id: `prop-ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              title: String(args.title || 'پیشنهاد بهینه‌سازی و ارتقای سایت'),
              category: (args.category as any) || 'seo',
              categoryLabel:
                args.category === 'bugfix'
                  ? 'رفع باگ و بهینه‌سازی فنی'
                  : args.category === 'content'
                  ? 'محتوا و وبلاگ سئو'
                  : args.category === 'media'
                  ? 'تصاویر و ویدیو'
                  : 'سئو و رتبه ۱ گوگل',
              priority: (args.priority as any) || 'high',
              description: String(args.description || 'اعمال تغییرات پیشنهادی هوش مصنوعی در دیتابیس سایت'),
              expectedImpact: String(args.expectedImpact || 'ارتقای رتبه سئو و بهبود تجربه کاربری مراجعین'),
              actionType,
              payload: {
                topic: args.topic,
                mediaUrl: args.mediaUrl || uploadedUrls[0],
                target: args.target,
                siteTitle: args.siteTitle,
                metaDescription: args.metaDescription,
                metaKeywords: args.metaKeywords,
                phoneDisplay: args.phoneDisplay,
                address: args.address,
                ...(args.heroTitle ? { titleLine1: args.heroTitle } : {}),
              },
              status: 'pending',
              createdAt: new Date().toLocaleString('fa-IR'),
            };
            freshState.proposals.unshift(prop);
            newProposals.push(prop);
          } else if (call.name === 'configure_auto_post_scheduler') {
            freshState.scheduler.enabled = Boolean(args.enabled);
            if (args.publishTime) {
              freshState.scheduler.publishTime = String(args.publishTime);
            }
            if (args.newTopicToAdd) {
              freshState.scheduler.topicQueue.push(String(args.newTopicToAdd));
            }
            executedActions.push(
              `زمان‌بندی خودکار مقالات روی وضعیت «${freshState.scheduler.enabled ? `فعال در ساعت ${freshState.scheduler.publishTime}` : 'غیرفعال'}» تنظیم شد.`
            );
          }
        }
        writeDb(freshDb);
      }

      replyText = response.text?.trim() || '';
      if (!replyText && newProposals.length > 0) {
        replyText = `تحلیل کامل انجام شد و **${newProposals.length} بسته عملیاتی** برای ارتقای سئو، رفع نواقص و بهبود سایت آماده گردید. با کلیک روی دکمه **«تأیید و پیاده‌سازی خودکار»** در زیر همین پیام (یا ارسال کلمه «تایید»)، تغییرات بلافاصله در سایت اعمال می‌شوند.`;
      } else if (!replyText && executedActions.length > 0) {
        replyText = executedActions.join('\n');
      }

      if (replyText) break;
    } catch {
      continue;
    }
  }

  if (!replyText) {
    replyText = `وضعیت فعلی سایت بررسی شد (امتیاز سلامت و سئو: ${audit.overallScore} از ۱۰۰). بسته‌های پیشنهادی برای رسیدن به رتبه ۱ گوگل و رفع خودکار باگ‌ها در زیر پیام آماده تأیید شما هستند.`;
  }

  const finalDb = readDb();
  const finalState = ensureAiAdminState(finalDb);

  return {
    reply: replyText,
    newProposals,
    executedActions,
    scheduler: finalState.scheduler,
    audit: finalState.lastAudit || audit,
  };
}
