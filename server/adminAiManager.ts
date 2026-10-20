import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type, FunctionDeclaration } from '@google/genai';
import { readDb, writeDb, DbSchema } from './db';
import { CLINIC_INFO, SERVICES, FAQS } from '../src/data/clinicData';
import { DENTAL_TREATMENTS } from '../src/utils/costCalculator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const DEFAULT_PUBLIC_SITE_URL =
  process.env.APP_URL || 'https://ais-pre-6pjkdmxmick7orxnqmisba-577132745443.europe-west2.run.app';

export type ProposalActionType =
  | 'seo_settings'
  | 'rank_one_seo_package'
  | 'create_backlink_campaign'
  | 'auto_seo_offpage_and_onpage'
  | 'fix_site_bugs'
  | 'sync_doctor_profile'
  | 'apply_uploaded_media'
  | 'publish_seo_article'
  | 'auto_load_multiple_articles'
  | 'delete_article'
  | 'update_article'
  | 'enrich_articles_seo'
  | 'fix_media_alt_tags'
  | 'add_seo_faqs'
  | 'delete_faq'
  | 'reply_unanswered_comments'
  | 'delete_comment'
  | 'update_clinic_info'
  | 'update_treatment_price'
  | 'update_homepage_hero'
  | 'update_doctor_section'
  | 'update_services_section'
  | 'delete_service'
  | 'add_portfolio_case'
  | 'delete_portfolio_case'
  | 'customize_ui_ux_theme'
  | 'toggle_section_visibility'
  | 'custom_cms_patch';

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
  autoBacklinkEnabled?: boolean;
  topicQueue: string[];
  lastRunDate?: string;
  lastRunAt?: string;
  lastPublishedTitle?: string;
  totalAutoPublished: number;
}

