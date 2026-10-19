import React, { useMemo } from 'react';
import { useCMS } from '../context/CMSContext.tsx';
import { CLINIC_INFO } from '../data/clinicData.ts';
import { ComparisonSlider } from './ComparisonSlider.tsx';
import { ALL_INITIAL_CASES, ClinicalCase } from '../data/clinicalCases.ts';

interface SmileTransformationsProps {
  onOpenBooking: () => void;
  onNavigateGallery?: () => void;
}

export const SmileTransformations: React.FC<SmileTransformationsProps> = ({
  onOpenBooking,
  onNavigateGallery,
}) => {
  const { transformations, clinicInfo, homeSettings } = useCMS();
  const CLINIC_INFO = clinicInfo;

  const stConfig = homeSettings?.transformations || {
    enabled: true,
    badge: 'نتایج درمانی و تحول لبخند',
    title: 'نمونه درمان‌های انجام شده',
    subtitle: 'تغییرات واقعی لبخند مراجعین کلینیک دکتر شمس پور',
    showCount: 3,
    moreButtonText: 'مشاهده گالری کامل نمونه درمان‌ها و لبخند',
    moreButtonLink: 'gallery',
    selectedCaseIds: ['case-composite-diastema', 'case-laminate-emax', 'case-digital-implant'],
  };

  // Compile all available cases: initial clinical cases + any custom CMS transformations
  const allCasesPool = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      description: string;
      beforeImage: string;
      afterImage: string;
      beforeLabel: string;
      afterLabel: string;
      icon: string;
      categoryLabel: string;
      accentColor: string;
      duration?: string;
      caseNumber?: string;
    }> = [];

    // 1. Add all initial rich clinical cases
    ALL_INITIAL_CASES.forEach((c) => {
      list.push({
        id: c.id,
        title: c.title,
        subtitle: c.patientInfo || c.categoryLabel,
        description: c.description,
        beforeImage: c.beforeImage,
        afterImage: c.afterImage,
        beforeLabel: 'قبل از درمان',
        afterLabel: c.afterBadge || 'بعد از درمان',
        icon: c.icon || 'auto_fix_high',
        categoryLabel: c.categoryLabel || 'اصلاح طرح لبخند',
        accentColor: c.accentColor || '#004ac6',
        duration: c.duration,
        caseNumber: c.caseNumber,
      });
    });

    // 2. Add or override with CMS transformations
    (transformations || []).forEach((tItem: any) => {
      const existingIdx = list.findIndex((c) => c.id === tItem.id);
      const normalized = {
        id: tItem.id,
        title: tItem.title || tItem.mobileTitle || 'نمونه درمان لبخند',
        subtitle: tItem.subtitle || tItem.mobileSubtitle || tItem.badge || 'اصلاح طرح لبخند',
        description: tItem.description || '',
        beforeImage: tItem.beforeImage || tItem.image || '',
        afterImage: tItem.afterImage || tItem.mobileImage || tItem.image || '',
        beforeLabel: tItem.beforeLabel || 'قبل از درمان',
        afterLabel: tItem.afterLabel || tItem.afterBadge || 'بعد از درمان',
        icon: tItem.iconName || (tItem.id === 'bleaching' ? 'auto_awesome' : tItem.id === 'implant' ? 'dentistry' : 'brush'),
        categoryLabel: tItem.badge || 'اصلاح طرح لبخند',
        accentColor: tItem.accentColor || '#004ac6',
        duration: tItem.duration,
        caseNumber: tItem.caseNumber,
      };

      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...normalized };
      } else {
        list.push(normalized);
      }
    });

    return list;
  }, [transformations]);

  // Determine which cases should be displayed on the Home Page:
  // ONLY the cases whose IDs were explicitly selected in Admin Panel!
  // When a new case is added to the site/gallery, it will NOT appear here until selected.
  const displayedTransformations = useMemo(() => {
    const selectedIds =
      stConfig.selectedCaseIds && stConfig.selectedCaseIds.length > 0
        ? stConfig.selectedCaseIds
        : ['case-composite-diastema', 'case-laminate-emax', 'case-digital-implant'];

    const matched = selectedIds
      .map((id) => allCasesPool.find((c) => c.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const limit = stConfig.showCount ?? 6;
    return matched.slice(0, limit);
  }, [allCasesPool, stConfig.selectedCaseIds, stConfig.showCount]);

  if (stConfig.enabled === false) {
    return null;
  }

  return (
    <section className="bg-[#f2f4f6]/50" id="transformations">
      {/* ================= MOBILE SMILE TRANSFORMATIONS (< md) ================= */}
      <div className="md:hidden px-4 py-8">
        <div className="text-right mb-5">
          <div className="inline-flex items-center gap-1.5 text-[#004ac6] text-xs font-bold mb-1.5">
            <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
            <span>{stConfig.badge || 'نتایج درمانی و تحول لبخند'}</span>
          </div>
          <h2 className="text-xl text-[#191c1e] font-bold leading-tight">
            {stConfig.title || 'نمونه درمان‌های انجام شده'}
          </h2>
          {stConfig.subtitle && (
            <p className="text-xs text-[#565e74] mt-1.5 leading-relaxed">
              {stConfig.subtitle}
            </p>
          )}
        </div>

        {/* Before/After Cards Grid for Mobile with Touch Slider */}
        <div className="space-y-4">
          {displayedTransformations.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3.5 rounded-2xl border border-[#c3c6d7]/30 shadow-xs text-right space-y-3"
            >
              {/* Category & Case Number */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${item.accentColor}15`,
                    color: item.accentColor,
                  }}
                >
                  <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                  <span>{item.categoryLabel}</span>
                </span>
                {item.caseNumber && (
                  <span className="text-[11px] text-slate-400 font-mono font-medium">{item.caseNumber}</span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-sm font-bold text-[#191c1e] leading-snug">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-[11px] text-[#565e74] mt-0.5">{item.subtitle}</p>
                )}
              </div>

              {/* Interactive Before/After Comparison Slider */}
              <div className="overflow-hidden rounded-xl">
                <ComparisonSlider
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  alt={item.title}
                  beforeLabel={item.beforeLabel || 'قبل از درمان'}
                  afterLabel={item.afterLabel || 'بعد از درمان'}
                  heightClass="h-52"
                  accentColor={item.accentColor}
                />
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-[#565e74] leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Footer Booking CTA */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {item.duration ? (
                  <span className="text-[11px] text-slate-400">{item.duration}</span>
                ) : (
                  <span className="text-[11px] text-[#004ac6] font-medium">مشاوره حضوری در پاکدشت</span>
                )}
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="px-3.5 py-1.5 rounded-full bg-[#004ac6]/10 text-[#004ac6] hover:bg-[#004ac6] hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  رزرو نوبت معاینه
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          {onNavigateGallery ? (
            <button
              type="button"
              onClick={onNavigateGallery}
              className="inline-flex items-center gap-1.5 text-[#004ac6] text-xs font-bold hover:underline cursor-pointer"
            >
              <span>{stConfig.moreButtonText || 'مشاهده گالری کامل نمونه درمان‌ها و لبخند'}</span>
              <span className="material-symbols-outlined text-sm rotate-180">arrow_back</span>
            </button>
          ) : (
            <a
              href={`tel:${CLINIC_INFO.phone}`}
              className="inline-flex items-center gap-1.5 text-[#004ac6] text-xs font-bold hover:underline"
            >
              <span>دریافت نوبت معاینه و ویزیت لبخند</span>
              <span className="material-symbols-outlined text-sm">arrow_left</span>
            </a>
          )}
        </div>
      </div>

      {/* ================= DESKTOP SMILE TRANSFORMATIONS (>= md) ================= */}
      <div className="hidden md:block py-16">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-right">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold mb-3">
                <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                <span>{stConfig.badge || 'نتایج درمانی و تحول لبخند'}</span>
              </div>
              <h2 className="text-[2.25rem] font-bold text-[#191c1e] leading-[1.25]">
                {stConfig.title || 'نمونه درمان‌های انجام شده'}
              </h2>
              <p className="text-base text-[#565e74] mt-2 max-w-2xl">
                {stConfig.subtitle || 'تغییرات واقعی لبخند مراجعین کلینیک دکتر انوشیروان شمس پور'}
              </p>
            </div>

            {onNavigateGallery ? (
              <button
                type="button"
                onClick={onNavigateGallery}
                className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#004ac6] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#003ea8] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>{stConfig.moreButtonText || 'مشاهده گالری کامل نمونه درمان‌ها'}</span>
                <span className="material-symbols-outlined text-[18px] rotate-180">arrow_back</span>
              </button>
            ) : (
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="mt-4 md:mt-0 inline-flex items-center gap-2 border border-[#004ac6] text-[#004ac6] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#dbe1ff]/20 transition-colors"
              >
                <span>دریافت نوبت معاینه و ویزیت لبخند</span>
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTransformations.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-3xl p-5 shadow-xs border border-[#c3c6d7]/40 hover:shadow-md transition-all flex flex-col justify-between text-right group"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${item.accentColor}15`,
                        color: item.accentColor,
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                      <span>{item.categoryLabel}</span>
                    </span>
                    {item.caseNumber && (
                      <span className="text-xs text-slate-400 font-mono font-medium">{item.caseNumber}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#191c1e] mb-1.5 leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-[#565e74] mb-3 line-clamp-1">{item.subtitle}</p>
                  )}

                  {/* Interactive Before/After Slider */}
                  <div className="mb-3.5">
                    <ComparisonSlider
                      beforeImage={item.beforeImage}
                      afterImage={item.afterImage}
                      alt={item.title}
                      beforeLabel={item.beforeLabel || 'قبل از درمان'}
                      afterLabel={item.afterLabel || 'بعد از درمان'}
                      heightClass="h-52 sm:h-56"
                      accentColor={item.accentColor}
                    />
                  </div>

                  {item.description && (
                    <p className="text-xs text-[#565e74] leading-relaxed mb-3 line-clamp-2 text-justify">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer specs & Actions */}
                <div className="pt-3 border-t border-[#c3c6d7]/30 flex items-center justify-between text-xs text-[#565e74]">
                  <span>{item.duration || 'درمان در کلینیک پارمیس'}</span>
                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="text-[#004ac6] hover:text-[#003ea8] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>درخواست این درمان</span>
                    <span className="material-symbols-outlined text-sm rotate-180">arrow_back</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
