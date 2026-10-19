import React from 'react';
import { useCMS } from '../context/CMSContext.tsx';

interface CtaBannerProps {
  onOpenBooking: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = () => {
  const { clinicInfo, homeSettings } = useCMS();
  const cta = homeSettings?.cta;

  const title = cta?.title || 'آماده‌اید لبخند رویایی خود را تجربه کنید؟';
  const description = cta?.description || 'جهت مشاوره و هماهنگی نوبت ویزیت، همین امروز با کلینیک پارمیس تماس بگیرید.';
  const phone = cta?.phone || clinicInfo.phone2 || clinicInfo.phone;
  const phoneText = cta?.phoneText || clinicInfo.phoneDisplay2 || phone;

  return (
    <section>
      {/* ================= MOBILE CTA BANNER (< md) ================= */}
      <div className="md:hidden px-4 py-4">
        <div className="bg-[#004ac6] text-white rounded-2xl p-5 text-center shadow-lg shadow-[#004ac6]/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
            <span className="material-symbols-outlined text-[26px]">{cta?.icon || 'call'}</span>
          </div>
          <h2 className="text-xl font-bold mb-1.5">{title}</h2>
          <p className="text-sm text-white/90 mb-4 max-w-xs mx-auto">
            {description}
          </p>
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-white text-[#004ac6] text-sm rounded-full font-bold shadow-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-fill material-symbols-outlined text-[20px]">{cta?.buttonIcon || 'call'}</span>
            <span>تماس مستقیم: {phoneText}</span>
          </a>
        </div>
      </div>

      {/* ================= DESKTOP CTA BANNER (>= md) ================= */}
      <div className="hidden md:block py-12">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="bg-[#004ac6] rounded-3xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-right">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#196fc0]/40 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 hidden sm:flex">
                <span className="material-symbols-fill material-symbols-outlined text-[36px]">
                  {cta?.icon || 'calendar_today'}
                </span>
              </div>
              <div>
                <h2 className="text-[2.25rem] font-bold mb-2 leading-[1.25]">
                  {title}
                </h2>
                <p className="text-[1.125rem] opacity-90">
                  {description}
                </p>
              </div>
            </div>

            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="w-full inline-flex items-center justify-center gap-3 bg-white text-[#004ac6] hover:bg-[#dbe1ff] hover:text-[#004ac6] px-8 py-4 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
              >
                <span className="material-symbols-fill material-symbols-outlined text-[24px]">
                  {cta?.buttonIcon || 'call'}
                </span>
                <span className="font-bold text-xl">تماس مستقیم: {phoneText}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
