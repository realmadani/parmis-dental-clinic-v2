import React, { useState, useRef, useEffect } from 'react';
import { CLINIC_INFO } from '../data/clinicData.ts';
import { useCMS } from '../context/CMSContext.tsx';

interface NavbarProps {
  activePage: 'home' | 'services' | 'about' | 'blog' | 'article' | 'gallery' | 'contact';
  onSelectPage: (page: 'home' | 'services' | 'about' | 'blog' | 'article' | 'gallery' | 'contact') => void;
  onOpenBooking?: (preselectedService?: string) => void;
  onOpenCostCalculator: () => void;
  onOpenAiAssistant?: () => void;
  isAiAssistantOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onSelectPage,
  onOpenCostCalculator,
  onOpenAiAssistant,
  isAiAssistantOpen = false,
}) => {
  const { siteImages, clinicInfo } = useCMS();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Coordinates of the hamburger button / touch point relative to the right-aligned drawer
  const [dropOrigin, setDropOrigin] = useState<{ x: string; y: string }>({
    x: 'calc(100% - 28px)',
    y: '28px',
  });
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const computeHamburgerOrigin = (clientX?: number, clientY?: number) => {
    const drawerWidth = drawerRef.current?.offsetWidth || Math.min(320, window.innerWidth * 0.85);
    const drawerLeft = window.innerWidth - drawerWidth;

    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      const centerX = clientX ?? rect.left + rect.width / 2;
      const centerY = clientY ?? rect.top + rect.height / 2;
      const localX = Math.max(0, Math.min(drawerWidth, centerX - drawerLeft));
      const localY = Math.max(0, centerY);
      setDropOrigin({ x: `${Math.round(localX)}px`, y: `${Math.round(localY)}px` });
    }
  };

  const handleOpenDrawer = (e: React.MouseEvent<HTMLButtonElement>) => {
    computeHamburgerOrigin(
      e.clientX || undefined,
      e.clientY || undefined
    );
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    // Always collapse back smoothly to the exact center of the hamburger button
    computeHamburgerOrigin();
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleNavClick = (page: 'home' | 'services' | 'about' | 'blog' | 'article' | 'gallery' | 'contact', hash?: string) => {
    handleCloseDrawer();
    onSelectPage(page);
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Shared Unified Header (Home Page Header across all pages on Mobile & Desktop) */}
      <header className="bg-white/90 backdrop-blur-md text-[#004ac6] sticky top-0 z-50 shadow-xs border-b border-[#c3c6d7]/30 transition-all">
        {/* ================= MOBILE HEADER (< md) - Exact Home Page Header ================= */}
        <div className="flex md:hidden items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 w-full max-w-full overflow-hidden">
          {/* Right: Drawer Toggle & Brand Identity */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              ref={menuBtnRef}
              type="button"
              onClick={handleOpenDrawer}
              aria-label="منوی سایت"
              className="p-2 -mr-1.5 rounded-full text-[#191c1e] hover:bg-[#e6e8ea] active:scale-90 transition-transform duration-200 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[26px]">menu</span>
            </button>
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#004ac6] shrink-0 shadow-xs bg-[#eceef0]">
                <img
                  src={siteImages.headerLogo?.url || clinicInfo.doctorImage || CLINIC_INFO.doctorImage}
                  alt={siteImages.headerLogo?.alt || clinicInfo.doctorName || CLINIC_INFO.doctorName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col text-right min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-[#004ac6] leading-tight truncate">
                  کلینیک دندانپزشکی پارمیس
                </span>
                <span className="text-[10px] text-[#565e74] font-semibold truncate">
                  {clinicInfo.doctorTitleBrand || CLINIC_INFO.doctorTitleBrand}
                </span>
              </div>
            </div>
          </div>

          {/* Left (Mobile): Quick Call Button */}
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            title="تماس و مسیریابی"
            aria-label="تماس با ما و مسیریابی"
            className="w-9 h-9 rounded-full bg-[#004ac6] hover:bg-[#2563eb] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-fill material-symbols-outlined text-[18px]">
              call
            </span>
          </button>
        </div>

        {/* ================= DESKTOP HEADER (>= md) - Exact Home Page Header ================= */}
        <div className="hidden md:flex w-full max-w-7xl mx-auto px-6 items-center justify-between py-3">
          {/* Brand Logo & Subtitle */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="text-right flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#004ac6] group-hover:scale-105 transition-transform shrink-0 shadow-xs bg-[#eceef0]">
              <img
                src={siteImages.headerLogo?.url || clinicInfo.doctorImage || CLINIC_INFO.doctorImage}
                alt={siteImages.headerLogo?.alt || clinicInfo.doctorName || CLINIC_INFO.doctorName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-base font-extrabold text-[#004ac6] tracking-tight">
                کلینیک دندانپزشکی پارمیس
              </span>
              <span className="text-xs text-[#565e74] font-semibold">
                {clinicInfo.doctorTitleBrand || CLINIC_INFO.doctorTitleBrand}
              </span>
            </div>
          </button>

           {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-4 lg:gap-5">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`text-sm transition-colors cursor-pointer pb-1 ${
                activePage === 'home'
                  ? 'text-[#004ac6] font-bold border-b-2 border-[#004ac6]'
                  : 'text-[#565e74] hover:text-[#004ac6] font-semibold'
              }`}
            >
              صفحه اصلی
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('services')}
              className={`text-sm transition-colors cursor-pointer pb-1 ${
                activePage === 'services'
                  ? 'text-[#004ac6] font-bold border-b-2 border-[#004ac6]'
                  : 'text-[#565e74] hover:text-[#004ac6] font-semibold'
              }`}
            >
              خدمات درمان و زیبایی
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('gallery')}
              className={`text-sm transition-colors cursor-pointer pb-1 ${
                activePage === 'gallery'
                  ? 'text-[#004ac6] font-bold border-b-2 border-[#004ac6]'
                  : 'text-[#565e74] hover:text-[#004ac6] font-semibold'
              }`}
            >
              نمونه درمان‌ها و لبخند
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`text-sm transition-colors cursor-pointer pb-1 ${
                activePage === 'about'
                  ? 'text-[#004ac6] font-bold border-b-2 border-[#004ac6]'
                  : 'text-[#565e74] hover:text-[#004ac6] font-semibold'
              }`}
            >
              درباره {clinicInfo.doctorTitleBrand || CLINIC_INFO.doctorTitleBrand}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('blog')}
              className={`text-sm transition-colors cursor-pointer pb-1 ${
                activePage === 'blog' || activePage === 'article'
                  ? 'text-[#004ac6] font-bold border-b-2 border-[#004ac6]'
                  : 'text-[#565e74] hover:text-[#004ac6] font-semibold'
              }`}
            >
              مقالات و وبلاگ تخصصی
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className={`text-sm transition-colors cursor-pointer pb-1 ${
                activePage === 'contact'
                  ? 'text-[#004ac6] font-bold border-b-2 border-[#004ac6]'
                  : 'text-[#565e74] hover:text-[#004ac6] font-semibold'
              }`}
            >
              تماس و مسیریابی
            </button>
          </nav>

          {/* Trailing Actions: Call Icon Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              title="تماس و مسیریابی"
              aria-label="تماس با ما و مسیریابی"
              className="w-10 h-10 rounded-full bg-[#004ac6] hover:bg-[#2563eb] text-white flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-fill material-symbols-outlined text-[20px]">
                call
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE NAVIGATION DRAWER (WATER DROPLET RIPPLE ANIMATION) ================= */}
      <div
        aria-hidden={!isDrawerOpen}
        className={`fixed inset-0 z-50 md:hidden overflow-hidden ${
          isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Smooth Backdrop Overlay */}
        <div
          onClick={handleCloseDrawer}
          className={`fixed inset-0 bg-[#2d3133]/50 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Water Droplet Expanding/Collapsing Drawer Panel */}
        <aside
          ref={drawerRef}
          style={{
            clipPath: isDrawerOpen
              ? `circle(150% at ${dropOrigin.x} ${dropOrigin.y})`
              : `circle(0px at ${dropOrigin.x} ${dropOrigin.y})`,
            WebkitClipPath: isDrawerOpen
              ? `circle(150% at ${dropOrigin.x} ${dropOrigin.y})`
              : `circle(0px at ${dropOrigin.x} ${dropOrigin.y})`,
            transition:
              'clip-path 560ms cubic-bezier(0.22, 1, 0.36, 1), -webkit-clip-path 560ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'clip-path',
          }}
          className="fixed inset-y-0 right-0 w-[85vw] max-w-[320px] z-50 bg-white rounded-l-2xl shadow-2xl flex flex-col h-full p-4 sm:p-5 overflow-y-auto overflow-x-hidden overscroll-contain transform-gpu box-border"
        >
          {/* Contained Water Droplet Ripple Ring Effect (Strictly Clipped so it never causes X-scroll) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-l-2xl">
            <span
              style={{
                left: dropOrigin.x,
                top: dropOrigin.y,
              }}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#004ac6]/10 transition-all duration-700 ease-out ${
                isDrawerOpen
                  ? 'w-[520px] h-[520px] opacity-0 scale-100'
                  : 'w-4 h-4 opacity-60 scale-0'
              }`}
            />
          </div>

          {/* Inner Content with Smooth Synchronized Fade & Scale */}
          <div
            className={`relative z-10 flex flex-col h-full w-full min-w-0 overflow-x-hidden transition-all duration-400 ease-out ${
              isDrawerOpen
                ? 'opacity-100 translate-y-0 scale-100 delay-75'
                : 'opacity-0 -translate-y-2 scale-[0.97]'
            }`}
          >
            {/* Header of Drawer */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#c3c6d7]/20 w-full min-w-0">
              <div className="flex items-center gap-2.5 text-right min-w-0 flex-1">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#004ac6] shrink-0 shadow-xs bg-[#eceef0]">
                  <img
                    src={siteImages.headerLogo?.url || clinicInfo.doctorImage || CLINIC_INFO.doctorImage}
                    alt={siteImages.headerLogo?.alt || clinicInfo.doctorName || CLINIC_INFO.doctorName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#004ac6] truncate">
                    کلینیک دندانپزشکی پارمیس
                  </h3>
                  <p className="text-xs text-[#565e74] font-semibold truncate">
                    {clinicInfo.doctorTitleBrand || CLINIC_INFO.doctorTitleBrand}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="p-2 rounded-full hover:bg-[#eceef0] text-[#434655] active:scale-90 transition-transform duration-200 cursor-pointer shrink-0"
                aria-label="بستن منو"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Navigation Drawer Links */}
            <nav className="flex-1 py-4 space-y-1.5 text-right w-full min-w-0">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center gap-3 rounded-full px-4 py-3 active:scale-[0.98] transition-all cursor-pointer min-w-0 ${
                  activePage === 'home'
                    ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold'
                    : 'text-[#434655] hover:bg-[#f2f4f6] font-semibold'
                }`}
              >
                <span
                  className={`material-symbols-outlined shrink-0 ${
                    activePage === 'home' ? 'material-symbols-fill' : ''
                  }`}
                >
                  home
                </span>
                <span className="text-xs truncate">صفحه اصلی</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('services')}
                className={`w-full flex items-center gap-3 rounded-full px-4 py-3 active:scale-[0.98] transition-all cursor-pointer min-w-0 ${
                  activePage === 'services'
                    ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold'
                    : 'text-[#434655] hover:bg-[#f2f4f6] font-semibold'
                }`}
              >
                <span
                  className={`material-symbols-outlined shrink-0 ${
                    activePage === 'services' ? 'material-symbols-fill' : ''
                  }`}
                >
                  medical_services
                </span>
                <span className="text-xs truncate">خدمات تخصصی دندان‌پزشکی</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('gallery')}
                className={`w-full flex items-center gap-3 rounded-full px-4 py-3 active:scale-[0.98] transition-all cursor-pointer min-w-0 ${
                  activePage === 'gallery'
                    ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold'
                    : 'text-[#434655] hover:bg-[#f2f4f6] font-semibold'
                }`}
              >
                <span
                  className={`material-symbols-outlined shrink-0 ${
                    activePage === 'gallery' ? 'material-symbols-fill' : ''
                  }`}
                  style={{ fontVariationSettings: activePage === 'gallery' ? "'FILL' 1" : undefined }}
                >
                  auto_fix_high
                </span>
                <span className="text-xs truncate">نمونه درمان‌ها و لبخند</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className={`w-full flex items-center gap-3 rounded-full px-4 py-3 active:scale-[0.98] transition-all cursor-pointer min-w-0 ${
                  activePage === 'about'
                    ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold'
                    : 'text-[#434655] hover:bg-[#f2f4f6] font-semibold'
                }`}
              >
                <span
                  className={`material-symbols-outlined shrink-0 ${
                    activePage === 'about' ? 'material-symbols-fill' : ''
                  }`}
                >
                  badge
                </span>
                <span className="text-xs truncate">درباره {clinicInfo.doctorTitleBrand || CLINIC_INFO.doctorTitleBrand}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('blog')}
                className={`w-full flex items-center gap-3 rounded-full px-4 py-3 active:scale-[0.98] transition-all cursor-pointer min-w-0 ${
                  activePage === 'blog' || activePage === 'article'
                    ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold'
                    : 'text-[#434655] hover:bg-[#f2f4f6] font-semibold'
                }`}
              >
                <span
                  className={`material-symbols-outlined shrink-0 ${
                    activePage === 'blog' || activePage === 'article' ? 'material-symbols-fill' : ''
                  }`}
                >
                  menu_book
                </span>
                <span className="text-xs truncate">مقالات و وبلاگ تخصصی</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('contact')}
                className={`w-full flex items-center gap-3 rounded-full px-4 py-3 active:scale-[0.98] transition-all cursor-pointer min-w-0 ${
                  activePage === 'contact'
                    ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold'
                    : 'text-[#434655] hover:bg-[#f2f4f6] font-semibold'
                }`}
              >
                <span
                  className={`material-symbols-outlined shrink-0 ${
                    activePage === 'contact' ? 'material-symbols-fill' : ''
                  }`}
                  style={{ fontVariationSettings: activePage === 'contact' ? "'FILL' 1" : undefined }}
                >
                  location_on
                </span>
                <span className="text-xs truncate">تماس و مسیریابی (پاکدشت)</span>
              </button>
            </nav>

            {/* Drawer Footer Quick Dial */}
            <div className="pt-4 border-t border-[#c3c6d7]/20 w-full min-w-0">
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-3 bg-[#004ac6] text-white rounded-full text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-transform truncate"
              >
                <span className="material-symbols-outlined shrink-0 text-[18px]">call</span>
                <span className="truncate">تماس مستقیم: {CLINIC_INFO.phoneCompact}</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= STICKY MINIMALIST AI BUTTON AT BOTTOM-LEFT ================= */}
      {onOpenAiAssistant && !isAiAssistantOpen && (
        <div className="fixed bottom-5 left-5 z-40 group">
          <button
            type="button"
            onClick={onOpenAiAssistant}
            aria-label="دستیار هوشمند دکتر شمس‌پور - از من بپرس"
            aria-expanded={isAiAssistantOpen}
            className="relative flex items-center gap-2 h-10 px-3 rounded-2xl bg-[#004ac6] hover:bg-[#2563eb] text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border border-white/15"
          >
            {/* Minimal Square with Two Blinking Eyes */}
            <span className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <g className="ai-robot-eyes-blink" style={{ transformOrigin: '12px 12px' }}>
                  <rect x="6.5" y="7.5" width="3.2" height="9" rx="1.6" fill="#ffffff" />
                  <rect x="14.3" y="7.5" width="3.2" height="9" rx="1.6" fill="#ffffff" />
                </g>
              </svg>
            </span>
            <span className="text-xs font-extrabold tracking-wide leading-none">AI</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-[85px] transition-all duration-300 ease-out text-[11px] font-bold whitespace-nowrap">
              دستیار هوشمند
            </span>
          </button>
        </div>
      )}
    </>
  );
};
