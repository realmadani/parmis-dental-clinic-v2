import React from 'react';
import { useCMS } from '../context/CMSContext.tsx';
import { VALUE_PROPOSITIONS } from '../data/clinicData.ts';
import { AppIcon } from './AppIcon.tsx';

export const ValueProps: React.FC = () => {
  const { homeSettings } = useCMS();
  const vpConfig = homeSettings?.valueProps || {
    title: 'چرا کلینیک دندان‌پزشکی پارمیس؟',
    subtitle: 'استاندارد درمانی برتر',
    items: VALUE_PROPOSITIONS,
  };

  const items = vpConfig.items && vpConfig.items.length > 0 ? vpConfig.items : VALUE_PROPOSITIONS;

  return (
    <section className="bg-[#f2f4f6]/60 border-y border-[#c3c6d7]/20">
      {/* ================= MOBILE HORIZONTAL SCROLL (< md) ================= */}
      <div className="md:hidden py-4">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-sm text-[#004ac6] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] animate-dental-sparkle">
              dentistry
            </span>
            <span>{vpConfig.title}</span>
          </span>
          <span className="text-[11px] text-[#434655] flex items-center gap-1">
            <span>{vpConfig.subtitle}</span>
            <span className="material-symbols-outlined text-[14px] text-[#004ac6] animate-pulse">
              swipe_left
            </span>
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="dental-card-interactive min-w-[210px] bg-white p-3.5 rounded-2xl border border-[#c3c6d7]/20 shadow-xs flex flex-col gap-2 shrink-0 text-right"
            >
              <div className="w-8 h-8 rounded-full bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center overflow-hidden p-1">
                <AppIcon name={item.icon} className="text-[18px] max-w-full max-h-full" />
              </div>
              <div>
                <h4 className="text-sm text-[#191c1e] font-bold">{item.title}</h4>
                <p className="text-[11px] text-[#434655] mt-1 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP GRID (>= md) ================= */}
      <div className="hidden md:block py-10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#c3c6d7]/20">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] animate-dental-sparkle">
                  dentistry
                </span>
              </span>
              <h2 className="text-xl lg:text-2xl font-bold text-[#191c1e]">
                {vpConfig.title}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe1ff]/60 text-[#004ac6] text-xs font-bold border border-[#dbe1ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-pulse" />
              <span>{vpConfig.subtitle}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="dental-card-interactive bg-white p-5 rounded-2xl shadow-xs border border-[#c3c6d7]/20 flex flex-col items-center text-center transition-all hover:-translate-y-1.5 hover:border-[#004ac6]/30 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-full bg-[#dbe1ff]/40 text-[#004ac6] flex items-center justify-center mb-3 overflow-hidden p-2">
                  <AppIcon name={item.icon} className="text-[24px] max-w-full max-h-full" />
                </div>
                <h3 className="text-sm font-bold text-[#191c1e] mb-1">{item.title}</h3>
                <p className="text-sm text-[#565e74]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
