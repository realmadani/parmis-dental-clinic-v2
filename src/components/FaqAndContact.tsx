import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext.tsx';
import { AppIcon } from './AppIcon.tsx';

export const FaqAndContact: React.FC = () => {
  const { faqs, mobileFaqs, clinicInfo, siteImages, homeSettings } = useCMS();
  const CLINIC_INFO = clinicInfo;
  const fc = homeSettings?.faqAndContact;
  const faqEnabled = fc?.faqEnabled ?? true;
  const contactEnabled = fc?.contactEnabled ?? true;

  const [openDesktopFaqId, setOpenDesktopFaqId] = useState<string>('faq-1');
  const [openMobileFaqId, setOpenMobileFaqId] = useState<string>('');

  const toggleDesktopFaq = (id: string) => {
    setOpenDesktopFaqId((prev) => (prev === id ? '' : id));
  };

  const toggleMobileFaq = (id: string) => {
    setOpenMobileFaqId((prev) => (prev === id ? '' : id));
  };

  if (!faqEnabled && !contactEnabled) {
    return null;
  }

  const mapImgUrl = fc?.mapImageUrl || siteImages.mapPreviewImage?.url || CLINIC_INFO.mobileMapImage || CLINIC_INFO.mapImage;
  const addressText = fc?.contactAddress || CLINIC_INFO.address;
  const phone1 = fc?.phone1 || CLINIC_INFO.phone;
  const phone2 = fc?.phone2 || CLINIC_INFO.phone2;
  const workingHours = fc?.workingHours || CLINIC_INFO.workingHours;
  const neshanLink = fc?.neshanUrl || CLINIC_INFO.neshanUrl;
  const baladLink = fc?.baladUrl || CLINIC_INFO.baladUrl;
  const googleMapsLink = fc?.googleMapsUrl || CLINIC_INFO.googleMapsUrl;

  return (
    <div id="contact">
      {/* ================= MOBILE FAQS & CONTACT (< md) ================= */}
      <div className="md:hidden">
        {/* 8. Mobile FAQ Section */}
        {faqEnabled && (
          <section className="px-4 py-6 bg-[#f2f4f6]/50">
            <div className="text-right mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-bold mb-1">
                <span className="material-symbols-outlined text-[16px]">{fc?.faqBadgeIcon || 'help'}</span>
                <span>{fc?.faqBadge || 'راهنمای بیماران'}</span>
              </div>
              <h2 className="text-xl text-[#191c1e] font-bold mt-1">{fc?.faqTitle || 'پرسش‌های متداول مراجعین'}</h2>
            </div>

            <div className="space-y-2 text-right">
              {(faqs && faqs.length > 0 ? faqs : mobileFaqs).map((faq) => {
                const isOpen = openMobileFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl border border-[#c3c6d7]/30 overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleMobileFaq(faq.id)}
                      className="w-full p-3.5 flex items-center justify-between text-right font-bold text-sm text-[#191c1e]"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
                        <AppIcon
                          name={faq.icon || 'quiz'}
                          className="text-[#004ac6] text-[18px] shrink-0 max-w-[20px] max-h-[20px]"
                        />
                        <span className="leading-snug">{faq.question}</span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[#004ac6] text-[20px] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-3.5 text-sm text-[#434655] bg-[#f2f4f6]/30">
                        <p className="pb-3 pt-1 text-[12px] leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 9. Mobile Contact, Map & Location */}
        {contactEnabled && (
          <section className="px-4 py-6">
            <div className="bg-white rounded-2xl p-4 border border-[#c3c6d7]/30 shadow-xs text-right">
              <div className="flex items-center gap-2 text-[#004ac6] mb-1">
                <span className="material-symbols-outlined text-[20px]">{fc?.locationMainIcon || 'location_on'}</span>
                <span className="text-xs font-bold">{fc?.contactBadge || 'موقعیت مطب و اطلاعات تماس'}</span>
              </div>

              <h2 className="text-xl font-bold text-[#191c1e] mb-2">
                {fc?.contactTitle || 'کلینیک دندان‌پزشکی در پاکدشت'}
              </h2>

              <p className="text-sm text-[#434655] mb-4 leading-relaxed">
                {addressText}
              </p>

              {/* Simulated Interactive Map Card for Pakdasht */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] w-full mb-3 border border-[#c3c6d7]/30">
                <img
                  src={mapImgUrl}
                  alt={siteImages.mapPreviewImage?.alt || 'نقشه کلینیک دندانپزشکی پارمیس در پاکدشت'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#004ac6]/10 pointer-events-none" />
                {googleMapsLink && (
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="bg-white/95 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#004ac6] shadow-xs">
                      مشاهده مجتمع پزشکی راستین روی نقشه
                    </span>
                  </a>
                )}
              </div>

              {/* 3 Dedicated Navigation Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {neshanLink && (
                  <a
                    href={neshanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-xl bg-[#004ac6]/10 hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-bold text-center transition-all"
                  >
                    مسیریابی نشان
                  </a>
                )}
                {baladLink && (
                  <a
                    href={baladLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold text-center transition-all"
                  >
                    مسیریابی بلد
                  </a>
                )}
                {googleMapsLink && (
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold text-center transition-all"
                  >
                    گوگل مپ
                  </a>
                )}
              </div>

              {/* Contact Box & Call Trigger */}
              <div className="bg-[#f2f4f6] p-3 rounded-xl border border-[#c3c6d7]/20 space-y-2">
                <div className="flex items-start justify-between text-sm">
                  <span className="text-[#434655]">شماره تماس مستقیم نوبت‌دهی:</span>
                  <div className="space-y-1 text-left">
                    {phone1 && (
                      <a
                        href={`tel:${phone1.replace(/\s+/g, '')}`}
                        className="block text-[#004ac6] font-bold dir-ltr tracking-wider"
                      >
                        {phone1}
                      </a>
                    )}
                    {phone2 && (
                      <a
                        href={`tel:${phone2.replace(/\s+/g, '')}`}
                        className="block text-[#004ac6] font-bold dir-ltr tracking-wider"
                      >
                        {phone2}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#434655]">ساعات پذیرش:</span>
                  <span className="text-[#191c1e] font-medium">
                    {workingHours}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ================= DESKTOP FAQS & CONTACT (>= md) ================= */}
      <section className="hidden md:block py-16 bg-[#f2f4f6]/50">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className={`grid grid-cols-1 ${faqEnabled && contactEnabled ? 'lg:grid-cols-12 gap-10' : 'max-w-4xl mx-auto gap-8'}`}>
            {/* FAQs Column */}
            {faqEnabled && (
              <div className={`${contactEnabled ? 'lg:col-span-7' : 'w-full'} text-right`}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-bold mb-3">
                  <span className="material-symbols-outlined text-[18px]">{fc?.faqBadgeIcon || 'help'}</span>
                  <span>{fc?.faqBadge || 'راهنمای بیماران'}</span>
                </div>
                <h2 className="text-[2.25rem] font-bold text-[#191c1e] mb-6 leading-[1.25]">
                  {fc?.faqTitle || 'پرسش‌های متداول مراجعین'}
                </h2>

                <div className="space-y-4">
                  {(faqs && faqs.length > 0 ? faqs : mobileFaqs).map((faq) => {
                    const isOpen = openDesktopFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="bg-white p-5 rounded-2xl border border-[#c3c6d7]/30 shadow-2xs hover:border-[#004ac6]/30 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleDesktopFaq(faq.id)}
                          className="w-full flex items-center justify-between cursor-pointer font-semibold text-lg lg:text-xl text-[#191c1e] text-right gap-4"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <AppIcon
                              name={faq.icon || 'quiz'}
                              className="text-[#004ac6] text-[24px] shrink-0 max-w-[28px] max-h-[28px]"
                            />
                            <span className="leading-snug">{faq.question}</span>
                          </div>
                          <span
                            className={`material-symbols-outlined transition-transform duration-300 text-[#004ac6] shrink-0 text-[24px] ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        {isOpen && (
                          <p className="text-base text-[#565e74] mt-4 leading-relaxed border-t border-[#c3c6d7]/20 pt-3 pr-9">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clinic Location & Contact Card */}
            {contactEnabled && (
              <div className={`${faqEnabled ? 'lg:col-span-5' : 'w-full'} text-right`}>
                <div className="bg-white p-8 rounded-3xl border border-[#c3c6d7]/30 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center mb-6">
                      <span className="material-symbols-fill material-symbols-outlined text-[28px]">
                        {fc?.locationMainIcon || 'location_on'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold text-[#191c1e] mb-2">
                      {fc?.contactBadge || 'موقعیت مطب و اطلاعات تماس'}
                    </h3>
                    <p className="text-base text-[#565e74] mb-6">
                      {fc?.contactTitle || 'دسترسی سریع و آسان برای مراجعین محترم پاکدشت، شریف‌آباد و حومه'}
                    </p>

                    {/* Detailed contact facts */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#004ac6] text-[22px] mt-0.5">
                          {fc?.addressIcon || 'place'}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#191c1e]">آدرس:</p>
                          <p className="text-sm text-[#565e74]">{addressText}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#004ac6] text-[22px] mt-0.5">
                          {fc?.phoneIcon || 'call'}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#191c1e]">
                            شماره تماس مستقیم نوبت‌دهی:
                          </p>
                          <div className="space-y-1 mt-1">
                            {phone1 && (
                              <a
                                href={`tel:${phone1.replace(/\s+/g, '')}`}
                                className="block text-lg font-bold text-[#004ac6] hover:underline dir-ltr text-right"
                              >
                                {phone1}
                              </a>
                            )}
                            {phone2 && (
                              <a
                                href={`tel:${phone2.replace(/\s+/g, '')}`}
                                className="block text-lg font-bold text-[#004ac6] hover:underline dir-ltr text-right"
                              >
                                {phone2}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#004ac6] text-[22px] mt-0.5">
                          {fc?.hoursIcon || 'schedule'}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#191c1e]">ساعات پذیرش:</p>
                          <p className="text-sm text-[#565e74]">{workingHours}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Map Snapshot */}
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-[#c3c6d7]/30 aspect-[16/8]">
                      <img
                        src={mapImgUrl}
                        alt={siteImages.mapPreviewImage?.alt || 'نقشه موقعیت کلینیک دندان‌پزشکی پارمیس در پاکدشت'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {googleMapsLink && (
                        <a
                          href={googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-[#004ac6]/10 hover:bg-[#004ac6]/20 flex items-center justify-center transition-colors"
                        >
                          <span className="bg-white/95 px-4 py-2 rounded-full text-xs font-bold text-[#004ac6] shadow-xs">
                            مشاهده مجتمع پزشکی راستین روی نقشه
                          </span>
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {neshanLink && (
                        <a
                          href={neshanLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-[#004ac6]/10 hover:bg-[#004ac6] text-[#004ac6] hover:text-white text-xs font-bold text-center transition-all"
                        >
                          مسیریابی نشان
                        </a>
                      )}
                      {baladLink && (
                        <a
                          href={baladLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold text-center transition-all"
                        >
                          مسیریابی بلد
                        </a>
                      )}
                      {googleMapsLink && (
                        <a
                          href={googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold text-center transition-all"
                        >
                          گوگل مپ
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
