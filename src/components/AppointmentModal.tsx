import React, { useState, useEffect } from 'react';
import { useCMS } from '../context/CMSContext.tsx';
import {
  validateAppointmentRequest,
  generateAppointmentTrackingCode,
  PERSIAN_WEEKDAYS,
  PERSIAN_SHIFTS,
  AppointmentBookingRequest,
} from '../utils/bookingUtils.ts';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
}) => {
  const { services, clinicInfo } = useCMS();
  const CLINIC_INFO = clinicInfo;

  const [formData, setFormData] = useState<Partial<AppointmentBookingRequest>>({
    fullName: '',
    phone: '',
    serviceId: preselectedServiceId || (services[0]?.id ?? 'root-canal'),
    preferredDay: 'saturday',
    preferredShift: 'evening',
    patientNotes: '',
    hasInsurance: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedServiceId) {
      setFormData((prev) => ({ ...prev, serviceId: preselectedServiceId }));
    }
  }, [preselectedServiceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAppointmentRequest(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const code = generateAppointmentTrackingCode();
    setTrackingCode(code);

    const selectedService = services.find((s) => s.id === formData.serviceId);
    const serviceTitle = selectedService?.title || 'معاینه کلی و چکاپ دوره‌ای';

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: validation.normalizedPhone || formData.phone,
          serviceId: formData.serviceId,
          serviceTitle,
          preferredDate: formData.preferredDay ? PERSIAN_WEEKDAYS[formData.preferredDay] : '',
          preferredTime: formData.preferredShift ? PERSIAN_SHIFTS[formData.preferredShift] : '',
          description: [
            formData.patientNotes,
            formData.hasInsurance ? '(متقاضی فاکتور رسمی بیمه تکمیلی)' : '',
            `کد رهگیری: ${code}`,
          ]
            .filter(Boolean)
            .join(' - '),
        }),
      });
    } catch (err) {
      console.warn('Appointment API warning:', err);
    }

    // Save to local storage for persistence
    try {
      const existing = JSON.parse(localStorage.getItem('parmis_appointments') || '[]');
      existing.push({
        ...formData,
        code,
        normalizedPhone: validation.normalizedPhone,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('parmis_appointments', JSON.stringify(existing));
    } catch {
      // Local storage fallback
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setTrackingCode('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-right animate-fadeIn my-auto">
        {/* Modal Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-[#eceef0] hover:bg-[#c3c6d7] flex items-center justify-center text-[#191c1e] transition-colors"
          aria-label="بستن فرم رزرو"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {!isSubmitted ? (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#004ac6] bg-[#dbe1ff] px-3 py-1 rounded-full">
                نوبت‌دهی و مشاوره حضوری
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#191c1e] mt-2">
                درخواست وقت ویزیت در کلینیک پارمیس
              </h3>
              <p className="text-xs sm:text-sm text-[#565e74] mt-1 leading-relaxed">
                لطفاً مشخصات خود را وارد نمایید. پس از ثبت درخواست، همکاران پذیرش جهت قطعی‌سازی ساعت
                دقیق با شما تماس خواهند گرفت.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#191c1e] mb-1.5">
                  نام و نام خانوادگی بیمار: *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: سارا محمدی"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm text-[#191c1e] transition-colors ${
                    errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-[#c3c6d7]/50 focus:border-[#004ac6]'
                  } focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#191c1e] mb-1.5">
                  شماره تماس (موبایل): *
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09123456789"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm text-left transition-colors ${
                    errors.phone ? 'border-red-500 bg-red-50/50' : 'border-[#c3c6d7]/50 focus:border-[#004ac6]'
                  } focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1 font-semibold text-right">{errors.phone}</p>
                )}
              </div>

              {/* Desired Service */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#191c1e] mb-1.5">
                  نوع درمان یا خدمات درخواستی: *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-[#c3c6d7]/50 text-sm text-[#191c1e] focus:border-[#004ac6] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 bg-white"
                >
                  <option value="">-- انتخاب خدمت دندان‌پزشکی --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                  <option value="general-consult">معاینه کلی و چکاپ دوره‌ای</option>
                </select>
                {errors.serviceId && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.serviceId}</p>
                )}
              </div>

              {/* Preferred Day and Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#191c1e] mb-1.5">
                    روز پیشنهادی:
                  </label>
                  <select
                    value={formData.preferredDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredDay: e.target.value as AppointmentBookingRequest['preferredDay'],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#c3c6d7]/50 text-xs sm:text-sm bg-white"
                  >
                    {Object.entries(PERSIAN_WEEKDAYS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#191c1e] mb-1.5">
                    بازه زمانی:
                  </label>
                  <select
                    value={formData.preferredShift}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredShift: e.target.value as AppointmentBookingRequest['preferredShift'],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#c3c6d7]/50 text-xs sm:text-sm bg-white"
                  >
                    {Object.entries(PERSIAN_SHIFTS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Supplementary Insurance */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-insurance"
                  checked={formData.hasInsurance}
                  onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
                  className="w-4 h-4 text-[#004ac6] rounded focus:ring-[#004ac6]"
                />
                <label htmlFor="modal-insurance" className="text-xs sm:text-sm text-[#191c1e] cursor-pointer">
                  متقاضی دریافت فاکتور رسمی بیمه تکمیلی هستم
                </label>
              </div>

              {/* Patient Notes */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#191c1e] mb-1.5">
                  توضیحات تکمیلی (اختیاری):
                </label>
                <textarea
                  rows={2}
                  value={formData.patientNotes}
                  onChange={(e) => setFormData({ ...formData, patientNotes: e.target.value })}
                  placeholder="در صورت داشتن دندان‌درد شدید، بارداری، یا سابقه بیماری خاص اینجا ذکر بفرمایید..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#c3c6d7]/50 text-xs sm:text-sm focus:border-[#004ac6] focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#004ac6] hover:bg-[#003896] text-white py-3.5 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>ثبت نهایی درخواست نوبت</span>
                </button>
              </div>

              <div className="text-center text-xs text-[#565e74]">
                برای رزرو فوری می‌توانید مستقیماً با شماره{' '}
                <a href={`tel:${CLINIC_INFO.phone}`} className="text-[#004ac6] font-bold">
                  {CLINIC_INFO.phoneDisplay}
                </a>{' '}
                تماس بگیرید.
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Slip */
          <div className="text-center py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#191c1e] mb-2">
              درخواست نوبت شما با موفقیت ثبت شد
            </h3>

            <p className="text-xs sm:text-sm text-[#565e74] max-w-sm mx-auto mb-6 leading-relaxed">
              با تشکر از اعتماد شما به کلینیک دندان‌پزشکی پارمیس. همکاران پذیرش به زودی با شماره{' '}
              <strong className="text-[#191c1e] dir-ltr inline-block">{formData.phone}</strong> جهت تایید نهایی تماس خواهند گرفت.
            </p>

            {/* Tracking Code Box */}
            <div className="bg-[#f7f9fb] p-5 rounded-2xl border border-[#c3c6d7]/40 mb-6">
              <span className="text-xs text-[#565e74] block mb-1">کد پیگیری نوبت شما:</span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-black text-[#004ac6] tracking-wider font-mono">
                  {trackingCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-white hover:bg-[#dbe1ff] text-[#004ac6] p-2 rounded-xl border border-[#c3c6d7]/30 text-xs flex items-center gap-1 transition-colors"
                  title="کپی کد پیگیری"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? 'done' : 'content_copy'}
                  </span>
                  <span>{copied ? 'کپی شد' : 'کپی'}</span>
                </button>
              </div>
            </div>

            {/* Clinic Info Snapshot */}
            <div className="bg-[#eceef0]/50 p-4 rounded-2xl text-xs text-[#565e74] text-right space-y-1.5 mb-6">
              <div className="flex items-center gap-1.5 text-[#191c1e] font-bold">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">place</span>
                <span>{CLINIC_INFO.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">call</span>
                <span>تلفن تماس کلینیک: {CLINIC_INFO.phoneDisplay}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="bg-[#004ac6] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#003896] transition-colors"
            >
              بستن و بازگشت به سایت
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
