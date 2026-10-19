import React from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../context/CMSContext.tsx';
import { CLINIC_INFO } from '../data/clinicData.ts';

interface HeroProps {
  onOpenBooking: () => void;
  onNavigateServices?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onNavigateServices }) => {
  const { homeSettings, siteImages, clinicInfo } = useCMS();
  const CLINIC_INFO = clinicInfo;
  const heroConfig = homeSettings?.hero || {
    badge: 'کلینیک تخصصی دندان‌پزشکی پارمیس • پاکدشت',
    titlePart1: 'لبخندی زیبا، سالم و ',
    titleHighlight: 'ماندگار برای شما',
    description: 'ارائه پیشرفته‌ترین خدمات ایمپلنت، کامپوزیت زیبایی و درمان‌های تخصصی با بهره‌گیری از تکنولوژی روز دیجیتال تحت نظر مستقیم دکتر انوشیروان شمس پور در پاکدشت.',
    primaryButtonText: 'نوبت‌دهی سریع تلفنی',
    primaryButtonPhone: CLINIC_INFO.phone,
    secondaryButtonText: 'مشاهده نتایج قبل و بعد درمان',
    statsDoctors: '+۵ متخصص',
    statsSatisfaction: '۹۹.۴٪ رضایت',
    imageUrl: siteImages.heroMainImage?.url || CLINIC_INFO.heroImage,
  };

  const heroImageSrc = heroConfig.imageUrl || siteImages.heroMainImage?.url || CLINIC_INFO.heroImage;

  const defaultTrustFeatures = [
    { icon: 'sentiment_satisfied', title: 'درمان با حداقل درد', subtitle: 'بی‌حسی دقیق' },
    { icon: 'biotech', title: 'تجهیزات به‌روز', subtitle: 'دیجیتال و مدرن' },
    { icon: 'verified', title: 'کادر دندان‌پزشکی مجرب', subtitle: 'متخصصین باسابقه' },
    { icon: 'clean_hands', title: 'محیط کاملاً استریل', subtitle: 'اتوکلاو کلاس B' },
  ];

  const trustFeatures = (heroConfig.trustFeatures && heroConfig.trustFeatures.length > 0)
    ? heroConfig.trustFeatures
    : defaultTrustFeatures;

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (target && target.startsWith('#')) {
      e.preventDefault();
      const elementId = target.substring(1);
      const targetEl = document.getElementById(elementId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  return (
    <section className="relative overflow-hidden" id="hero">
      {/* ================= MOBILE HERO (< md) ================= */}
      <div className="md:hidden relative px-4 pt-4 pb-6 overflow-hidden text-right">
        {/* Ambient decorative gradient blob */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#dbe1ff]/40 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Floating Subtle Dental Icon (Top Left Eye Guide) */}
        <div className="absolute top-3 left-4 pointer-events-none opacity-25 text-[#004ac6] animate-dental-float">
          <span className="material-symbols-outlined text-[28px]">dentistry</span>
        </div>

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dae2fd] text-[#131b2e] text-xs font-semibold mb-3 border border-[#c3c6d7]/30 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse" />
          <span>{heroConfig.badge}</span>
          <span className="material-symbols-outlined text-[14px] text-[#004ac6] animate-dental-sparkle">
            auto_awesome
          </span>
        </div>

        {/* Main Headline Mobile Optimized */}
        <h1 className="text-[1.75rem] font-bold text-[#191c1e] tracking-tight mb-2.5 leading-snug">
          {heroConfig.titlePart1}{' '}
          <span className="relative inline-block text-[#004ac6]">
            {heroConfig.titleHighlight}
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              viewBox="0 0 180 14"
              fill="none"
              className="absolute -bottom-1.5 right-0 w-full h-2.5 text-[#2563eb]/45 pointer-events-none"
            >
              <motion.path
                d="M4 9C48 2 132 2 176 9"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </motion.svg>
          </span>
        </h1>

        <p className="text-base text-[#434655] mb-4 leading-relaxed">
          {heroConfig.description}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-3 mb-5">
          <a
            href={`tel:${heroConfig.primaryButtonPhone || CLINIC_INFO.phone}`}
            className="flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white text-sm font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#004ac6]/25 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-fill material-symbols-outlined text-[20px] animate-dental-sparkle">
              calendar_month
            </span>
            <span>{heroConfig.primaryButtonText}: {heroConfig.primaryButtonPhone || CLINIC_INFO.phoneCompact}</span>
          </a>

          <a
            href={heroConfig.secondaryButtonLink || '#transformations'}
            onClick={(e) => handleScrollToSection(e, heroConfig.secondaryButtonLink || '#transformations')}
            className="flex items-center justify-center gap-2 bg-white text-[#004ac6] border border-[#004ac6]/30 hover:bg-[#dbe1ff]/20 text-sm font-bold py-3.5 px-6 rounded-full active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            <span>{heroConfig.secondaryButtonText}</span>
            <span className="material-symbols-outlined text-[16px] animate-eye-guide">
              south
            </span>
          </a>
        </div>

        {/* Quick Highlights / Stats (Doctors & Satisfaction) */}
        {(heroConfig.statsDoctors || heroConfig.statsSatisfaction) && (
          <div className="grid grid-cols-2 gap-2.5 my-3.5 text-right">
            {heroConfig.statsDoctors && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#c3c6d7]/40 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">diversity_1</span>
                </div>
                <div>
                  <span className="block text-sm font-extrabold text-[#191c1e] leading-tight">{heroConfig.statsDoctors}</span>
                  <span className="text-[10px] text-[#565e74] font-medium">کادر متخصصین</span>
                </div>
              </div>
            )}
            {heroConfig.statsSatisfaction && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#c3c6d7]/40 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                </div>
                <div>
                  <span className="block text-sm font-extrabold text-[#191c1e] leading-tight">{heroConfig.statsSatisfaction}</span>
                  <span className="text-[10px] text-[#565e74] font-medium">رضایت مراجعین</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hero Visual Frame with Doctor Trust Badge */}
        <div className="relative mt-2 rounded-2xl overflow-hidden shadow-lg border border-[#c3c6d7]/30 bg-white">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <img
              src={heroImageSrc}
              alt={siteImages.heroMainImage?.alt || 'مراجع خوشحال در کلینیک دندان‌پزشکی پارمیس پاکدشت'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e]/80 via-transparent to-transparent" />
          </div>

          {/* Floating Dental Sparkle Pill on Top-Left of Image */}
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-white/60 animate-dental-float">
            <span className="material-symbols-outlined text-[#004ac6] text-[15px] animate-dental-sparkle">
              dentistry
            </span>
            <span className="text-[10px] font-bold text-[#004ac6]">
              {heroConfig.statsDoctors ? `${heroConfig.statsDoctors} با‌تجربه` : 'طراحی لبخند دیجیتال'}
            </span>
          </div>

          {/* Floating Badge on Hero Image */}
          <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-white/60 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#004ac6]/10 flex items-center justify-center text-[#004ac6] shrink-0 animate-dental-pulse">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#191c1e]">
                  {CLINIC_INFO.doctorName}
                </p>
                <p className="text-[11px] text-[#434655]">پزشک معتمد و باسابقه در پاکدشت</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#004ac6] text-xs font-bold bg-[#004ac6]/10 px-2.5 py-1 rounded-full">
              <span>درمان بدون درد</span>
            </div>
          </div>
        </div>

        {/* Quick Trust Bullets (4 cols / 2x2 grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center">
          {trustFeatures.map((tf: { icon: string; title: string; subtitle: string }, i: number) => (
            <div key={i} className="dental-card-interactive p-2.5 rounded-xl bg-[#f2f4f6] border border-[#c3c6d7]/20 flex flex-col items-center">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px] mb-1">
                {tf.icon}
              </span>
              <span className="text-xs text-[#191c1e] font-bold">{tf.title}</span>
              <span className="text-[10px] text-[#434655]">{tf.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP HERO (>= md) ================= */}
      <div className="hidden md:block relative pt-8 pb-16 lg:py-20">
        {/* Ambient Decorative background shapes */}
        <div className="absolute top-10 right-[5%] w-96 h-96 bg-[#dbe1ff]/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-[10%] w-80 h-80 bg-[#dae2fd]/40 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text and Action Column (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col items-start text-right">
              {/* Category Chip Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dbe1ff]/60 text-[#004ac6] font-semibold text-xs mb-6 border border-[#dbe1ff]">
                <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse" />
                <span>{heroConfig.badge}</span>
                <span className="material-symbols-outlined text-[16px] text-[#004ac6] animate-dental-sparkle">
                  auto_awesome
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-[3.25rem] font-extrabold text-[#191c1e] tracking-tight mb-5 leading-[1.2]">
                {heroConfig.titlePart1} <br className="hidden sm:inline" />
                <span className="text-[#004ac6] underline decoration-[#dbe1ff] decoration-wavy decoration-2">
                  {heroConfig.titleHighlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-[1.125rem] text-[#565e74] mb-8 max-w-2xl leading-[1.7]">
                {heroConfig.description}
              </p>

              {/* CTA Cluster */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href={`tel:${heroConfig.primaryButtonPhone || CLINIC_INFO.phone}`}
                  className="inline-flex items-center justify-center gap-2.5 bg-[#2563eb] hover:bg-[#004ac6] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                >
                  <span className="material-symbols-fill material-symbols-outlined text-[20px]">
                    calendar_month
                  </span>
                  <span>{heroConfig.primaryButtonText}: {heroConfig.primaryButtonPhone || CLINIC_INFO.phoneCompact}</span>
                </a>

                <a
                  href={heroConfig.secondaryButtonLink || '#transformations'}
                  onClick={(e) => handleScrollToSection(e, heroConfig.secondaryButtonLink || '#transformations')}
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#004ac6]/20 hover:border-[#004ac6] text-[#004ac6] hover:bg-[#dbe1ff]/20 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-200 group"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
                    visibility
                  </span>
                  <span>{heroConfig.secondaryButtonText}</span>
                  <span className="material-symbols-outlined text-[18px] animate-eye-guide">
                    south
                  </span>
                </a>
              </div>

              {/* Highlight Stats Row (Desktop) */}
              {(heroConfig.statsDoctors || heroConfig.statsSatisfaction) && (
                <div className="flex flex-wrap items-center gap-6 mb-8 py-3.5 px-6 rounded-2xl bg-white/95 border border-[#c3c6d7]/40 shadow-xs backdrop-blur-xs">
                  {heroConfig.statsDoctors && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[22px]">diversity_1</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-black text-[#191c1e] leading-tight">
                          {heroConfig.statsDoctors}
                        </span>
                        <span className="text-xs text-[#565e74] font-medium">کادر دندان‌پزشکان متخصص</span>
                      </div>
                    </div>
                  )}

                  {heroConfig.statsDoctors && heroConfig.statsSatisfaction && (
                    <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                  )}

                  {heroConfig.statsSatisfaction && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[22px]">star</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-black text-[#191c1e] leading-tight">
                          {heroConfig.statsSatisfaction}
                        </span>
                        <span className="text-xs text-[#565e74] font-medium">رضایت مراجعین درمان</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mini Feature Trust Badges */}
              <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[#c3c6d7]/30 w-full">
                {trustFeatures.map((tf: { icon: string; title: string; subtitle: string }, i: number) => (
                  <div key={i} className="dental-card-interactive flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#dbe1ff]/50 flex items-center justify-center text-[#004ac6] shrink-0">
                      <span className="material-symbols-outlined text-[18px]">
                        {tf.icon}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#191c1e] block leading-tight">{tf.title}</span>
                      <span className="text-xs text-[#565e74] font-medium">{tf.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Organic Frame Visual (5 cols on desktop) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                {/* Subtle decorative dot grid */}
                <div className="absolute -top-6 -right-6 w-24 h-24 text-[#004ac6]/20 pointer-events-none hidden sm:block">
                  <svg fill="currentColor" height="100%" width="100%">
                    <pattern
                      height="16"
                      id="dot-pattern"
                      patternUnits="userSpaceOnUse"
                      width="16"
                      x="0"
                      y="0"
                    >
                      <circle cx="2" cy="2" r="2" />
                    </pattern>
                    <rect fill="url(#dot-pattern)" height="100%" width="100%" />
                  </svg>
                </div>

                {/* Floating Dental Hygiene Sparkle Pill (Top Left of Image) */}
                <div className="absolute -top-4 left-6 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-[#dbe1ff] flex items-center gap-2 animate-dental-float">
                  <span className="w-7 h-7 rounded-xl bg-[#dbe1ff]/60 text-[#004ac6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] animate-dental-sparkle">
                      dentistry
                    </span>
                  </span>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#004ac6] block leading-tight">
                      {heroConfig.statsDoctors ? `${heroConfig.statsDoctors} با‌تجربه` : 'طراحی لبخند دیجیتال'}
                    </span>
                    <span className="text-[10px] text-[#565e74]">تخصص زیبایی و ایمپلنت</span>
                  </div>
                </div>

                {/* Floating Satisfaction Sparkle Pill (Top Right of Image) */}
                {heroConfig.statsSatisfaction && (
                  <div className="absolute -top-4 -right-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-amber-200/80 flex items-center gap-2 animate-dental-float">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">
                        star
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="text-[11px] font-black text-[#191c1e] block leading-tight">
                        {heroConfig.statsSatisfaction}
                      </span>
                      <span className="text-[10px] text-[#565e74]">رضایت مراجعین</span>
                    </div>
                  </div>
                )}

                {/* Main Patient Image with organic smooth curve */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl border-4 border-white aspect-[4/5]">
                  <img
                    src={heroImageSrc}
                    alt={siteImages.heroMainImage?.alt || 'مراجع خوشحال در کلینیک دندان‌پزشکی پارمیس'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Trust Badge Card */}
                <div className="absolute -bottom-6 left-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#c3c6d7]/30 flex items-center gap-3 animate-dental-float">
                  <div className="w-12 h-12 rounded-xl bg-[#004ac6] text-white flex items-center justify-center animate-dental-pulse">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-bold text-[#191c1e]">
                      {CLINIC_INFO.doctorName}
                    </h4>
                    <p className="text-xs font-semibold text-[#565e74]">
                      پزشک معتمد و باسابقه در پاکدشت
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

