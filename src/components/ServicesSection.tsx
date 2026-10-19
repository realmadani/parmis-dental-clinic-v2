import React from 'react';
import { useCMS } from '../context/CMSContext.tsx';
import { MOBILE_SERVICES_ORDER, CLINIC_INFO } from '../data/clinicData.ts';
import { AppIcon } from './AppIcon.tsx';

interface ServicesSectionProps {
  onOpenBooking: (serviceId?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBooking }) => {
  const { services, homeSettings } = useCMS();
  const srvConfig = homeSettings?.services || {
    badge: 'طیف کامل خدمات دندان‌پزشکی پارمیس',
    title: 'خدمات درمانی و زیبایی در پاکدشت',
    description: 'کلیه درمان‌های ترمیمی، زیبایی و جراحی دهان و دندان با بهترین تجهیزات و با رعایت کامل استانداردهای پزشکی در فضایی آرام انجام می‌پذیرد.',
    showCount: 6,
    ctaButtonText: 'مشاوره و رزرو ویزیت',
    badgeIcon: 'dentistry',
  };

  const badgeIconName = srvConfig.badgeIcon || 'dentistry';

  const displayedServices = React.useMemo(() => {
    const list = services || [];
    if (srvConfig.selectedServiceIds && srvConfig.selectedServiceIds.length > 0) {
      const selected = srvConfig.selectedServiceIds
        .map((id) => list.find((s) => s.id === id))
        .filter((s): s is typeof list[0] => Boolean(s));
      if (selected.length > 0) return selected;
    }
    return list.slice(0, srvConfig.showCount || 6);
  }, [services, srvConfig.selectedServiceIds, srvConfig.showCount]);

  return (
    <section id="services">
      {/* ================= MOBILE 2-COLUMN BENTO GRID (< md) ================= */}
      <div className="md:hidden px-4 py-6">
        <div className="text-right mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe1ff]/60 text-[#004ac6] text-xs font-bold mb-2">
            <AppIcon name={badgeIconName} className="text-[15px] animate-dental-sparkle" />
            <span>{srvConfig.badge}</span>
          </div>
          <h2 className="text-xl text-[#191c1e] font-bold mt-1 leading-snug">{srvConfig.title}</h2>
          <p className="text-sm text-[#434655] mt-1 leading-relaxed">
            {srvConfig.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-right">
          {displayedServices.map((service, idx) => (
            <div
              key={service.id}
              className="dental-card-interactive p-3.5 bg-white rounded-2xl border border-[#c3c6d7]/30 flex flex-col justify-between hover:border-[#004ac6]/40 transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center mb-2 overflow-hidden p-1">
                  <AppIcon
                    name={service.iconName || service.mobileIconName || 'dentistry'}
                    className="text-[22px] max-w-full max-h-full"
                  />
                </div>
                <h3 className="text-sm font-bold text-[#191c1e]">{service.title || service.mobileTitle}</h3>
                <p className="text-[11px] text-[#434655] mt-1 leading-snug line-clamp-3">
                  {service.shortDesc || service.mobileDesc}
                </p>
              </div>
              <a
                href={`tel:${idx % 2 === 0 ? CLINIC_INFO.phone : CLINIC_INFO.phone2}`}
                className="text-[#004ac6] text-[10px] font-bold mt-3 inline-flex items-center gap-1 group"
              >
                <span>مشاوره: {idx % 2 === 0 ? CLINIC_INFO.phoneCompact : CLINIC_INFO.phoneCompact2}</span>
                <span className="material-symbols-outlined text-xs group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
              </a>
            </div>
          ))}
        </div>

        {srvConfig.ctaButtonText && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="w-full py-3 px-4 rounded-xl bg-[#004ac6] text-white text-xs font-bold shadow-md hover:bg-[#003ba0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              <span>{srvConfig.ctaButtonText}</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= DESKTOP 3-COLUMN SERVICES GRID (>= md) ================= */}
      <div className="hidden md:block py-16 lg:py-24">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold mb-3">
              <AppIcon name={badgeIconName} className="text-[15px] animate-dental-sparkle" />
              <span>{srvConfig.badge}</span>
            </div>
            <h2 className="text-[2.25rem] font-bold text-[#191c1e] mb-4 leading-[1.25]">
              {srvConfig.title}
            </h2>
            <p className="text-[1.125rem] text-[#565e74] leading-[1.7]">
              {srvConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedServices.map((service, idx) => (
              <div
                key={service.id}
                className="dental-card-interactive bg-white p-8 rounded-3xl border border-[#c3c6d7]/30 shadow-xs hover:-translate-y-1.5 hover:border-[#004ac6]/35 hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-right group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#dbe1ff]/50 text-[#004ac6] flex items-center justify-center mb-6 group-hover:bg-[#004ac6] group-hover:text-white transition-colors overflow-hidden p-2">
                    <AppIcon
                      name={service.iconName || 'dentistry'}
                      className={`text-[30px] max-w-full max-h-full ${
                        service.id === 'root-canal' ? 'material-symbols-fill' : ''
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#191c1e] mb-3">{service.title}</h3>
                  <p className="text-base text-[#565e74] leading-relaxed mb-6">
                    {service.shortDesc}
                  </p>
                </div>

                <a
                  href={`tel:${idx % 2 === 0 ? CLINIC_INFO.phone : CLINIC_INFO.phone2}`}
                  className="inline-flex items-center gap-2 text-[#004ac6] font-bold text-sm hover:underline mt-auto"
                >
                  <span>
                    مشاوره و وقت ویزیت: {idx % 2 === 0 ? CLINIC_INFO.phoneCompact : CLINIC_INFO.phoneCompact2}
                  </span>
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                </a>
              </div>
            ))}
          </div>

          {srvConfig.ctaButtonText && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#004ac6] hover:bg-[#003ba0] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                <span>{srvConfig.ctaButtonText}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
