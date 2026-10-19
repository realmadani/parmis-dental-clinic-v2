import React from 'react';
import { useCMS } from '../context/CMSContext.tsx';

interface DoctorSectionProps {
  onOpenBooking: () => void;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({ onOpenBooking }) => {
  const { doctor, clinicInfo, siteImages, homeSettings } = useCMS();
  const CLINIC_INFO = clinicInfo;
  const docConfig = homeSettings?.doctor || {
    badge: 'مسئول فنی و سرپرست درمان',
    doctorName: CLINIC_INFO.doctorName,
    specialty: 'جراح - دندان‌پزشک | پاکدشت',
    bio: 'دکتر انوشیروان شمس پور با سال‌ها تجربه بالینی درخشان و بهره‌گیری از پروتکل‌های درمانی مدرن، اصل کاری خود را بر پایه «صداقت در تشخیص و اولویت حفظ حداکثری دندان طبیعی بیمار» بنا نهاده است. کلیه مراحل درمانی در محیطی استریل، آرام و مجهز به جدیدترین فناوری‌های تشخیصی روز انجام می‌شود.',
    experienceText: 'بیش از ۱۰ سال تجربه',
    experienceLabel: 'سابقه درخشان بالینی',
    successCountText: '+۵,۰۰۰ درمان موفق',
    successCountLabel: 'رضایت کامل مراجعین',
    locationBadge: 'مطب فعال: پاکدشت، مجتمع پزشکی راستین، طبقه دوم',
    imageUrl: siteImages.doctorProfileImage?.url || CLINIC_INFO.doctorImage,
    consultationPhone: CLINIC_INFO.phone,
  };

  const doctorImg = docConfig.imageUrl || siteImages.doctorProfileImage?.url || CLINIC_INFO.doctorImage;

  return (
    <section className="bg-[#f2f4f6]/70" id="about">
      {/* ================= MOBILE DOCTOR PROFILE (< md) ================= */}
      <div className="md:hidden px-4 py-6">
        <div className="bg-white rounded-2xl p-4 border border-[#c3c6d7]/30 shadow-xs text-right">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#004ac6] shrink-0 shadow-xs">
              <img
                src={doctorImg}
                alt={docConfig.doctorName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#004ac6] font-bold mb-0.5">
                <span>{docConfig.badge}</span>
                <span className="text-[10px] bg-[#dbe1ff] text-[#004ac6] px-1.5 py-0.5 rounded-md font-semibold">پزشک معتمد</span>
              </div>
              <h2 className="text-xl font-bold text-[#191c1e]">{docConfig.doctorName}</h2>
              <p className="text-[11px] text-[#434655]">{docConfig.specialty}</p>
            </div>
          </div>

          <p className="text-sm text-[#434655] leading-relaxed mb-4">
            {docConfig.bio}
          </p>

          {/* Doctor Credentials (2-col) */}
          <div className="grid grid-cols-2 gap-2 text-right mb-4">
            <div className="p-2.5 rounded-xl bg-[#f2f4f6] border border-[#c3c6d7]/20">
              <span className="text-[#004ac6] text-[11px] font-bold block mb-0.5">
                {docConfig.experienceLabel}
              </span>
              <span className="text-sm font-bold text-[#191c1e]">{docConfig.experienceText}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f2f4f6] border border-[#c3c6d7]/20">
              <span className="text-[#004ac6] text-[11px] font-bold block mb-0.5">
                {docConfig.successCountLabel}
              </span>
              <span className="text-sm font-bold text-[#191c1e]">{docConfig.successCountText}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#dbe1ff]/30 border border-[#004ac6]/20 text-[#00174b]">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px] shrink-0">
                {docConfig.locationIcon || 'domain'}
              </span>
              <span className="text-[11px] font-medium leading-tight">
                {docConfig.locationBadge}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f4f6] border border-[#c3c6d7]/20 text-[#191c1e]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">
                  {docConfig.phoneIcon || 'phone_in_talk'}
                </span>
                <span className="text-xs font-semibold text-[#565e74]">مشاوره مستقیم مطب:</span>
              </div>
              <a
                href={`tel:${docConfig.consultationPhone || CLINIC_INFO.phone}`}
                className="text-xs font-bold text-[#004ac6] hover:underline dir-ltr"
              >
                {docConfig.consultationPhone || CLINIC_INFO.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP DOCTOR PROFILE (>= md) ================= */}
      <div className="hidden md:block py-16">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#c3c6d7]/30 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 relative">
                <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-[#eceef0]">
                  <img
                    src={doctorImg}
                    alt={docConfig.doctorName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-[#004ac6] text-white py-2 px-5 rounded-full text-xs font-semibold shadow">
                  پزشک متعهد و باسابقه
                </div>
              </div>

              <div className="lg:col-span-7 text-right">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold mb-3">
                  <span>{docConfig.badge}</span>
                </div>

                <h2 className="text-[2.25rem] font-bold text-[#191c1e] mb-2 leading-[1.25]">
                  {docConfig.doctorName}
                </h2>

                <p className="text-sm font-bold text-[#004ac6] mb-6">
                  {docConfig.specialty}
                </p>

                <div className="space-y-4 text-base text-[#565e74] leading-relaxed mb-8">
                  <p>
                    {docConfig.bio}
                  </p>
                </div>

                {/* Doctor Credentials Desktop */}
                <div className="grid grid-cols-2 gap-4 text-right mb-6">
                  <div className="p-3.5 rounded-2xl bg-[#f2f4f6] border border-[#c3c6d7]/20">
                    <span className="text-[#004ac6] text-xs font-bold block mb-1">
                      {docConfig.experienceLabel}
                    </span>
                    <span className="text-lg font-bold text-[#191c1e]">{docConfig.experienceText}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f2f4f6] border border-[#c3c6d7]/20">
                    <span className="text-[#004ac6] text-xs font-bold block mb-1">
                      {docConfig.successCountLabel}
                    </span>
                    <span className="text-lg font-bold text-[#191c1e]">{docConfig.successCountText}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#c3c6d7]/30">
                  <div className="flex items-center gap-2 text-[#191c1e]">
                    <span className="material-symbols-outlined text-[#004ac6] text-[22px]">
                      {docConfig.locationIcon || 'domain'}
                    </span>
                    <span className="text-sm">{docConfig.locationBadge}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#191c1e]">
                    <span className="material-symbols-outlined text-[#004ac6] text-[22px]">
                      {docConfig.phoneIcon || 'phone_in_talk'}
                    </span>
                    <a
                      href={`tel:${docConfig.consultationPhone || CLINIC_INFO.phone}`}
                      className="text-sm font-bold hover:text-[#004ac6]"
                    >
                      {docConfig.consultationPhone || CLINIC_INFO.phoneDisplay}
                    </a>
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
