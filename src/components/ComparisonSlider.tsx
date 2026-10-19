import React, { useState, useEffect } from 'react';

export interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeBadge?: string;
  afterBadge?: string;
  heightClass?: string;
  aspectClass?: string;
  alt: string;
  accentColor?: string;
  initialPosition?: number;
  dividerColor?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'قبل از درمان',
  afterLabel = 'بعد از درمان',
  beforeBadge,
  afterBadge,
  heightClass = 'h-52 sm:h-56',
  aspectClass,
  alt,
  accentColor = '#004ac6',
  initialPosition = 50,
  dividerColor = '#ffffff',
}) => {
  const [sliderPos, setSliderPos] = useState<number>(initialPosition);

  useEffect(() => {
    if (typeof initialPosition === 'number' && !isNaN(initialPosition)) {
      setSliderPos(initialPosition);
    }
  }, [initialPosition]);

  const displayBefore = beforeBadge || beforeLabel;
  const displayAfter = afterBadge || afterLabel;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#eceef0] select-none ${
        aspectClass ? aspectClass : heightClass
      } w-full group shadow-inner`}
      dir="ltr"
    >
      {/* 1. Base Layer: BEFORE Image (Full width background - visible on the RIGHT side) */}
      <img
        src={beforeImage}
        alt={`${alt} - قبل از درمان`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* 2. Top Layer: AFTER Image (Clipped from left 0% to sliderPos% - visible on the LEFT side) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
          WebkitClipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
        }}
      >
        <img
          src={afterImage}
          alt={`${alt} - بعد از درمان`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* 3. Divider Line & Circular Drag Handle */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-10 -translate-x-1/2 flex items-center justify-center transition-transform"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Vertical divider line */}
        <div
          className="w-0.5 h-full shadow-[0_0_10px_rgba(0,0,0,0.6)]"
          style={{ backgroundColor: dividerColor || '#ffffff' }}
        />

        {/* Circular Thumb Handle */}
        <div
          className="absolute w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white shadow-xl border-2 flex items-center justify-center transform active:scale-95 transition-transform"
          style={{
            backgroundColor: accentColor || '#004ac6',
            borderColor: dividerColor || '#ffffff',
          }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 4. Overlay Labels */}
      {/* Left Badge: After Treatment (سمت چپ: بعد درمان) */}
      <span
        className="absolute bottom-2.5 left-2.5 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md pointer-events-none z-10 shadow-xs max-w-[45%] truncate"
        style={{ backgroundColor: `${accentColor}E6` }}
      >
        {displayAfter}
      </span>

      {/* Right Badge: Before Treatment (سمت راست: قبل درمان) */}
      <span className="absolute bottom-2.5 right-2.5 bg-[#2d3133]/90 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md pointer-events-none z-10 shadow-xs max-w-[45%] truncate">
        {displayBefore}
      </span>

      {/* Swipe Hint Pill */}
      <div className="absolute top-2.5 right-2.5 bg-black/50 text-white/95 text-[10px] px-2.5 py-0.5 rounded-full pointer-events-none backdrop-blur-sm flex items-center gap-1 z-10 font-medium">
        <span className="material-symbols-outlined text-[13px]">swipe</span>
        <span>لمس و کشیدن</span>
      </div>

      {/* 5. Invisible Range Slider Input for Drag/Touch Event */}
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={sliderPos}
        aria-label="لغزنده مقایسه قبل و بعد"
        onChange={(e) => setSliderPos(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 z-20 m-0 cursor-ew-resize"
      />
    </div>
  );
};

