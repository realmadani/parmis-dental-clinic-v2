import React from 'react';
import { CLINIC_INFO } from '../data/clinicData.ts';
import { useCMS, defaultAboutPageSettings } from '../context/CMSContext.tsx';

interface AboutPageProps {
  onOpenBooking: (serviceId?: string) => void;
  onNavigateServices: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onOpenBooking,
  onNavigateServices,
}) => {
  const { siteImages, clinicInfo, aboutPageSettings: cmsSettings } = useCMS();
  const s = cmsSettings || defaultAboutPageSettings;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e]">
      {/* ================= MOBILE ABOUT DOCTOR PAGE (< md) ================= */}
      <div className="md:hidden pt-5 pb-12 max-w-lg mx-auto px-4 space-y-7 text-right">
        {/* 1. DOCTOR HERO SECTION */}
        {s.hero?.enabled !== false && (
          <section
            className="bg-white rounded-[2rem] p-5 shadow-xs border border-[#c3c6d7]/20 relative overflow-hidden"
            id="about-mobile"
          >
            {/* Decorative Backdrop glow */}
            <div className="absolute -top-12 -left-12 w-44 h-44 bg-[#dae2fd]/40 rounded-full blur-2xl pointer-events-none" />

            {/* Eyebrow Chip */}
            {s.hero.eyebrowChip && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004ac6]/10 text-[#004ac6] text-xs font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
                <span>{s.hero.eyebrowChip}</span>
              </div>
            )}

            {/* Doctor Portrait Container */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md mb-4 bg-[#eceef0]">
              <img
                alt={siteImages.doctorProfileImage?.alt || `${s.hero.doctorName} - کلینیک دندانپزشکی پارمیس پاکدشت`}
                className="w-full h-full object-cover object-top"
                src={s.hero.doctorImage || siteImages.doctorProfileImage?.url || clinicInfo.doctorImage}
              />
              {s.hero.verifiedBadgeText && (
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs border border-white/60 flex items-center gap-1.5">
                  <span className="material-symbols-fill material-symbols-outlined text-[#004ac6] text-base">
                    verified
                  </span>
                  <span className="text-[12px] font-bold text-[#191c1e]">
                    {s.hero.verifiedBadgeText}
                  </span>
                </div>
              )}
            </div>

            {/* Headline & Introduction */}
            <h1 className="text-[1.75rem] leading-[1.3] font-bold text-[#191c1e] mb-2 tracking-tight">
              {s.hero.doctorName}
            </h1>
            {s.hero.titleHighlight && (
              <p className="text-sm font-bold text-[#004ac6] mb-3">
                {s.hero.titleHighlight}
              </p>
            )}
            {s.hero.description && (
              <p className="text-sm text-[#565e74] leading-relaxed mb-5 text-justify">
                {s.hero.description}
              </p>
            )}

            {/* Trust Metrics Badges (Grid 2x2) */}
            {s.hero.metrics && s.hero.metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {s.hero.metrics.map((m, idx) => (
                  <div key={m.id || idx} className="bg-[#f2f4f6] rounded-2xl p-3 text-center border border-[#c3c6d7]/30">
                    <div className="text-[#004ac6] font-bold text-xl leading-[1.4]">{m.value}</div>
                    <div className="text-[12px] text-[#565e74] font-medium mt-0.5">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Dual CTA */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${s.hero.primaryButtonPhone || clinicInfo.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#004ac6] text-white py-3 px-4 rounded-full text-xs font-bold shadow-md hover:bg-[#003ea8] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                <span>{s.hero.primaryButtonText} {clinicInfo.phoneCompact}</span>
              </a>
              {s.hero.secondaryButtonLink && (
                <a
                  href={s.hero.secondaryButtonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-[#dae2fd] text-[#131b2e] py-3 px-4 rounded-full text-xs font-bold border border-[#c3c6d7]/40 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  <span>{s.hero.secondaryButtonText}</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* 1.5. 5 PILLARS QUICK STRIP (MOBILE HORIZONTAL SCROLL) */}
        {s.pillars?.enabled !== false && s.pillars.items && s.pillars.items.length > 0 && (
          <section className="bg-white rounded-2xl p-4 border border-[#c3c6d7]/20 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#004ac6] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{s.pillars.badge}</span>
              </span>
              <span className="text-[11px] text-[#565e74]">{s.pillars.badgeSubtitle}</span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              {s.pillars.items.map((item, idx) => (
                <div key={item.id || idx} className="min-w-[170px] bg-[#f2f4f6] p-3 rounded-xl border border-[#c3c6d7]/20 flex flex-col items-center text-center shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[#dae2fd]/60 text-[#004ac6] flex items-center justify-center mb-1.5">
                    <span className="material-symbols-outlined text-[22px]">{item.icon || 'verified'}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#191c1e]">{item.title}</h4>
                  <p className="text-[10px] text-[#565e74] mt-0.5">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. CLINICAL PHILOSOPHY (Bento / High-Tactile Cards) */}
        {s.philosophy?.enabled !== false && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#191c1e]">{s.philosophy.title}</h2>
              {s.philosophy.badge && (
                <span className="text-xs text-[#004ac6] font-bold">{s.philosophy.badge}</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {s.philosophy.cards?.map((card, idx) => (
                <div key={card.id || idx} className="bg-white p-4 rounded-2xl border border-[#c3c6d7]/20 shadow-xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">{card.icon || 'verified'}</span>
                  </div>
                  <div>
                    <h3 className="text-sm text-[#191c1e] font-bold mb-1">{card.title}</h3>
                    <p className="text-sm text-[#565e74] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. STERILIZATION & ADVANCED TECHNOLOGY STANDARDS */}
        {s.sterilization?.enabled !== false && (
          <section className="bg-white rounded-[2rem] p-5 border border-[#c3c6d7]/20 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#004ac6] text-2xl">verified_user</span>
              <h2 className="text-xl font-bold text-[#191c1e]">{s.sterilization.title}</h2>
            </div>
            {s.sterilization.description && (
              <p className="text-sm text-[#565e74] mb-4 leading-relaxed">
                {s.sterilization.description}
              </p>
            )}

            <div className="space-y-3">
              {s.sterilization.items?.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start gap-3 bg-[#f2f4f6] p-3 rounded-2xl">
                  <span className="material-symbols-outlined text-[#004ac6] mt-0.5">{item.icon || 'sanitizer'}</span>
                  <div>
                    <h4 className="text-sm text-[#191c1e] font-bold">{item.title}</h4>
                    <p className="text-sm text-[#565e74] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. CLINIC ENVIRONMENT & CSR GALLERY (Mobile Carousel/Snap) */}
        {s.gallery?.enabled !== false && s.gallery.slides && s.gallery.slides.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#191c1e]">{s.gallery.title}</h2>
                {s.gallery.badgeSubtitle && (
                  <p className="text-[12px] text-[#565e74]">{s.gallery.badgeSubtitle}</p>
                )}
              </div>
              <div className="flex gap-1 text-[#004ac6] items-center">
                <span className="material-symbols-outlined text-sm">swipe_left</span>
                <span className="text-[11px] font-bold">ورق بزنید</span>
              </div>
            </div>

            {/* Horizontal Scrollable Gallery Container */}
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x-mandatory no-scrollbar -mx-4 px-4">
              {s.gallery.slides.map((slide, idx) => (
                <div key={slide.id || idx} className="min-w-[82%] sm:min-w-[70%] snap-center-child bg-white rounded-[2rem] overflow-hidden border border-[#c3c6d7]/20 shadow-xs flex flex-col">
                  <div className="h-44 w-full bg-[#eceef0] relative">
                    <img
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      src={slide.image}
                    />
                    {slide.tag && (
                      <span className="absolute top-2 right-2 bg-white/90 text-[#191c1e] text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {slide.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm text-[#191c1e] font-bold">{slide.title}</h3>
                    <p className="text-[#565e74] text-[12px] mt-1 leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. SERVICES SUMMARY (Under Dr. Shamspoor's Direct Supervision) */}
        {s.services?.enabled !== false && s.services.items && s.services.items.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#191c1e]">{s.services.title}</h2>
              {s.services.badge && (
                <span className="text-xs font-semibold text-[#565e74]">{s.services.badge}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {s.services.items.map((srv, idx) => (
                <div
                  key={srv.id || idx}
                  onClick={onNavigateServices}
                  className="bg-white p-3.5 rounded-2xl border border-[#c3c6d7]/20 shadow-xs flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div>
                    <div className="w-9 h-9 rounded-full bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-xl">{srv.icon || 'dentistry'}</span>
                    </div>
                    <h3 className="text-sm text-[#191c1e] font-bold">{srv.title}</h3>
                    <p className="text-[12px] text-[#565e74] mt-1 leading-normal">
                      {srv.description}
                    </p>
                  </div>
                  <div className="mt-2 text-[#004ac6] font-bold text-[11px] flex items-center gap-0.5">
                    <span>{srv.linkText || 'اطلاعات بیشتر'}</span>
                    <span className="material-symbols-outlined text-xs">arrow_back</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. APPOINTMENT RESERVATION ACCORDION CALLOUT */}
        {s.cta?.enabled !== false && (
          <section
            className="bg-gradient-to-br from-[#2563eb] to-[#004ac6] text-white rounded-[2rem] p-5 shadow-lg relative overflow-hidden"
            id="appointment-mobile"
          >
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-xl font-bold mb-2">{s.cta.title}</h3>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">
              {s.cta.description}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`tel:${s.cta.phone || clinicInfo.phone2}`}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#004ac6] py-3 rounded-full text-sm font-bold shadow-md active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">call</span>
                <span>{s.cta.buttonText} {s.cta.phoneDisplay || clinicInfo.phoneDisplay2}</span>
              </a>
            </div>
          </section>
        )}
      </div>

      {/* ================= DESKTOP ABOUT DOCTOR PAGE (>= md) ================= */}
      <div className="hidden md:block text-right">
        {/* ==================== HERO SECTION ==================== */}
        {s.hero?.enabled !== false && (
          <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-white via-[#f7f9fb] to-[#f7f9fb]">
            {/* Subtle Dot Matrix Decorative Vector */}
            <div className="absolute top-12 right-10 w-48 h-48 dot-pattern rounded-full pointer-events-none" />
            <div className="absolute bottom-8 left-16 w-64 h-64 dot-pattern rounded-full pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Right Column: Medical Hero Narrative */}
                <div className="lg:col-span-7 flex flex-col items-start gap-5">
                  {/* Eyebrow Pill Badge */}
                  {s.hero.eyebrowChip && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dae2fd]/60 text-[#004ac6] font-semibold text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse" />
                      <span>{s.hero.eyebrowChip}</span>
                    </div>
                  )}

                  {/* Main Hero Headline */}
                  <h1 className="text-[2.25rem] lg:text-[3.5rem] text-[#191c1e] leading-[1.15] font-extrabold">
                    {s.hero.doctorName}
                    {s.hero.titleHighlight && (
                      <span className="block text-[#004ac6] mt-1 text-[2.25rem] leading-[1.25] font-bold">
                        {s.hero.titleHighlight}
                      </span>
                    )}
                  </h1>

                  {/* Value Description */}
                  {s.hero.description && (
                    <p className="text-[1.125rem] text-[#565e74] leading-[1.7] max-w-2xl">
                      {s.hero.description}
                    </p>
                  )}

                  {/* Quick Stats Matrix Pills */}
                  {s.hero.metrics && s.hero.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full py-2">
                      {s.hero.metrics.map((m, idx) => (
                        <div key={m.id || idx} className="bg-white p-3.5 rounded-2xl shadow-xs border border-[#c3c6d7]/30 flex flex-col items-center text-center">
                          <span className="text-xl font-bold text-[#004ac6]">{m.value}</span>
                          <span className="text-xs font-semibold text-[#565e74]">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conversion Pathways CTAs */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                    <a
                      href={`tel:${s.hero.primaryButtonPhone || clinicInfo.phone}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#2563eb] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-[#004ac6]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-fill material-symbols-outlined">
                        calendar_month
                      </span>
                      <span>{s.hero.primaryButtonText} {clinicInfo.phoneCompact}</span>
                    </a>
                    {s.hero.secondaryButtonLink && (
                      <a
                        href={s.hero.secondaryButtonLink}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-[#004ac6]/30 text-[#004ac6] font-bold text-sm px-6 py-3.5 rounded-full hover:bg-[#004ac6]/5 transition-all"
                      >
                        <span>{s.hero.secondaryButtonText}</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      </a>
                    )}
                  </div>

                  {/* Trust Sub-badge */}
                  {(s.hero.licenseText || (clinicInfo as any).medicalCouncilCode) && (
                    <div className="flex items-center gap-3 pt-2 text-[#565e74] text-sm">
                      <span className="flex items-center text-[#004ac6]">
                        <span className="material-symbols-fill material-symbols-outlined text-[20px]">
                          verified
                        </span>
                      </span>
                      <span>{s.hero.licenseText || `شماره پروانه طبابت / نظام پزشکی: ${(clinicInfo as any).medicalCouncilCode}`}</span>
                    </div>
                  )}
                </div>

                {/* Left Column: Organic Doctor & Clinic Visual Card */}
                <div className="lg:col-span-5 relative flex justify-center">
                  {/* Background Organic Aura */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#004ac6]/10 to-[#dae2fd]/50 rounded-3xl filter blur-2xl -z-10" />
                  <div className="relative w-full max-w-md bg-white rounded-3xl p-3 shadow-xl border border-[#c3c6d7]/20">
                    {/* Doctor Main Image */}
                    <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-[#f2f4f6]">
                      <img
                        alt={siteImages.doctorProfileImage?.alt || s.hero.doctorName}
                        className="w-full h-full object-cover"
                        src={s.hero.doctorImage || siteImages.doctorProfileImage?.url || clinicInfo.doctorImage}
                      />
                      {/* Subtle bottom gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e]/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                        <span className="text-xl font-bold">{s.hero.doctorName}</span>
                        <span className="text-sm text-[#eeefff] opacity-90">
                          {s.hero.verifiedBadgeText || 'موسس و سرپرست درمان مطب پارمیس پاکدشت'}
                        </span>
                      </div>
                    </div>

                    {/* Floating Trust Pill: Top Left */}
                    {s.hero.floatingPill1Title && (
                      <div className="absolute -top-4 -left-4 bg-white text-[#191c1e] px-4 py-2.5 rounded-2xl shadow-lg border border-[#c3c6d7]/20 flex items-center gap-3 animate-dental-float">
                        <div className="w-9 h-9 rounded-xl bg-[#004ac6]/10 flex items-center justify-center text-[#004ac6]">
                          <span className="material-symbols-fill material-symbols-outlined">
                            {s.hero.floatingPill1Icon || 'shield_person'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#191c1e]">
                            {s.hero.floatingPill1Title}
                          </div>
                          <div className="text-[11px] text-[#565e74]">
                            {s.hero.floatingPill1Subtitle}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Floating Trust Pill: Bottom Right */}
                    {s.hero.floatingPill2Title && (
                      <div className="absolute -bottom-4 -right-4 bg-white text-[#191c1e] px-4 py-2.5 rounded-2xl shadow-lg border border-[#c3c6d7]/20 flex items-center gap-3 animate-dental-float">
                        <div className="w-9 h-9 rounded-xl bg-[#00569c]/10 flex items-center justify-center text-[#00569c] animate-dental-pulse">
                          <span className="material-symbols-fill material-symbols-outlined">
                            {s.hero.floatingPill2Icon || 'health_and_safety'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#191c1e]">
                            {s.hero.floatingPill2Title}
                          </div>
                          <div className="text-[11px] text-[#565e74]">
                            {s.hero.floatingPill2Subtitle}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== 5 PILLARS QUICK STRIP ==================== */}
        {s.pillars?.enabled !== false && s.pillars.items && s.pillars.items.length > 0 && (
          <section className="py-10 bg-white border-y border-[#c3c6d7]/20">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {s.pillars.items.map((pillar, idx) => (
                  <div key={pillar.id || idx} className="flex flex-col items-center text-center gap-2 group">
                    <div className="w-14 h-14 rounded-2xl bg-[#dae2fd]/50 text-[#004ac6] flex items-center justify-center group-hover:bg-[#004ac6] group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[28px]">{pillar.icon || 'verified'}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#191c1e]">{pillar.title}</h4>
                    <p className="text-sm text-[#565e74]">{pillar.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== BIOGRAPHY & PHILOSOPHY ==================== */}
        {s.philosophy?.enabled !== false && (
          <section className="py-16 lg:py-24 bg-[#f7f9fb]" id="philosophy">
            <div className="w-full max-w-7xl mx-auto px-6">
              {/* Section Header */}
              <div className="text-center max-w-3xl mx-auto mb-16">
                {s.philosophy.badge && (
                  <span className="text-xs font-bold text-[#004ac6] bg-[#004ac6]/10 px-4 py-1.5 rounded-full inline-block mb-3">
                    {s.philosophy.badge}
                  </span>
                )}
                <h2 className="text-[2.25rem] leading-[1.25] text-[#191c1e] font-extrabold mb-4">
                  {s.philosophy.title}
                </h2>
                {s.philosophy.subtitle && (
                  <p className="text-base text-[#565e74]">
                    {s.philosophy.subtitle}
                  </p>
                )}
              </div>

              {/* Bento-style Layout for Story & Principles */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Story / Background Box (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-8 lg:p-10 shadow-xs border border-[#c3c6d7]/30 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#004ac6] text-[32px]">
                        auto_stories
                      </span>
                      <h3 className="text-2xl font-bold text-[#191c1e]">{s.philosophy.bioTitle}</h3>
                    </div>

                    <p className="text-base text-[#434655] leading-relaxed">
                      {s.philosophy.bioText1}
                    </p>

                    <p className="text-base text-[#434655] leading-relaxed">
                      {s.philosophy.bioText2}
                    </p>

                    {/* Key Checkmarks */}
                    {s.philosophy.checklist && s.philosophy.checklist.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {s.philosophy.checklist.map((c, idx) => (
                          <div key={c.id || idx} className="flex items-start gap-3">
                            <span className="material-symbols-fill material-symbols-outlined text-[#004ac6] text-[20px] mt-0.5">
                              check_circle
                            </span>
                            <span className="text-sm text-[#191c1e]">
                              {c.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#c3c6d7]/20 flex items-center justify-between">
                    <div className="text-sm text-[#565e74]">
                      {s.philosophy.clinicLocationTag}
                    </div>
                    {(s.philosophy.licenseLinkText || (clinicInfo as any).medicalCouncilCode) && (
                      <div className="text-[#004ac6] font-bold text-sm flex items-center gap-1.5 bg-[#004ac6]/5 px-3 py-1.5 rounded-full border border-[#004ac6]/15">
                        <span>{s.philosophy.licenseLinkText || `شماره پروانه طبابت: ${(clinicInfo as any).medicalCouncilCode}`}</span>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Clinical Pillars (5 cols) */}
                {s.philosophy.cards && s.philosophy.cards.length > 0 && (
                  <div className="lg:col-span-5 flex flex-col gap-5">
                    {s.philosophy.cards.map((card, idx) => (
                      <div key={card.id || idx} className="bg-white rounded-3xl p-6 shadow-xs border border-[#c3c6d7]/30 flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[26px]">{card.icon || 'verified'}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-[#191c1e] mb-1">
                            {card.title}
                          </h4>
                          <p className="text-sm text-[#565e74] leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ==================== CLINIC ENVIRONMENT & INFECTION CONTROL ==================== */}
        {s.sterilization?.enabled !== false && (
          <section className="py-16 lg:py-24 bg-white">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Visual Side (5 cols) */}
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <div className="relative">
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-[#c3c6d7]/30 bg-[#f2f4f6] aspect-[4/3]">
                      <img
                        alt={siteImages.sterilizationImage?.alt || 'اتاق درمان و استریلیزاسیون کلینیک پارمیس پاکدشت'}
                        className="w-full h-full object-cover"
                        src={s.sterilization.mainImage || siteImages.sterilizationImage?.url || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80'}
                      />
                    </div>
                    {/* Mini Overlay Card */}
                    {s.sterilization.overlayBadgeTitle && (
                      <div className="absolute -bottom-6 -left-4 sm:left-6 bg-white p-4 rounded-2xl shadow-xl border border-[#c3c6d7]/30 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center">
                            <span className="material-symbols-fill material-symbols-outlined">
                              {s.sterilization.overlayBadgeIcon || 'sanitizer'}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#191c1e]">
                              {s.sterilization.overlayBadgeTitle}
                            </div>
                            <div className="text-[11px] text-[#565e74]">
                              {s.sterilization.overlayBadgeSubtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Content Side (7 cols) */}
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                  {s.sterilization.badge && (
                    <span className="text-xs font-bold text-[#004ac6] bg-[#004ac6]/10 px-4 py-1.5 rounded-full inline-block">
                      {s.sterilization.badge}
                    </span>
                  )}
                  <h2 className="text-[2.25rem] leading-[1.25] font-extrabold text-[#191c1e]">
                    {s.sterilization.title}
                  </h2>
                  {s.sterilization.description && (
                    <p className="text-base text-[#565e74] leading-relaxed">
                      {s.sterilization.description}
                    </p>
                  )}

                  {s.sterilization.items && s.sterilization.items.length > 0 && (
                    <div className="space-y-4 pt-2">
                      {s.sterilization.items.map((item, idx) => (
                        <div key={item.id || idx} className="p-4 rounded-2xl bg-[#f7f9fb] border border-[#c3c6d7]/20 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">{item.icon || 'cleaning_services'}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#191c1e]">
                              {item.title}
                            </h4>
                            <p className="text-sm text-[#565e74] mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== CLINICAL SERVICES AT A GLANCE ==================== */}
        {s.services?.enabled !== false && s.services.items && s.services.items.length > 0 && (
          <section className="py-16 lg:py-24 bg-[#f7f9fb]">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                  {s.services.badge && (
                    <span className="text-xs font-bold text-[#004ac6] bg-[#004ac6]/10 px-4 py-1.5 rounded-full inline-block mb-3">
                      {s.services.badge}
                    </span>
                  )}
                  <h2 className="text-[2.25rem] leading-[1.25] font-extrabold text-[#191c1e]">
                    {s.services.title}
                  </h2>
                </div>
                {s.services.description && (
                  <p className="text-base text-[#565e74] max-w-md mt-4 md:mt-0">
                    {s.services.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {s.services.items.map((srv, idx) => (
                  <div
                    key={srv.id || idx}
                    onClick={onNavigateServices}
                    className="bg-white rounded-3xl p-6 shadow-xs border border-[#c3c6d7]/30 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[28px]">{srv.icon || 'dentistry'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#191c1e] mb-2">
                        {srv.title}
                      </h3>
                      <p className="text-sm text-[#565e74] mb-4 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#004ac6] flex items-center gap-1">
                      <span>{srv.linkText || 'جزئیات درمان'}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== CLINIC ATMOSPHERE GALLERY ==================== */}
        {s.gallery?.enabled !== false && s.gallery.slides && s.gallery.slides.length > 0 && (
          <section className="py-16 lg:py-24 bg-white">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-14">
                {s.gallery.badge && (
                  <span className="text-xs font-bold text-[#004ac6] bg-[#004ac6]/10 px-4 py-1.5 rounded-full inline-block mb-3">
                    {s.gallery.badge}
                  </span>
                )}
                <h2 className="text-[2.25rem] leading-[1.25] font-extrabold text-[#191c1e] mb-3">
                  {s.gallery.title}
                </h2>
                {s.gallery.description && (
                  <p className="text-base text-[#565e74]">
                    {s.gallery.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {s.gallery.slides.map((slide, idx) => (
                  <div key={slide.id || idx} className="rounded-3xl overflow-hidden shadow-xs border border-[#c3c6d7]/30 group relative aspect-[4/3] bg-[#f2f4f6]">
                    <img
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={slide.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e]/80 via-transparent to-transparent flex items-end p-6">
                      <span className="text-sm text-white font-bold">{slide.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== FINAL HIGH-IMPACT CTA STRIP ==================== */}
        {s.cta?.enabled !== false && (
          <section className="py-12 bg-[#f7f9fb]">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
                {/* Background Vector Shape */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />

                <div className="space-y-3 text-center lg:text-right relative z-10">
                  {s.cta.badge && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
                      <span className="material-symbols-outlined text-[18px]">{s.cta.badgeIcon || 'favorite'}</span>
                      <span>{s.cta.badge}</span>
                    </div>
                  )}
                  <h3 className="text-2xl lg:text-[2.25rem] leading-[1.25] font-extrabold text-white">
                    {s.cta.title}
                  </h3>
                  {s.cta.description && (
                    <p className="text-base text-[#eeefff] max-w-xl">
                      {s.cta.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 relative z-10 w-full sm:w-auto flex items-center">
                  <a
                    href={`tel:${s.cta.phone || clinicInfo.phone2}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#004ac6] text-xl font-bold px-8 py-4 rounded-full shadow-lg hover:scale-[1.03] transition-all"
                  >
                    <span className="material-symbols-fill material-symbols-outlined text-[#004ac6] text-[24px]">
                      call
                    </span>
                    <span>{s.cta.buttonText} {s.cta.phoneDisplay || clinicInfo.phoneDisplay2}</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
