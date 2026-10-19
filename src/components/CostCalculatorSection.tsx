import React, { useState, useMemo } from 'react';
import { useCMS } from '../context/CMSContext.tsx';
import {
  DENTAL_TREATMENTS,
  formatPersianTomans,
  formatPersianNumber,
} from '../utils/costCalculator.ts';
import { CLINIC_INFO } from '../data/clinicData.ts';

interface CostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: (serviceName?: string) => void;
}

export const CostCalculatorSection: React.FC<CostCalculatorModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const { treatments, clinicInfo } = useCMS();
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>('composite-veneer');
  const [quantity, setQuantity] = useState<number>(8);
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [insurancePercent, setInsurancePercent] = useState<number>(30);

  const selectedTreatment = useMemo(
    () => treatments.find((t) => t.id === selectedTreatmentId) || treatments[0] || DENTAL_TREATMENTS[0],
    [treatments, selectedTreatmentId]
  );

  const estimate = useMemo(() => {
    const treatment = selectedTreatment;
    const qty = Math.max(treatment.minUnits, Math.min(quantity, treatment.maxUnits));
    const rawTotal = treatment.basePricePerUnitTomans * qty;
    let insuranceDiscount = 0;
    if (hasInsurance) {
      const coverage = Math.min(100, Math.max(0, insurancePercent ?? 30));
      insuranceDiscount = Math.round(rawTotal * (coverage / 100));
    }
    const finalPayable = Math.max(0, rawTotal - insuranceDiscount);
    const estimatedSessions = qty > 4 && treatment.sessionsEstimate === 1 ? 2 : treatment.sessionsEstimate;
    const totalMinutes = treatment.durationMinutesPerSession * (qty > 1 && treatment.category === 'cosmetic' ? Math.ceil(qty / 4) : 1);

    return {
      treatmentName: treatment.name,
      unit: treatment.unit,
      quantity: qty,
      unitPriceTomans: treatment.basePricePerUnitTomans,
      rawTotalTomans: rawTotal,
      insuranceDiscountTomans: insuranceDiscount,
      finalPayableTomans: finalPayable,
      estimatedSessions,
      totalEstimatedMinutes: totalMinutes,
    };
  }, [selectedTreatment, quantity, hasInsurance, insurancePercent]);

  if (!isOpen) return null;

  const handleTreatmentChange = (id: string) => {
    setSelectedTreatmentId(id);
    const item = DENTAL_TREATMENTS.find((t) => t.id === id);
    if (item) {
      setQuantity(item.defaultUnits);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#f7f9fb] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-[#c3c6d7]/40 shadow-2xl text-right relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-[#eceef0] hover:bg-[#c3c6d7] flex items-center justify-center text-[#191c1e]"
          aria-label="بستن محاسبه‌گر"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>شفافیت کامل در برآورد هزینه‌ها</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] mb-1">
            محاسبه‌گر تقریبی هزینه‌های دندان‌پزشکی
          </h2>
          <p className="text-xs sm:text-sm text-[#565e74]">
            نوع خدمت و تعداد واحد مورد نظر خود را انتخاب کنید تا برآورد تعرفه و سهم احتمالی بیمه
            تکمیلی را مشاهده فرمایید.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Control Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#191c1e] mb-2">
                انتخاب نوع درمان:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {treatments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTreatmentChange(item.id)}
                    className={`p-3 rounded-2xl text-right border transition-all text-xs sm:text-sm font-semibold flex items-center justify-between ${
                      selectedTreatmentId === item.id
                        ? 'bg-[#dbe1ff]/60 border-[#004ac6] text-[#004ac6] shadow-xs'
                        : 'bg-white border-[#c3c6d7]/40 text-[#191c1e] hover:border-[#004ac6]/40'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[11px] opacity-75">
                      {formatPersianTomans(item.basePricePerUnitTomans)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedTreatment.maxUnits > 1 && (
              <div className="bg-white p-4 rounded-2xl border border-[#c3c6d7]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-[#191c1e]">
                    تعداد {selectedTreatment.unit}:
                  </span>
                  <span className="text-sm font-extrabold text-[#004ac6] bg-[#dbe1ff] px-3 py-0.5 rounded-full">
                    {formatPersianNumber(quantity)} {selectedTreatment.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedTreatment.minUnits}
                  max={selectedTreatment.maxUnits}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-[#004ac6] cursor-pointer"
                />
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-[#c3c6d7]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="insurance-toggle"
                    checked={hasInsurance}
                    onChange={(e) => setHasInsurance(e.target.checked)}
                    className="w-4 h-4 text-[#004ac6] rounded focus:ring-[#004ac6]"
                  />
                  <label
                    htmlFor="insurance-toggle"
                    className="text-xs sm:text-sm font-bold text-[#191c1e] cursor-pointer"
                  >
                    دارای بیمه تکمیلی هستم (ارائه فاکتور رسمی)
                  </label>
                </div>
              </div>

              {hasInsurance && (
                <div className="pt-2 border-t border-[#eceef0]">
                  <div className="flex gap-2">
                    {[20, 30, 50, 70].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setInsurancePercent(pct)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          insurancePercent === pct
                            ? 'bg-[#004ac6] text-white border-[#004ac6]'
                            : 'bg-white border-[#c3c6d7]/40 text-[#565e74]'
                        }`}
                      >
                        {formatPersianNumber(pct)}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estimate Summary Result (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-[#004ac6]/30 shadow-md">
            <h3 className="text-base font-bold text-[#191c1e] pb-3 border-b border-[#eceef0] mb-4 flex items-center justify-between">
              <span>خلاصه برآورد هزینه درمان</span>
              <span className="material-symbols-outlined text-[#004ac6]">receipt_long</span>
            </h3>

            <div className="space-y-3 mb-5 text-xs sm:text-sm">
              <div className="flex justify-between text-[#565e74]">
                <span>عنوان درمان:</span>
                <span className="font-bold text-[#191c1e]">{estimate.treatmentName}</span>
              </div>

              <div className="flex justify-between text-[#565e74]">
                <span>تعداد درخواستی:</span>
                <span className="font-bold text-[#191c1e]">
                  {formatPersianNumber(estimate.quantity)} {estimate.unit}
                </span>
              </div>

              <div className="flex justify-between text-[#565e74]">
                <span>هزینه پایه درمان:</span>
                <span className="font-bold text-[#191c1e]">
                  {formatPersianTomans(estimate.rawTotalTomans)}
                </span>
              </div>

              {hasInsurance && (
                <div className="flex justify-between text-emerald-600 bg-emerald-50 p-2 rounded-xl font-medium">
                  <span>کسر تقریبی بیمه تکمیلی:</span>
                  <span className="font-bold">
                    - {formatPersianTomans(estimate.insuranceDiscountTomans)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-[#eceef0] flex justify-between items-center">
                <span className="text-sm font-bold text-[#191c1e]">مبلغ برآوردی نهایی:</span>
                <span className="text-lg font-black text-[#004ac6]">
                  {formatPersianTomans(estimate.finalPayableTomans)}
                </span>
              </div>
            </div>

            <a
              href={`tel:${CLINIC_INFO.phone}`}
              onClick={onClose}
              className="w-full bg-[#004ac6] hover:bg-[#003896] text-white py-3 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>تماس تلفنی جهت هماهنگی این برآورد ({CLINIC_INFO.phoneCompact})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