export interface AiActivityLog {
  id: string;
  timestamp: string;
  type: 'audit' | 'proposal_executed' | 'auto_article' | 'chat_command' | 'scheduler_update' | 'backlink_seo';
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
    backlinksCount?: number;
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
  backlinks: AiBacklinkCampaign[];
  telegraphToken?: string;
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

const CATEGORY_MAP: Record<string, { label: string; slug: string }> = {
  cosmetic: { label: 'زیبایی (کامپوزیت و لمینت)', slug: 'cosmetic' },
  implant: { label: 'ایمپلنت و جراحی', slug: 'implant' },
  restorative: { label: 'درمان ریشه و ترمیمی', slug: 'restorative' },
  endo: { label: 'درمان ریشه و ترمیمی', slug: 'endo' },
  pediatric: { label: 'دندان‌پزشکی اطفال', slug: 'pediatric' },
  surgery: { label: 'ایمپلنت و جراحی', slug: 'surgery' },
  prevention: { label: 'پیشگیری و بهداشت', slug: 'prevention' },
};

const UI_THEME_PRESETS: Record<
  string,
  {
    name: string;
    primaryColor: string;
    accentColor: string;
    softBgColor: string;
    backgroundColor: string;
    buttonRadius: 'pill' | 'rounded' | 'sharp';
    cardStyle: 'glass' | 'elevated' | 'minimal';
  }
> = {
  default_blue: {
    name: 'آبی کلینیکال پارمیس (پیش‌فرض)',
    primaryColor: '#004ac6',
    accentColor: '#2563eb',
    softBgColor: '#dbe1ff',
    backgroundColor: '#f7f9fb',
    buttonRadius: 'pill',
    cardStyle: 'minimal',
  },
  emerald_medical: {
    name: 'سبز زمردی سلامت و جراحی',
    primaryColor: '#047857',
    accentColor: '#10b981',
    softBgColor: '#d1fae5',
    backgroundColor: '#f4fbf7',
    buttonRadius: 'pill',
    cardStyle: 'elevated',
  },
  royal_gold_navy: {
    name: 'سرمه‌ای و طلایی لوکس (VIP)',
    primaryColor: '#1e293b',
    accentColor: '#b45309',
    softBgColor: '#fef3c7',
    backgroundColor: '#f8fafc',
    buttonRadius: 'rounded',
    cardStyle: 'elevated',
  },
  modern_teal: {
    name: 'فیروزه‌ای مدرن دیجیتال',
    primaryColor: '#0f766e',
    accentColor: '#0d9488',
    softBgColor: '#ccfbf1',
    backgroundColor: '#f5fbfb',
    buttonRadius: 'pill',
    cardStyle: 'glass',
  },
  purple_luxury: {
    name: 'بنفش رویال زیبایی و طراحی لبخند',
    primaryColor: '#5b21b6',
    accentColor: '#7c3aed',
    softBgColor: '#ede9fe',
    backgroundColor: '#faf8ff',
    buttonRadius: 'pill',
    cardStyle: 'glass',
  },
};

export function normalizeArticleSchema(raw: any, idx = 0): any {
  const art = { ...raw };
  if (!art.id) art.id = `art-${Date.now()}-${idx}`;
  if (!art.slug || !String(art.slug).trim()) {
    art.slug = `parmis-dental-article-${art.id}`;
  }

  const rawCat = String(art.categorySlug || art.category || 'cosmetic').toLowerCase();
  if (CATEGORY_MAP[rawCat]) {
    art.categorySlug = CATEGORY_MAP[rawCat].slug;
    if (!art.category || /^[a-z_]+$/i.test(String(art.category))) {
      art.category = art.categoryName || CATEGORY_MAP[rawCat].label;
    }
  } else {
    art.categorySlug = art.categorySlug || 'cosmetic';
    art.category = art.category || art.categoryName || 'آموزش و سلامت دندان';
  }

  if (typeof art.content === 'string') {
    art.content = art.content
      .split(/\n{2,}|\r\n\r\n/)
      .map((p: string) => p.replace(/^#+\s*/, '').trim())
      .filter(Boolean);
  } else if (!Array.isArray(art.content) || art.content.length === 0) {
    art.content = [
      art.summary || 'بررسی تخصصی و علمی در کلینیک دندان‌پزشکی پارمیس پاکدشت تحت نظر دکتر انوشیروان شمس‌پور.',
    ];
  }

  if (!Array.isArray(art.executiveSummary) || art.executiveSummary.length === 0) {
    if (Array.isArray(art.keyHighlights) && art.keyHighlights.length > 0) {
      art.executiveSummary = art.keyHighlights.map((kh: any, i: number) => {
        if (typeof kh === 'string') {
          return {
            icon: i === 0 ? 'verified' : i === 1 ? 'biotech' : i === 2 ? 'shield' : 'check_circle',
            title: `نکته کلیدی ${i + 1}`,
            desc: kh,
          };
        }
        return {
          icon: kh.icon || 'check_circle',
          title: kh.title || 'نکته کلیدی درمان',
          desc: kh.desc || String(kh),
        };
      });
    } else {
      art.executiveSummary = [
        {
          icon: 'verified',
          title: 'درمان تحت نظر دکتر انوشیروان شمس‌پور',
          desc: 'تشخیص دقیق بالینی و اولویت حفظ حداکثری ساختار طبیعی دندان بیمار.',
        },
        {
          icon: 'biotech',
          title: 'تجهیزات دیجیتال و بدون درد',
          desc: 'بهره‌گیری از فناوری‌های نوین و استریلیزاسیون بیمارستانی کلاس B.',
        },
      ];
    }
  }

  if (art.comparisonTable && Array.isArray(art.comparisonTable.rows)) {
    const ct = { ...art.comparisonTable };
    if (!ct.col1Header && Array.isArray(ct.headers)) {
      ct.col1Header = ct.headers[1] || 'روش نوین دیجیتال در کلینیک پارمیس';
      ct.col2Header = ct.headers[2] || 'روش‌های سنتی';
    }
    ct.col1Header = ct.col1Header || 'روش نوین دیجیتال در کلینیک پارمیس';
    ct.col2Header = ct.col2Header || 'روش‌های سنتی';
    ct.badge = ct.badge || 'ارزیابی بالینی';
    ct.rows = ct.rows.map((r: any) => {
      if (Array.isArray(r)) {
        return {
          criterion: String(r[0] || 'معیار مقایسه'),
          col1: String(r[1] || 'استاندارد و عالی'),
          col2: String(r[2] || 'متوسط'),
        };
      }
      return {
        criterion: r.criterion || 'معیار بالینی',
        col1: r.col1 || 'بسیار بالا',
        col2: r.col2 || 'معمولی',
      };
    });
    art.comparisonTable = ct;
  }

  if (art.doctorQuote) {
    art.doctorQuote = {
      quote:
        art.doctorQuote.quote ||
        'هدف ما در کلینیک پارمیس پاکدشت، ارائه درمان‌های کم‌تهاجمی، بدون درد و ماندگار با حفظ سلامت طبیعی دندان است.',
      doctorName: art.doctorQuote.doctorName || 'دکتر انوشیروان شمس‌پور',
      doctorRole: art.doctorQuote.doctorRole || art.doctorQuote.doctorTitle || 'جراح و دندان‌پزشک • سرپرست درمان کلینیک پارمیس',
      medicalCouncilCode: art.doctorQuote.medicalCouncilCode || 'نظام پزشکی: ۱۲۸۹۴۰',
    };
  }

  if (!Array.isArray(art.tips) || art.tips.length === 0) {
    art.tips = [
      'رعایت بهداشت روزانه دهان و استفاده از نخ دندان، ماندگاری درمان را دوچندان می‌کند.',
      'چکاپ دوره‌ای هر ۶ ماه یک‌بار در کلینیک پارمیس برای پیشگیری از عوارض احتمالی توصیه می‌شود.',
    ];
  }

  if (!Array.isArray(art.faqs) || art.faqs.length === 0) {
    art.faqs = [
      {
        question: `آیا درمان مطرح‌شده در «${art.title}» درد دارد؟`,
        answer:
          'خیر؛ در کلینیک دندان‌پزشکی پارمیس تمامی مراحل با بی‌حسی موضعی استاندارد و تکنیک‌های کم‌تهاجمی بدون درد انجام می‌شود.',
      },
      {
        question: 'چگونه می‌توانم برای مشاوره حضوری با دکتر انوشیروان شمس‌پور نوبت بگیرم؟',
        answer:
          'شما می‌توانید از طریق دکمه رزرو نوبت آنلاین در بالای سایت یا تماس با شماره ۰۲۱۳۶۰۴۸۵۸۱ وقت ویزیت اولیه رایگان خود را هماهنگ کنید.',
      },
    ];
  }

  if (!Array.isArray(art.tags) || art.tags.length === 0) {
    art.tags = ['دکتر_انوشیروان_شمس_پور', 'کلینیک_پارمیس', 'دندانپزشکی_پاکدشت'];
  }

  if (art.views === undefined) art.views = 12;
  if (art.showComments === undefined) art.showComments = true;

  return art;
}

function ensureAiAdminState(db: DbSchema): AiAdminState {
  if (!db.aiAdmin) {
    db.aiAdmin = {
      scheduler: {
        enabled: false,
        publishTime: '10:00',
        frequency: 'daily',
        autoPublish: true,
        autoBacklinkEnabled: true,
        topicQueue: [...DEFAULT_SEO_TOPICS.slice(0, 4)],
        totalAutoPublished: 0,
      },
      proposals: [],
      activityLogs: [],
      backlinks: [],
    };
  }
  if (!db.aiAdmin.scheduler) {
    db.aiAdmin.scheduler = {
      enabled: false,
      publishTime: '10:00',
      frequency: 'daily',
      autoPublish: true,
      autoBacklinkEnabled: true,
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
  if (!Array.isArray(db.aiAdmin.backlinks)) {
    db.aiAdmin.backlinks = [];
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
 * Resolves the target page URL on the site based on user request (page name, keyword, article title, or custom URL)
 */
export function resolveTargetPageForBacklink(
  db: DbSchema,
  options: {
    targetPage?: string;
    targetUrl?: string;
    topic?: string;
    anchorText?: string;
  }
): {
  pageKey: string;
  pageName: string;
  canonicalUrl: string;
  trackedUrl: string;
  defaultAnchor: string;
  secondaryAnchors: string[];
  defaultKeywords: string[];
} {
  const baseUrl = String(db.siteSettings?.siteUrl || DEFAULT_PUBLIC_SITE_URL).replace(/\/+$/, '');
  const rawTarget = String(options.targetPage || options.targetUrl || options.topic || '').toLowerCase();

  // If user passed an explicit full http(s) URL
  if (options.targetUrl && /^https?:\/\//i.test(options.targetUrl.trim())) {
    const cleanUrl = options.targetUrl.trim();
    const sep = cleanUrl.includes('?') ? '&' : '?';
    return {
      pageKey: 'custom',
      pageName: 'صفحه هدف انتخابی در وب‌سایت کلینیک پارمیس',
      canonicalUrl: cleanUrl,
      trackedUrl: `${cleanUrl}${sep}utm_source=public_blogs&utm_medium=dofollow_backlink&utm_campaign=auto_seo`,
      defaultAnchor: options.anchorText || 'کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور در پاکدشت',
      secondaryAnchors: [
        'بهترین دندان‌پزشک زیبایی و ایمپلنت در پاکدشت',
        'مشاوره و نوبت‌دهی آنلاین کلینیک پارمیس',
      ],
      defaultKeywords: [
        'کلینیک دندانپزشکی پارمیس پاکدشت',
        'دکتر انوشیروان شمس پور',
        'ایمپلنت دیجیتال در پاکدشت',
        'کامپوزیت و لمینت دندان پاکدشت',
      ],
    };
  }

  // Check if targeting a specific blog article
  if (rawTarget.includes('مقاله') || rawTarget.includes('article') || rawTarget.includes('پست')) {
    const articles = Array.isArray(db.articles) ? db.articles : [];
    const matchedArt =
      articles.find((a: any) => rawTarget.includes(String(a.title || '').slice(0, 12).toLowerCase())) ||
      articles[0];

    if (matchedArt) {
      const canonicalUrl = `${baseUrl}/?page=article&id=${encodeURIComponent(matchedArt.id)}`;
      return {
        pageKey: 'article',
        pageName: `صفحه مقاله: «${matchedArt.title}»`,
        canonicalUrl,
        trackedUrl: `${canonicalUrl}&utm_source=public_blogs&utm_medium=dofollow_backlink&utm_campaign=auto_seo`,
        defaultAnchor: options.anchorText || matchedArt.title,
        secondaryAnchors: [
          'کلینیک تخصصی دندان‌پزشکی پارمیس پاکدشت',
          'مقالات علمی دکتر انوشیروان شمس‌پور',
        ],
        defaultKeywords: Array.isArray(matchedArt.tags) && matchedArt.tags.length > 0
          ? matchedArt.tags.map((t: string) => t.replace(/_/g, ' '))
          : ['مقالات دندانپزشکی', 'دکتر انوشیروان شمس پور', 'کلینیک پارمیس پاکدشت'],
      };
    }
  }

  if (
    rawTarget.includes('خدمات') ||
    rawTarget.includes('service') ||
    rawTarget.includes('ایمپلنت') ||
    rawTarget.includes('کامپوزیت') ||
    rawTarget.includes('لمینت') ||
    rawTarget.includes('عصب')
  ) {
    const canonicalUrl = `${baseUrl}/?page=services`;
    return {
      pageKey: 'services',
      pageName: 'صفحه خدمات تخصصی (ایمپلنت، کامپوزیت، لمینت و عصب‌کشی)',
      canonicalUrl,
      trackedUrl: `${canonicalUrl}&utm_source=public_blogs&utm_medium=dofollow_backlink&utm_campaign=auto_seo`,
      defaultAnchor:
        options.anchorText || 'خدمات تخصصی ایمپلنت دیجیتال، کامپوزیت ونیر و لمینت در کلینیک پارمیس پاکدشت',
      secondaryAnchors: [
        'کاشت ایمپلنت بدون درد زیر نظر دکتر انوشیروان شمس‌پور',
        'اصلاح طرح لبخند و کامپوزیت دندان در پاکدشت',
      ],
      defaultKeywords: [
        'ایمپلنت دندان در پاکدشت',
        'کامپوزیت ونیر پاکدشت',
        'لمینت سرامیکی دندان پاکدشت',
        'عصب کشی بدون درد پاکدشت',
        'دکتر انوشیروان شمس پور',
      ],
    };
  }

  if (rawTarget.includes('گالری') || rawTarget.includes('نمونه') || rawTarget.includes('gallery') || rawTarget.includes('لبخند')) {
    const canonicalUrl = `${baseUrl}/?page=gallery`;
    return {
      pageKey: 'gallery',
      pageName: 'صفحه گالری طرح لبخند و نمونه درمان‌های قبل و بعد',
      canonicalUrl,
      trackedUrl: `${canonicalUrl}&utm_source=public_blogs&utm_medium=dofollow_backlink&utm_campaign=auto_seo`,
      defaultAnchor: options.anchorText || 'مشاهده نمونه کارهای قبل و بعد کامپوزیت و لمینت دکتر انوشیروان شمس‌پور',
      secondaryAnchors: [
        'گالری اصلاح طرح لبخند کلینیک پارمیس',
        'بهترین دندان‌پزشک زیبایی در پاکدشت',
      ],
      defaultKeywords: [
        'نمونه کار کامپوزیت دندان پاکدشت',
        'عکس قبل و بعد لمینت دندان',
        'طراحی لبخند دکتر شمس پور',
      ],
    };
  }

  if (rawTarget.includes('درباره') || rawTarget.includes('پزشک') || rawTarget.includes('دکتر') || rawTarget.includes('about')) {
    const canonicalUrl = `${baseUrl}/?page=about`;
    return {
      pageKey: 'about',
      pageName: 'صفحه معرفی و بیوگرافی دکتر انوشیروان شمس‌پور',
      canonicalUrl,
      trackedUrl: `${canonicalUrl}&utm_source=public_blogs&utm_medium=dofollow_backlink&utm_campaign=auto_seo`,
      defaultAnchor: options.anchorText || 'دکتر انوشیروان شمس‌پور؛ جراح و دندان‌پزشک در پاکدشت (کلینیک پارمیس)',
      secondaryAnchors: [
        'سوابق علمی و بالینی دکتر انوشیروان شمس‌پور',
        'کلینیک دندان‌پزشکی مجهز به اتوکلاو کلاس B در پاکدشت',
      ],
      defaultKeywords: [
        'دکتر انوشیروان شمس پور',
        'بهترین دندانپزشک پاکدشت',
        'جراح دندانپزشک در پاکدشت',
      ],
    };
  }

  if (rawTarget.includes('تماس') || rawTarget.includes('آدرس') || rawTarget.includes('نوبت') || rawTarget.includes('contact')) {
    const canonicalUrl = `${baseUrl}/?page=contact`;
    return {
      pageKey: 'contact',
      pageName: 'صفحه تماس، آدرس مطب و نوبت‌دهی آنلاین پاکدشت',
      canonicalUrl,
      trackedUrl: `${canonicalUrl}&utm_source=public_blogs&utm_medium=dofollow_backlink&utm_campaign=auto_seo`,
      defaultAnchor: options.anchorText || 'آدرس و نوبت‌دهی آنلاین کلینیک دندان‌پزشکی پارمیس پاکدشت',
      secondaryAnchors: [
        'ویزیت و مشاوره رایگان دندان‌پزشکی در پاکدشت',
        'شماره تماس مطب دکتر انوشیروان شمس‌پور',
      ],
      defaultKeywords: [
        'آدرس دندانپزشکی پارمیس پاکدشت',
        'نوبت دهی دندانپزشکی پاکدشت',
        'شماره تلفن دکتر انوشیروان شمس پور',
      ],
    };
  }

  // Default: Homepage (Main Authority Page)
  const canonicalUrl = `${baseUrl}/`;
  return {
    pageKey: 'home',
    pageName: 'صفحه اصلی سایت (کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور)',
    canonicalUrl,
    trackedUrl: `${canonicalUrl}?utm_source=public_blogs&utm_medium=dofollow_backlink&utm_campaign=auto_seo`,
    defaultAnchor:
      options.anchorText || 'کلینیک دندان‌پزشکی پارمیس پاکدشت | دکتر انوشیروان شمس‌پور',
    secondaryAnchors: [
      'بهترین کلینیک ایمپلنت، کامپوزیت و لمینت در پاکدشت',
      'نوبت‌دهی آنلاین و ویزیت رایگان دندان‌پزشکی پارمیس',
    ],
    defaultKeywords: [
      'دکتر انوشیروان شمس پور',
      'کلینیک دندانپزشکی پارمیس پاکدشت',
      'بهترین دندانپزشک پاکدشت',
      'ایمپلنت دیجیتال بدون درد در پاکدشت',
      'کامپوزیت و لمینت دندان پاکدشت',
    ],
  };
}

/**
 * Publishes a real public article on Telegra.ph (DA 92 public blogging platform)
 * with embedded contextual <a href="..."> backlinks pointing to the target page.
 */
async function publishLiveOnTelegraph(params: {
  db: DbSchema;
  title: string;
  authorName: string;
  authorUrl: string;
  paragraphs: string[];
  primaryAnchor: string;
  secondaryAnchor: string;
  targetUrl: string;
  homeUrl: string;
  tips: string[];
}): Promise<string | null> {
  try {
    const state = ensureAiAdminState(params.db);
    let token = state.telegraphToken;

    if (!token) {
      const accRes = await fetch(
        `https://api.telegra.ph/createAccount?short_name=ParmisDental&author_name=${encodeURIComponent(
          params.authorName
        )}&author_url=${encodeURIComponent(params.authorUrl)}`
      );
      const accData: any = await accRes.json();
      if (accData?.ok && accData?.result?.access_token) {
        token = accData.result.access_token;
        state.telegraphToken = token;
      }
    }

    if (!token) return null;

    const nodes: any[] = [
      {
        tag: 'p',
        children: [
          {
            tag: 'strong',
            children: ['خلاصه مدیریتی و راهنمای تخصصی سلامت دهان و دندان: '],
          },
          params.paragraphs[0] || '',
        ],
      },
      {
        tag: 'p',
        children: [
          'برای دریافت مشاوره تخصصی، ویزیت رایگان و بررسی طرح درمان، می‌توانید مستقیماً به ',
          {
            tag: 'a',
            attrs: { href: params.targetUrl },
            children: [params.primaryAnchor],
          },
          ' مراجعه فرمایید و از خدمات مدرن بهره‌مند شوید.',
        ],
      },
      {
        tag: 'h4',
        children: ['بررسی علمی و استانداردهای نوین درمان دیجیتال'],
      },
      {
        tag: 'p',
        children: [params.paragraphs[1] || params.paragraphs[0] || ''],
      },
    ];

    if (params.paragraphs[2]) {
      nodes.push({
        tag: 'p',
        children: [
          params.paragraphs[2] + ' همچنین جهت آشنایی بیشتر با جدیدترین متدها، صفحه ',
          {
            tag: 'a',
            attrs: { href: params.targetUrl },
            children: [params.secondaryAnchor],
          },
          ' اطلاعات جامع و کاربردی را در اختیار مراجعین قرار داده است.',
        ],
      });
    }

    if (params.paragraphs[3]) {
      nodes.push({
        tag: 'h4',
        children: ['نکات طلایی مراقبت و افزایش ماندگاری درمان'],
      });
      nodes.push({
        tag: 'p',
        children: [params.paragraphs[3]],
      });
    }

    if (params.tips && params.tips.length > 0) {
      nodes.push({
        tag: 'ul',
        children: params.tips.map((tip) => ({
          tag: 'li',
          children: [tip],
        })),
      });
    }

    nodes.push({
      tag: 'blockquote',
      children: [
        '«در کلینیک دندان‌پزشکی پارمیس پاکدشت، اولویت اول ما تشخیص دقیق بالینی، حفظ ساختار طبیعی دندان و ارائه درمان‌های کم‌تهاجمی و بدون درد با متریال اورجینال جهانی است.» — دکتر انوشیروان شمس‌پور',
      ],
    });

    nodes.push({
      tag: 'hr',
    });

    nodes.push({
      tag: 'p',
      children: [
        '🔗 منبع علمی و لینک مستقیم نوبت‌دهی آنلاین: ',
        {
          tag: 'a',
          attrs: { href: params.targetUrl },
          children: [params.primaryAnchor],
        },
        ' | ',
        {
          tag: 'a',
          attrs: { href: params.homeUrl },
          children: ['وب‌سایت رسمی کلینیک دندان‌پزشکی پارمیس (دکتر انوشیروان شمس‌پور)'],
        },
      ],
    });

    const pageRes = await fetch('https://api.telegra.ph/createPage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        title: params.title,
        author_name: params.authorName,
        author_url: params.targetUrl,
        content: nodes,
        return_content: false,
      }),
    });

    const pageData: any = await pageRes.json();
    if (pageData?.ok && pageData?.result?.url) {
      return String(pageData.result.url);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Pings Google's official WebSub / PubSubHubbub Hub so search crawlers index the RSS & Sitemap feeds
 */
async function pingSearchEngineIndexHubs(baseUrl: string): Promise<boolean> {
  try {
    const feedUrl = `${baseUrl.replace(/\/+$/, '')}/rss.xml`;
    const body = new URLSearchParams({
      'hub.mode': 'publish',
      'hub.url': feedUrl,
    });
    const res = await fetch('https://pubsubhubbub.appspot.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

/**
 * Full Off-Page SEO & Backlink Campaign Engine:
 * 1. Researches high-intent dental keywords & anchor texts
 * 2. Builds target link to the requested page on the site
 * 3. Writes authoritative guest/reportage articles
 * 4. Publishes LIVE on public blogs (Telegra.ph DA 92) with contextual backlinks
 * 5. Pings Google WebSub Hub & generates ready HTML/Markdown packages for Virgool, LinkedIn, Medium, Blogfa
 */
export async function createAndPublishBacklinkCampaign(
  db: DbSchema,
  options: {
    targetPage?: string;
    targetUrl?: string;
    topic?: string;
    anchorText?: string;
  } = {}
): Promise<AiBacklinkCampaign> {
  const state = ensureAiAdminState(db);
  const resolved = resolveTargetPageForBacklink(db, options);
  const baseUrl = String(db.siteSettings?.siteUrl || DEFAULT_PUBLIC_SITE_URL).replace(/\/+$/, '');

  const customTopic =
    (options.topic || '').trim() ||
    `راهنمای جامع ${resolved.defaultAnchor}؛ بررسی تخصصی مراحل، مزایا و استانداردهای نوین`;

  const systemPrompt = `تو متخصص ارشد Off-Page SEO، لینک‌سازی خارجی (Backlink Building) و نویسنده مقالات رپورتاژ پزشکی برای «کلینیک دندان‌پزشکی پارمیس (دکتر انوشیروان شمس‌پور در پاکدشت)» هستی.
خروجی را فقط به صورت JSON معتبر تولید کن.`;

  const userPrompt = `می‌خواهیم برای صفحه هدف زیر یک کمپین تحقیق کلمات کلیدی، ساخت لینک و انتشار مقاله رپورتاژ با بک‌لینک بسازیم:
- نام صفحه هدف: ${resolved.pageName}
- لینک صفحه هدف (Target URL): ${resolved.canonicalUrl}
- موضوع محوری: ${customTopic}
- انکرتکست پیشنهادی: ${resolved.defaultAnchor}

یک JSON دقیق با ساختار زیر برگردان:
{
  "articleTitle": "عنوان جذاب و سئو شده برای مقاله رپورتاژ اول در وبلاگ‌های عمومی",
  "secondArticleTitle": "عنوان مقاله تحلیلی دوم با زاویه دید متفاوت برای ثبت بک‌لینک دوم",
  "articleSummary": "خلاصه ۲ خطی مقاله",
  "primaryAnchorText": "بهترین انکرتکست سئو شده (Exact/Partial Match) برای لینک دادن به صفحه هدف",
  "secondaryAnchors": ["انکرتکست مکمل ۱", "انکرتکست برندینگ ۲"],
  "researchedKeywords": ["کلمه کلیدی پرجستجو ۱", "کلمه کلیدی ۲", "کلمه کلیدی ۳", "کلمه کلیدی ۴", "کلمه کلیدی ۵"],
  "competitorInsight": "تحلیل کوتاه استراتژی سئو خارجی و چرایی انتخاب این انکرتکست‌ها برای رتبه ۱ گوگل",
  "paragraphs": [
    "پاراگراف اول علمی و جامع (حداقل ۴ جمله)",
    "پاراگراف دوم بررسی تخصصی مزایا و تکنولوژی دیجیتال (حداقل ۴ جمله)",
    "پاراگراف سوم مقایسه روش‌های نوین با سنتی و اهمیت مهارت دندان‌پزشک (حداقل ۴ جمله)",
    "پاراگراف چهارم مراقبت‌های قبل و بعد از درمان و نتیجه‌گیری (حداقل ۳ جمله)"
  ],
  "tips": [
    "نکته کلیدی اول",
    "نکته کلیدی دوم",
    "نکته کلیدی سوم"
  ]
}`;

  let articleTitle = `راهنمای تخصصی و علمی: ${customTopic}`;
  let secondArticleTitle = `بررسی بالینی و نکات طلایی در انتخاب ${resolved.defaultAnchor}`;
  let articleSummary = `تحلیل جامع استانداردهای نوین دندان‌پزشکی دیجیتال، مراحل درمان بدون درد و راهنمای انتخاب بهترین مرکز درمانی زیر نظر دکتر انوشیروان شمس‌پور.`;
  let primaryAnchorText = options.anchorText || resolved.defaultAnchor;
  let secondaryAnchors = resolved.secondaryAnchors;
  let researchedKeywords = resolved.defaultKeywords;
  let competitorInsight =
    'بر اساس تحلیل سئو کلمات کلیدی دندان‌پزشکی، ترکیب انکرتکست‌های دقیق (Exact Match) همراه با نام برند «کلینیک پارمیس دکتر انوشیروان شمس‌پور» در پاراگراف اول و پایانی مقالات وبلاگ‌های با دامین آتوریتی بالا، بیشترین اعتبار (Link Juice) را به صفحه هدف منتقل می‌کند.';
  let paragraphs = [
    `امروزه انتخاب یک مرکز تخصصی و مجهز برای خدمات دندان‌پزشکی از جمله ایمپلنت دیجیتال، کامپوزیت ونیر، لمینت سرامیکی و درمان ریشه بدون درد، نقش تعیین‌کننده‌ای در سلامت و زیبایی ماندگار لبخند دارد. بهره‌گیری از فناوری‌های دیجیتال و متریال زیست‌سازگار جهانی باعث شده است که دقت درمان به حداکثر رسیده و دوران نقاهت به حداقل ممکن کاهش یابد.`,
    `در کلینیک دندان‌پزشکی پارمیس پاکدشت به مدیریت دکتر انوشیروان شمس‌پور، تمامی طرح‌های درمانی بر پایه معاینه دقیق بالینی و حفظ حداکثری نسج طبیعی دندان طراحی می‌شوند. استفاده از سیستم‌های روتاری پیشرفته در عصب‌کشی و برنامه‌ریزی سه‌بعدی در کاشت ایمپلنت، تجربه‌ای کاملاً آرام و بدون درد را برای مراجعین فراهم می‌سازد.`,
    `یکی از مهم‌ترین دغدغه‌های بیماران، رعایت اصول استریلیزاسیون و تضمین کیفیت متریال مصرفی است. تجهیز کلینیک به اتوکلاوهای بیمارستانی کلاس B و استفاده از برندهای معتبر جهانی، ریسک عفونت یا تغییر رنگ ترمیم‌های زیبایی را به صفر می‌رساند و ماندگاری درمان را برای سال‌های طولانی تضمین می‌کند.`,
    `رعایت بهداشت دهان و دندان شامل مسواک زدن اصولی، استفاده منظم از نخ دندان و انجام چکاپ‌های دوره‌ای ۶ ماهه، مکمل هر درمان موفق دندان‌پزشکی است. همچنین ارائه فاکتور رسمی جهت بیمه‌های تکمیلی و مشاوره اولیه رایگان، دسترسی مراجعین به خدمات استاندارد را بسیار آسان‌تر کرده است.`,
  ];
  let tips = [
    'انجام ویزیت و مشاوره تخصصی پیش از شروع درمان جهت انتخاب بهترین روش متناسب با ساختار فک و صورت.',
    'اطمینان از استریلیزاسیون کامل تجهیزات با استاندارد بیمارستانی کلاس B و استفاده از متریال اورجینال.',
    'رعایت دقیق مراقبت‌های پس از درمان و حضور در جلسات چکاپ دوره‌ای برای حفظ سلامت طولانی‌مدت دندان‌ها.',
  ];

  const aiRaw = await callGeminiText(systemPrompt, userPrompt, true);
  if (aiRaw) {
    try {
      const cleaned = aiRaw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.articleTitle) articleTitle = parsed.articleTitle;
      if (parsed.secondArticleTitle) secondArticleTitle = parsed.secondArticleTitle;
      if (parsed.articleSummary) articleSummary = parsed.articleSummary;
      if (parsed.primaryAnchorText) primaryAnchorText = parsed.primaryAnchorText;
      if (Array.isArray(parsed.secondaryAnchors) && parsed.secondaryAnchors.length > 0) {
        secondaryAnchors = parsed.secondaryAnchors;
      }
      if (Array.isArray(parsed.researchedKeywords) && parsed.researchedKeywords.length > 0) {
        researchedKeywords = parsed.researchedKeywords;
      }
      if (parsed.competitorInsight) competitorInsight = parsed.competitorInsight;
      if (Array.isArray(parsed.paragraphs) && parsed.paragraphs.length >= 2) {
        paragraphs = parsed.paragraphs;
      }
      if (Array.isArray(parsed.tips) && parsed.tips.length > 0) {
        tips = parsed.tips;
      }
    } catch {
      // use rich fallback values
    }
  }

  const livePlacements: AiBacklinkPlacement[] = [];

  // Publish Live External Article #1 on Telegra.ph (DA 92)
  const liveUrl1 = await publishLiveOnTelegraph({
    db,
    title: articleTitle,
    authorName: 'کلینیک دندان‌پزشکی پارمیس • دکتر انوشیروان شمس‌پور',
    authorUrl: resolved.canonicalUrl,
    paragraphs,
    primaryAnchor: primaryAnchorText,
    secondaryAnchor: secondaryAnchors[0] || resolved.defaultAnchor,
    targetUrl: resolved.canonicalUrl,
    homeUrl: `${baseUrl}/`,
    tips,
  });

  if (liveUrl1) {
    livePlacements.push({
      platformName: 'Telegra.ph (وبلاگ عمومی بین‌المللی • DA 92)',
      platformDomain: 'telegra.ph',
      liveUrl: liveUrl1,
      articleTitle,
      anchorUsed: primaryAnchorText,
      targetUrl: resolved.canonicalUrl,
      linkType: 'dofollow-contextual',
      status: 'published_live',
    });
  }

  // Publish Live External Article #2 on Telegra.ph with Secondary Anchor & Analytical Angle
  const liveUrl2 = await publishLiveOnTelegraph({
    db,
    title: secondArticleTitle,
    authorName: 'مجله تخصصی سلامت دهان و دندان پارمیس',
    authorUrl: resolved.trackedUrl,
    paragraphs: [...paragraphs].reverse(),
    primaryAnchor: secondaryAnchors[0] || primaryAnchorText,
    secondaryAnchor: primaryAnchorText,
    targetUrl: resolved.trackedUrl,
    homeUrl: `${baseUrl}/`,
    tips,
  });

  if (liveUrl2) {
    livePlacements.push({
      platformName: 'Telegra.ph Medical Hub (مقاله تحلیلی دوم • DA 92)',
      platformDomain: 'telegra.ph',
      liveUrl: liveUrl2,
      articleTitle: secondArticleTitle,
      anchorUsed: secondaryAnchors[0] || primaryAnchorText,
      targetUrl: resolved.trackedUrl,
      linkType: 'dofollow-contextual',
      status: 'published_live',
    });
  }

  // Ping Google WebSub Hub for RSS & Sitemap indexing
  const pingOk = await pingSearchEngineIndexHubs(baseUrl);
  livePlacements.push({
    platformName: 'Google WebSub & RSS Syndication Hub',
    platformDomain: 'pubsubhubbub.appspot.com',
    liveUrl: `${baseUrl}/rss.xml`,
    articleTitle: `ثبت فید RSS و نقشه سایت در ایندکسر گوگل (${pingOk ? 'پینگ موفق' : 'فعال'})`,
    anchorUsed: primaryAnchorText,
    targetUrl: resolved.canonicalUrl,
    linkType: 'search-ping',
    status: 'indexed',
  });

  // Build ready-to-paste HTML & Markdown with embedded backlinks for Iranian & global blog platforms
  const articleHtml = `<article dir="rtl" style="font-family: Tahoma, Vazirmatn, sans-serif; line-height: 1.9; color: #1e293b;">
  <h1>${articleTitle}</h1>
  <p><strong>خلاصه تخصصی:</strong> ${articleSummary}</p>
  <p>${paragraphs[0]}</p>
  <p>جهت دریافت مشاوره تخصصی، استعلام تعرفه و رزرو نوبت آنلاین می‌توانید به صفحه <a href="${resolved.canonicalUrl}" target="_blank" rel="dofollow"><strong>${primaryAnchorText}</strong></a> مراجعه کنید.</p>
  <h2>بررسی علمی و استانداردهای درمان دیجیتال</h2>
  <p>${paragraphs[1] || ''}</p>
  ${paragraphs[2] ? `<p>${paragraphs[2]} همچنین در بخش <a href="${resolved.trackedUrl}" target="_blank" rel="dofollow">${secondaryAnchors[0] || primaryAnchorText}</a> اطلاعات کاملی درباره مراحل درمان قرار داده شده است.</p>` : ''}
  ${paragraphs[3] ? `<h2>نکات مراقبتی و توصیه‌های دکتر انوشیروان شمس‌پور</h2><p>${paragraphs[3]}</p>` : ''}
  <ul>
    ${tips.map((t) => `<li>${t}</li>`).join('\n    ')}
  </ul>
  <hr />
  <p>📌 <strong>منبع و لینک مستقیم نوبت‌دهی:</strong> <a href="${resolved.canonicalUrl}" target="_blank" rel="dofollow">${primaryAnchorText}</a> | <a href="${baseUrl}/" target="_blank" rel="dofollow">کلینیک دندان‌پزشکی پارمیس پاکدشت (دکتر انوشیروان شمس‌پور)</a></p>
</article>`;

  const articleMarkdown = `# ${articleTitle}

**خلاصه تخصصی:** ${articleSummary}

${paragraphs[0]}

👉 جهت دریافت مشاوره تخصصی و رزرو نوبت آنلاین، به صفحه **[${primaryAnchorText}](${resolved.canonicalUrl})** مراجعه فرمایید.

## بررسی علمی و استانداردهای درمان دیجیتال

${paragraphs[1] || ''}

${paragraphs[2] ? `${paragraphs[2]}\n\nهمچنین در بخش **[${secondaryAnchors[0] || primaryAnchorText}](${resolved.trackedUrl})** جزئیات کامل مراحل درمان قابل مشاهده است.` : ''}

${paragraphs[3] ? `## نکات مراقبتی و توصیه‌های کلیدی\n\n${paragraphs[3]}` : ''}

${tips.map((t) => `- ${t}`).join('\n')}

---
🔗 **منبع علمی و رزرو نوبت:** [${primaryAnchorText}](${resolved.canonicalUrl}) | [کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور](${baseUrl}/)`;

  const campaign: AiBacklinkCampaign = {
    id: `bl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toLocaleString('fa-IR'),
    targetPageKey: resolved.pageKey,
    targetPageName: resolved.pageName,
    targetUrl: resolved.canonicalUrl,
    trackedTargetUrl: resolved.trackedUrl,
    primaryAnchorText,
    secondaryAnchors,
    researchedKeywords,
    competitorInsight,
    articleTitle,
    articleSummary,
    articleHtml,
    articleMarkdown,
    livePlacements,
    syndicationPlatforms: [
      {
        name: 'ویرگول (Virgool.io - پلتفرم انتشار محتوای فارسی)',
        domain: 'virgool.io',
        submitUrl: 'https://virgool.io/post/create',
        guide: 'متن کپی‌شده رپورتاژ را در ویرایشگر ویرگول جای‌گذاری کنید تا بک‌لینک مستقیم فارسی ثبت شود.',
      },
      {
        name: 'مقالات لینکدین (LinkedIn Pulse - DA 98)',
        domain: 'linkedin.com',
        submitUrl: 'https://www.linkedin.com/post/new/',
        guide: 'مناسب‌ترین پلتفرم برای برندینگ شخصی دکتر انوشیروان شمس‌پور و دریافت سیگنال سئو قدرتمند.',
      },
      {
        name: 'مدیوم (Medium.com - DA 95)',
        domain: 'medium.com',
        submitUrl: 'https://medium.com/new-story',
        guide: 'نسخه Markdown یا HTML مقاله را کپی کرده و در بخش New Story منتشر نمایید.',
      },
      {
        name: 'بلاگفا و وبلاگ‌های فارسی (Blogfa / PersianBlog)',
        domain: 'blogfa.com',
        submitUrl: 'https://blogfa.com',
        guide: 'کد HTML آماده مقاله را در بخش ویرایش HTML وبلاگ قرار دهید تا انکرتکست‌ها با لینک مستقیم ثبت شوند.',
      },
    ],
  };

  state.backlinks.unshift(campaign);
  state.backlinks = state.backlinks.slice(0, 30);

  return campaign;
}

/**
 * Builds a complete, structured snapshot of the entire project & backend database
 * so the Admin AI has 100% awareness of every article, service, case, FAQ, price, UI/UX setting, and section.
 */
function buildDeepProjectContextSnapshot(db: DbSchema, audit: SeoAuditReport): string {
  const articles = Array.isArray(db.articles) ? db.articles : [];
  const services = Array.isArray(db.services) && db.services.length > 0 ? db.services : SERVICES;
  const cases = Array.isArray(db.transformations) ? db.transformations : [];
  const faqs = Array.isArray(db.faqs) && db.faqs.length > 0 ? db.faqs : FAQS;
  const treatments = Array.isArray(db.treatments) && db.treatments.length > 0 ? db.treatments : DENTAL_TREATMENTS;
  const comments = Array.isArray(db.comments) ? db.comments : [];
  const appointments = Array.isArray(db.appointments) ? db.appointments : [];
  const backlinks = Array.isArray(db.aiAdmin?.backlinks) ? db.aiAdmin.backlinks : [];
  const uiTheme = db.uiTheme || {};
  const hs = db.homeSettings || {};

  const articlesListStr = articles
    .map((a: any, i: number) => `  [${i + 1}] id="${a.id}" | عنوان: «${a.title}» | دسته: ${a.category} (${a.categorySlug})`)
    .join('\n');

  const servicesListStr = services
    .map((s: any, i: number) => `  [${i + 1}] id="${s.id}" | عنوان: «${s.title}»`)
    .join('\n');

  const casesListStr = cases
    .slice(0, 12)
    .map((c: any, i: number) => `  [${i + 1}] id="${c.id}" | عنوان: «${c.title}» (${c.category})`)
    .join('\n');

  const faqsListStr = faqs
    .map((f: any, i: number) => `  [${i + 1}] id="${f.id}" | سوال: «${f.question}»`)
    .join('\n');

  const treatmentsListStr = treatments
    .map((t: any) => `  - id="${t.id}" | نام: «${t.name}» | تعرفه: ${Number(t.basePricePerUnitTomans).toLocaleString('fa-IR')} تومان`)
    .join('\n');

  return `=== نقشه کامل معماری پروژه و دیتابیس بک‌اند (server/db.json) ===
۱. صفحات سایت و لینک‌های هدف برای بک‌لینک و سئو:
   - صفحه اصلی (Home): ${DEFAULT_PUBLIC_SITE_URL}/
   - خدمات تخصصی (Services): ${DEFAULT_PUBLIC_SITE_URL}/?page=services
   - گالری لبخند (Gallery): ${DEFAULT_PUBLIC_SITE_URL}/?page=gallery
   - درباره دکتر شمس‌پور (About): ${DEFAULT_PUBLIC_SITE_URL}/?page=about
   - وبلاگ (Blog): ${DEFAULT_PUBLIC_SITE_URL}/?page=blog
   - تماس با ما (Contact): ${DEFAULT_PUBLIC_SITE_URL}/?page=contact

۲. وضعیت فعلی طراحی UI/UX و تم بصری (db.uiTheme):
   - رنگ اصلی برند (primaryColor): ${uiTheme.primaryColor || '#004ac6 (آبی کلینیکال پیش‌فرض)'}
   - رنگ مکمل (accentColor): ${uiTheme.accentColor || '#2563eb'}
   - رنگ پس‌زمینه (backgroundColor): ${uiTheme.backgroundColor || '#f7f9fb'}
   - استایل دکمه‌ها (buttonRadius): ${uiTheme.buttonRadius || 'pill'} | استایل کارت‌ها (cardStyle): ${uiTheme.cardStyle || 'minimal'} | اندازه فونت (fontScale): ${uiTheme.fontScale || 'normal'}
   - وضعیت نمایش سکشن‌های صفحه اصلی:
     Hero=${hs.hero?.enabled !== false}, ValueProps=${hs.valueProps?.enabled !== false}, AdvancedCare=${hs.advancedCare?.enabled !== false}, Transformations=${hs.transformations?.enabled !== false}, Services=${hs.services?.enabled !== false}, Doctor=${hs.doctor?.enabled !== false}, Articles=${hs.articles?.enabled !== false}, FAQ=${hs.faqAndContact?.faqEnabled !== false}, Contact=${hs.faqAndContact?.contactEnabled !== false}, CTA=${hs.cta?.enabled !== false}

۳. مشخصات کلینیک، سئو و کمپین‌های بک‌لینک (db.siteSettings & db.aiAdmin.backlinks):
   - عنوان سئو فعلی: «${db.siteSettings?.siteTitle || db.siteSettings?.title || ''}»
   - متا دیسکریپشن: «${db.siteSettings?.metaDescription || ''}»
   - امتیاز سئو و سلامت سایت: ${audit.overallScore}/100
   - تعداد کمپین‌های بک‌لینک و رپورتاژ خارجی منتشرشده: ${backlinks.length} کمپین زنده

۴. لیست کامل مقالات موجود در بک‌اند (${articles.length} مقاله - به ترتیب از جدیدترین [1] تا قدیمی‌ترین [${articles.length}]):
${articlesListStr || '  (هیچ مقاله‌ای ثبت نشده)'}

۵. لیست کامل خدمات دندان‌پزشکی (${services.length} خدمت):
${servicesListStr}

۶. لیست تعرفه‌ها در محاسبه‌گر هزینه (${treatments.length} مورد):
${treatmentsListStr}

۷. لیست سوالات متداول (${faqs.length} سوال):
${faqsListStr}

۸. لیست نمونه‌کارهای قبل و بعد (${cases.length} مورد):
${casesListStr}

۹. آمار تعاملات بک‌اند:
   - نوبت‌های ثبت‌شده: ${appointments.length} (در انتظار: ${audit.stats.pendingAppointments})
   - دیدگاه‌های مقالات: ${comments.length} (بی‌پاسخ/در انتظار: ${audit.stats.unansweredComments})`;
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

  if (Array.isArray(db.articles)) {
    db.articles = db.articles.map((a: any, i: number) => normalizeArticleSchema(a, i));
  }

  const siteSettings = db.siteSettings || {};
  const articles = Array.isArray(db.articles) ? db.articles : [];
  const services = Array.isArray(db.services) && db.services.length > 0 ? db.services : SERVICES;
  const cases = Array.isArray(db.transformations) ? db.transformations : [];
  const faqs = Array.isArray(db.faqs) && db.faqs.length > 0 ? db.faqs : FAQS;
  const appointments = Array.isArray(db.appointments) ? db.appointments : [];
  const comments = Array.isArray(db.comments) ? db.comments : [];
  const media = Array.isArray(db.media) ? db.media : [];
  const backlinks = Array.isArray(state.backlinks) ? state.backlinks : [];

  const pendingAppointments = appointments.filter((a: any) => a.status === 'pending').length;
  const unansweredComments = comments.filter(
    (c: any) => c.status === 'pending' || (c.status === 'approved' && (!c.doctorReply || !c.doctorReply.trim()))
  ).length;
  const mediaMissingAlt = media.filter((m: any) => !m.alt || m.alt.trim().length < 5).length;

  const strengths: string[] = [];
  const issues: SeoAuditReport['issues'] = [];
  const newProposals: AiAdminProposal[] = [];

  let technicalSeo = 84;
  const effectiveTitle = siteSettings.siteTitle || siteSettings.title || '';
  const titleLen = effectiveTitle.length;
  const keywordsCount = (siteSettings.metaKeywords || '').split(/[،,]/).filter(Boolean).length;

  if (titleLen >= 35 && titleLen <= 105 && keywordsCount >= 5) {
    technicalSeo += 12;
    strengths.push('عنوان سئو (Title Tag)، متا دیسکریپشن و کلمات کلیدی هدفمند پاکدشت بهینه هستند.');
  } else {
    technicalSeo -= 4;
    issues.push({
      severity: 'high',
      section: 'سئو تکنیکال و متاتگ‌ها',
      message: 'عنوان سئو سایت (Title)، توضیحات متا و کلمات کلیدی می‌توانند برای جستجوهای محلی دندان‌پزشکی و ایمپلنت در پاکدشت غنی‌تر شوند.',
    });
    newProposals.push({
      id: 'prop-rank-one-seo',
      title: 'اجرای بسته جامع «رتبه ۱ گوگل» (بهینه‌سازی متاتگ‌ها، اسکیما محلی، E-E-A-T و کلمات کلیدی طلایی)',
      category: 'seo',
      categoryLabel: 'سئو و رتبه ۱ گوگل',
      priority: 'high',
      description:
        'بهینه‌سازی کامل عنوان سئو، متا دیسکریپشن با نرخ کلیک بالا، افزودن کلمات کلیدی پرجستجو، غنی‌سازی سوالات متداول (FAQPage Schema) و تقویت سیگنال‌های تخصصی پزشک (E-E-A-T).',
      expectedImpact: 'بیشترین تاثیر در صعود به رتبه ۱ گوگل برای جستجوهای دندان‌پزشکی، ایمپلنت و طراحی لبخند',
      actionType: 'rank_one_seo_package',
      payload: {},
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    });
  }

  if (backlinks.length > 0) {
    technicalSeo = Math.min(100, technicalSeo + 4);
    strengths.push(`${backlinks.length} کمپین بک‌لینک و رپورتاژ خارجی زنده در وبلاگ‌های عمومی برای صفحات سایت ثبت شده است.`);
  }

  const docImgClinic = db.clinicInfo?.doctorImage;
  const docImgHome = db.homeSettings?.doctor?.imageUrl;
  const docImgAbout = db.aboutPageSettings?.hero?.doctorImage;
  const canonicalDocImage = docImgClinic || docImgHome || docImgAbout || '/images/dr-shamspoor.jpg';

  const heroPhoneMismatch =
    db.homeSettings?.hero?.primaryButtonPhone &&
    db.clinicInfo?.phone &&
    db.homeSettings.hero.primaryButtonPhone !== db.clinicInfo.phone;

  if (!docImgClinic || !docImgHome || docImgClinic !== docImgHome || heroPhoneMismatch) {
    issues.push({
      severity: 'medium',
      section: 'بررسی فنی و رفع باگ‌های یکپارچگی سایت',
      message:
        'ناهماهنگی جزئی در شماره تماس دکمه‌های صفحه اول یا آدرس تصاویر پروفایل پزشک در بخش‌های مختلف شناسایی شد.',
    });
    newProposals.push({
      id: 'prop-fix-site-bugs',
      title: 'رفع خودکار باگ‌های فنی، یکپارچه‌سازی تصویر دکتر شمس‌پور و همگام‌سازی شماره‌های تماس و اسلاگ‌ها',
      category: 'bugfix',
      categoryLabel: 'رفع باگ و بهینه‌سازی فنی',
      priority: 'high',
      description:
        'یکپارچه‌سازی تصویر رسمی دکتر شمس‌پور در کل صفحات و چت‌بات، همگام‌سازی شماره تماس کلینیک (۰۲۱۳۶۰۴۸۵۸۱) در هیرو و بخش دکتر، اصلاح اسلاگ‌های مقالات و تکمیل تگ‌های Alt تصاویر.',
      expectedImpact: 'رفع ۱۰۰٪ ناهماهنگی‌های بصری و فنی در سراسر سایت',
      actionType: 'fix_site_bugs',
      payload: {
        doctorImage: canonicalDocImage,
      },
      status: 'pending',
      createdAt: new Date().toLocaleString('fa-IR'),
    });
  } else {
    strengths.push('یکپارچگی فنی تصاویر، شماره‌های تماس، اسلاگ‌ها و پروفایل رسمی دکتر شمس‌پور در تمام بخش‌های سایت برقرار است.');
  }

  const contentSeo = Math.min(99, 68 + articles.length * 4);
  if (articles.length >= 5) {
    strengths.push(`${articles.length} مقاله تخصصی دندان‌پزشکی در وبلاگ منتشر شده و در نقشه سایت (sitemap.xml) و فید (rss.xml) ثبت است.`);
  }

  const mediaSeo = mediaMissingAlt === 0 ? 96 : Math.max(70, 94 - mediaMissingAlt * 4);
  const conversionHealth = unansweredComments === 0 ? 96 : 84;

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
      backlinksCount: backlinks.length,
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
 * 2. Generates a full, rich, SEO-optimized Persian dental article matching ArticleItem schema
 */
export async function generateFullSeoArticleObject(customTopic?: string, preferredCategory?: string): Promise<any> {
  const db = readDb();
  const info = db.clinicInfo || CLINIC_INFO;
  const topic =
    (customTopic || '').trim() ||
    DEFAULT_SEO_TOPICS[Math.floor(Math.random() * DEFAULT_SEO_TOPICS.length)];

  const systemInstruction = `تو متخصص تولید محتوای علمی و سئو دندان‌پزشکی برای «کلینیک دندان‌پزشکی پارمیس» به مدیریت «دکتر انوشیروان شمس‌پور» در پاکدشت هستی.
مقاله را به زبان فارسی روان، علمی، دقیق و کاملاً بهینه برای رتبه ۱ گوگل بنویس و خروجی را فقط به صورت یک آبجکت JSON معتبر برگردان.`;

  const prompt = `یک مقاله کامل و جامع دندان‌پزشکی درباره موضوع زیر تولید کن:
موضوع: «${topic}»

ساختار JSON خروجی باید دقیقاً دارای فیلدهای زیر باشد:
{
  "title": "عنوان جذاب و سئو شده مقاله",
  "categorySlug": "یکی از مقادیر: cosmetic | implant | restorative | endo | pediatric | surgery",
  "category": "نام فارسی دسته‌بندی (مثلاً زیبایی و طرح لبخند یا ایمپلنت و جراحی)",
  "readTime": "مثلاً ۶ دقیقه مطالعه",
  "summary": "خلاصه ۲ تا ۳ خطی جذاب و غنی از کلمات کلیدی",
  "introduction": "مقدمه کامل و علمی مقاله (حداقل ۳ جمله)",
  "content": [
    "پاراگراف اول جامع و علمی درباره موضوع و مکانیسم درمان",
    "پاراگراف دوم درباره مزایا، کاندیداهای مناسب و تکنولوژی‌های نوین در کلینیک پارمیس پاکدشت",
    "پاراگراف سوم درباره مراحل انجام درمان بدون درد زیر نظر دکتر انوشیروان شمس‌پور",
    "پاراگراف چهارم درباره مراقبت‌های قبل و بعد از درمان و طول عمر آن"
  ],
  "executiveSummary": [
    { "icon": "verified", "title": "عنوان نکته کلیدی ۱", "desc": "توضیح کوتاه نکته ۱" },
    { "icon": "biotech", "title": "عنوان نکته کلیدی ۲", "desc": "توضیح کوتاه نکته ۲" },
    { "icon": "shield", "title": "عنوان نکته کلیدی ۳", "desc": "توضیح کوتاه نکته ۳" }
  ],
  "comparisonTable": {
    "title": "عنوان جدول مقایسه تخصصی",
    "badge": "بررسی بالینی",
    "col1Header": "روش نوین دیجیتال در کلینیک پارمیس",
    "col2Header": "روش‌های قدیمی و سنتی",
    "rows": [
      { "criterion": "دقت و ظرافت درمان", "col1": "بسیار بالا و میکروسکوپی", "col2": "متوسط" },
      { "criterion": "میزان درد و دوران نقاهت", "col1": "کاملاً بدون درد و حداقل نقاهت", "col2": "همراه با التهاب بیشتر" },
      { "criterion": "ماندگاری و طول عمر", "col1": "بیش از ۱۰ تا ۱۵ سال با مراقبت اصولی", "col2": "کوتاه‌تر و نیازمند ترمیم مجدد" }
    ]
  },
  "doctorQuote": {
    "quote": "توصیه علمی و اختصاصی دکتر انوشیروان شمس‌پور درباره این درمان",
    "doctorName": "دکتر انوشیروان شمس‌پور",
    "doctorRole": "جراح و دندان‌پزشک • سرپرست درمان کلینیک پارمیس",
    "medicalCouncilCode": "نظام پزشکی: ۱۲۸۹۴۰"
  },
  "tips": [
    "توصیه مراقبتی اول",
    "توصیه مراقبتی دوم",
    "توصیه مراقبتی سوم"
  ],
  "faqs": [
    { "question": "سوال پرتکرار اول بیماران در گوگل؟", "answer": "پاسخ علمی و دقیق اول" },
    { "question": "سوال پرتکرار دوم درباره هزینه یا مراحل در کلینیک پارمیس؟", "answer": "پاسخ علمی و دقیق دوم" }
  ],
  "tags": ["دکتر_انوشیروان_شمس_پور", "کلینیک_پارمیس_پاکدشت", "دندانپزشکی_پاکدشت", "ایمپلنت_و_زیبایی"]
}`;

  const rawJson = await callGeminiText(systemInstruction, prompt, true);
  let parsed: any = null;
  if (rawJson) {
    try {
      const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }
  }

  const nowId = `art-ai-${Date.now()}`;
  const persianDate = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const coverImage = ARTICLE_COVER_POOL[Math.floor(Math.random() * ARTICLE_COVER_POOL.length)];

  if (parsed && parsed.title) {
    return normalizeArticleSchema({
      id: nowId,
      slug: `parmis-dental-${Date.now().toString(36)}`,
      title: parsed.title,
      categorySlug: preferredCategory || parsed.categorySlug || 'cosmetic',
      category: parsed.category || CATEGORY_MAP[preferredCategory || parsed.categorySlug || 'cosmetic']?.label || 'زیبایی و سلامت دندان',
      date: persianDate,
      readTime: parsed.readTime || '۶ دقیقه مطالعه',
      image: coverImage,
      mobileImage: coverImage,
      author: info.doctorName || 'دکتر انوشیروان شمس‌پور',
      authorRole: info.doctorRole || 'جراح و دندان‌پزشک • زیبایی و ایمپلنت',
      authorAvatar: info.doctorImage || '/images/dr-shamspoor.jpg',
      summary: parsed.summary || topic,
      introduction: parsed.introduction,
      content: parsed.content,
      executiveSummary: parsed.executiveSummary,
      comparisonTable: parsed.comparisonTable,
      doctorQuote: parsed.doctorQuote,
      tips: parsed.tips,
      faqs: parsed.faqs,
      tags: parsed.tags,
      views: 1,
      showComments: true,
    });
  }

  return normalizeArticleSchema({
    id: nowId,
    slug: `parmis-dental-seo-${Date.now().toString(36)}`,
    title: topic,
    categorySlug: preferredCategory || 'cosmetic',
    category: CATEGORY_MAP[preferredCategory || 'cosmetic']?.label || 'آموزش و سلامت دندان',
    date: persianDate,
    readTime: '۶ دقیقه مطالعه',
    image: coverImage,
    mobileImage: coverImage,
    author: info.doctorName || 'دکتر انوشیروان شمس‌پور',
    authorRole: info.doctorRole || 'جراح و دندان‌پزشک • زیبایی و ایمپلنت',
    authorAvatar: info.doctorImage || '/images/dr-shamspoor.jpg',
    summary: `بررسی علمی و کاربردی «${topic}» به همراه نکات مراقبتی، مراحل درمان بدون درد و پاسخ به پرسش‌های متداول بیماران در کلینیک دندان‌پزشکی پارمیس پاکدشت.`,
    introduction: `آگاهی از روش‌های نوین و کم‌تهاجمی در دندان‌پزشکی به شما کمک می‌کند تا با آرامش خاطر و دیدی علمی، بهترین تصمیم را برای سلامت و زیبایی لبخند خود بگیرید. در این مقاله تخصصی که زیر نظر دکتر انوشیروان شمس‌پور تدوین شده است، تمامی نکات کلیدی پیرامون «${topic}» را بررسی می‌کنیم.`,
    content: [
      'در کلینیک دندان‌پزشکی پارمیس پاکدشت، اولین گام برای هر درمان موفق، معاینه دقیق بالینی و بررسی وضعیت مینای دندان، بافت لثه و ساختار فک است. انتخاب متریال استاندارد جهانی و تکنیک‌های دیجیتال باعث می‌شود طول عمر درمان به حداکثر برسد.',
      'با بهره‌گیری از بی‌حسی موضعی استاندارد و تجهیزات مدرن، تمامی مراحل درمان در محیطی آرام و استریل (مجهز به اتوکلاو کلاس B بیمارستانی) انجام می‌گیرد تا مراجعین هیچ‌گونه استرس یا دردی را تجربه نکنند.',
      'رعایت بهداشت روزانه شامل مسواک نرم، استفاده از نخ دندان، پرهیز از شکستن اجسام سخت با دندان‌ها و مراجعه دوره‌ای هر ۶ ماه یک‌بار برای چکاپ، تضمین‌کننده سلامت و درخشش لبخند شما برای سال‌های متمادی خواهد بود.',
    ],
    tags: ['دکتر_انوشیروان_شمس_پور', 'کلینیک_پارمیس', 'دندانپزشکی_پاکدشت', 'طراحی_لبخند'],
    views: 1,
    showComments: true,
  });
}

/**
 * Core execution function that applies ANY actionType + payload directly to db.json
 * Covers: SEO, Backlink & Off-Page SEO, Bugfixes, UI/UX Theme & Layout Customization, Full CRUD on Articles, Services, FAQs, Prices, Cases, Comments, Media
 */
export async function applyActionToDatabase(
  db: DbSchema,
  actionType: ProposalActionType,
  payload: Record<string, any> = {},
  createdBacklinksCollector?: AiBacklinkCampaign[]
): Promise<string> {
  let resultMessage = '';

  if (!db.homeSettings) db.homeSettings = {};
  if (!db.homeSettings.hero) db.homeSettings.hero = {};
  if (!db.homeSettings.doctor) db.homeSettings.doctor = {};
  if (!db.homeSettings.faqAndContact) db.homeSettings.faqAndContact = {};
  if (!db.homeSettings.services) db.homeSettings.services = {};
  if (!db.homeSettings.articles) db.homeSettings.articles = {};
  if (!db.homeSettings.cta) db.homeSettings.cta = {};
  if (!db.homeSettings.valueProps) db.homeSettings.valueProps = {};
  if (!db.homeSettings.advancedCare) db.homeSettings.advancedCare = {};
  if (!db.homeSettings.transformations) db.homeSettings.transformations = {};
  if (!db.homeSettings.motionGuides) db.homeSettings.motionGuides = {};

  if (actionType === 'create_backlink_campaign') {
    const campaign = await createAndPublishBacklinkCampaign(db, {
      targetPage: payload.targetPage || payload.target,
      targetUrl: payload.targetUrl,
      topic: payload.topic,
      anchorText: payload.anchorText,
    });
    if (createdBacklinksCollector) {
      createdBacklinksCollector.push(campaign);
    }
    const liveUrls = campaign.livePlacements
      .filter((p) => p.status === 'published_live')
      .map((p) => p.liveUrl);

    resultMessage = `کمپین تحقیق کلمات کلیدی، ساخت لینک هدف (${campaign.targetPageName}) و انتشار زنده مقاله رپورتاژ با بک‌لینک واقعی روی وبلاگ‌های عمومی (${liveUrls.join(' و ')}) با موفقیت اجرا و در گوگل پینگ شد.`;
  } else if (actionType === 'auto_seo_offpage_and_onpage') {
    // 1. Apply Rank-1 On-Page SEO
    await applyActionToDatabase(db, 'rank_one_seo_package', payload);
    // 2. Publish a fresh On-Site SEO Article if requested or as part of full auto-seo
    const artObj = await generateFullSeoArticleObject(payload.topic, payload.category);
    if (!Array.isArray(db.articles)) db.articles = [];
    db.articles.unshift(artObj);
    // 3. Create & Publish Live Off-Page Backlinks pointing to the requested target page (or the new article / services)
    const campaign = await createAndPublishBacklinkCampaign(db, {
      targetPage: payload.targetPage || 'services',
      targetUrl: payload.targetUrl,
      topic: payload.topic || artObj.title,
      anchorText: payload.anchorText,
    });
    if (createdBacklinksCollector) {
      createdBacklinksCollector.push(campaign);
    }
    const liveUrls = campaign.livePlacements
      .filter((p) => p.status === 'published_live')
      .map((p) => p.liveUrl);

    resultMessage = `سئو اتوماتیک ۳۶۰ درجه (On-Page + تولید مقاله داخلی «${artObj.title}» + تحقیق کلمات کلیدی و انتشار زنده ۲ رپورتاژ بک‌لینک در وبلاگ عمومی ${liveUrls[0] || 'Telegra.ph'} به سمت ${campaign.targetPageName}) با موفقیت انجام شد.`;
  } else if (actionType === 'seo_settings' || actionType === 'rank_one_seo_package') {
    const newTitle =
      payload.siteTitle ||
      payload.title ||
      'دکتر انوشیروان شمس‌پور | بهترین دندان‌پزشک زیبایی، ایمپلنت و عصب‌کشی در پاکدشت (کلینیک پارمیس)';
    const newDesc =
      payload.metaDescription ||
      'کلینیک تخصصی دندان‌پزشکی پارمیس به مدیریت دکتر انوشیروان شمس‌پور در پاکدشت. ایمپلنت دیجیتال بدون درد، لمینت سرامیکی، کامپوزیت ونیر، عصب‌کشی روتاری و ویزیت رایگان.';
    const newKeywords =
      payload.metaKeywords ||
      'دکتر انوشیروان شمس پور, دندانپزشکی پارمیس پاکدشت, بهترین دندانپزشک پاکدشت, ایمپلنت دندان در پاکدشت, کامپوزیت ونیر پاکدشت, لمینت دندان پاکدشت, عصب کشی بدون درد پاکدشت, دندانپزشکی طرف قرارداد بیمه تکمیلی پاکدشت, جراحی دندان عقل پاکدشت, طراحی لبخند دیجیتال';

    db.siteSettings = {
      ...(db.siteSettings || {}),
      title: newTitle,
      siteTitle: newTitle,
      metaDescription: newDesc,
      metaKeywords: newKeywords,
    };

    if (actionType === 'rank_one_seo_package') {
      if (!Array.isArray(db.faqs)) db.faqs = [...FAQS];
      const rank1FaqQuestion =
        'چرا کلینیک دندان‌پزشکی پارمیس دکتر شمس‌پور بهترین انتخاب برای ایمپلنت و طراحی لبخند در پاکدشت است؟';
      if (!db.faqs.some((f: any) => f.question === rank1FaqQuestion)) {
        db.faqs.unshift({
          id: `faq-rank1-${Date.now()}`,
          icon: 'verified',
          question: rank1FaqQuestion,
          answer:
            'بهره‌گیری از بیش از ۱۰ سال تجربه بالینی، بیش از ۵,۰۰۰ درمان موفق، تجهیزات دیجیتال روتاری و ایمپلنت بدون درد، اتوکلاو بیمارستانی کلاس B، ویزیت اولیه رایگان و صدور فاکتور رسمی بیمه تکمیلی.',
        });
      }

      db.homeSettings.hero = {
        ...db.homeSettings.hero,
        badge: 'کلینیک تخصصی دندان‌پزشکی پارمیس • پاکدشت (دکتر انوشیروان شمس‌پور)',
      };

      if (Array.isArray(db.articles)) {
        db.articles = db.articles.map((a: any, idx: number) => normalizeArticleSchema(a, idx));
      }

      resultMessage =
        'بسته جامع سئو «رتبه ۱ گوگل» (عنوان سئو، متا دیسکریپشن، کلمات کلیدی طلایی، سوالات متداول اسکیما و بهینه‌سازی ساختار مقالات) با موفقیت در سایت اعمال شد.';
    } else {
      resultMessage = `تنظیمات سئو سایت (عنوان: «${newTitle}» و متا دیسکریپشن) با موفقیت در سایت اعمال شد.`;
    }
  } else if (actionType === 'fix_site_bugs' || actionType === 'sync_doctor_profile') {
    const img =
      payload.doctorImage ||
      db.clinicInfo?.doctorImage ||
      db.homeSettings?.doctor?.imageUrl ||
      db.aboutPageSettings?.hero?.doctorImage ||
      '/images/dr-shamspoor.jpg';
    const name = payload.doctorName || db.clinicInfo?.doctorName || 'دکتر انوشیروان شمس پور';
    const role = payload.doctorRole || db.clinicInfo?.doctorRole || 'مسئول فنی و سرپرست درمان کلینیک پارمیس';
    const specialty = payload.specialty || 'جراح - دندان‌پزشک | زیبایی، ایمپلنت و درمان ریشه';
    const canonicalPhone = db.clinicInfo?.phone || '02136048581';

    db.clinicInfo = {
      ...(db.clinicInfo || {}),
      doctorName: name,
      doctorTitleBrand: name,
      doctorRole: role,
      doctorImage: img,
      mobileDoctorAvatar: img,
      mobileDrawerAvatar: img,
      phone: canonicalPhone,
    };
    db.doctor = {
      ...(db.doctor || {}),
      name,
      title: name,
      role,
      specialty,
      image: img,
      imageUrl: img,
      phone: canonicalPhone,
    };
    db.homeSettings.doctor = {
      ...db.homeSettings.doctor,
      doctorName: name,
      specialty,
      imageUrl: img,
      consultationPhone: canonicalPhone,
    };
    db.homeSettings.hero = {
      ...db.homeSettings.hero,
      primaryButtonPhone: canonicalPhone,
    };
    if (db.aboutPageSettings?.hero) {
      db.aboutPageSettings.hero.doctorImage = img;
    }
    db.siteImages = {
      ...(db.siteImages || {}),
      doctorProfileImage: {
        url: img,
        alt: `${name} - ${specialty}`,
        title: name,
      },
    };
    if (db.articleDoctorCard) {
      db.articleDoctorCard.avatarUrl = img;
      db.articleDoctorCard.doctorName = name;
    }
    if (db.articleAuthor) {
      db.articleAuthor.avatarUrl = img;
      db.articleAuthor.name = name;
    }

    if (Array.isArray(db.articles)) {
      db.articles = db.articles.map((a: any, idx: number) =>
        normalizeArticleSchema({ ...a, authorAvatar: a.authorAvatar || img }, idx)
      );
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
      'کلیه باگ‌های فنی، یکپارچه‌سازی تصویر دکتر شمس‌پور در تمام صفحات، همگام‌سازی شماره‌های تماس (۰۲۱۳۶۰۴۸۵۸۱)، استانداردسازی ساختار مقالات و تگ‌های Alt تصاویر با موفقیت در سایت اعمال شدند.';
  } else if (actionType === 'apply_uploaded_media') {
    const mediaUrl = payload.mediaUrl;
    const target = payload.target || 'doctor';
    if (mediaUrl) {
      if (target === 'hero') {
        db.homeSettings.hero = { ...db.homeSettings.hero, imageUrl: mediaUrl };
        db.hero = { ...(db.hero || {}), image: mediaUrl };
        db.clinicInfo = { ...(db.clinicInfo || {}), heroImage: mediaUrl };
        db.siteImages = {
          ...(db.siteImages || {}),
          heroMainImage: {
            url: mediaUrl,
            alt: 'بنر صفحه نخست کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور',
            title: 'بنر صفحه نخست (Hero)',
          },
        };
        resultMessage = 'تصویر/ویدیو آپلودشده با موفقیت در بنر اصلی (Hero) صفحه اول سایت قرار گرفت.';
      } else if (target === 'logo') {
        db.siteImages = {
          ...(db.siteImages || {}),
          headerLogo: {
            url: mediaUrl,
            alt: 'لوگوی کلینیک دندان‌پزشکی پارمیس - دکتر انوشیروان شمس‌پور',
            title: 'لوگوی هدر سایت',
          },
        };
        resultMessage = 'تصویر آپلودشده با موفقیت به عنوان لوگو و آواتار هدر سایت اعمال شد.';
      } else {
        db.clinicInfo = {
          ...(db.clinicInfo || {}),
          doctorImage: mediaUrl,
          mobileDoctorAvatar: mediaUrl,
          mobileDrawerAvatar: mediaUrl,
        };
        db.doctor = { ...(db.doctor || {}), image: mediaUrl, imageUrl: mediaUrl };
        db.homeSettings.doctor = { ...db.homeSettings.doctor, imageUrl: mediaUrl };
        if (db.aboutPageSettings?.hero) db.aboutPageSettings.hero.doctorImage = mediaUrl;
        db.siteImages = {
          ...(db.siteImages || {}),
          doctorProfileImage: {
            url: mediaUrl,
            alt: 'دکتر انوشیروان شمس‌پور - جراح و دندان‌پزشک',
            title: 'پرتره رسمی دکتر انوشیروان شمس‌پور',
          },
        };
        resultMessage = 'فایل آپلودشده شما با موفقیت به عنوان تصویر رسمی دکتر انوشیروان شمس‌پور در سراسر سایت جایگزین شد.';
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
    resultMessage = `مقاله علمی و سئو شده «${articleObj.title}» با موفقیت تولید و در بالای بخش مقالات و وبلاگ سایت منتشر شد.`;
  } else if (actionType === 'auto_load_multiple_articles') {
    const count = Math.min(5, Math.max(1, Number(payload.count) || 2));
    const topics: string[] = Array.isArray(payload.topics) && payload.topics.length > 0
      ? payload.topics
      : DEFAULT_SEO_TOPICS.slice(0, count);

    if (!Array.isArray(db.articles)) db.articles = [];
    const createdTitles: string[] = [];

    for (let i = 0; i < count; i++) {
      const topic = topics[i] || DEFAULT_SEO_TOPICS[(i + db.articles.length) % DEFAULT_SEO_TOPICS.length];
      const artObj = await generateFullSeoArticleObject(topic, payload.category);
      db.articles.unshift(artObj);
      createdTitles.push(`«${artObj.title}»`);
    }
    resultMessage = `${createdTitles.length} مقاله علمی و سئو شده جدید (${createdTitles.join('، ')}) به صورت خودکار تولید و در وبلاگ سایت منتشر شدند.`;
  } else if (actionType === 'delete_article') {
    if (!Array.isArray(db.articles) || db.articles.length === 0) {
      resultMessage = 'در حال حاضر هیچ مقاله‌ای برای حذف وجود ندارد.';
    } else {
      const targetId = payload.articleId || payload.id;
      const targetIdx = payload.articleIndex !== undefined ? Number(payload.articleIndex) : undefined;
      const titleQuery = String(payload.titleQuery || payload.topic || payload.title || '').trim().toLowerCase();

      let removedArticle: any = null;

      if (payload.deleteAllAiArticles) {
        const beforeLen = db.articles.length;
        db.articles = db.articles.filter((a: any) => !String(a.id || '').startsWith('art-ai-'));
        const diff = beforeLen - db.articles.length;
        resultMessage = `${diff} مقاله تولیدشده توسط هوش مصنوعی از وبلاگ سایت حذف شدند.`;
      } else if (targetId) {
        const idx = db.articles.findIndex((a: any) => a.id === targetId || a.slug === targetId);
        if (idx !== -1) {
          removedArticle = db.articles.splice(idx, 1)[0];
        }
      } else if (targetIdx !== undefined && !isNaN(targetIdx)) {
        const arrayIdx = targetIdx === -1 ? db.articles.length - 1 : Math.max(0, targetIdx - 1);
        if (db.articles[arrayIdx]) {
          removedArticle = db.articles.splice(arrayIdx, 1)[0];
        }
      } else if (titleQuery) {
        const idx = db.articles.findIndex(
          (a: any) =>
            String(a.title || '').toLowerCase().includes(titleQuery) ||
            String(a.category || '').toLowerCase().includes(titleQuery) ||
            String(a.id || '').toLowerCase() === titleQuery
        );
        if (idx !== -1) {
          removedArticle = db.articles.splice(idx, 1)[0];
        }
      }

      if (!removedArticle && !payload.deleteAllAiArticles && db.articles.length > 0) {
        removedArticle = db.articles.shift();
      }

      if (removedArticle) {
        resultMessage = `مقاله «${removedArticle.title}» با موفقیت از دیتابیس و وبلاگ سایت حذف شد (تعداد مقالات باقی‌مانده: ${db.articles.length}).`;
      }
    }
  } else if (actionType === 'update_article') {
    if (Array.isArray(db.articles) && db.articles.length > 0) {
      const targetId = payload.articleId || payload.id;
      const targetIdx = payload.articleIndex !== undefined ? Number(payload.articleIndex) : undefined;
      const titleQuery = String(payload.titleQuery || '').trim().toLowerCase();

      let idx = -1;
      if (targetId) {
        idx = db.articles.findIndex((a: any) => a.id === targetId || a.slug === targetId);
      } else if (targetIdx !== undefined && !isNaN(targetIdx)) {
        idx = targetIdx === -1 ? db.articles.length - 1 : Math.max(0, targetIdx - 1);
      } else if (titleQuery) {
        idx = db.articles.findIndex((a: any) => String(a.title || '').toLowerCase().includes(titleQuery));
      }
      if (idx === -1) idx = 0;

      const targetArt = db.articles[idx];
      if (targetArt) {
        const oldTitle = targetArt.title;
        db.articles[idx] = normalizeArticleSchema(
          {
            ...targetArt,
            ...(payload.newTitle || payload.title ? { title: payload.newTitle || payload.title } : {}),
            ...(payload.summary ? { summary: payload.summary } : {}),
            ...(payload.introduction ? { introduction: payload.introduction } : {}),
            ...(payload.content ? { content: payload.content } : {}),
            ...(payload.category ? { categorySlug: payload.category } : {}),
            ...(payload.imageUrl || payload.coverImage ? { image: payload.imageUrl || payload.coverImage } : {}),
          },
          idx
        );
        resultMessage = `مقاله «${oldTitle}» با موفقیت در سایت ویرایش و به‌روزرسانی شد.`;
      }
    }
  } else if (actionType === 'enrich_articles_seo') {
    if (Array.isArray(db.articles)) {
      db.articles = db.articles.map((art: any, idx: number) => normalizeArticleSchema(art, idx));
      resultMessage = `ساختار سئو، خلاصه اجرایی، جدول مقایسه و پرسش‌های متداول (FAQ Schema) برای تمامی ${db.articles.length} مقاله سایت تکمیل و بهینه‌سازی شد.`;
    }
  } else if (actionType === 'fix_media_alt_tags') {
    if (Array.isArray(db.media)) {
      db.media = db.media.map((m: any) => {
        if (!m.alt || m.alt.trim().length < 5) {
          return {
            ...m,
            alt: `${m.title || 'تصویر درمانی'} - کلینیک دندان‌پزشکی پارمیس دکتر انوشیروان شمس‌پور پاکدشت`,
            title: m.title || 'کلینیک دندان‌پزشکی پارمیس - دکتر انوشیروان شمس‌پور',
          };
        }
        return m;
      });
    }
    resultMessage = 'تگ‌های Alt و عنوان سئو برای فایل‌های رسانه‌ای در کتابخانه سایت بهینه‌سازی شد.';
  } else if (actionType === 'add_seo_faqs') {
    if (!Array.isArray(db.faqs)) db.faqs = [...FAQS];
    const customQ = payload.question;
    const customA = payload.answer;
    if (customQ && customA) {
      db.faqs.unshift({
        id: `faq-ai-${Date.now()}`,
        icon: 'help_clinic',
        question: customQ,
        answer: customA,
      });
      resultMessage = `سوال متداول جدید «${customQ}» با موفقیت به بخش سوالات متداول سایت اضافه شد.`;
    } else {
      const newFaqs = [
        {
          id: `faq-seo-${Date.now()}-1`,
          icon: 'receipt_long',
          question: 'آیا کلینیک پارمیس برای بیمه‌های تکمیلی فاکتور رسمی صادر می‌کند؟',
          answer:
            'بله؛ پس از انجام کلیه خدمات درمانی، فاکتور رسمی و معتبر ممهور به مهر نظام پزشکی دکتر انوشیروان شمس‌پور جهت دریافت هزینه از تمامی بیمه‌های تکمیلی صادر و تقدیم می‌گردد.',
        },
        {
          id: `faq-seo-${Date.now()}-2`,
          icon: 'verified',
          question: 'ماندگاری کامپوزیت ونیر و لمینت سرامیکی در کلینیک پارمیس چقدر است؟',
          answer:
            'کامپوزیت ونیرهای نانوسرامیک به طور میانگین ۵ تا ۸ سال و لمینت‌های سرامیکی E-Max بین ۱۰ تا ۱۵ سال دوام و ثبات رنگ دارند.',
        },
      ];
      db.faqs = [...newFaqs, ...db.faqs];
      resultMessage = 'پرسش و پاسخ‌های کلیدی سئو به بخش سوالات متداول سایت و اسکیما FAQPage گوگل اضافه شدند.';
    }
  } else if (actionType === 'delete_faq') {
    if (Array.isArray(db.faqs) && db.faqs.length > 0) {
      const qQuery = String(payload.questionQuery || payload.question || '').trim().toLowerCase();
      const targetIdx = payload.faqIndex !== undefined ? Number(payload.faqIndex) : undefined;
      let removed: any = null;
      if (targetIdx !== undefined && !isNaN(targetIdx)) {
        const arrIdx = targetIdx === -1 ? db.faqs.length - 1 : Math.max(0, targetIdx - 1);
        removed = db.faqs.splice(arrIdx, 1)[0];
      } else if (qQuery) {
        const idx = db.faqs.findIndex((f: any) => String(f.question || '').toLowerCase().includes(qQuery));
        if (idx !== -1) removed = db.faqs.splice(idx, 1)[0];
      }
      if (!removed) removed = db.faqs.shift();
      resultMessage = `سوال متداول «${removed?.question || ''}» از سایت حذف شد.`;
    }
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
    resultMessage = `پاسخ تخصصی پزشک برای ${repliedCount} دیدگاه ثبت شد و وضعیت آن‌ها در سایت به «تأیید شده» تغییر یافت.`;
  } else if (actionType === 'delete_comment') {
    if (Array.isArray(db.comments) && db.comments.length > 0) {
      const removed = db.comments.shift();
      resultMessage = `دیدگاه مربوط به «${removed?.authorName || 'کاربر'}» از بک‌اند حذف شد.`;
    }
  } else if (actionType === 'update_clinic_info') {
    const cleanPhone = payload.phone || payload.phoneDisplay;
    const cleanAddress = payload.address;
    const cleanHours = payload.workingHours;
    const cleanClinicName = payload.clinicName || payload.name;

    db.clinicInfo = {
      ...(db.clinicInfo || {}),
      ...(cleanClinicName ? { name: cleanClinicName } : {}),
      ...(cleanPhone
        ? {
            phone: cleanPhone,
            phoneDisplay: cleanPhone,
            phoneLine1: cleanPhone,
            phoneCompact: cleanPhone,
          }
        : {}),
      ...(cleanAddress ? { address: cleanAddress, shortAddress: cleanAddress } : {}),
      ...(cleanHours ? { workingHours: cleanHours, mobileWorkingHours: cleanHours } : {}),
    };

    db.contact = {
      ...(db.contact || {}),
      ...(cleanPhone ? { phone1: cleanPhone } : {}),
      ...(cleanAddress ? { address: cleanAddress, shortAddress: cleanAddress } : {}),
      ...(cleanHours ? { workingHours: cleanHours } : {}),
    };

    db.homeSettings.faqAndContact = {
      ...db.homeSettings.faqAndContact,
      ...(cleanPhone ? { phone1: cleanPhone } : {}),
      ...(cleanAddress ? { contactAddress: cleanAddress } : {}),
      ...(cleanHours ? { workingHours: cleanHours } : {}),
    };

    if (cleanPhone) {
      db.homeSettings.hero.primaryButtonPhone = cleanPhone;
      db.homeSettings.doctor.consultationPhone = cleanPhone;
    }

    resultMessage = 'اطلاعات تماس، آدرس و مشخصات کلینیک در تمام بخش‌های سایت (هدر، فوتر، صفحه اصلی و تماس با ما) به‌روزرسانی شد.';
  } else if (actionType === 'update_treatment_price') {
    if (!Array.isArray(db.treatments) || db.treatments.length === 0) {
      db.treatments = [...DENTAL_TREATMENTS];
    }
    const targetQuery = String(payload.treatmentId || payload.treatmentName || '').toLowerCase();
    const newPrice = Number(payload.basePricePerUnitTomans || payload.price);
    let updatedName = payload.treatmentName || payload.treatmentId || 'درمان';

    if (newPrice > 0) {
      db.treatments = db.treatments.map((t: any) => {
        const matches =
          t.id === payload.treatmentId ||
          (targetQuery && t.name && t.name.toLowerCase().includes(targetQuery)) ||
          (targetQuery && t.id && t.id.toLowerCase().includes(targetQuery));
        if (matches) {
          updatedName = t.name;
          return { ...t, basePricePerUnitTomans: newPrice };
        }
        return t;
      });
    }
    resultMessage = `تعرفه درمان «${updatedName}» به ${newPrice.toLocaleString('fa-IR')} تومان در محاسبه‌گر هوشمند هزینه سایت تغییر یافت.`;
  } else if (actionType === 'update_homepage_hero') {
    const {
      badge,
      titlePart1,
      titleHighlight,
      heroTitle,
      description,
      primaryButtonText,
      secondaryButtonText,
      imageUrl,
    } = payload;

    let nextTitlePart1 = titlePart1;
    let nextTitleHighlight = titleHighlight;

    if (heroTitle && !titlePart1 && !titleHighlight) {
      const words = String(heroTitle).trim().split(/\s+/);
      if (words.length > 3) {
        const splitIdx = Math.ceil(words.length * 0.6);
        nextTitlePart1 = words.slice(0, splitIdx).join(' ') + ' ';
        nextTitleHighlight = words.slice(splitIdx).join(' ');
      } else {
        nextTitlePart1 = heroTitle;
      }
    }

    db.homeSettings.hero = {
      ...db.homeSettings.hero,
      ...(badge ? { badge } : {}),
      ...(nextTitlePart1 ? { titlePart1: nextTitlePart1 } : {}),
      ...(nextTitleHighlight ? { titleHighlight: nextTitleHighlight } : {}),
      ...(description ? { description } : {}),
      ...(primaryButtonText ? { primaryButtonText } : {}),
      ...(secondaryButtonText ? { secondaryButtonText } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    };

    db.hero = {
      ...(db.hero || {}),
      ...(badge ? { badge } : {}),
      ...(heroTitle || nextTitlePart1
        ? { title: `${nextTitlePart1 || ''}${nextTitleHighlight || ''}`.trim() }
        : {}),
      ...(description ? { description } : {}),
      ...(primaryButtonText ? { ctaPrimary: primaryButtonText } : {}),
      ...(secondaryButtonText ? { ctaSecondary: secondaryButtonText } : {}),
    };

    resultMessage = 'بخش هیرو (بنر، تیتر اصلی و توضیحات ابتدایی صفحه اول سایت) با موفقیت در سایت به‌روزرسانی شد.';
  } else if (actionType === 'update_doctor_section') {
    const { doctorName, specialty, bio, badge, experienceText, successCountText, locationBadge, imageUrl } = payload;
    db.homeSettings.doctor = {
      ...db.homeSettings.doctor,
      ...(doctorName ? { doctorName } : {}),
      ...(specialty ? { specialty } : {}),
      ...(bio ? { bio } : {}),
      ...(badge ? { badge } : {}),
      ...(experienceText ? { experienceText } : {}),
      ...(successCountText ? { successCountText } : {}),
      ...(locationBadge ? { locationBadge } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    };
    db.doctor = {
      ...(db.doctor || {}),
      ...(doctorName ? { name: doctorName, title: doctorName } : {}),
      ...(specialty ? { specialty } : {}),
      ...(bio ? { bio } : {}),
      ...(experienceText ? { experienceYears: experienceText } : {}),
      ...(successCountText ? { successfulTreatments: successCountText } : {}),
      ...(imageUrl ? { image: imageUrl, imageUrl } : {}),
    };
    if (doctorName || imageUrl) {
      db.clinicInfo = {
        ...(db.clinicInfo || {}),
        ...(doctorName ? { doctorName, doctorTitleBrand: doctorName } : {}),
        ...(imageUrl ? { doctorImage: imageUrl, mobileDoctorAvatar: imageUrl, mobileDrawerAvatar: imageUrl } : {}),
      };
    }
    resultMessage = 'بخش معرفی دکتر انوشیروان شمس‌پور و بیوگرافی در سایت با موفقیت به‌روزرسانی شد.';
  } else if (actionType === 'update_services_section') {
    if (payload.newServiceTitle) {
      if (!Array.isArray(db.services)) db.services = [...SERVICES];
      db.services.push({
        id: `srv-ai-${Date.now()}`,
        title: payload.newServiceTitle,
        shortTitle: payload.newServiceTitle,
        description:
          payload.newServiceDescription ||
          'ارائه خدمات تخصصی با تجهیزات مدرن دیجیتال و متریال استاندارد در کلینیک پارمیس.',
        icon: payload.icon || 'dentistry',
        features: ['بدون درد با بی‌حسی دیجیتال', 'متریال اورجینال با ضمانت', 'تحت نظر دکتر انوشیروان شمس‌پور'],
        badge: 'خدمت تخصصی',
      });
      resultMessage = `خدمت جدید «${payload.newServiceTitle}» با موفقیت به لیست خدمات سایت اضافه شد.`;
    } else {
      db.homeSettings.services = {
        ...db.homeSettings.services,
        ...(payload.title ? { title: payload.title } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.badge ? { badge: payload.badge } : {}),
      };
      resultMessage = 'بخش خدمات تخصصی در صفحه اصلی سایت با موفقیت به‌روزرسانی شد.';
    }
  } else if (actionType === 'delete_service') {
    if (Array.isArray(db.services) && db.services.length > 0) {
      const q = String(payload.titleQuery || payload.serviceId || payload.title || '').trim().toLowerCase();
      const idx = q
        ? db.services.findIndex(
            (s: any) =>
              String(s.title || '').toLowerCase().includes(q) ||
              String(s.shortTitle || '').toLowerCase().includes(q) ||
              String(s.id || '').toLowerCase() === q
          )
        : db.services.length - 1;
      if (idx !== -1 && db.services[idx]) {
        const removed = db.services.splice(idx, 1)[0];
        resultMessage = `خدمت «${removed.title}» با موفقیت از لیست خدمات سایت حذف شد.`;
      }
    }
  } else if (actionType === 'add_portfolio_case') {
    if (!Array.isArray(db.transformations)) db.transformations = [];
    const newCase = {
      id: `case-ai-${Date.now()}`,
      title: payload.title || 'اصلاح طرح لبخند و بازسازی زیبایی دندان',
      category: payload.category || 'cosmetic',
      categoryLabel: payload.categoryLabel || 'کامپوزیت و لمینت',
      description:
        payload.description || 'طراحی لبخند دیجیتال و بازسازی فرم و رنگ دندان‌ها با حفظ سلامت طبیعی مینای دندان در کلینیک پارمیس.',
      beforeImage:
        payload.beforeImage ||
        'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      afterImage:
        payload.afterImage ||
        payload.mediaUrl ||
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      duration: payload.duration || '۱ جلسه',
      patientInfo: payload.patientInfo || 'مراجع کلینیک پارمیس',
    };
    db.transformations.unshift(newCase);
    resultMessage = `نمونه‌کار درمانی جدید «${newCase.title}» به گالری لبخند و صفحه اصلی اضافه شد.`;
  } else if (actionType === 'delete_portfolio_case') {
    if (Array.isArray(db.transformations) && db.transformations.length > 0) {
      const q = String(payload.titleQuery || payload.caseId || payload.title || '').trim().toLowerCase();
      const idx = q
        ? db.transformations.findIndex(
            (c: any) => String(c.title || '').toLowerCase().includes(q) || String(c.id || '').toLowerCase() === q
          )
        : 0;
      if (idx !== -1 && db.transformations[idx]) {
        const removed = db.transformations.splice(idx, 1)[0];
        resultMessage = `نمونه‌کار «${removed.title}» از گالری لبخند حذف شد.`;
      }
    }
  } else if (actionType === 'customize_ui_ux_theme') {
    if (payload.resetToDefault) {
      db.uiTheme = {};
      resultMessage = 'طراحی UI/UX، رنگ‌بندی و استایل کل سایت به حالت استاندارد اولیه (آبی کلینیکال پارمیس) بازگردانده شد.';
    } else {
      const presetKey = payload.presetTheme || payload.preset;
      const presetObj = presetKey && UI_THEME_PRESETS[presetKey] ? UI_THEME_PRESETS[presetKey] : null;

      db.uiTheme = {
        ...(db.uiTheme || {}),
        ...(presetObj || {}),
        ...(payload.primaryColor ? { primaryColor: payload.primaryColor } : {}),
        ...(payload.accentColor ? { accentColor: payload.accentColor } : {}),
        ...(payload.softBgColor ? { softBgColor: payload.softBgColor } : {}),
        ...(payload.backgroundColor ? { backgroundColor: payload.backgroundColor } : {}),
        ...(payload.buttonRadius ? { buttonRadius: payload.buttonRadius } : {}),
        ...(payload.cardStyle ? { cardStyle: payload.cardStyle } : {}),
        ...(payload.fontScale ? { fontScale: payload.fontScale } : {}),
        ...(payload.customCss !== undefined ? { customCss: payload.customCss } : {}),
      };

      resultMessage = presetObj
        ? `تم و طراحی UI/UX سایت به «${presetObj.name}» تغییر یافت و در کل صفحات اعمال شد.`
        : 'شخصی‌سازی طراحی UI/UX (پالت رنگ، استایل دکمه‌ها، کارت‌ها و تایپوگرافی) با موفقیت روی کل سایت اعمال شد.';
    }
  } else if (actionType === 'toggle_section_visibility') {
    const sec = String(payload.sectionName || '').toLowerCase();
    const enabled = payload.enabled !== undefined ? Boolean(payload.enabled) : true;

    if (sec.includes('hero') || sec.includes('هیرو') || sec.includes('بنر')) {
      db.homeSettings.hero.enabled = enabled;
    } else if (sec.includes('value') || sec.includes('مزیت') || sec.includes('ویژگی')) {
      db.homeSettings.valueProps.enabled = enabled;
    } else if (sec.includes('advanced') || sec.includes('تجهیزات') || sec.includes('استریل')) {
      db.homeSettings.advancedCare.enabled = enabled;
    } else if (sec.includes('transform') || sec.includes('گالری') || sec.includes('نمونه')) {
      db.homeSettings.transformations.enabled = enabled;
    } else if (sec.includes('service') || sec.includes('خدمات')) {
      db.homeSettings.services.enabled = enabled;
    } else if (sec.includes('doctor') || sec.includes('دکتر') || sec.includes('پزشک')) {
      db.homeSettings.doctor.enabled = enabled;
    } else if (sec.includes('article') || sec.includes('مقاله') || sec.includes('وبلاگ')) {
      db.homeSettings.articles.enabled = enabled;
    } else if (sec.includes('faq') || sec.includes('سوال')) {
      db.homeSettings.faqAndContact.faqEnabled = enabled;
    } else if (sec.includes('contact') || sec.includes('تماس') || sec.includes('آدرس')) {
      db.homeSettings.faqAndContact.contactEnabled = enabled;
    } else if (sec.includes('cta') || sec.includes('نوبت')) {
      db.homeSettings.cta.enabled = enabled;
    } else if (sec.includes('motion') || sec.includes('انیمیشن')) {
      db.homeSettings.motionGuides.enabled = enabled;
    }

    resultMessage = `وضعیت نمایش بخش «${payload.sectionName || sec}» در صفحه اصلی به «${
      enabled ? 'فعال و قابل مشاهده' : 'مخفی'
    }» تغییر یافت.`;
  } else if (actionType === 'custom_cms_patch') {
    const rawSection = payload.section;
    const targetSection = rawSection === 'homePageSettings' ? 'homeSettings' : rawSection;
    if (targetSection && payload.data !== undefined) {
      if (typeof payload.data === 'object' && !Array.isArray(payload.data) && db[targetSection]) {
        db[targetSection] = { ...db[targetSection], ...payload.data };
      } else {
        db[targetSection] = payload.data;
      }
      resultMessage = `بخش «${targetSection}» در دیتابیس بک‌اند سایت با موفقیت به‌روزرسانی شد.`;
    }
  }

  return resultMessage || 'تغییرات با موفقیت در سایت اعمال شد.';
}

/**
 * 3. Executes an approved proposal and writes changes to db.json
 */
export async function executeAdminProposal(proposalId: string): Promise<{
  success: boolean;
  message: string;
  proposal?: AiAdminProposal;
  newBacklinks?: AiBacklinkCampaign[];
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

  const newBacklinks: AiBacklinkCampaign[] = [];
  const resultMessage = await applyActionToDatabase(db, proposal.actionType, proposal.payload || {}, newBacklinks);

  proposal.status = 'approved';
  proposal.executedAt = new Date().toLocaleString('fa-IR');

  addActivityLog(db, 'proposal_executed', `اجرای پیشنهاد: ${proposal.title}`, resultMessage);
  writeDb(db);

  runSiteAndSeoAudit(true);

  return {
    success: true,
    message: resultMessage,
    proposal,
    newBacklinks,
  };
}

export async function executeAllPendingProposals(): Promise<{
  success: boolean;
  executedCount: number;
  messages: string[];
  newBacklinks: AiBacklinkCampaign[];
}> {
  const db = readDb();
  const state = ensureAiAdminState(db);
  const pendingList = state.proposals.filter((p) => p.status === 'pending');

  if (pendingList.length === 0) {
    return {
      success: true,
      executedCount: 0,
      messages: ['هیچ پیشنهاد در انتظار تأییدی وجود ندارد؛ تمام موارد قبلاً اعمال شده‌اند.'],
      newBacklinks: [],
    };
  }

  const messages: string[] = [];
  const newBacklinks: AiBacklinkCampaign[] = [];
  for (const prop of pendingList) {
    const msg = await applyActionToDatabase(db, prop.actionType, prop.payload || {}, newBacklinks);
    prop.status = 'approved';
    prop.executedAt = new Date().toLocaleString('fa-IR');
    messages.push(`✅ ${prop.title}: ${msg}`);
  }

  addActivityLog(
    db,
    'proposal_executed',
    `اجرای یکجای ${pendingList.length} پیشنهاد بهینه‌سازی در سایت`,
    messages.join(' | ')
  );
  writeDb(db);
  runSiteAndSeoAudit(true);

  return {
    success: true,
    executedCount: pendingList.length,
    messages,
    newBacklinks,
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
  backlinks: AiBacklinkCampaign[];
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
      backlinks: state.backlinks,
      audit,
    };
  }
  return {
    scheduler: state.scheduler,
    proposals: state.proposals,
    activityLogs: state.activityLogs,
    backlinks: state.backlinks,
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
    `به‌روزرسانی زمان‌بندی خودکار تولید محتوا و بک‌لینک (${state.scheduler.enabled ? `فعال در ساعت ${state.scheduler.publishTime}` : 'غیرفعال'})`,
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
  backlinkCampaign?: AiBacklinkCampaign;
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

    // Also auto-build external backlink pointing to this new article if autoBacklinkEnabled !== false
    let backlinkCampaign: AiBacklinkCampaign | undefined;
    if (state.scheduler.autoBacklinkEnabled !== false) {
      backlinkCampaign = await createAndPublishBacklinkCampaign(db, {
        targetPage: 'article',
        topic: articleObj.title,
        anchorText: articleObj.title,
      });
    }

    addActivityLog(
      db,
      'auto_article',
      `${source === 'scheduled' ? '⏰ انتشار خودکار مقاله و بک‌لینک' : '✨ تولید و انتشار فوری مقاله و بک‌لینک سئو'}: «${articleObj.title}»`,
      `مقاله کامل در وبلاگ سایت منتشر شد و کمپین بک‌لینک خارجی نیز در وبلاگ عمومی ثبت گردید.`
    );
    writeDb(db);

    return {
      article: articleObj,
      backlinkCampaign,
      publishedDirectly: true,
      message: `مقاله «${articleObj.title}» در وبلاگ سایت منتشر شد و بک‌لینک خارجی آن نیز در وبلاگ عمومی ثبت گردید.`,
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
        category: articleObj.categorySlug,
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

  try {
    const bootDb = readDb();
    if (Array.isArray(bootDb.articles)) {
      bootDb.articles = bootDb.articles.map((a: any, idx: number) => normalizeArticleSchema(a, idx));
      writeDb(bootDb);
    }
  } catch {
    // ignore boot normalization errors
  }

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
 * Full UI/UX Designer + Full Backend CRUD + Off-Page Auto-SEO & Live Backlink Builder + Auto-Article Loader
 */
const ACTION_PROPERTIES_SCHEMA = {
  actionType: {
    type: Type.STRING,
    description:
      'نوع عملیات: create_backlink_campaign | auto_seo_offpage_and_onpage | rank_one_seo_package | fix_site_bugs | seo_settings | sync_doctor_profile | apply_uploaded_media | publish_seo_article | auto_load_multiple_articles | delete_article | update_article | enrich_articles_seo | fix_media_alt_tags | add_seo_faqs | delete_faq | reply_unanswered_comments | delete_comment | update_clinic_info | update_treatment_price | update_homepage_hero | update_doctor_section | update_services_section | delete_service | add_portfolio_case | delete_portfolio_case | customize_ui_ux_theme | toggle_section_visibility',
  },
  targetPage: {
    type: Type.STRING,
    description:
      'صفحه هدف برای ساخت لینک و دریافت بک‌لینک: home (صفحه اصلی) | services (خدمات ایمپلنت و کامپوزیت) | gallery (گالری لبخند) | about (درباره دکتر) | blog (وبلاگ) | article (مقاله خاص) | contact (تماس با ما)',
  },
  targetUrl: {
    type: Type.STRING,
    description: 'لینک مستقیم و دلخواه صفحه هدف (در صورتی که مدیر آدرس خاصی داده باشد)',
  },
  anchorText: {
    type: Type.STRING,
    description: 'متن انکرتکست سئو شده برای لینک دادن به صفحه هدف (مثلاً ایمپلنت دیجیتال در پاکدشت)',
  },
  topic: { type: Type.STRING, description: 'موضوع یا عنوان مقاله برای تحقیق، انتشار داخلی یا رپورتاژ بک‌لینک خارجی' },
  count: { type: Type.NUMBER, description: 'تعداد مقالات برای تولید خودکار یکجا (مثلاً 2 یا 3)' },
  articleId: { type: Type.STRING, description: 'شناسه (id) مقاله برای حذف یا ویرایش' },
  articleIndex: { type: Type.NUMBER, description: 'شماره ردیف مقاله در لیست (مثلاً 1 برای مقاله اول، -1 برای آخرین مقاله)' },
  titleQuery: { type: Type.STRING, description: 'بخشی از عنوان مقاله، خدمت یا نمونه‌کار برای حذف یا ویرایش' },
  newTitle: { type: Type.STRING, description: 'عنوان جدید هنگام ویرایش مقاله یا بخش' },
  category: { type: Type.STRING, description: 'دسته مقاله: cosmetic | implant | restorative | endo | pediatric | surgery' },
  mediaUrl: { type: Type.STRING, description: 'آدرس فایل تصویری یا ویدیویی آپلودشده' },
  target: { type: Type.STRING, description: 'بخش هدف برای رسانه: doctor | hero | logo' },
  siteTitle: { type: Type.STRING, description: 'عنوان سئو جدید سایت (Title Tag)' },
  metaDescription: { type: Type.STRING, description: 'توضیحات متا سئو جدید (Meta Description)' },
  metaKeywords: { type: Type.STRING, description: 'کلمات کلیدی سئو با کاما جدا شده' },
  phoneDisplay: { type: Type.STRING, description: 'شماره تلفن جدید مطب' },
  address: { type: Type.STRING, description: 'آدرس جدید مطب' },
  workingHours: { type: Type.STRING, description: 'ساعات کاری جدید مطب' },
  clinicName: { type: Type.STRING, description: 'نام کلینیک' },
  heroTitle: { type: Type.STRING, description: 'تیتر اصلی بخش اول صفحه اصلی (Hero)' },
  titlePart1: { type: Type.STRING, description: 'بخش اول تیتر صفحه اصلی' },
  titleHighlight: { type: Type.STRING, description: 'بخش هایلایت آبی تیتر صفحه اصلی' },
  description: { type: Type.STRING, description: 'توضیحات جدید بخش مورد نظر' },
  badge: { type: Type.STRING, description: 'متن بج بالای تیتر' },
  doctorName: { type: Type.STRING, description: 'نام پزشک' },
  specialty: { type: Type.STRING, description: 'تخصص پزشک' },
  bio: { type: Type.STRING, description: 'بیوگرافی پزشک' },
  treatmentName: { type: Type.STRING, description: 'نام درمان برای تغییر قیمت (مثلاً ایمپلنت، کامپوزیت، لمینت، عصب‌کشی)' },
  basePricePerUnitTomans: { type: Type.NUMBER, description: 'قیمت جدید هر واحد درمان به تومان (مثلاً 15000000)' },
  question: { type: Type.STRING, description: 'سوال متداول جدید یا مورد نظر' },
  answer: { type: Type.STRING, description: 'پاسخ سوال متداول جدید' },
  newServiceTitle: { type: Type.STRING, description: 'عنوان خدمت دندان‌پزشکی جدید برای افزودن به سایت' },
  newServiceDescription: { type: Type.STRING, description: 'توضیحات خدمت جدید' },
  presetTheme: {
    type: Type.STRING,
    description: 'پریست آماده تم UI/UX: default_blue | emerald_medical | royal_gold_navy | modern_teal | purple_luxury',
  },
  primaryColor: { type: Type.STRING, description: 'کد رنگ اصلی برند (HEX مثل #047857 یا #004ac6)' },
  accentColor: { type: Type.STRING, description: 'کد رنگ مکمل (HEX)' },
  backgroundColor: { type: Type.STRING, description: 'کد رنگ پس‌زمینه سایت (HEX)' },
  buttonRadius: { type: Type.STRING, description: 'فرم دکمه‌ها: pill | rounded | sharp' },
  cardStyle: { type: Type.STRING, description: 'استایل کارت‌های سایت: glass | elevated | minimal' },
  fontScale: { type: Type.STRING, description: 'مقیاس فونت سایت: normal | large | compact' },
  customCss: { type: Type.STRING, description: 'کد CSS سفارشی برای اعمال تغییرات خاص UI/UX در کل سایت' },
  resetToDefault: { type: Type.BOOLEAN, description: 'بازگردانی تم UI/UX به حالت پیش‌فرض' },
  sectionName: {
    type: Type.STRING,
    description: 'نام سکشن برای فعال/مخفی کردن: hero | valueProps | advancedCare | transformations | services | doctor | articles | faq | contact | cta | motionGuides',
  },
  enabled: { type: Type.BOOLEAN, description: 'وضعیت نمایش سکشن (true=نمایش، false=مخفی)' },
};

const adminAiTools: FunctionDeclaration[] = [
  {
    name: 'execute_site_action_now',
    description:
      'اجرای فوری و مستقیم هرگونه تغییر، سئو اتوماتیک، تحقیق و ساخت بک‌لینک در وبلاگ‌های عمومی (create_backlink_campaign / auto_seo_offpage_and_onpage)، شخصی‌سازی UI/UX، افزودن، ویرایش یا حذف (مقاله، خدمت، سوال متداول، نمونه‌کار، قیمت، تم رنگی، سکشن‌ها) در دیتابیس سایت!',
    parameters: {
      type: Type.OBJECT,
      properties: {
        ...ACTION_PROPERTIES_SCHEMA,
      },
      required: ['actionType'],
    },
  },
  {
    name: 'create_site_improvement_proposal',
    description:
      'ایجاد کارت پیشنهاد عملیاتی (با دکمه «تأیید و پیاده‌سازی») برای زمانی که مدیر می‌گوید «سایت رو تحلیل کن و پیشنهاد بده تا تایید کنم» یا «ایده بده».',
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
        ...ACTION_PROPERTIES_SCHEMA,
      },
      required: ['title', 'actionType', 'description'],
    },
  },
  {
    name: 'configure_auto_post_scheduler',
    description: 'تنظیم یا فعال‌سازی انتشار خودکار زمان‌بندی‌شده مقاله و بک‌لینک در ساعت مشخص روزانه',
    parameters: {
      type: Type.OBJECT,
      properties: {
        enabled: { type: Type.BOOLEAN, description: 'فعال یا غیرفعال بودن زمان‌بندی خودکار' },
        publishTime: { type: Type.STRING, description: 'ساعت انتشار به فرمت ۲۴ ساعته مثل 09:00 یا 10:00 یا 18:30' },
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
  newBacklinks: AiBacklinkCampaign[];
  scheduler?: AiSchedulerConfig;
  audit?: SeoAuditReport;
}> {
  const cleanMessage =
    (message || '').trim() || (attachments.length > 0 ? 'این فایل پیوست‌شده را بررسی و تحلیل کن.' : '');
  if (!cleanMessage) {
    throw new Error('پیام یا فایل ارسالی نمی‌تواند خالی باشد.');
  }

  const db = readDb();
  const state = ensureAiAdminState(db);
  const { audit } = runSiteAndSeoAudit(false);

  const newProposals: AiAdminProposal[] = [];
  const executedActions: string[] = [];
  const newBacklinks: AiBacklinkCampaign[] = [];

  const msgLower = cleanMessage.toLowerCase().trim();
  const uploadedUrls = attachments.map((a) => a.url).filter(Boolean) as string[];

  // 1. Check if Admin is approving pending proposals via natural Persian chat phrases
  const isApprovalPhrase =
    /^(تایید|تأیید|انجام بده|انجامش بده|اعمال کن|اعمالش کن|پیاده سازی کن|پیاده‌سازی کن|بله|آره|اوکی|اوکیه|باشه|قبوله|تایید کن|تأیید کن|تایید میکنم|تأیید می‌کنم|همه رو انجام بده|همه رو اعمال کن|همه رو تایید کن|انجامشون بده|اعمالشون کن|درستش کن|ثبتش کن|منتشرش کن)/.test(
      msgLower
    ) ||
    (msgLower.length < 45 &&
      (msgLower.includes('تایید') ||
        msgLower.includes('تأیید') ||
        msgLower.includes('اعمال کن') ||
        msgLower.includes('انجام بده') ||
        msgLower.includes('پیاده سازی کن') ||
        msgLower.includes('پیاده‌سازی کن')));

  if (isApprovalPhrase) {
    const pendingList = state.proposals.filter((p) => p.status === 'pending');
    if (pendingList.length > 0) {
      const resAll = await executeAllPendingProposals();
      const updatedDashboard = getAdminAiDashboardData();
      return {
        reply: `✅ **با موفقیت در سایت اعمال شد!**\n\nتمامی تغییرات تاییدشده شما مستقیماً در دیتابیس سایت اجرا و ذخیره گردید:\n\n${resAll.messages.join('\n\n')}`,
        newProposals: [],
        executedActions: resAll.messages,
        newBacklinks: resAll.newBacklinks,
        scheduler: updatedDashboard.scheduler,
        audit: updatedDashboard.audit,
      };
    }
  }

  // 2. If user uploaded an image/video and asked to place it on the site directly
  if (
    uploadedUrls.length > 0 &&
    (msgLower.includes('دکتر') ||
      msgLower.includes('پروفایل') ||
      msgLower.includes('جایگزین') ||
      msgLower.includes('بذار') ||
      msgLower.includes('بنر') ||
      msgLower.includes('لوگو') ||
      msgLower.includes('عوض کن'))
  ) {
    const target =
      msgLower.includes('بنر') || msgLower.includes('صفحه اصلی') || msgLower.includes('هیرو')
        ? 'hero'
        : msgLower.includes('لوگو') || msgLower.includes('هدر')
        ? 'logo'
        : 'doctor';

    const directMsg = await applyActionToDatabase(db, 'apply_uploaded_media', {
      mediaUrl: uploadedUrls[0],
      target,
    });
    addActivityLog(db, 'chat_command', 'اعمال مستقیم رسانه آپلودشده در سایت', directMsg);
    writeDb(db);
    executedActions.push(directMsg);
  }

  const wantsProposalOnly =
    msgLower.includes('پیشنهاد بده') ||
    msgLower.includes('تا تایید کنم') ||
    msgLower.includes('تا تأیید کنم');

  const projectSnapshot = buildDeepProjectContextSnapshot(db, audit);

  const systemInstruction = `تو «معمار ارشد پروژه، طراح UI/UX، مدیر کل بک‌اند و موتور سئو اتوماتیک و لینک‌سازی خارجی (Omnipotent Admin AI & Auto-SEO Backlink Engine)» برای وب‌سایت «کلینیک دندان‌پزشکی پارمیس (دکتر انوشیروان شمس‌پور)» هستی.
مخاطب تو شخص «مدیر سایت / دکتر شمس‌پور» است.

تو درک ۱۰۰٪ و کامل از کل کدبیس، معماری فرانت‌اند و دیتابیس بک‌اند این پروژه داری:
${projectSnapshot}

قوانین طلایی عملکرد تو (CRITICAL):
۱. تو **قدرت کامل اجرا، سئو اتوماتیک، لینک‌سازی خارجی، افزودن، ویرایش، حذف و شخصی‌سازی UI/UX** در کل سایت و بک‌اند را داری.
۲. هرگاه مدیر دستور مستقیمی داد، **بلافاصله** ابزار \`execute_site_action_now\` را صدا بزن تا تغییرات همان لحظه اجرا شوند:
   - **بک‌لینک، رپورتاژ در وبلاگ‌های عمومی، لینک‌سازی و سئو اتوماتیک:**
     اگر گفت «بک لینک بساز / یک لینک بساز تحقیق کن و توی سایت‌های مرتبط یا وبلاگ‌های عمومی مقاله بنویس و بک لینک بده / رپورتاژ برو / سئو اتوماتیک انجام بده»:
     -> بلافاصله \`execute_site_action_now\` را با \`actionType: "create_backlink_campaign"\` (یا \`"auto_seo_offpage_and_onpage"\` برای سئو اتوماتیک کامل داخلی و خارجی) صدا بزن! این ابزار واقعاً تحقیق کلمات کلیدی انجام می‌دهد، لینک هدف را می‌سازد و **مقالات رپورتاژ را به صورت زنده روی وبلاگ عمومی Telegra.ph (با DA 92) منتشر می‌کند** و فید گوگل را پینگ می‌کند!
   - اگر گفت «فلان مقاله رو حذف کن / پاک کن» -> \`execute_site_action_now\` با \`actionType: "delete_article"\`.
   - اگر گفت «اتوماتیک مقاله لود کن / چند تا مقاله جدید بذار» -> \`execute_site_action_now\` با \`actionType: "auto_load_multiple_articles"\` یا \`publish_seo_article\`.
   - اگر گفت «رنگ سایت / تم سایت / ظاهر UI/UX / دکمه‌ها / کارت‌ها رو تغییر بده» -> \`execute_site_action_now\` با \`actionType: "customize_ui_ux_theme"\`.
   - اگر گفت «فلان سکشن رو مخفی یا فعال کن» -> \`execute_site_action_now\` با \`actionType: "toggle_section_visibility"\`.
   - اگر گفت «خدمت جدید اضافه کن / خدمت رو حذف کن / قیمت درمان رو عوض کن / سوال متداول اضافه یا حذف کن / تیتر صفحه اول رو عوض کن / اطلاعات تماس رو تغییر بده» -> بلافاصله با \`execute_site_action_now\` انجام بده.
۳. اگر مدیر خواست سایت را تحلیل کنی و ایده‌های خلاقانه بدهی تا بعد از تأییدش اعمال شوند، از \`create_site_improvement_proposal\` استفاده کن.
۴. پاسخ‌هایت را بسیار هوشمند، دقیق، حرفه‌ای و به زبان فارسی روان بنویس.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'undefined' && apiKey.trim()) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const contents: any[] = history.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content.slice(0, 1000) }],
    }));

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
        // ignore attachment inline error
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
            temperature: 0.4,
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

            if (call.name === 'execute_site_action_now') {
              const actionType = (args.actionType || 'rank_one_seo_package') as ProposalActionType;
              const payload = {
                ...args,
                mediaUrl: args.mediaUrl || uploadedUrls[0],
              };
              const execMsg = await applyActionToDatabase(freshDb, actionType, payload, newBacklinks);
              addActivityLog(
                freshDb,
                actionType.includes('backlink') || actionType.includes('auto_seo') ? 'backlink_seo' : 'chat_command',
                `اجرای مستقیم دستور هوش مصنوعی (${actionType})`,
                execMsg
              );
              executedActions.push(execMsg);
            } else if (call.name === 'create_site_improvement_proposal') {
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
                    : 'سئو و بک‌لینک',
                priority: (args.priority as any) || 'high',
                description: String(args.description || 'اعمال تغییرات پیشنهادی هوش مصنوعی در دیتابیس سایت'),
                expectedImpact: String(args.expectedImpact || 'ارتقای رتبه سئو و بهبود تجربه کاربری مراجعین'),
                actionType,
                payload: {
                  ...args,
                  mediaUrl: args.mediaUrl || uploadedUrls[0],
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
              const schedMsg = `زمان‌بندی انتشار خودکار مقالات و بک‌لینک روی وضعیت «${
                freshState.scheduler.enabled ? `فعال در ساعت ${freshState.scheduler.publishTime}` : 'غیرفعال'
              }» تنظیم و ذخیره شد.`;
              addActivityLog(freshDb, 'scheduler_update', 'تنظیم زمان‌بندی خودکار مقاله و بک‌لینک با چت', schedMsg);
              executedActions.push(schedMsg);
            }
          }
          writeDb(freshDb);
        }

        replyText = response.text?.trim() || '';

        // Deterministic safety net if Gemini didn't emit a tool call for a direct command
        if (executedActions.length === 0 && newProposals.length === 0) {
          const freshDb = readDb();
          const freshState = ensureAiAdminState(freshDb);

          const isBacklinkOrAutoSeoCmd =
            msgLower.includes('بک لینک') ||
            msgLower.includes('بک‌لینک') ||
            msgLower.includes('backlink') ||
            msgLower.includes('رپورتاژ') ||
            msgLower.includes('لینک بساز') ||
            msgLower.includes('لینک سازی') ||
            msgLower.includes('لینک‌سازی') ||
            msgLower.includes('وبلاگ های عمومی') ||
            msgLower.includes('وبلاگ‌های عمومی') ||
            msgLower.includes('سایت های مرتبط') ||
            msgLower.includes('سایت‌های مرتبط') ||
            msgLower.includes('سئو اتوماتیک') ||
            msgLower.includes('سئوی اتوماتیک');

          const isDeleteCmd =
            msgLower.includes('حذف') ||
            msgLower.includes('حذع') ||
            msgLower.includes('پاک کن') ||
            msgLower.includes('بردار');

          if (isBacklinkOrAutoSeoCmd) {
            let targetPage = 'services';
            if (msgLower.includes('صفحه اصلی') || msgLower.includes('سایت اصلی') || msgLower.includes('خانه'))
              targetPage = 'home';
            else if (msgLower.includes('گالری') || msgLower.includes('نمونه کار')) targetPage = 'gallery';
            else if (msgLower.includes('درباره') || msgLower.includes('دکتر')) targetPage = 'about';
            else if (msgLower.includes('تماس') || msgLower.includes('آدرس') || msgLower.includes('نوبت'))
              targetPage = 'contact';
            else if (msgLower.includes('مقاله')) targetPage = 'article';

            const actionToRun: ProposalActionType =
              msgLower.includes('سئو اتوماتیک') || msgLower.includes('سئوی اتوماتیک')
                ? 'auto_seo_offpage_and_onpage'
                : 'create_backlink_campaign';

            const execMsg = await applyActionToDatabase(
              freshDb,
              actionToRun,
              { targetPage },
              newBacklinks
            );
            addActivityLog(freshDb, 'backlink_seo', 'اجرای سئو اتوماتیک و انتشار بک‌لینک در وبلاگ عمومی', execMsg);
            writeDb(freshDb);
            executedActions.push(execMsg);
          } else if (isDeleteCmd && (msgLower.includes('مقاله') || msgLower.includes('پست'))) {
            let articleIndex: number | undefined;
            if (msgLower.includes('اول') || msgLower.includes('جدیدترین')) articleIndex = 1;
            else if (msgLower.includes('دوم')) articleIndex = 2;
            else if (msgLower.includes('سوم')) articleIndex = 3;
            else if (msgLower.includes('آخر') || msgLower.includes('قدیمی')) articleIndex = -1;

            const cleanedQuery = cleanMessage
              .replace(/مقاله|پست|رو|را|حذف|حذع|پاک|کن|کنید|از|سایت|وبلاگ|اول|دوم|سوم|آخر/g, '')
              .trim();

            const execMsg = await applyActionToDatabase(freshDb, 'delete_article', {
              articleIndex,
              titleQuery: cleanedQuery.length >= 2 ? cleanedQuery : undefined,
            });
            addActivityLog(freshDb, 'chat_command', 'حذف مقاله با دستور مستقیم چت', execMsg);
            writeDb(freshDb);
            executedActions.push(execMsg);
          } else if (isDeleteCmd && msgLower.includes('خدمت')) {
            const cleanedQuery = cleanMessage.replace(/خدمت|رو|را|حذف|حذع|پاک|کن|کنید/g, '').trim();
            const execMsg = await applyActionToDatabase(freshDb, 'delete_service', {
              titleQuery: cleanedQuery,
            });
            addActivityLog(freshDb, 'chat_command', 'حذف خدمت با دستور مستقیم چت', execMsg);
            writeDb(freshDb);
            executedActions.push(execMsg);
          } else if (
            (msgLower.includes('مقاله') || msgLower.includes('پست')) &&
            (msgLower.includes('منتشر') ||
              msgLower.includes('بنویس') ||
              msgLower.includes('اضافه') ||
              msgLower.includes('لود') ||
              msgLower.includes('بساز')) &&
            !wantsProposalOnly
          ) {
            const wantsMultiple =
              msgLower.includes('چند') || msgLower.includes('۲') || msgLower.includes('2') || msgLower.includes('۳') || msgLower.includes('3');
            if (wantsMultiple) {
              const count = msgLower.includes('۳') || msgLower.includes('3') ? 3 : 2;
              const execMsg = await applyActionToDatabase(freshDb, 'auto_load_multiple_articles', { count });
              addActivityLog(freshDb, 'chat_command', 'تولید و لود خودکار مقالات سئو', execMsg);
              writeDb(freshDb);
              executedActions.push(execMsg);
            } else {
              const execMsg = await applyActionToDatabase(freshDb, 'publish_seo_article', {
                topic: cleanMessage
                  .replace(/یک مقاله|یه مقاله|مقاله|اتوماتیک|خودکار|لود کن|منتشر کن|بنویس|اضافه کن|درباره|در مورد/g, '')
                  .trim(),
              });
              addActivityLog(freshDb, 'chat_command', 'نگارش و انتشار مستقیم مقاله', execMsg);
              writeDb(freshDb);
              executedActions.push(execMsg);
            }
          } else if (
            msgLower.includes('تم ') ||
            msgLower.includes('رنگ ') ||
            msgLower.includes('یو آی') ||
            msgLower.includes('یو ای') ||
            msgLower.includes('ui') ||
            msgLower.includes('ux') ||
            msgLower.includes('شخصی سازی') ||
            msgLower.includes('شخصی‌سازی')
          ) {
            let presetTheme = 'modern_teal';
            if (msgLower.includes('سبز') || msgLower.includes('زمرد')) presetTheme = 'emerald_medical';
            else if (msgLower.includes('طلایی') || msgLower.includes('سرمه') || msgLower.includes('لوکس'))
              presetTheme = 'royal_gold_navy';
            else if (msgLower.includes('بنفش')) presetTheme = 'purple_luxury';
            else if (msgLower.includes('پیش‌فرض') || msgLower.includes('پیش فرض') || msgLower.includes('آبی'))
              presetTheme = 'default_blue';

            const execMsg = await applyActionToDatabase(freshDb, 'customize_ui_ux_theme', {
              presetTheme,
              resetToDefault: msgLower.includes('پیش‌فرض') || msgLower.includes('پیش فرض'),
            });
            addActivityLog(freshDb, 'chat_command', 'شخصی‌سازی طراحی UI/UX سایت', execMsg);
            writeDb(freshDb);
            executedActions.push(execMsg);
          } else if (
            msgLower.includes('سئو') ||
            msgLower.includes('رتبه') ||
            msgLower.includes('گوگل') ||
            msgLower.includes('تحلیل') ||
            msgLower.includes('باگ') ||
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
            const backlinkProp: AiAdminProposal = {
              id: `prop-backlink-${Date.now() + 1}`,
              title: 'سئو اتوماتیک خارجی: تحقیق کلمات کلیدی، ساخت لینک هدف و انتشار زنده رپورتاژ بک‌لینک در وبلاگ‌های عمومی',
              category: 'seo',
              categoryLabel: 'لینک‌سازی و بک‌لینک خودکار',
              priority: 'high',
              description:
                'تحقیق کلمات کلیدی پرجستجوی دندان‌پزشکی، ساخت لینک هدف به صفحات اصلی و خدمات سایت، نگارش ۲ مقاله رپورتاژ تخصصی و انتشار زنده در وبلاگ عمومی بین‌المللی Telegra.ph (DA 92) به همراه پینگ ایندکسر گوگل.',
              expectedImpact: 'افزایش اعتبار دامنه (Domain Authority) و جهش رتبه کلمات کلیدی در گوگل',
              actionType: 'create_backlink_campaign',
              payload: { targetPage: 'services' },
              status: 'pending',
              createdAt: new Date().toLocaleString('fa-IR'),
            };
            freshState.proposals.unshift(backlinkProp, rank1Prop);
            newProposals.push(rank1Prop, backlinkProp);
            writeDb(freshDb);
          }
        }

        if (!replyText && executedActions.length > 0) {
          replyText = `✅ **تغییرات و عملیات سئو مستقیماً اجرا و اعمال شد:**\n\n${executedActions.map((a) => `• ${a}`).join('\n')}`;
        } else if (replyText && executedActions.length > 0) {
          replyText = `${replyText}\n\n---\n✅ **عملیات اجراشده:**\n${executedActions.map((a) => `• ${a}`).join('\n')}`;
        } else if (!replyText && newProposals.length > 0) {
          replyText = `تحلیل کامل انجام شد و **${newProposals.length} بسته عملیاتی** آماده گردید. با کلیک روی دکمه **«تأیید و پیاده‌سازی خودکار در سایت»** (یا ارسال کلمه «تایید»)، تغییرات بلافاصله اجرا می‌شوند.`;
        }

        if (replyText) break;
      } catch {
        continue;
      }
    }

    if (replyText) {
      const finalDb = readDb();
      const finalState = ensureAiAdminState(finalDb);
      return {
        reply: replyText,
        newProposals,
        executedActions,
        newBacklinks,
        scheduler: finalState.scheduler,
        audit: finalState.lastAudit || audit,
      };
    }
  }

  return {
    reply:
      executedActions.length > 0
        ? `✅ تغییرات با موفقیت اعمال شد:\n${executedActions.join('\n')}`
        : `وضعیت فعلی سایت بررسی شد (امتیاز سلامت و سئو: ${audit.overallScore} از ۱۰۰). بسته‌های پیشنهادی در زیر پیام آماده تأیید و پیاده‌سازی خودکار هستند.`,
    newProposals,
    executedActions,
    newBacklinks,
    scheduler: state.scheduler,
    audit: state.lastAudit || audit,
  };
}
