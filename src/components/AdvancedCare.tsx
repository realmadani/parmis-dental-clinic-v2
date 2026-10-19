import React from 'react';
import { CLINIC_INFO } from '../data/clinicData.ts';
import { useCMS } from '../context/CMSContext.tsx';

interface AdvancedCareProps {
  onOpenBooking: () => void;
}

export const AdvancedCare: React.FC<AdvancedCareProps> = () => {
  const { homeSettings, siteImages, clinicInfo } = useCMS();
  const CLINIC_INFO = clinicInfo;
  const acConfig = homeSettings?.advancedCare || {
    badge: 'تجهیزات و فناوری نوین',
    title: 'دندان‌پزشکی دیجیتال و مدرن در کلینیک پارمیس',
    description: 'ما در پاکدشت بالاترین سطوح بهداشتی و نوآوری تجهیزاتی را برای بیماران عزیز به کار گرفته‌ایم تا دوره نقاهت به حداقل رسیده و دوام درمان به حداکثر برسد.',
    imageUrl: siteImages.clinicEquipmentImage?.url || CLINIC_INFO.operatoryImage,
    imageBadge: 'تصویر واقعی مطب',
    checklist: [
      'رادیوگرافی دیجیتال با کمترین میزان تابش اشعه',
      'استفاده اختصاصی از مواد ترمیمی و کامپوزیت‌های برند سوئیسی و آلمانی',
      'چرخه ضدعفونی مکانیزه و اتوکلاو بیمارستانی کلاس B',
    ],
    buttonText: 'مشاوره و ارزیابی تشخیصی دندان‌ها',
    buttonPhone: CLINIC_INFO.phone,
  };

  const imageSrc = acConfig.imageUrl || siteImages.clinicEquipmentImage?.url || CLINIC_INFO.operatoryImage;
  const checklistItems = acConfig.checklist && acConfig.checklist.length > 0 ? acConfig.checklist : [
    'رادیوگرافی دیجیتال با کمترین میزان تابش اشعه',
    'استفاده اختصاصی از مواد ترمیمی و کامپوزیت‌های برند سوئیسی و آلمانی',
    'چرخه ضدعفونی مکانیزه و اتوکلاو بیمارستانی کلاس B',
  ];

  return (
    <section id="standards">
      {/* ================= MOBILE ADVANCED CARE (< md) ================= */}
      <div className="md:hidden px-4 py-6 text-right">
        <div className="bg-white rounded-2xl p-4 border border-[#c3c6d7]/30 shadow-xs">
          <div className="flex items-center gap-2 text-[#004ac6] mb-2">
            <span className="material-symbols-outlined text-[20px]">{acConfig.icon || 'biotech'}</span>
            <span className="text-xs font-bold">{acConfig.badge}</span>
          </div>

          <h2 className="text-xl font-bold text-[#191c1e] mb-2 leading-snug">
            {acConfig.title}
          </h2>

          <p className="text-sm text-[#434655] mb-4 leading-relaxed">
            {acConfig.description}
          </p>

          {/* Tech image */}
          <div className="relative rounded-xl overflow-hidden mb-4 border border-[#c3c6d7]/20 aspect-[16/10]">
            <img
              src={imageSrc}
              alt={siteImages.clinicEquipmentImage?.alt || 'اتاق درمان کلینیک دندان‌پزشکی پارمیس پاکدشت'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-2.5 right-2.5 bg-[#004ac6] text-white text-[11px] px-3 py-1.5 rounded-xl font-medium flex items-center gap-2 shadow-md">
              <span className="material-symbols-outlined text-[16px]">{acConfig.imageBadgeIcon || acConfig.icon || 'biotech'}</span>
              <div className="text-right">
                <span className="font-bold block leading-tight">{acConfig.imageBadge}</span>
                <span className="text-[9px] opacity-85">پاکدشت، مجتمع راستین</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2.5">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#dae2fd] text-[#004ac6] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] font-bold">{acConfig.checkIcon || 'check'}</span>
                </div>
                <p className="text-sm text-[#191c1e]">{item}</p>
              </div>
            ))}
          </div>

          <a
            href={`tel:${acConfig.buttonPhone || CLINIC_INFO.phone}`}
            className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#004ac6]/10 text-[#004ac6] text-xs font-bold hover:bg-[#004ac6]/20 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-sm">{acConfig.buttonIcon || 'call'}</span>
            <span>{acConfig.buttonText}</span>
          </a>
        </div>
      </div>

      {/* ================= DESKTOP ADVANCED CARE (>= md) ================= */}
      <div className="hidden md:block py-16 lg:py-24">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Clinic Room Visual with Floating Tag */}
            <div className="lg:col-span-6 relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src={imageSrc}
                  alt={siteImages.clinicEquipmentImage?.alt || 'اتاق درمان مجهز کلینیک دندان‌پزشکی پارمیس'}
                  className="w-full h-[400px] object-cover"
                  loading="lazy"
                />
                {/* Floating Clinic Badge Overlay */}
                <div className="absolute bottom-4 right-4 bg-[#004ac6] text-white px-4 py-3 rounded-2xl shadow-md flex items-center gap-3">
                  <span className="material-symbols-outlined text-[28px]">{acConfig.imageBadgeIcon || acConfig.icon || 'biotech'}</span>
                  <div className="text-right">
                    <p className="text-xs font-bold">{acConfig.imageBadge}</p>
                    <p className="text-xs opacity-80">پاکدشت، مجتمع راستین</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Specification */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold mb-4">
                <span className="material-symbols-outlined text-base">{acConfig.icon || 'biotech'}</span>
                <span>{acConfig.badge}</span>
              </div>

              <h2 className="text-[2.25rem] font-bold text-[#191c1e] mb-6 leading-[1.25]">
                {acConfig.title}
              </h2>

              <p className="text-[1.125rem] text-[#565e74] mb-8 leading-[1.7]">
                {acConfig.description}
              </p>

              {/* Checklist */}
              <div className="space-y-4 mb-8">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] mt-1 shrink-0">
                      <span className="material-symbols-fill material-symbols-outlined text-[16px]">
                        {acConfig.checkIcon || 'check'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#191c1e]">
                        {item}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={`tel:${acConfig.buttonPhone || CLINIC_INFO.phone}`}
                className="inline-flex items-center gap-2 bg-[#004ac6] hover:bg-[#00569c] text-white px-6 py-3 rounded-full text-sm font-bold transition-colors shadow"
              >
                <span className="material-symbols-outlined text-[20px]">{acConfig.buttonIcon || 'call'}</span>
                <span>{acConfig.buttonText}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
